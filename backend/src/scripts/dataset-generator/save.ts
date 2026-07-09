import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export async function saveDataset(
  category: string,
  fileName: string,
  data: unknown
) {
  const outputDir = path.join(
    process.cwd(),
    "src",
    "scripts",
    "dataset-generator",
    "output",
    category.toLowerCase()
  );

  await mkdir(outputDir, { recursive: true });

  const filePath = path.join(outputDir, `${fileName}.json`);

  await writeFile(
    filePath,
    JSON.stringify(data, null, 2),
    "utf-8"
  );

  console.log(`✅ Saved dataset to ${filePath}`);
}