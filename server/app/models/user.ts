import mongoose from "mongoose";
import { ROLES, STATUS } from "../../utils/constants";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    avatar: { type: String },
    biography: { type: String, default: null },
    // optional English version of the Persian base fields (PRD F10)
    translations: { en: { name: String, biography: String } },
    // set only on the seeded demo accounts
    username: { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    email: { type: String, lowercase: true, trim: true },
    phoneNumber: { type: String, trim: true },
    password: { type: String },
    otp: {
      code: { type: Number, default: 0 },
      expiresIn: { type: Date, default: 0 },
    },
    resetLink: { type: String, default: null },
    isVerifiedPhoneNumber: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    status: {
      type: Number,
      required: true,
      default: STATUS.PENDING,
      enum: Object.values(STATUS),
    },
    role: { type: String, default: ROLES.OWNER },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
  }
);

UserSchema.virtual("avatarUrl").get(function () {
  if (this.avatar) return `${process.env.SERVER_URL}/${this.avatar}`;
  return null;
});

UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  obj.avatarUrl = this.avatarUrl;
  delete obj.password;
  delete obj.avatar;
  delete obj.otp;
  return obj;
};

UserSchema.index({
  name: "text",
  email: "text",
  phoneNumber: "text",
});

export const UserModel = mongoose.model("User", UserSchema);
export type UserDocument = mongoose.HydratedDocument<mongoose.InferSchemaType<typeof UserSchema>>;
