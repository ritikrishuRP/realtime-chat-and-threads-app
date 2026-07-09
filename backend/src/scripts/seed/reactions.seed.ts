import { query } from "../../db/db.js";

export async function seedReactions() {
  console.log("🌱 Seeding thread reactions...");

  const users = (
    await query<{ id: string }>(`
      SELECT id
      FROM users
    `)
  ).rows;

  const threads = (
    await query<{ id: string }>(`
      SELECT id
      FROM threads
    `)
  ).rows;

  let totalReactions = 0;

  for (const thread of threads) {
    // Random likes between 2 and 8
    const likeCount = Math.floor(Math.random() * 7) + 2;

    // Shuffle users
    const shuffledUsers = [...users].sort(() => Math.random() - 0.5);

    for (const user of shuffledUsers.slice(0, likeCount)) {
      await query(
        `
        INSERT INTO thread_reactions (
          thread_id,
          user_id
        )
        VALUES ($1,$2)
        ON CONFLICT DO NOTHING
        `,
        [
          thread.id,
          user.id,
        ]
      );

      totalReactions++;
    }
  }

  console.log(`✅ Inserted ${totalReactions} reactions.`);
}