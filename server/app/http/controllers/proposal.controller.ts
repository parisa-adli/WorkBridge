import type { Request, Response } from "express";
import { StatusCodes as HttpStatus } from "http-status-codes";
import createHttpError from "http-errors";
import Controller from "./controller";
import { ProposalModel } from "../../models/proposal";
import { addProposalSchema } from "../validators/proposal.schema";
import { ProjectModel } from "../../models/project";
import { assertProjectOwner } from "./project.controller";
import {
  copyObject,
  findByIdOr404,
  createdAtSort,
} from "../../../utils/functions";
import { ROLES, STATUS, PROJECT_STATUS } from "../../../utils/constants";

const findProposal = (id: unknown) =>
  findByIdOr404(ProposalModel, id, "پیشنهاد یافت نشد.");

// Proposal routes run after verifyAccessToken, which sets req.user.
class ProposalController extends Controller {
  async addNewProposal(req: Request, res: Response) {
    const userId = req.user!._id;
    await addProposalSchema.validateAsync(req.body);
    const { description, price, duration, projectId } = req.body;

    const project = await findByIdOr404(ProjectModel, projectId, "پروژه یافت نشد.");
    if (project.status !== PROJECT_STATUS.OPEN)
      throw createHttpError.BadRequest("پروژه بسته است");
    // shortcut: check-then-create can race on double submit; add a unique {project, user} index if that shows up.
    if (await ProposalModel.exists({ project: projectId, user: userId }))
      throw createHttpError.Conflict("برای این پروژه قبلا پیشنهاد ثبت کرده اید");

    const proposal = await ProposalModel.create({
      description,
      price,
      duration,
      user: userId,
      project: projectId,
    });
    await ProjectModel.updateOne(
      { _id: projectId },
      { $push: { proposals: proposal._id } }
    );
    if (!proposal?._id)
      throw createHttpError.InternalServerError("پیشنهاد ثبت نشد");

    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data: {
        message: "پیشنهاد با موفقیت ایجاد شد",
      },
    });
  }
  async getListOfProposals(req: Request, res: Response) {
    const dbQuery: Record<string, unknown> = {};

    const user = req.user!;
    if (user.role !== ROLES.ADMIN) {
      dbQuery["user"] = user._id;
    }

    const proposals = await ProposalModel.find(dbQuery).sort(
      createdAtSort(req.query.sort)
    );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        proposals,
      },
    });
  }
  async getProposalById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const proposal = await findProposal(id);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        proposal,
      },
    });
  }
  async changeProposalStatus(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const status = Number(req.body.status);

    const proposal = await findProposal(id);
    const project = await findByIdOr404(
      ProjectModel,
      proposal.project,
      "پروژه یافت نشد."
    );
    assertProjectOwner(project, req.user!);

    await ProposalModel.updateOne(
      { _id: id },
      { $set: { status } }
    );

    const freelancer = status === STATUS.ACCEPTED ? copyObject(proposal).user : null;

    await ProjectModel.updateOne(
      { _id: project._id },
      { $set: { freelancer } }
    );

    let message = "وضعیت پروپوزال تایید شد";
    if (status === STATUS.REJECTED)
      message = "وضعیت پروپوزال به حالت رد شده تغییر یافت";
    if (status === STATUS.PENDING)
      message = "وضعیت پروپوزال به حالت در انتظار تایید تغییر یافت";

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message,
      },
    });
  }
}

const proposalController = new ProposalController();
export { proposalController as ProposalController };
