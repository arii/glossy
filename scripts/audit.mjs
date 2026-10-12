import { execSync } from "node:child_process";

const steps = [
  { name: "Deadcode audit (knip)", command: "npm run audit:deadcode" },
  { name: "ESLint check", command: "npm run lint" },
  { name: "TypeScript type check", command: "npm run typecheck" },
  { name: "Corpus Zod schema test", command: "npm run test:schemas" },
  { name: "Validate source glosses", command: "npm run validate:source" },
  { name: "Validate lemmas", command: "npm run validate:lemmas" },
  { name: "Smoke test", command: "npm run test:smoke" },
  { name: "Deployment validation", command: "npm run validate:deploy" },
];

console.log("Running comprehensive Glossy audit suite...\n");

for (const step of steps) {
  console.log(`\x1b[36m▶ Running ${step.name}...\x1b[0m`);
  try {
    execSync(step.command, { stdio: "inherit" });
    console.log(`\x1b[32m✓ ${step.name} passed.\x1b[0m\n`);
  } catch {
    console.error(`\x1b[31m❌ ${step.name} failed!\x1b[0m`);
    process.exit(1);
  }
}

console.log("\x1b[32m✨ All audit checks completed successfully!\x1b[0m");
