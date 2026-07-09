import { query } from "../../db/db.js";

export async function seedNotifications() {
  console.log("🌱 Seeding notifications...");

  // Reply notifications
  await query(`
    INSERT INTO notifications (
      user_id,
      actor_user_id,
      thread_id,
      type
    )
    SELECT
      t.author_user_id,
      r.author_user_id,
      r.thread_id,
      'REPLY_ON_THREAD'
    FROM replies r
    JOIN threads t
      ON t.id = r.thread_id
    WHERE t.author_user_id <> r.author_user_id;
  `);

  // Like notifications
  await query(`
    INSERT INTO notifications (
      user_id,
      actor_user_id,
      thread_id,
      type
    )
    SELECT
      t.author_user_id,
      tr.user_id,
      tr.thread_id,
      'LIKE_ON_THREAD'
    FROM thread_reactions tr
    JOIN threads t
      ON t.id = tr.thread_id
    WHERE t.author_user_id <> tr.user_id;
  `);

  const result = await query<{ count: string }>(`
    SELECT COUNT(*) AS count
    FROM notifications;
  `);

  console.log(
    `✅ Inserted ${result.rows[0].count} notifications.`
  );
}