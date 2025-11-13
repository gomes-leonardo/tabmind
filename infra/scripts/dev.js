const { spawn, execSync } = require("child_process");

function run(cmd) {
  execSync(cmd, { stdio: "inherit", shell: true });
}

let interrupted = false;
let cleaning = false;

function cleanup() {
  if (cleaning) return;
  cleaning = true;

  console.log("\n🛑 Parando servidor de desenvolvimento...\n");
  try {
    run("npm run postdev");
  } catch (e) {
    console.error("Erro ao parar containers:", e.message);
  }

  const code = interrupted ? 0 : 0;
  process.exit(code);
}

function spawnNext() {
  run("npm run services:up");
  run("npm run services:wait:database");
  run("npm run migrations:up");

  const nextDev = spawn("next", ["dev"], { stdio: "inherit", shell: true });

  process.on("SIGINT", () => {
    interrupted = true;
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /pid ${nextDev.pid} /T /F`, { stdio: "ignore" });
      } else {
        nextDev.kill("SIGTERM");
      }
    } catch (error) {
      console.error(error);
    }
    cleanup("SIGINT");
  });

  process.on("SIGTERM", () => {
    try {
      if (process.platform === "win32") {
        execSync(`taskkill /pid ${nextDev.pid} /T /F`, { stdio: "ignore" });
      } else {
        nextDev.kill("SIGTERM");
      }
    } catch (error) {
      console.error(error);
    }
    cleanup("SIGTERM");
  });

  nextDev.on("exit", () => {
    if (interrupted) return;
    cleanup("CHILD_EXIT");
  });
}

spawnNext();
