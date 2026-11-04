// `npm run seed`: fills APP_DB with the bilingual demo data. Safe to run again.
import dotenv from "dotenv";
import mongoose from "mongoose";
import { seedDemoData } from "../utils/seedDemoData";

dotenv.config();

async function main() {
  if (!process.env.APP_DB) throw new Error("Missing required env var: APP_DB");
  await mongoose.connect(process.env.APP_DB);
  try {
    await seedDemoData();
    console.log("Demo data seeded");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error("Seed failed:", (err as Error).message);
  process.exit(1);
});
