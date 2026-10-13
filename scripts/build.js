import { spawnSync } from "child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import net from "net";
import crypto from "crypto";

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

function getFileHash(filepath) {
  if (!existsSync(filepath)) return null;
  const buffer = readFileSync(filepath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
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

  const lockFilePath = "tina/tina-lock.json";
  const cacheDirPath = "node_modules/.cache/tinacms";
  const hashFilePath = `${cacheDirPath}/lock-hash.txt`;

  const currentHash = getFileHash(lockFilePath);
  let cachedHash = null;
  if (existsSync(hashFilePath)) {
    cachedHash = readFileSync(hashFilePath, "utf8").trim();
  }

  if (hasGeneratedFiles && currentHash && currentHash === cachedHash) {
    console.log("ℹ️ tina-lock.json hasn't changed and generated files exist; skipping Tina build.");
  } else if (busy && hasGeneratedFiles) {
    console.log("ℹ️ Tina dev server port (9000/9123/4001) is currently busy; reusing existing compiled schema.");
  } else {
    // Add environment variable to increase max old space size specifically for TinaCMS build
    const env = { ...process.env, NODE_OPTIONS: `${process.env.NODE_OPTIONS || ''} --max-old-space-size=4096`.trim() };
    const tinaBin = existsSync("./node_modules/.bin/tinacms") ? "./node_modules/.bin/tinacms" : "tinacms";
    const res = spawnSync(tinaBin, ["build", "--skip-cloud-checks", "--datalayer-port", "9123"], {
      stdio: "inherit",
      env: env
    });
    if (res.status !== 0) {
      if (hasGeneratedFiles) {
        console.warn("⚠️ tinacms build encountered port/env conflict; reusing pre-generated Tina client and types.");
      } else {
        console.error(`\n🚨 [BUILD FAILURE] Command failed: ${tinaBin} build`);
        process.exit(res.status ?? 1);
      }
    } else {
      if (currentHash) {
        if (!existsSync(cacheDirPath)) {
          mkdirSync(cacheDirPath, { recursive: true });
        }
        writeFileSync(hashFilePath, currentHash, "utf8");
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
