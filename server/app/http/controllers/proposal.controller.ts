import type { Request, Response } from "express";
import { StatusCodes as HttpStatus } from "http-status-codes";
import Controller from "./controller";
import { ProposalModel } from "../../models/proposal";
import type { AddProposalBody, ChangeProposalStatusBody } from "../validators/proposal.schema";
import { ProjectModel } from "../../models/project";
import { assertProjectOwner } from "./project.controller";
import {
  copyObject,
  findByIdOr404,
  createdAtSort,
} from "../../../utils/functions";
import { ROLES, STATUS, PROJECT_STATUS } from "../../../utils/constants";
import { apiError, sendData } from "../../../utils/apiResponse";
import { ERROR_CODES, SUCCESS_CODES, type SuccessCode } from "../../../utils/errorCodes";

const findProposal = (id: unknown) =>
  findByIdOr404(ProposalModel, id, ERROR_CODES.PROPOSAL_NOT_FOUND, "پیشنهاد یافت نشد.");
const findProject = (id: unknown) =>
  findByIdOr404(ProjectModel, id, ERROR_CODES.PROJECT_NOT_FOUND, "پروژه یافت نشد.");

// Proposal routes run after verifyAccessToken, which sets req.user.
class ProposalController extends Controller {
  async addNewProposal(req: Request<object, unknown, AddProposalBody>, res: Response) {
    const userId = req.user!._id;
    const { description, price, duration, projectId } = req.body;

    const project = await findProject(projectId);
    if (project.status !== PROJECT_STATUS.OPEN)
      throw apiError(400, ERROR_CODES.PROJECT_NOT_OPEN, "پروژه بسته است");
    // shortcut: check-then-create can race on double submit; add a unique {project, user} index if that shows up.
    if (await ProposalModel.exists({ project: projectId, user: userId }))
      throw apiError(409, ERROR_CODES.DUPLICATE_PROPOSAL, "برای این پروژه قبلا پیشنهاد ثبت کرده اید");

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
      throw apiError(500, ERROR_CODES.PROPOSAL_NOT_CREATED, "پیشنهاد ثبت نشد");

    return sendData(res, HttpStatus.CREATED, {
      message: "پیشنهاد با موفقیت ایجاد شد",
      code: SUCCESS_CODES.PROPOSAL_CREATED,
    });
  }
  async getListOfProposals(req: Request, res: Response) {
    const dbQuery: Record<string, unknown> = {};

    const user = req.user!;
    if (user.role !== ROLES.ADMIN) {
      dbQuery["user"] = user._id;
    }

    const proposals = await ProposalModel.find(dbQuery)
      .populate([
        { path: "user", select: { name: 1 } },
        { path: "project", select: { owner: 1 }, populate: { path: "owner", select: { name: 1 } } },
      ])
      .sort(createdAtSort(req.query.sort));

    return sendData(res, HttpStatus.OK, { proposals });
  }
  async getProposalById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const proposal = await findProposal(id);
    return sendData(res, HttpStatus.OK, { proposal });
  }
  async changeProposalStatus(req: Request<{ id: string }, unknown, ChangeProposalStatusBody>, res: Response) {
    const { id } = req.params;
    const { status } = req.body;

    const proposal = await findProposal(id);
    const project = await findProject(proposal.project);
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

    let result: { message: string; code: SuccessCode } = { message: "وضعیت پروپوزال تایید شد", code: SUCCESS_CODES.PROPOSAL_ACCEPTED };
    if (status === STATUS.REJECTED)
      result = {
        message: "وضعیت پروپوزال به حالت رد شده تغییر یافت",
        code: SUCCESS_CODES.PROPOSAL_REJECTED,
      };
    if (status === STATUS.PENDING)
      result = {
        message: "وضعیت پروپوزال به حالت در انتظار تایید تغییر یافت",
        code: SUCCESS_CODES.PROPOSAL_PENDING,
      };

    return sendData(res, HttpStatus.OK, result);
  }
}

const proposalController = new ProposalController();
export { proposalController as ProposalController };
