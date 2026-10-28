import { UserModel } from "../app/models/user";
import { DEMO_USERS, STATUS } from "./constants";
import { hashPassword } from "./functions";

// Upserts the verified demo accounts so the email login tab always works.
export async function seedDemoUsers() {
  for (const [role, { username, name, biography, en, email, password }] of Object.entries(DEMO_USERS)) {
    await UserModel.updateOne(
      { email },
      {
        $set: {
          username,
          name,
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
