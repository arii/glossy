import { spawn } from "child_process";

console.log("Starting TinaCMS dev server with Next.js (port 4001 + 3000)...");

const child = spawn('npx tinacms dev -c "next dev -p 3000 -H 0.0.0.0"', {
  stdio: "inherit",
  shell: true,
});

child.on("close", (code) => {
  process.exit(code ?? 0);
});
