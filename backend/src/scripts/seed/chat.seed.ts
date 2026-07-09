import { faker } from "@faker-js/faker";
import { query } from "../../db/db.js";

export async function seedChats() {
  console.log("🌱 Seeding direct messages...");

  const users = (
    await query<{ id: string }>(`
      SELECT id
      FROM users
      ORDER BY id
    `)
  ).rows;

  let totalMessages = 0;

  for (let i = 0; i < 300; i++) {
    const sender =
      users[Math.floor(Math.random() * users.length)];

    let recipient =
      users[Math.floor(Math.random() * users.length)];

    while (recipient.id === sender.id) {
      recipient =
        users[Math.floor(Math.random() * users.length)];
    }

    await query(
      `
      INSERT INTO direct_messages (
        sender_user_id,
        recipient_user_id,
        body
      )
      VALUES ($1,$2,$3)
      `,
      [
        sender.id,
        recipient.id,
        faker.helpers.arrayElement([
          "Hey! How's your project going?",
          "Can you review my PR?",
          "Did you deploy the backend?",
          "I'm getting a Docker error.",
          "Let's work on the AI feature tonight.",
          "The Clerk integration is working now.",
          "Can you help me with PostgreSQL indexing?",
          "That UI looks awesome!",
          "Let's meet on Discord later.",
          "Did you try the latest Next.js version?"
        ])
      ]
    );

    totalMessages++;
  }

  console.log(`✅ Inserted ${totalMessages} direct messages.`);
}