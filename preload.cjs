const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // 🖨 Print HTML ke printer biasa (silent)
  printToPrinter: (htmlContent, printerName) =>
    ipcRenderer.invoke("print-ticket-to-printer", {
      htmlContent,
      printerName
    }),

  // 🧾 Print ke thermal printer (ESC/POS)
  printThermal: ({ queueCode, service, printerName }) =>
    ipcRenderer.invoke("print-thermal", {
      queueCode,
      service,
      printerName
    }),

  // 🖨 Ambil list printer
  getPrinters: () => ipcRenderer.invoke("get-printers"),

  // 🔄 Reset antrian
  resetQueue: () => ipcRenderer.invoke("reset-antrian")
});
