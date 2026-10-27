const mongoose = require("mongoose");
const ObjectId = mongoose.Schema.Types.ObjectId;
const { STATUS } = require("../../utils/constants");

const ProposalSchema = new mongoose.Schema(
  {
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    description: { type: String, required: true },
    user: { type: ObjectId, ref: "User", required: true },
    project: { type: ObjectId, ref: "Project", required: true },
    status: {
      type: Number,
      required: true,
      default: STATUS.PENDING,
      enum: Object.values(STATUS),
    },
  },
  {
    timestamps: true,
  }
);

module.exports = {
  ProposalModel: mongoose.model("Proposal", ProposalSchema),
};
