import mongoose from "mongoose";
import { STATUS } from "../../utils/constants";
const ObjectId = mongoose.Schema.Types.ObjectId;

const ProposalSchema = new mongoose.Schema(
  {
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
    description: { type: String, required: true },
    // optional English version of the Persian base field (PRD F10)
    translations: { en: { description: String } },
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

export const ProposalModel = mongoose.model("Proposal", ProposalSchema);
