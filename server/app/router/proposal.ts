import { Router } from "express";
import { ProposalController } from "../http/controllers/proposal.controller";
import { ROLES } from "../../utils/constants";
import { authorize } from "../http/middlewares/permission.guard";

const router = Router();

router.get(
  "/list",
  authorize(ROLES.FREELANCER, ROLES.ADMIN),
  ProposalController.getListOfProposals
);
router.post(
  "/add",
  authorize(ROLES.FREELANCER, ROLES.ADMIN),
  ProposalController.addNewProposal
);
router.get(
  "/:id",
  authorize(ROLES.FREELANCER, ROLES.ADMIN),
  ProposalController.getProposalById
);
router.patch(
  "/:id",
  authorize(ROLES.OWNER, ROLES.ADMIN),
  ProposalController.changeProposalStatus
);

export { router as proposalRoutes };
