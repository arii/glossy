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
  if (process.argv.includes("--with-content")) {
    printStep("0. Synchronizing dictionaries & compiling content");
    runCommand("npx", ["tsx", "scripts/sync-dictionary.mjs"]);
    runCommand("npx", ["tsx", "scripts/compile-tex-to-content.mjs"]);
    runCommand("npx", ["tsx", "scripts/compile-beowulf.mjs"]);
  }

  printStep("1. Building TinaCMS schemas & admin bundle");
  const busy = await isPortBusy(9123);
  if (busy) {
    console.log("ℹ️ Datalayer port 9123 is currently busy; reusing existing compiled schema.");
  } else {
    runCommand("npx", ["tinacms", "build", "--skip-cloud-checks"]);
  }

  printStep("3. Building Next.js production output");
  runCommand("npx", ["next", "build"]);

  console.log("\n✨ Production build completed successfully!\n");
}

main().catch((err) => {
  console.error("Fatal Build Pipeline Exception:", err);
  process.exit(1);
});
