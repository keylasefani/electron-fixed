import { app, BrowserWindow, ipcMain } from "electron";
import net from "net";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ================= WAIT NEXT READY ================= */
function waitForNext(callback) {
  const tryConnect = () => {
    const socket = net.createConnection(3000, "127.0.0.1");
    socket.on("connect", () => {
      socket.destroy();
      callback();
    });
    socket.on("error", () => {
      setTimeout(tryConnect, 300);
    });
  };
  tryConnect();
}

/* ================= CREATE WINDOW ================= */
function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.webContents.openDevTools();
  win.loadURL("http://localhost:3000");

  win.webContents.once("did-finish-load", () => {
    console.log("✅ Next.js loaded in Electron");
  });
}

/* ================= APP READY ================= */
app.whenReady().then(() => {
  console.log("⏳ Waiting Next.js on localhost:3000...");
  waitForNext(() => {
    console.log("✅ Next.js ready, opening Electron window");
    createWindow();
  });
});

/* ================= RESET ANTRIAN ================= */
const queueFilePath = path.join(__dirname, "app", "api", "queue.json");

ipcMain.handle("reset-antrian", async () => {
  try {
    // Hanya 1 loket: loketA
    const defaultQueue = { loketA: 0 };
    fs.writeFileSync(queueFilePath, JSON.stringify(defaultQueue, null, 2));
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

/* ================= PRINT ================= */
ipcMain.handle("print-ticket-to-printer", async (e, { htmlContent, printerName }) => {
  const win = new BrowserWindow({ show: false });

  await win.loadURL(
    `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`
  );

  return new Promise((resolve) => {
    win.webContents.print(
      {
        silent: true,
        printBackground: true,
        deviceName: printerName
      },
      (success) => {
        win.close();
        resolve(success);
      }
    );
  });
});

/* ================= PRINTER LIST ================= */
ipcMain.handle("get-printers", async () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (!win) return [];
  return (await win.webContents.getPrintersAsync()).map(p => ({
    name: p.name,
    isDefault: p.isDefault
  }));
});

/* ================= APP CLOSE ================= */
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
