import { faker } from "@faker-js/faker";
import { query } from "../../db/db.js";

export async function seedUsers(count = 50) {
  console.log(`🌱 Seeding ${count} users...`);

  for (let i = 0; i < count; i++) {
    const displayName = faker.person.fullName();
    const handle = faker.internet.username().toLowerCase();

    await query(
      `
      INSERT INTO users (
        clerk_user_id,
        display_name,
        handle,
        avatar_url,
        bio
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (clerk_user_id) DO NOTHING
      `,
      [
        `seed_user_${faker.string.uuid()}`,
        displayName,
        `${handle}_${i}`,
        faker.image.avatar(),
        faker.person.bio(),
      ]
    );
  }

  const result = await query<{ count: string }>(`
    SELECT COUNT(*) AS count
    FROM users
  `);

  console.log(`✅ Users available: ${result.rows[0].count}`);
}