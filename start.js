import { spawn } from "child_process";
import net from "net";

// --- Start Next.js ---
console.log("Menjalankan Next.js pada port 3000...");
const nextDev = spawn("npm", ["run", "dev"], {
  shell: true,
  stdio: "inherit",
});

function waitForNext(callback) {
  const tryConnect = () => {
    const socket = net.createConnection(3000, "127.0.0.1");
    socket.on("connect", () => {
      socket.end();
      callback();
    });
    socket.on("error", () => {
      setTimeout(tryConnect, 500);
    });
  };
  tryConnect();
}

// --- Setelah Next.js siap, buka Electron ---
waitForNext(() => {
  console.log("Next.js siap! Membuka Electron...");
  spawn("npm", ["run", "ele"], {
    shell: true,
    stdio: "inherit",
  });
});
