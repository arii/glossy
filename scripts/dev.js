import { spawn } from "child_process";
import fs from "node:fs";
import path from "node:path";
import prettier from "prettier";

console.log("Starting TinaCMS dev server with Next.js (port 4001 + 3000)...");

// Auto-format and sort JSON files in content/ whenever changed (e.g. by TinaCMS)
const contentDir = path.join(process.cwd(), "content");
const pendingFormatTimeouts = new Map();

async function autoFormatJson(filePath) {
  try {
    if (!filePath.endsWith(".json") || !fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, "utf8");
    const options = await prettier.resolveConfig(filePath);
    const formatted = await prettier.format(content, {
      ...options,
      filepath: filePath,
    });
    if (formatted !== content) {
      fs.writeFileSync(filePath, formatted, "utf8");
      console.log(`[dev] Formatted & sorted JSON keys in ${path.relative(process.cwd(), filePath)}`);
    }
  } catch {
    // Ignore transient errors during rapid filesystem operations
  }
}

if (fs.existsSync(contentDir)) {
  fs.watch(contentDir, { recursive: true }, (eventType, filename) => {
    if (!filename || !filename.endsWith(".json")) return;
    const fullPath = path.join(contentDir, filename);
    if (pendingFormatTimeouts.has(fullPath)) {
      clearTimeout(pendingFormatTimeouts.get(fullPath));
    }
    const timer = setTimeout(() => {
      pendingFormatTimeouts.delete(fullPath);
      autoFormatJson(fullPath);
    }, 200);
    pendingFormatTimeouts.set(fullPath, timer);
  });
}

const child = spawn('npx tinacms dev -c "next dev -p 3000 -H 0.0.0.0"', {
  stdio: "inherit",
  shell: true,
});

child.on("close", (code) => {
  process.exit(code ?? 0);
});
