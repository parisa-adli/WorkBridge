// Mirrors server/utils/apiResponse.ts and the Mongoose models. Change both together.
import type { PROJECT_STATUS, ROLES, STATUS } from "../constants";

// Every success body; services return its `data`.
export type ApiResponse<T> = { statusCode: number; data: T };
// Every error body. `field` is set on validation errors.
export type ApiErrorResponse = { statusCode: number; code: string; message: string; field?: string };
// The payload of every mutation that answers with a toast.
export type MessageData = { message: string; code: string };

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type Status = (typeof STATUS)[keyof typeof STATUS];
export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

type Timestamps = { createdAt: string; updatedAt: string };
// A populated user reference carries only the selected fields.
export type UserRef = { _id: string; name: string };

export type User = Timestamps & {
  _id: string;
  name?: string;
  email?: string;
  phoneNumber: string;
  biography: string | null;
  avatarUrl: string | null;
  isVerifiedPhoneNumber: boolean;
  isActive: boolean;
  status: Status;
  role: Role;
};

export type Category = Timestamps & {
  _id: string;
  title: string;
  englishTitle: string;
  description: string;
  type: string;
};

export type Proposal = Timestamps & {
  _id: string;
  price: number;
  duration: number;
  description: string;
  // populated with { _id, name } inside a single project
  user: string | UserRef;
  project: string;
  status: Status;
};

export type Project = Timestamps & {
  _id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  category: Pick<Category, "_id" | "title" | "englishTitle">;
  budget: number;
  tags: string[];
  // ids in lists, populated proposals in a single project
  proposals: string[] | Proposal[];
  deadline: string;
  owner: string | UserRef;
  freelancer: string | UserRef | null;
};
