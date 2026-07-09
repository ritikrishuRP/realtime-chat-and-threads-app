import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { query } from "../../db/db.js";

type DatasetThread = {
  category: string;
  title: string;
  body: string;
  replies: {
    body: string;
  }[];
};

export async function seedReplies() {
  console.log("🌱 Seeding replies...");

const outputRoot = path.join(
  process.cwd(),
  "src",
  "scripts",
  "dataset-generator",
  "output"
);

const folders = await readdir(outputRoot);

const dataset: DatasetThread[] = [];

for (const folder of folders) {
  const folderPath = path.join(outputRoot, folder);

  const files = await readdir(folderPath);

  for (const fileName of files) {
    if (!fileName.endsWith(".json")) continue;

    const content = await readFile(
      path.join(folderPath, fileName),
      "utf8"
    );

    dataset.push(...JSON.parse(content));
  }
}

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
      ORDER BY id DESC
      LIMIT $1
    `, [dataset.length])
  ).rows.reverse();

  for (let i = 0; i < dataset.length; i++) {
    const thread = dataset[i];
    const threadId = threads[i].id;

    for (const reply of thread.replies) {
      const randomUser =
        users[Math.floor(Math.random() * users.length)];

      await query(
        `
        INSERT INTO replies (
          thread_id,
          author_user_id,
          body
        )
        VALUES ($1,$2,$3)
        `,
        [
          threadId,
          randomUser.id,
          reply.body,
        ]
      );
    }
  }

  console.log("✅ Replies inserted.");
}