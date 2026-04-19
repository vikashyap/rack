import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SEARCH_DIRS = ["apps/web/src", "packages/ui/src", "packages/device-templates/src"];
const FILE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".mjs", ".cjs"]);

const forbiddenColorPattern =
  /\b(?:bg|text|fill|stroke|border|shadow|ring|from|via|to)-\[[^\]]*(?:rgba\s*\(|rgb\s*\(|#[0-9a-fA-F]{3,8})[^\]]*\]/;

async function walk(dir, output = []) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name === "dist" || entry.name === "node_modules" || entry.name === ".turbo") {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath, output);
      continue;
    }

    if (FILE_EXTENSIONS.has(path.extname(entry.name))) {
      output.push(fullPath);
    }
  }

  return output;
}

const violations = [];

for (const relativeDir of SEARCH_DIRS) {
  const files = await walk(path.join(ROOT, relativeDir));

  for (const file of files) {
    const contents = await readFile(file, "utf8");
    const lines = contents.split(/\r?\n/);

    lines.forEach((line, index) => {
      if (!line.includes("[") && !line.includes("rgba") && !line.includes("rgb")) {
        return;
      }

      if (forbiddenColorPattern.test(line)) {
        violations.push(`${path.relative(ROOT, file)}:${index + 1}: forbidden arbitrary color value in Tailwind class`);
      }

      forbiddenColorPattern.lastIndex = 0;
    });
  }
}

if (violations.length > 0) {
  console.error("Design token check failed:");
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  console.error("");
  console.error("Use semantic tokens or CSS variables instead of arbitrary Tailwind color values.");
  process.exit(1);
}

