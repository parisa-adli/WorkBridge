import type { Request, Response } from "express";
import { StatusCodes as HttpStatus } from "http-status-codes";
import Controller from "./controller";
import { CategoryModel } from "../../models/category";
import { ProjectModel } from "../../models/project";
import { UserModel } from "../../models/user";
import { sendData } from "../../../utils/apiResponse";
import { PROJECT_STATUS, ROLES } from "../../../utils/constants";

class StatsController extends Controller {
  async getPublicStats(req: Request, res: Response) {
    // only verified accounts, so pending and rejected sign-ups don't inflate the public numbers
    const [freelancers, owners, openProjects, categories, counts] = await Promise.all([
      UserModel.countDocuments({ role: ROLES.FREELANCER, status: 2 }),
      UserModel.countDocuments({ role: ROLES.OWNER, status: 2 }),
      ProjectModel.countDocuments({ status: PROJECT_STATUS.OPEN }),
      CategoryModel.find({ type: "project" }, { title: 1, englishTitle: 1 }).lean(),
      ProjectModel.aggregate<{ _id: unknown; projects: number }>([
        { $group: { _id: "$category", projects: { $sum: 1 } } },
      ]),
    ]);
    const byCategory = new Map(counts.map((c) => [String(c._id), c.projects]));
    return sendData(res, HttpStatus.OK, {
      freelancers,
      owners,
      openProjects,
      categories: categories.map((c) => ({ ...c, projects: byCategory.get(String(c._id)) ?? 0 })),
    });
  }
}

const statsController = new StatsController();
export { statsController as StatsController };
