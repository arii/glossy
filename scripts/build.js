import { spawnSync } from "child_process";
import { existsSync } from "node:fs";
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
    }, 300);
  });
}

function runCommand(cmd, args) {
  const localBin = `./node_modules/.bin/${cmd}`;
  const bin = existsSync(localBin) ? localBin : cmd;
  const res = spawnSync(bin, args, { stdio: "inherit" });
  if (res.status !== 0) {
    console.error(`\n🚨 [BUILD FAILURE] Command failed: ${bin} ${args.join(" ")}`);
    process.exit(res.status ?? 1);
  }
}

async function main() {
  if (process.argv.includes("--with-content")) {
    printStep("0. Compiling content");
    runCommand("tsx", ["scripts/compile-tex-to-content.mjs"]);
    runCommand("tsx", ["scripts/compile-beowulf.mjs"]);
    runCommand("tsx", ["scripts/compile-presets.mjs"]);
  }

  printStep("1. Building TinaCMS schemas & admin bundle");
  const hasGeneratedFiles =
    existsSync("tina/__generated__/client.ts") && existsSync("tina/__generated__/types.ts");
  const busy =
    (await isPortBusy(9000)) ||
    (await isPortBusy(9123)) ||
    (await isPortBusy(4001));

  if (busy && hasGeneratedFiles) {
    console.log("ℹ️ Tina dev server port (9000/9123/4001) is currently busy; reusing existing compiled schema.");
  } else {
    const tinaBin = existsSync("./node_modules/.bin/tinacms") ? "./node_modules/.bin/tinacms" : "tinacms";
    const res = spawnSync(tinaBin, ["build", "--skip-cloud-checks", "--datalayer-port", "9123"], {
      stdio: "inherit",
    });
    if (res.status !== 0) {
      if (hasGeneratedFiles) {
        console.warn("⚠️ tinacms build encountered port/env conflict; reusing pre-generated Tina client and types.");
      } else {
        console.error(`\n🚨 [BUILD FAILURE] Command failed: ${tinaBin} build`);
        process.exit(res.status ?? 1);
      }
    }
  }

  printStep("2. Building Next.js production output");
  runCommand("next", ["build"]);

  console.log("\n✨ Production build completed successfully!\n");
}

main().catch((err) => {
  console.error("Fatal Build Pipeline Exception:", err);
  process.exit(1);
});
