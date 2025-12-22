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
    // Auto-detect printer jika tidak ada yang dipilih
    let selectedPrinter = printerName;
    
    if (!selectedPrinter) {
      const win = BrowserWindow.getAllWindows()[0];
      if (win) {
        const printers = await win.webContents.getPrintersAsync();
        // Cari thermal printer atau gunakan default
        const thermalPrinter = printers.find(p => 
          p.name.toLowerCase().includes('pos') || 
          p.name.toLowerCase().includes('thermal') ||
          p.name.toLowerCase().includes('xprinter') ||
          p.name.toLowerCase().includes('receipt') ||
          p.isDefault
        );
        selectedPrinter = thermalPrinter ? thermalPrinter.name : (printers[0]?.name || '');
      }
    }

    if (!selectedPrinter) {
      throw new Error('Tidak ada printer yang tersedia');
    }

    console.log('🖨️ Printing to:', selectedPrinter);

    // Deteksi tipe driver berdasarkan nama printer
    let printerType = PrinterTypes.EPSON; // Default
    const printerLower = selectedPrinter.toLowerCase();
    
    if (printerLower.includes('star')) {
      printerType = PrinterTypes.STAR;
    } else if (printerLower.includes('tanca')) {
      printerType = PrinterTypes.TANCA;
    } else if (printerLower.includes('daruma')) {
      printerType = PrinterTypes.DARUMA;
    }

    console.log('🔧 Using printer type:', printerType);

    // Coba beberapa konfigurasi driver
    const configs = [
      {
        type: printerType,
        interface: `printer:${selectedPrinter}`,
        width: 48,
        characterSet: 'PC437_USA',
      },
      {
        type: PrinterTypes.EPSON,
        interface: `printer:${selectedPrinter}`,
        width: 48,
        characterSet: 'PC437_USA',
      },
      {
        type: PrinterTypes.STAR,
        interface: `printer:${selectedPrinter}`,
        width: 48,
        characterSet: 'PC437_USA',
      }
    ];

    let lastError = null;
    
    // Coba setiap konfigurasi sampai ada yang berhasil
    for (const config of configs) {
      try {
        const printer = new ThermalPrinter({
          ...config,
          removeSpecialCharacters: false,
          lineCharacter: "-",
          options: {
            timeout: 5000
          }
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

        // Nomor Antrian (BESAR)
        printer.bold(true);
        printer.setTextSize(2, 2);
        printer.println(queueCode);
        printer.setTextSize(0, 0);
        printer.bold(false);

        // Info Layanan
        printer.alignLeft();
        printer.println(`Layanan : ${service}`);
        printer.println(`Tanggal : ${dateStr}`);
        printer.println(`Waktu   : ${timeStr}`);
        printer.println("================================");

        // Footer
        printer.alignCenter();
        printer.println("Terima kasih");
        printer.println("Mohon menunggu panggilan");
        printer.newLine();
        printer.newLine();

        // Cut paper
        printer.cut();

        await printer.execute();
        console.log(`✅ Thermal print berhasil dengan driver ${config.type}:`, queueCode);
        
        return { success: true, driver: config.type };
      } catch (err) {
        console.log(`⚠️ Gagal dengan driver ${config.type}:`, err.message);
        lastError = err;
        continue;
      }
    }

    // Kalau semua gagal, throw error terakhir
    throw lastError || new Error('Semua driver gagal');
    
  } catch (error) {
    console.error("❌ Thermal print error:", error);
    return { 
      success: false, 
      error: error.message,
      detail: 'Pastikan:\n1. Printer sudah menyala\n2. Driver printer terinstall\n3. Printer bisa print test page dari Windows'
    };
  }
});

