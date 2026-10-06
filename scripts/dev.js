import { spawn } from "child_process";

if (!process.env.TINA_TOKEN) {
  process.env.TINA_TOKEN = "1003b7a92c90f98a00ad4e6cf8e2ad87fb2455d9";
}
if (!process.env.NEXT_PUBLIC_TINA_CLIENT_ID) {
  process.env.NEXT_PUBLIC_TINA_CLIENT_ID = "cc29fe7b-9d48-4d53-83f1-115a9f5f48b8";
}
if (!process.env.NEXT_PUBLIC_TINA_BRANCH) {
  process.env.NEXT_PUBLIC_TINA_BRANCH = "main";
}

console.log("Starting TinaCMS dev server with Next.js (port 4001 + 3000)...");

const child = spawn('npx tinacms dev -c "next dev -p 3000 -H 0.0.0.0"', {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

child.on("close", (code) => {
  process.exit(code ?? 0);
});
