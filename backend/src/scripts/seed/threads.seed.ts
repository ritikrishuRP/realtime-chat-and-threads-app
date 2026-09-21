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

async function loadDataset(): Promise<DatasetThread[]> {
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

  return threads;
}

export async function seedThreads() {
  console.log("🌱 Seeding threads...");

  const threads = await loadDataset();

  console.log(`✅ Loaded ${threads.length} threads from dataset`);

  const users = (
    await query<{ id: string }>(`
      SELECT id
      FROM users
      ORDER BY id
    `)
  ).rows;

  if (users.length === 0) {
    throw new Error(
      "Cannot seed threads: no users exist."
    );
  }

  const categories = (
    await query<{ id: string; name: string }>(`
      SELECT id, name
      FROM categories
    `)
  ).rows;

  const categoryMap = new Map(
    categories.map((category) => [
      category.name,
      category.id,
    ])
  );

  for (const thread of threads) {
    const categoryId = categoryMap.get(thread.category);

    if (!categoryId) {
      throw new Error(
        `Category not found: ${thread.category}`
      );
    }

    const randomUser =
      users[Math.floor(Math.random() * users.length)];

    const result = await query<{ id: string }>(
      `
      INSERT INTO threads (
        category_id,
        author_user_id,
        title,
        body
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [
        categoryId,
        randomUser.id,
        thread.title,
        thread.body,
      ]
    );

    console.log(
      `Inserted Thread ID: ${result.rows[0].id}`
    );
  }

  console.log(`✅ Inserted ${threads.length} threads`);
}