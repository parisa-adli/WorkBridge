import { UserModel } from "../app/models/user";
import { DEMO_USERS, STATUS } from "./constants";
import { hashPassword } from "./functions";

// Upserts the verified demo accounts for the demo login tab. Login is by email, so the demo account must own its
// email: an older account with that email (e.g. from a seed keyed by email, without a username) is adopted.
export async function seedDemoUsers() {
  for (const [role, { username, name, biography, en, email, password }] of Object.entries(DEMO_USERS)) {
    await UserModel.updateOne(
      { $or: [{ username }, { email }] },
      {
        $set: {
          username,
          name,
          email,
          biography,
          translations: { en },
          role,
          password: await hashPassword(password),
          status: STATUS.ACCEPTED,
          isActive: true,
        },
      },
      { upsert: true }
    );
  }
}
