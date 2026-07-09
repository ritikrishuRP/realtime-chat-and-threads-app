import { query } from "../../db/db.js";

export async function cleanupSeed() {
  console.log("🧹 Cleaning previous seed data...");

  await query(`
    TRUNCATE TABLE
      notifications,
      thread_reactions,
      replies,
      threads,
      direct_messages
    RESTART IDENTITY
    CASCADE;
  `);

  console.log("✅ Cleanup completed.");
}