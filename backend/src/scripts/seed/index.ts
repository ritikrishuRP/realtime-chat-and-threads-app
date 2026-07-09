// import { faker } from "@faker-js/faker";
import { query } from "../../db/db.js";
//import { seedUsers } from "./chat.seed.js";
import { seedThreads } from "./threads.seed.js";
import { seedReplies } from "./replies.seed.js";
import { cleanupSeed } from "./cleanup.seed.js";
import { seedReactions } from "./reactions.seed.js";
import { seedNotifications } from "./notifications.seed.js";
import { seedChats } from "./chat.seed.js";


async function main() {
  console.log("🌱 Starting database seed...");

  await cleanupSeed();



  //await seedUsers();
  await seedThreads();
  await seedReplies();
  await seedReactions();
  await seedNotifications();
  await seedChats();
  // 1. Read all users already synced from Clerk
  const usersResult = await query<{
    id: number;
    clerk_user_id: string;
    display_name: string | null;
    handle: string | null;
  }>(`
    SELECT
      id,
      clerk_user_id,
      display_name,
      handle
    FROM users
    ORDER BY id ASC;
  `);

  const users = usersResult.rows;

  console.log(`✅ Found ${users.length} users`);

  if (users.length < 2) {
    throw new Error(
      "Seed requires at least 2 users. Create your Clerk users first."
    );
  }

  console.log("Sample users:");

  users.slice(0, 5).forEach((user) => {
    console.log({
      id: user.id,
      displayName: user.display_name,
      handle: user.handle,
    });
  });

  console.log("🎉 Seed setup completed.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });