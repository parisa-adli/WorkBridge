import type { Request, Response } from "express";
import { StatusCodes as HttpStatus } from "http-status-codes";
import Controller from "./controller";
import type { AddCategoryBody, UpdateCategoryBody } from "../validators/category.schema";
import { CategoryModel } from "../../models/category";
import { findByIdOr404 } from "../../../utils/functions";
import { apiError, sendData } from "../../../utils/apiResponse";
import { ERROR_CODES, SUCCESS_CODES } from "../../../utils/errorCodes";

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
      throw apiError(503, ERROR_CODES.CATEGORY_NOT_FOUND, "دسته بندی ها یافت نشد");

    return sendData(res, HttpStatus.OK, { categories });
  }
  async addNewCategory(req: Request<object, unknown, AddCategoryBody>, res: Response) {
    // `parent` is validated but not saved: the schema field is `parentId` (current-state.md).
    const { title, englishTitle, description, type } = req.body;
    await this.findCategoryWithTitle(englishTitle);
    const category = await CategoryModel.create({
      title,
      englishTitle,
      description,
      type,
    });

    if (!category)
      throw apiError(500, ERROR_CODES.CATEGORY_NOT_CREATED, "خطای داخلی");
    return sendData(res, HttpStatus.CREATED, {
      message: "دسته بندی با موفقیت افزوده شد",
      code: SUCCESS_CODES.CATEGORY_CREATED,
    });
  }
  async findCategoryWithTitle(englishTitle: string) {
    const category = await CategoryModel.findOne({ englishTitle });
    if (category)
      throw apiError(400, ERROR_CODES.DUPLICATE_CATEGORY, "دسته بندی با این عنوان وجود دارد.");
  }
  checkExistCategory(id: string) {
    return findByIdOr404(CategoryModel, id, ERROR_CODES.CATEGORY_NOT_FOUND, "دسته بندی یافت نشد.");
  }
  async updateCategory(req: Request<{ id: string }, unknown, UpdateCategoryBody>, res: Response) {
    const { id } = req.params;
    const { title, englishTitle, type, description } = req.body;
    await this.checkExistCategory(id);
    const updateResult = await CategoryModel.updateOne(
      { _id: id },
      {
        $set: { title, englishTitle, type, description },
      }
    );
    if (updateResult.modifiedCount == 0)
      throw apiError(500, ERROR_CODES.CATEGORY_NOT_UPDATED, "به روزرسانی انجام نشد");
    return sendData(res, HttpStatus.OK, {
      message: "به روز رسانی با موفقیت انجام شد",
      code: SUCCESS_CODES.CATEGORY_UPDATED,
    });
  }
  async removeCategory(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const category = await this.checkExistCategory(id);
    const deleteResult = await CategoryModel.deleteMany({
      $or: [{ _id: category._id }, { parentId: category._id }],
    });
    if (deleteResult.deletedCount == 0)
      throw apiError(500, ERROR_CODES.CATEGORY_NOT_DELETED, "حدف دسته بندی انجام نشد");
    return sendData(res, HttpStatus.OK, {
      message: "حذف دسته بندی با موفقیت انجام شد",
      code: SUCCESS_CODES.CATEGORY_DELETED,
    });
  }
  async getCategoryById(req: Request<{ id: string }>, res: Response) {
    const { id } = req.params;
    const category = await this.checkExistCategory(id);
    return sendData(res, HttpStatus.OK, { category });
  }
}

const categoryController = new CategoryController();
export { categoryController as CategoryController };
