import "dotenv/config";
import { access } from "node:fs/promises";
import path from "node:path";

import { GoogleGenAI } from "@google/genai";

import { datasetSchema } from "./schema.js";
import { generationConfig } from "./config.js";
import { saveDataset } from "./save.js";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

async function fileExists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function generateBatch(
  category: string,
  topics: readonly string[],
  batchNumber: number
) {
  // Folder/file name slug
  const categorySlug =
    category === "Q&A" ? "qna" : category.toLowerCase();

  const filePath = path.join(
    process.cwd(),
    "src",
    "scripts",
    "dataset-generator",
    "output",
    categorySlug,
    `${categorySlug}-${batchNumber}.json`
  );

  if (await fileExists(filePath)) {
    console.log(
      `⏭️ Skipping ${category} Batch ${batchNumber} (already exists)`
    );
    return;
  }

  console.log(`Generating ${category} Batch ${batchNumber}...`);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",

    contents: `
Generate exactly 5 realistic community discussions.

Category:
${category}

Topics:
${topics.join(", ")}

Rules:

- Return ONLY JSON.
- Follow the schema exactly.
- Every thread must contain 6-10 replies.
- Replies should feel like Reddit or StackOverflow.
- Avoid repeating discussions.
`,

    config: {
      responseMimeType: "application/json",
      responseSchema: datasetSchema,
      temperature: 0.9,
    },
  });

  if (!response.text) {
    throw new Error("Gemini returned an empty response.");
  }

  const dataset = JSON.parse(response.text);

  await saveDataset(
    categorySlug,
    `${categorySlug}-${batchNumber}`,
    dataset
  );

  console.log(`✅ ${category} Batch ${batchNumber} Completed`);
}

async function main() {
  for (const config of generationConfig) {
    for (let i = 0; i < config.batches.length; i++) {
      try {
        await generateBatch(
          config.category,
          config.batches[i],
          i + 1
        );
      } catch (error) {
        console.error(
          `❌ Failed: ${config.category} Batch ${i + 1}`
        );
        console.error(error);
      }
    }
  }

  console.log("🎉 Dataset generation completed.");
}

main().catch(console.error);