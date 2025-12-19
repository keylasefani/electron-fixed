import { app, BrowserWindow, ipcMain, protocol } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { ThermalPrinter, PrinterTypes } from "node-thermal-printer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    show: false,
    backgroundColor: "#f3f4f6",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (isDev) {
    win.loadURL("http://localhost:3000");
    win.webContents.openDevTools();
    win.show();
  } else {
    const indexPath = path.join(__dirname, "out", "index.html");

    if (!fs.existsSync(indexPath)) {
      console.error("❌ Build belum dijalankan (folder out tidak ada)");
      app.quit();
      return;
    }

    win.loadFile(indexPath).then(() => {
      win.webContents.openDevTools(); // Debug - lihat console untuk error
      win.show();
    }).catch(err => {
      console.error("Load error:", err);
    });
  }

  return win;
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

