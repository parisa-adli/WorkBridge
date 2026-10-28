import { Router } from "express";
import { ProjectController } from "../http/controllers/project.controller";
import { ROLES } from "../../utils/constants";
import { authorize } from "../http/middlewares/permission.guard";
import { validate } from "../http/middlewares/validate";
import { idParamSchema } from "../http/validators/common.schema";
import {
  addProjectSchema,
  changeProjectStatusSchema,
  projectListQuerySchema,
} from "../http/validators/project.schema";

const router = Router();

router.get("/list", validate(projectListQuerySchema, "query"), ProjectController.getListOfProjects);
router.get(
  "/owner-projects",
  authorize(ROLES.ADMIN, ROLES.OWNER),
  validate(projectListQuerySchema, "query"),
  ProjectController.getListOfOwnerProjects
);
router.post(
  "/add",
  authorize(ROLES.ADMIN, ROLES.OWNER),
  validate(addProjectSchema),
  ProjectController.addNewProject
);
router.get(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.OWNER),
  validate(idParamSchema, "params"),
  ProjectController.getProjectById
);
router.patch(
  "/update/:id",
  authorize(ROLES.ADMIN, ROLES.OWNER),
  validate(idParamSchema, "params"),
  validate(addProjectSchema),
  ProjectController.updateProject
);
router.patch(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.OWNER),
  validate(idParamSchema, "params"),
  validate(changeProjectStatusSchema),
  ProjectController.changeProjectStatus
);
router.delete(
  "/:id",
  authorize(ROLES.ADMIN, ROLES.OWNER),
  validate(idParamSchema, "params"),
  ProjectController.deleteProject
);

export { router as projectRoutes };
