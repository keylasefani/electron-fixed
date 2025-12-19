const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  printTicket: (htmlContent) => ipcRenderer.invoke('print-ticket', htmlContent),
  printTicketToPrinter: (htmlContent, printerName) =>
    ipcRenderer.invoke('print-ticket-to-printer', { htmlContent, printerName }),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  resetQueue: () => ipcRenderer.invoke('reset-antrian')
});
