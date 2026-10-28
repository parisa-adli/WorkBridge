import { Router } from "express";
import { ProposalController } from "../http/controllers/proposal.controller";
import { ROLES } from "../../utils/constants";
import { authorize } from "../http/middlewares/permission.guard";
import { validate } from "../http/middlewares/validate";
import { idParamSchema } from "../http/validators/common.schema";
import {
  addProposalSchema,
  changeProposalStatusSchema,
  proposalListQuerySchema,
} from "../http/validators/proposal.schema";

const router = Router();

router.get(
  "/list",
  authorize(ROLES.FREELANCER, ROLES.ADMIN),
  validate(proposalListQuerySchema, "query"),
  ProposalController.getListOfProposals
);
router.post(
  "/add",
  authorize(ROLES.FREELANCER, ROLES.ADMIN),
  validate(addProposalSchema),
  ProposalController.addNewProposal
);
router.get(
  "/:id",
  authorize(ROLES.FREELANCER, ROLES.ADMIN),
  validate(idParamSchema, "params"),
  ProposalController.getProposalById
);
router.patch(
  "/:id",
  authorize(ROLES.OWNER, ROLES.ADMIN),
  validate(idParamSchema, "params"),
  validate(changeProposalStatusSchema),
  ProposalController.changeProposalStatus
);

export { router as proposalRoutes };
