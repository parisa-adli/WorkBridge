const { UserModel } = require("../app/models/user");
const { DEMO_USERS, STATUS } = require("./constants");
const { hashPassword } = require("./functions");

// Upserts the verified demo accounts so the email login tab always works.
async function seedDemoUsers() {
  for (const [role, { name, email, password }] of Object.entries(DEMO_USERS)) {
    await UserModel.updateOne(
      { email },
      {
        $set: {
          name,
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

module.exports = { seedDemoUsers };
