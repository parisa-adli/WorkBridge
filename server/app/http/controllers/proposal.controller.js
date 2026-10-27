const Controller = require("./controller");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const createHttpError = require("http-errors");
const { ProposalModel } = require("../../models/proposal");
const { addProposalSchema } = require("../validators/proposal.schema");
const { ProjectModel } = require("../../models/project");
const { assertProjectOwner } = require("./project.controller");
const {
  copyObject,
  findByIdOr404,
  createdAtSort,
} = require("../../../utils/functions");
const { ROLES, STATUS, PROJECT_STATUS } = require("../../../utils/constants");

const findProposal = (id) =>
  findByIdOr404(ProposalModel, id, "پیشنهاد یافت نشد.");

class ProposalController extends Controller {
  async addNewProposal(req, res) {
    const userId = req.user._id;
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
  async getListOfProposals(req, res) {
    let dbQuery = {};

    const user = req.user;
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
  async getProposalById(req, res) {
    const { id } = req.params;
    const proposal = await findProposal(id);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        proposal,
      },
    });
  }
  async changeProposalStatus(req, res) {
    const { id } = req.params;
    let { status } = req.body;
    status = Number(status);

    const proposal = await findProposal(id);
    const project = await findByIdOr404(
      ProjectModel,
      proposal.project,
      "پروژه یافت نشد."
    );
    assertProjectOwner(project, req.user);

    await ProposalModel.updateOne(
      { _id: id },
      { $set: { status } }
    );

    let freelancer = copyObject(proposal).user;

    if (status !== STATUS.ACCEPTED) freelancer = null;

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

module.exports = {
  ProposalController: new ProposalController(),
};
