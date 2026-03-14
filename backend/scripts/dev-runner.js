import fs from "fs";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.join(__dirname, "..");
const projectRoot = path.join(backendRoot, "..");
const watchTargets = [
  path.join(backendRoot, "src"),
  path.join(projectRoot, "shared"),
];

let childProcess = null;
let restartTimer = null;
let shuttingDown = false;
let intentionalRestart = false;

function startServer() {
  console.log("[backend:dev] starting backend server");
  childProcess = spawn(process.execPath, [path.join(backendRoot, "src/server.js")], {
    cwd: backendRoot,
    stdio: "inherit",
    env: process.env,
  });

  console.log(`[backend:dev] child pid ${childProcess.pid ?? "unknown"}`);

  childProcess.on("error", (error) => {
    console.error("[backend:dev] failed to start child process:", error);
  });

  childProcess.on("exit", (code, signal) => {
    childProcess = null;

    if (shuttingDown) {
      return;
    }

    const reason = signal ? `signal ${signal}` : `code ${code ?? 0}`;
    console.log(`[backend:dev] server stopped with ${reason}`);

    if (intentionalRestart) {
      intentionalRestart = false;
      return;
    }

    restartTimer = setTimeout(() => {
      restartTimer = null;
      if (!shuttingDown && !childProcess) {
        console.log("[backend:dev] restarting after unexpected exit");
        startServer();
      }
    }, 1000);
  });
}

function restartServer(reason) {
  if (restartTimer) {
    clearTimeout(restartTimer);
  }

  restartTimer = setTimeout(() => {
    restartTimer = null;

    if (shuttingDown) {
      return;
    }

    console.log(`[backend:dev] restarting after change in ${reason}`);

    if (!childProcess) {
      startServer();
      return;
    }

    const previous = childProcess;
    intentionalRestart = true;
    childProcess = null;
    previous.once("exit", () => {
      if (!shuttingDown) {
        startServer();
      }
    });
    previous.kill();
  }, 250);
}

function watchDirectory(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return;
  }

  try {
    fs.watch(targetPath, { recursive: true }, (_eventType, filename) => {
      if (!filename) {
        return;
      }

      if (String(filename).includes(".git")) {
        return;
      }

      restartServer(path.relative(projectRoot, path.join(targetPath, filename)));
    });
  } catch (error) {
    console.warn(`[backend:dev] watch unavailable for ${targetPath}: ${error.message}`);
  }
}

function shutdown(signal) {
  shuttingDown = true;
  console.log(`[backend:dev] shutting down (${signal})`);

  if (!childProcess) {
    process.exit(0);
    return;
  }

  childProcess.once("exit", () => process.exit(0));
  childProcess.kill(signal === "SIGINT" ? "SIGINT" : "SIGTERM");
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

watchTargets.forEach(watchDirectory);
startServer();
