const {
  ProposalController,
} = require("../http/controllers/proposal.controller");
const { ROLES } = require("../../utils/constants");
const { authorize } = require("../http/middlewares/permission.guard");

const router = require("express").Router();

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

module.exports = {
  proposalRoutes: router,
};
