import { UserModel } from "../app/models/user";
import { DEMO_USERS, STATUS } from "./constants";
import { hashPassword } from "./functions";

// Upserts the verified demo accounts for the demo login tab. Keyed by username, so a real user's email is never taken over.
export async function seedDemoUsers() {
  for (const [role, { username, name, biography, en, email, password }] of Object.entries(DEMO_USERS)) {
    await UserModel.updateOne(
      { username },
      {
        $set: {
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
