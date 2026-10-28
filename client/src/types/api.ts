// Mirrors server/utils/apiResponse.ts and the Mongoose models. Change both together.
import type { PROJECT_STATUS, ROLES, STATUS } from "../constants";

// Every success body; services return its `data`.
export type ApiResponse<T> = { statusCode: number; data: T };
// Every error body. `field` is set on validation errors.
export type ApiErrorResponse = { statusCode: number; code: string; message: string; field?: string };
// The payload of every mutation that answers with a toast.
export type MessageData = { message: string; code: string };
// The payload of the paged list endpoints (project/list, project/owner-projects, proposal/list, admin/user/list).
export type Page<T> = { items: T[]; total: number; page: number; limit: number };

export type Role = (typeof ROLES)[keyof typeof ROLES];
export type Status = (typeof STATUS)[keyof typeof STATUS];
export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

type Timestamps = { createdAt: string; updatedAt: string };
// Optional English version of an entity's Persian text fields (PRD F10); read through utils/localized.
export type Translations<T> = { translations?: { en?: Partial<T> } };
// A populated user reference carries only the selected fields.
export type UserRef = { _id: string; name: string } & Translations<{ name: string }>;

export type User = Timestamps & Translations<{ name: string; biography: string }> & {
  _id: string;
  username?: string;
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
  parentId: string | null;
};

export type Proposal = Timestamps & Translations<{ description: string }> & {
  _id: string;
  price: number;
  duration: number;
  description: string;
  // populated with { _id, name } inside a single project and in the list
  user: string | UserRef;
  // populated with the project's title and owner in the list
  project: string | ({ _id: string; title: string; owner: UserRef } & Translations<{ title: string }>);
  status: Status;
};

export type Project = Timestamps & Translations<{ title: string; description: string; tags: string[] }> & {
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
