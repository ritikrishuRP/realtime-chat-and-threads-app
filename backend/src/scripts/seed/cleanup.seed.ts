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

  await query(`
    DELETE FROM users
    WHERE clerk_user_id LIKE 'seed_user_%';
  `);

  console.log("✅ Cleanup completed.");
}