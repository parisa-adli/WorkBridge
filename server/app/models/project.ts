import mongoose from "mongoose";
import { PROJECT_STATUS } from "../../utils/constants";
const ObjectId = mongoose.Schema.Types.ObjectId;

const ProjectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      required: true,
      default: PROJECT_STATUS.OPEN,
      enum: Object.values(PROJECT_STATUS),
    },
    category: { type: ObjectId, ref: "Category", required: true },
    budget: { type: Number, required: true },
    tags: [{ type: String }],
    proposals: { type: [ObjectId], ref: "Proposal", default: [] },
    deadline: { type: Date, required: true },
    owner: { type: ObjectId, required: true, ref: "User" },
    freelancer: { type: ObjectId, default: null, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export const ProjectModel = mongoose.model("Project", ProjectSchema);
