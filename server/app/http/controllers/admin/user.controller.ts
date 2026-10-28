import type { Request, Response } from "express";
import { StatusCodes as HttpStatus } from "http-status-codes";
import { UserModel } from "../../../models/user";
import Controller from "../controller";
import { ProjectModel } from "../../../models/project";
import { ProposalModel } from "../../../models/proposal";
import { escapeRegex } from "../../../../utils/functions";
import type { VerifyUserBody } from "../../validators/user.schema";
import { STATUS } from "../../../../utils/constants";
import { apiError, sendData } from "../../../../utils/apiResponse";
import { ERROR_CODES, SUCCESS_CODES, type SuccessCode } from "../../../../utils/errorCodes";

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
    return sendData(res, HttpStatus.OK, { users });
  }
  async userProfile(req: Request<{ userId: string }>, res: Response) {
    const { userId } = req.params;
    const user = await UserModel.findById(userId, { otp: 0 });
    const createdProjects = await ProjectModel.find({ owner: userId });
    const completedProjects = await ProjectModel.find({ freelancer: userId });
    const proposals = await ProposalModel.find({ user: userId });

    return sendData(res, HttpStatus.OK, {
      user,
      createdProjects,
      completedProjects,
      proposals,
    });
  }
  async verifyUser(req: Request<{ userId: string }, unknown, VerifyUserBody>, res: Response) {
    const { userId } = req.params;
    const { status } = req.body;
    const updateResult = await UserModel.updateOne(
      { _id: userId },
      { $set: { status } }
    );

    if (updateResult.modifiedCount === 0)
      throw apiError(500, ERROR_CODES.USER_STATUS_NOT_UPDATED, " وضعیت کاربر آپدیت نشد");

    let result: { message: string; code: SuccessCode } = {
      message: "وضعیت کاربر تایید شد",
      code: SUCCESS_CODES.USER_ACCEPTED,
    };
    if (status === STATUS.REJECTED)
      result = {
        message: "وضعیت کاربر به حالت رد شده تغییر یافت",
        code: SUCCESS_CODES.USER_REJECTED,
      };
    if (status === STATUS.PENDING)
      result = {
        message: "وضعیت کاربر به حالت در انتظار تایید تغییر یافت",
        code: SUCCESS_CODES.USER_PENDING,
      };

    return sendData(res, HttpStatus.OK, result);
  }
}

const userController = new UserController();
export { userController as UserController };
