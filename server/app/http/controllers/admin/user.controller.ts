import type { Request, Response } from "express";
import createHttpError from "http-errors";
import { StatusCodes as HttpStatus } from "http-status-codes";
import { UserModel } from "../../../models/user";
import Controller from "../controller";
import { ProjectModel } from "../../../models/project";
import { ProposalModel } from "../../../models/proposal";
import { escapeRegex } from "../../../../utils/functions";
import { verifyUserSchema } from "../../validators/user.schema";
import { STATUS } from "../../../../utils/constants";

class UserController extends Controller {
  // ADMIN ROUTES :
  async getAllUsers(req: Request, res: Response) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search } = req.query;
    const searchTerm = new RegExp(escapeRegex(search), "i");
    const users = await UserModel.find({
      $or: [
        { name: searchTerm },
        { email: searchTerm },
        { phoneNumber: searchTerm },
      ],
    })
      .limit(limit)
      .skip(skip)
      .sort({
        createdAt: -1,
      });
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        users,
      },
    });
  }
  async userProfile(req: Request<{ userId: string }>, res: Response) {
    const { userId } = req.params;
    const user = await UserModel.findById(userId, { otp: 0 });
    const createdProjects = await ProjectModel.find({ owner: userId });
    const completedProjects = await ProjectModel.find({ freelancer: userId });
    const proposals = await ProposalModel.find({ user: userId });

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        user,
        createdProjects,
        completedProjects,
        proposals,
      },
    });
  }
  async verifyUser(req: Request<{ userId: string }>, res: Response) {
    const { userId } = req.params;
    const { status } = await verifyUserSchema.validateAsync(req.body);
    const updateResult = await UserModel.updateOne(
      { _id: userId },
      { $set: { status } }
    );

    if (updateResult.modifiedCount === 0)
      throw createHttpError.InternalServerError(" وضعیت کاربر آپدیت نشد");

    let message = "وضعیت کاربر تایید شد";
    if (status === STATUS.REJECTED)
      message = "وضعیت کاربر به حالت رد شده تغییر یافت";
    if (status === STATUS.PENDING)
      message = "وضعیت کاربر به حالت در انتظار تایید تغییر یافت";

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message,
      },
    });
  }
}

const userController = new UserController();
export { userController as UserController };
