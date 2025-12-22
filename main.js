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

// ========================================
// 🧾 IPC Handlers untuk Thermal Printer
// ========================================

// Get list printers
ipcMain.handle("get-printers", async () => {
  const win = BrowserWindow.getAllWindows()[0];
  if (!win) return [];
  
  try {
    const printers = await win.webContents.getPrintersAsync();
    return printers;
  } catch (error) {
    console.error("Error getting printers:", error);
    return [];
  }
});

// Print ke thermal printer dengan ESC/POS
ipcMain.handle("print-thermal", async (event, { queueCode, service, printerName }) => {
  try {
    const printer = new ThermalPrinter({
      type: PrinterTypes.EPSON,
      interface: `printer:${printerName}`,
      width: 48,
      characterSet: 'PC437_USA',
      removeSpecialCharacters: false,
      lineCharacter: "-"
    });

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID');
    const timeStr = now.toLocaleTimeString('id-ID');

    // Header
    printer.alignCenter();
    printer.bold(true);
    printer.setTextSize(1, 1);
    printer.println("SISTEM ANTRIAN");
    printer.bold(false);
    printer.setTextSize(0, 0);
    printer.println("================================");
    printer.newLine();

    // Nomor Antrian (BESAR)
    printer.bold(true);
    printer.setTextSize(2, 2);
    printer.println(queueCode);
    printer.setTextSize(0, 0);
    printer.bold(false);
    printer.newLine();

    // Info Layanan
    printer.alignLeft();
    printer.println(`Layanan      : ${service}`);
    printer.println(`Tanggal      : ${dateStr}`);
    printer.println(`Waktu        : ${timeStr}`);
    printer.println("================================");
    printer.newLine();

    // Footer
    printer.alignCenter();
    printer.println("Terima kasih");
    printer.println("Mohon menunggu panggilan");
    printer.newLine();
    printer.newLine();
    printer.newLine();

    // Cut paper
    printer.cut();

    await printer.execute();
    console.log("✅ Thermal print berhasil:", queueCode);
    
    return { success: true };
  } catch (error) {
    console.error("❌ Thermal print error:", error);
    return { success: false, error: error.message };
  }
});

