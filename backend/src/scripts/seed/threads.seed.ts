import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { query } from "../../db/db.js";

type DatasetThread = {
  category: "General" | "Q&A" | "Help" | "Showcase";
  title: string;
  body: string;
  replies: {
    body: string;
  }[];
};

export async function seedThreads() {
  console.log("🌱 Seeding threads...");

const outputRoot = path.join(
  process.cwd(),
  "src",
  "scripts",
  "dataset-generator",
  "output"
);

const folders = await readdir(outputRoot);

const threads: DatasetThread[] = [];

for (const folder of folders) {
  const folderPath = path.join(outputRoot, folder);

  const files = await readdir(folderPath);

  for (const fileName of files) {
    if (!fileName.endsWith(".json")) continue;

    const content = await readFile(
      path.join(folderPath, fileName),
      "utf8"
    );

    threads.push(...JSON.parse(content));
  }
}

console.log(`✅ Loaded ${threads.length} threads from dataset`);

  const users = (
    await query<{ id: string }>(`
      SELECT id
      FROM users
      ORDER BY id
    `)
  ).rows;

  const categories = (
    await query<{ id: string; name: string }>(`
      SELECT id, name
      FROM categories
    `)
  ).rows;

  const categoryMap = new Map(
    categories.map((c) => [c.name, c.id])
  );

  for (const thread of threads) {
    const randomUser =
      users[Math.floor(Math.random() * users.length)];

    const insertedThread = await query<{ id: string }>(
  `
  INSERT INTO threads (
    category_id,
    author_user_id,
    title,
    body
  )
  VALUES ($1,$2,$3,$4)
  RETURNING id
  `,
  [
    categoryMap.get(thread.category),
    randomUser.id,
    thread.title,
    thread.body,
  ]
);

console.log(
  `Inserted Thread ID: ${insertedThread.rows[0].id}`
);
  }

  console.log(`✅ Inserted ${threads.length} threads`);
}

