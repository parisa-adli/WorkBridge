import type { Request, Response } from "express";
import { StatusCodes as HttpStatus } from "http-status-codes";
import createHttpError from "http-errors";
import Controller from "./controller";
import {
  addCategorySchema,
  updateCategorySchema,
} from "../validators/category.schema";
import { CategoryModel } from "../../models/category";
import { findByIdOr404 } from "../../../utils/functions";

class CategoryController extends Controller {
  async getListOfCategories(req: Request, res: Response) {
    // only plain string values of known fields, so no `?title[$ne]=x` operators
    const query: Record<string, string> = {};
    for (const field of ["title", "englishTitle", "type"]) {
      const value = req.query[field];
      if (typeof value === "string") query[field] = value;
    }
    const categories = await CategoryModel.find(query);
    if (!categories)
      throw createHttpError.ServiceUnavailable("دسته بندی ها یافت نشد");

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        categories,
      },
    });
  }
  async addNewCategory(req: Request, res: Response) {
    console.log(req.body);
    // `parent` is validated but not saved: the schema field is `parentId` (current-state.md).
    const { title, englishTitle, description, type } =
      await addCategorySchema.validateAsync(req.body);
    await this.findCategoryWithTitle(englishTitle);
    const category = await CategoryModel.create({
      title,
      englishTitle,
      description,
      type,
    });

    if (!category) throw createHttpError.InternalServerError("خطای داخلی");
    return res.status(HttpStatus.CREATED).json({
      statusCode: HttpStatus.CREATED,
      data: {
        message: "دسته بندی با موفقیت افزوده شد",
      },
    });
  }
  async findCategoryWithTitle(englishTitle: string) {
    const category = await CategoryModel.findOne({ englishTitle });
    if (category)
      throw createHttpError.BadRequest("دسته بندی با این عنوان وجود دارد.");
  }
  checkExistCategory(id: string) {
    return findByIdOr404(CategoryModel, id, "دسته بندی یافت نشد.");
  }
  async updateCategory(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const { title, englishTitle, type, description } = req.body;
    await this.checkExistCategory(id);
    await updateCategorySchema.validateAsync(req.body);
    const updateResult = await CategoryModel.updateOne(
      { _id: id },
      {
        $set: { title, englishTitle, type, description },
      }
    );
    if (updateResult.modifiedCount == 0)
      throw createHttpError.InternalServerError("به روزرسانی انجام نشد");
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "به روز رسانی با موفقیت انجام شد",
      },
    });
  }
  async removeCategory(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const category = await this.checkExistCategory(id);
    const deleteResult = await CategoryModel.deleteMany({
      $or: [{ _id: category._id }, { parentId: category._id }],
    });
    if (deleteResult.deletedCount == 0)
      throw createHttpError.InternalServerError("حدف دسته بندی انجام نشد");
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        message: "حذف دسته بندی با موفقیت انجام شد",
      },
    });
  }
  async getCategoryById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const category = await this.checkExistCategory(id);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: {
        category,
      },
    });
  }
}

const categoryController = new CategoryController();
export { categoryController as CategoryController };
