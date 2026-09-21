import { query } from "../../db/db.js";

export async function seedReactions() {
  console.log("🌱 Seeding thread reactions...");

  const users = (
    await query<{ id: string }>(`
      SELECT id
      FROM users
      ORDER BY id
    `)
  ).rows;

  const threads = (
    await query<{ id: string }>(`
      SELECT id
      FROM threads
      ORDER BY id
    `)
  ).rows;

  if (users.length === 0) {
    throw new Error(
      "Cannot seed reactions: no users exist."
    );
  }

  let totalReactions = 0;

  for (const thread of threads) {
    const likeCount = Math.min(
      Math.floor(Math.random() * 7) + 2,
      users.length
    );

    const shuffledUsers = [...users].sort(
      () => Math.random() - 0.5
    );

    for (const user of shuffledUsers.slice(0, likeCount)) {
      const result = await query(
        `
        INSERT INTO thread_reactions (
          thread_id,
          user_id
        )
        VALUES ($1, $2)
        ON CONFLICT DO NOTHING
        `,
        [
          thread.id,
          user.id,
        ]
      );

      if (result.rowCount) {
        totalReactions++;
      }
    }
  }

  console.log(
    `✅ Inserted ${totalReactions} reactions.`
  );
}