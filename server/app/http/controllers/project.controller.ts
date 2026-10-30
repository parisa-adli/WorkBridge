import type { Request, Response } from "express";
import { StatusCodes as HttpStatus } from "http-status-codes";
import Controller from "./controller";
import { ProjectModel } from "../../models/project";
import { ProposalModel } from "../../models/proposal";
import type { UserDocument } from "../../models/user";
import type { AddProjectBody, ChangeProjectStatusBody } from "../validators/project.schema";
import { ROLES, PROJECT_STATUS } from "../../../utils/constants";
import { findByIdOr404, buildProjectQuery, pagination } from "../../../utils/functions";
import { apiError, sendData } from "../../../utils/apiResponse";
import { ERROR_CODES, SUCCESS_CODES } from "../../../utils/errorCodes";

export function assertProjectOwner(project: { owner: unknown }, user: UserDocument) {
  if (user.role !== ROLES.ADMIN && String(project.owner) !== String(user._id))
    throw apiError(403, ERROR_CODES.ACCESS_DENIED, "شما به این قسمت دسترسی ندارید");
}

// Project routes run after verifyAccessToken, which sets req.user.
class ProjectController extends Controller {
  async addNewProject(req: Request<object, unknown, AddProjectBody>, res: Response) {
    const userId = req.user!._id;
    const { title, description, tags, category, budget, deadline } = req.body;

    const project = await ProjectModel.create({
      title,
      description,
      tags,
      category,
      budget,
      deadline,
      owner: userId,
    });

    if (!project?._id)
      throw apiError(500, ERROR_CODES.PROJECT_NOT_CREATED, "پروژه ثبت نشد");

    return sendData(res, HttpStatus.CREATED, {
      message: "پروژه با موفقیت ایجاد شد",
      code: SUCCESS_CODES.PROJECT_CREATED,
      project,
    });
  }
  async getListOfProjects(req: Request, res: Response) {
    const { filter, sort } = await buildProjectQuery(req.query);
    const { page, limit, skip } = pagination(req.query);

    const [items, total] = await Promise.all([
      ProjectModel.find(filter)
        .select({
          freelancer: 0,
          proposals: 0,
        })
        .populate([
          { path: "category", select: { title: 1, englishTitle: 1 } },
          { path: "owner", select: { name: 1, translations: 1 } },
        ])
        .sort(sort)
        .skip(skip)
        .limit(limit),
      ProjectModel.countDocuments(filter),
    ]);

    return sendData(res, HttpStatus.OK, { items, total, page, limit });
  }
  async getListOfOwnerProjects(req: Request, res: Response) {
    const { filter, sort } = await buildProjectQuery(req.query);
    const { page, limit, skip } = pagination(req.query);
    const ownFilter = { ...filter, owner: req.user!._id };

    const [items, total] = await Promise.all([
      ProjectModel.find(ownFilter)
        .populate([
          { path: "category", select: { title: 1, englishTitle: 1 } },
          { path: "owner", select: { name: 1, translations: 1 } },
          { path: "freelancer", select: { name: 1, translations: 1 } },
        ])
        .sort(sort)
        .skip(skip)
        .limit(limit),
      ProjectModel.countDocuments(ownFilter),
    ]);

    return sendData(res, HttpStatus.OK, { items, total, page, limit });
  }
  async getProjectById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const user = req.user!;
    // freelancers get a read-only view of any project, with only their own proposal
    const isFreelancer = user.role === ROLES.FREELANCER;
    if (isFreelancer)
      await findByIdOr404(ProjectModel, id, ERROR_CODES.PROJECT_NOT_FOUND, "پروژه یافت نشد.");
    else await this.findOwnProject(id, user);
    const project = await ProjectModel.findById(id).populate([
      {
        path: "category",
        model: "Category",
        select: {
          title: 1,
          englishTitle: 1,
        },
      },
      {
        path: "proposals",
        model: "Proposal",
        match: isFreelancer ? { user: user._id } : {},
        populate: [
          {
            path: "user",
            model: "User",
            select: { name: 1, translations: 1 },
          },
        ],
      },
      {
        path: "owner",
        model: "User",
        select: { name: 1, translations: 1 },
      },
      {
        path: "freelancer",
        model: "User",
        select: { name: 1, translations: 1 },
      },
    ]);

    return sendData(res, HttpStatus.OK, { project });
  }
  async findOwnProject(id: string, user: UserDocument) {
    const project = await findByIdOr404(
      ProjectModel,
      id,
      ERROR_CODES.PROJECT_NOT_FOUND,
      "پروژه یافت نشد."
    );
    assertProjectOwner(project, user);
    return project;
  }
  async changeProjectStatus(req: Request<{ id: string }, unknown, ChangeProjectStatusBody>, res: Response) {
    const { id } = req.params;
    const { status } = req.body;
    await this.findOwnProject(id, req.user!);

    const updateResult = await ProjectModel.updateOne(
      { _id: id },
      { $set: { status } }
    );

    if (updateResult.modifiedCount === 0)
      throw apiError(500, ERROR_CODES.PROJECT_STATUS_NOT_UPDATED, " وضعیت پروپوزال آپدیت نشد");

    const result =
      status === PROJECT_STATUS.OPEN
        ? { message: "وضعیت پروژه به حالت باز تغییر یافت", code: SUCCESS_CODES.PROJECT_OPENED }
        : { message: "پروژه بسته شد", code: SUCCESS_CODES.PROJECT_CLOSED };

    return sendData(res, HttpStatus.OK, result);
  }
  async deleteProject(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const project = await this.findOwnProject(id, req.user!);

    if (project.freelancer)
      throw apiError(400, ERROR_CODES.PROJECT_NOT_DELETABLE, "پروژه قابل حذف نیست");

    const result = await ProjectModel.deleteOne({ _id: id });
    if (!result.deletedCount)
      throw apiError(404, ERROR_CODES.PROJECT_NOT_FOUND, "پروژه یافت نشد.");
    await ProposalModel.deleteMany({ project: id });
    return sendData(res, HttpStatus.OK, {
      message: "پروژه با موفقیت حذف شد",
      code: SUCCESS_CODES.PROJECT_DELETED,
    });
  }
  async updateProject(req: Request<{ id: string }, unknown, AddProjectBody>, res: Response) {
    const { id } = req.params;
    await this.findOwnProject(id, req.user!);
    const { title, description, tags, deadline, category, budget } = req.body;
    const updateResult = await ProjectModel.updateOne(
      { _id: id },
      {
        $set: { title, description, tags, deadline, category, budget },
        // the edited text is the owner's own; a seeded English version would be stale
        $unset: { translations: 1 },
      }
    );
    if (updateResult.modifiedCount == 0)
      throw apiError(500, ERROR_CODES.PROJECT_NOT_UPDATED, "به روزرسانی انجام نشد");
    return sendData(res, HttpStatus.OK, {
      message: "به روز رسانی با موفقیت انجام شد",
      code: SUCCESS_CODES.PROJECT_UPDATED,
    });
  }
}

const projectController = new ProjectController();
export { projectController as ProjectController };
