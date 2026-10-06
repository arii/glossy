import { spawnSync } from "child_process";
import net from "net";

function printStep(step) {
  console.log(`\n🚀 [BUILD STEP] ${step}...`);
}

function isPortBusy(port) {
  return new Promise((resolve) => {
    let completed = false;
    const done = (val) => {
      if (completed) return;
      completed = true;
      resolve(val);
    };

    const s1 = net.createConnection({ port, host: "127.0.0.1" }, () => {
      s1.end();
      done(true);
    });
    s1.on("error", () => {});

    setTimeout(() => {
      s1.destroy();
      done(false);
    }, 250);
  });
}

function runCommand(cmd, args) {
  const res = spawnSync(cmd, args, { stdio: "inherit", shell: true });
  if (res.status !== 0) {
    console.error(`\n🚨 [BUILD FAILURE] Command failed: ${cmd} ${args.join(" ")}`);
    process.exit(res.status ?? 1);
  }
}

async function main() {
  printStep("1. Synchronizing dictionaries & compiling content");
  runCommand("node", ["scripts/sync-dictionary.mjs"]);
  runCommand("node", ["scripts/compile-tex-to-content.mjs"]);
  runCommand("node", ["scripts/compile-beowulf.mjs"]);

  printStep("2. Building TinaCMS schemas & admin bundle");
  const busy = await isPortBusy(9123);
  if (busy) {
    console.log("ℹ️ Datalayer port 9123 is currently busy; reusing existing compiled schema.");
  } else {
    const hasEnv =
      process.env.NEXT_PUBLIC_TINA_CLIENT_ID &&
      process.env.TINA_TOKEN &&
      process.env.TINA_TOKEN !== "local-build-token";

    const tinaArgs = hasEnv
      ? ["build", "--skip-cloud-checks", "--datalayer-port", "9123"]
      : ["build", "--local", "--skip-cloud-checks", "--datalayer-port", "9123"];

    console.log(`Executing: npx tinacms ${tinaArgs.join(" ")}`);
    runCommand("npx", ["tinacms", ...tinaArgs]);
  }

  printStep("3. Building Next.js production output");
  runCommand("npx", ["next", "build"]);

  console.log("\n✨ Production build completed successfully!\n");
}

main().catch((err) => {
  console.error("Fatal Build Pipeline Exception:", err);
  process.exit(1);
});
