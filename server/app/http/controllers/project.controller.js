const Controller = require("./controller");
const { StatusCodes: HttpStatus } = require("http-status-codes");
const { ProjectModel } = require("../../models/project");
const createHttpError = require("http-errors");
const { addProjectSchema } = require("../validators/project.schema");
const { ROLES } = require("../../../utils/constants");
const {
  findByIdOr404,
  buildProjectQuery,
} = require("../../../utils/functions");

function assertProjectOwner(project, user) {
  if (user.role !== ROLES.ADMIN && String(project.owner) !== String(user._id))
    throw createHttpError.Forbidden("شما به این قسمت دسترسی ندارید");
}

class ProjectController extends Controller {
  async addNewProject(req, res) {
    const userId = req.user._id;
    await addProjectSchema.validateAsync(req.body);
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
      throw createHttpError.InternalServerError("پروژه ثبت نشد");

    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data: {
        message: "پروژه با موفقیت ایجاد شد",
        project,
      },
    });
  }
  async getListOfProjects(req, res) {
    const { filter, sort } = await buildProjectQuery(req.query);

    const projects = await ProjectModel.find(filter)
      .select({
        owner: 0,
        freelancer: 0,
        proposals: 0,
      })
      .populate([{ path: "category", select: { title: 1, englishTitle: 1 } }])
      .sort(sort);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        projects,
      },
    });
  }
  async getListOfOwnerProjects(req, res) {
    const { filter, sort } = await buildProjectQuery(req.query);

    const projects = await ProjectModel.find({ ...filter, owner: req.user._id })
      .populate([
        { path: "category", select: { title: 1, englishTitle: 1 } },
        { path: "owner", select: { name: 1 } },
        { path: "freelancer", select: { name: 1 } },
      ])
      .sort(sort);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        projects,
      },
    });
  }
  async getProjectById(req, res) {
    const { id } = req.params;
    await this.findOwnProject(id, req.user);
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
        populate: [
          {
            path: "user",
            model: "User",
            select: { name: 1 },
          },
        ],
      },
      {
        path: "owner",
        model: "User",
        select: { name: 1 },
      },
      {
        path: "freelancer",
        model: "User",
        select: { name: 1 },
      },
    ]);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        project,
      },
    });
  }
  async findOwnProject(id, user) {
    const project = await findByIdOr404(ProjectModel, id, "پروژه یافت نشد.");
    assertProjectOwner(project, user);
    return project;
  }
  async changeProjectStatus(req, res) {
    const { id } = req.params;
    const { status } = req.body;
    await this.findOwnProject(id, req.user);

    const updateResult = await ProjectModel.updateOne(
      { _id: id },
      { $set: { status } } // 0, 1, 2
    );

    if (updateResult.modifiedCount === 0)
      throw createHttpError.InternalServerError(" وضعیت پروپوزال آپدیت نشد");

    let message = "پروژه بسته شد";
    if (status === "OPEN") message = "وضعیت پروژه به حالت باز تغییر یافت";

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message,
      },
    });
  }
  async deleteProject(req, res) {
    const { id } = req.params;
    const project = await this.findOwnProject(id, req.user);

    if (project.freelancer)
      throw createHttpError.BadRequest("پروژه قابل حذف نیست");

    const result = await ProjectModel.deleteOne({ _id: id });
    if (result.deletedCount)
      return res.status(HttpStatus.OK).json({
        statusCode: HttpStatus.OK,
        data: {
          message: "پروژه با موفقیت حذف شد",
        },
      });
  }
  async updateProject(req, res) {
    const { id } = req.params;
    await this.findOwnProject(id, req.user);
    const { title, description, tags, deadline, category, budget } = req.body;
    console.log(req.body);
    await addProjectSchema.validateAsync(req.body);
    const updateResult = await ProjectModel.updateOne(
      { _id: id },
      {
        $set: { title, description, tags, deadline, category, budget },
      }
    );
    if (updateResult.modifiedCount == 0)
      // TODO(phase 12): createError is undefined here (known-bugs #11); fix the reference.
      // eslint-disable-next-line no-undef
      throw createError.InternalServerError("به روزرسانی انجام نشد");
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "به روز رسانی با موفقیت انجام شد",
      },
    });
  }
}

module.exports = {
  ProjectController: new ProjectController(),
  assertProjectOwner,
};
