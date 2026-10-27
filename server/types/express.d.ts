import type { UserDocument } from "../app/models/user";

declare global {
  namespace Express {
    interface Request {
      // set by verifyAccessToken
      user?: UserDocument;
    }
  }
}
