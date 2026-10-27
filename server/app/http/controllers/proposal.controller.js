const Controller = require("./controller");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const mongoose = require("mongoose");
const createHttpError = require("http-errors");
const { ProposalModel } = require("../../models/proposal");
const { addProposalSchema } = require("../validators/proposal.schema");
const { ProjectModel } = require("../../models/project");
const { assertProjectOwner } = require("./project.controller");
const { copyObject } = require("../../../utils/functions");
const { ROLES } = require("../../../utils/constants");

class ProposalController extends Controller {
  async addNewProposal(req, res) {
    const userId = req.user._id;
    await addProposalSchema.validateAsync(req.body);
    const { description, price, duration, projectId } = req.body;

    const project = await ProjectModel.findById(projectId);
    if (!project) throw createHttpError.NotFound("پروژه یافت نشد.");
    if (project.status !== "OPEN")
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
    const { sort } = req.query;

    const user = req.user;
    if (user.role !== ROLES.ADMIN) {
      dbQuery["user"] = user._id;
    }

    const sortQuery = {};

    if (!sort) sortQuery["createdAt"] = 1;
    if (sort) {
      if (sort === "latest") sortQuery["createdAt"] = -1;
      if (sort === "earliest") sortQuery["createdAt"] = 1;
    }

    const proposals = await ProposalModel.find(dbQuery).sort(sortQuery);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        proposals,
      },
    });
  }
  async getProposalById(req, res) {
    const { id } = req.params;
    const proposal = await this.findProposalById(id);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        proposal,
      },
    });
  }
  async findProposalById(id) {
    if (!mongoose.isValidObjectId(id))
      throw createHttpError.BadRequest("شناسه پروژه ارسال شده صحیح نمیباشد");
    const proposal = await ProposalModel.findById(id);
    if (!proposal) throw createHttpError.NotFound("پروژه یافت نشد.");
    return proposal;
  }
  async changeProposalStatus(req, res) {
    const { id } = req.params;
    let { status } = req.body;
    status = Number(status);

    const proposal = await this.findProposalById(id);
    const project = await ProjectModel.findById(proposal.project);
    if (!project) throw createHttpError.NotFound("پروژه یافت نشد.");
    assertProjectOwner(project, req.user);

    await ProposalModel.updateOne(
      { _id: id },
      { $set: { status } } // 0, 1, 2
    );

    let freelancer = copyObject(proposal).user;

    if (status !== 2) freelancer = null;

    await ProjectModel.updateOne(
      { _id: project._id },
      { $set: { freelancer } }
    );

    let message = "وضعیت پروپوزال تایید شد";
    if (status === 0) message = "وضعیت پروپوزال به حالت رد شده تغییر یافت";
    if (status === 1)
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
