"use client"
import { useEffect, useState } from 'react'

export default function QueueButton({ label, service }) {
  const [isClient, setIsClient] = useState(false)
  const [printers, setPrinters] = useState([])
  const [selectedPrinter, setSelectedPrinter] = useState('')
  const [loading, setLoading] = useState(false)
  const [printing, setPrinting] = useState(false)

  useEffect(() => {
    setIsClient(true)
    loadPrinters()
  }, [])

  const loadPrinters = async () => {
    setLoading(true)
    try {
      if (window.electronAPI?.getPrinters) {
        const list = await window.electronAPI.getPrinters()
        console.log('Printers loaded:', list)
        setPrinters(list)

        if (list.length === 0) {
          console.warn('No printers found! Please check your printer installation.')
        }

        const saved = localStorage.getItem('selected_printer')
        if (saved && list.find(p => p.name === saved)) {
          setSelectedPrinter(saved)
        } else {
          const defaultPrinter = list.find(p => p.isDefault)
          if (defaultPrinter) {
            setSelectedPrinter(defaultPrinter.name)
            localStorage.setItem('selected_printer', defaultPrinter.name)
          }
        }
      }
    } catch (err) {
      console.error('Error loading printers:', err)
      alert('Gagal memuat daftar printer: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const takeNumber = async () => {
    if (!isClient || printing) return

    if (!selectedPrinter && window.electronAPI) {
      alert('Silakan pilih printer terlebih dahulu!')
      return
    }

    setPrinting(true)
    try {
      const key = `queue_last_${service}`
      const last = parseInt(localStorage.getItem(key) || "0", 10)
      const next = last + 1
      localStorage.setItem(key, String(next))

      const code = `${service}${String(next).padStart(3, "0")}`

      const hist = JSON.parse(localStorage.getItem('queue_history') || '[]')
      hist.push({ code, service, ts: Date.now() })
      localStorage.setItem('queue_history', JSON.stringify(hist))
      window.dispatchEvent(new Event('storage'))

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            @page { size: 80mm 297mm; margin: 0; }
            body { font-family: Arial, sans-serif; padding: 20px; text-align: center; margin: 0; width: 80mm; }
            h3 { margin: 0 0 10px 0; font-size: 20px; }
            .code { font-size: 48px; font-weight: 800; margin: 20px 0; letter-spacing: 2px; }
            .service { font-size: 18px; margin: 10px 0; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
            .timestamp { font-size: 10px; color: #999; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h3>Nomor Antrian</h3>
          <div class="code">${code}</div>
          <div class="service">Layanan ${service}</div>
          <div class="footer">Terima kasih</div>
          <div class="timestamp">${new Date().toLocaleString('id-ID')}</div>
        </body>
        </html>
      `;

      if (window.electronAPI?.printTicketToPrinter) {
        const ok = await window.electronAPI.printTicketToPrinter(html, selectedPrinter)
        if (!ok) throw new Error('Print failed')
        alert(`✅ Nomor antrian ${code} berhasil dicetak!`)
      } else {
        const w = window.open('', '_blank')
        if (w) {
          w.document.write(html)
          w.document.close()
          w.focus()
          w.print()
          w.close()
        }
      }
    } catch (err) {
      console.error(err)
      alert('Terjadi kesalahan saat mengambil nomor: ' + err.message)
    } finally {
      setPrinting(false)
    }
  }

  const handlePrinterChange = (e) => {
    const printer = e.target.value
    setSelectedPrinter(printer)
    localStorage.setItem('selected_printer', printer)
  }

  return (
    <div className="space-y-2">
      {printers.length > 0 && (
        <div className="flex gap-2">
          <select 
            value={selectedPrinter} 
            onChange={handlePrinterChange}
            disabled={loading}
            className="flex-1 p-2 border rounded"
          >
            <option value="">Pilih Printer</option>
            {printers.map(p => (
              <option key={p.name} value={p.name}>
                {p.displayName || p.name} {p.isDefault ? '⭐' : ''}
              </option>
            ))}
          </select>
          <button
            onClick={loadPrinters}
            disabled={loading}
            className="px-3 py-2 border rounded hover:bg-gray-100"
          >
            {loading ? '⏳' : '🔄'}
          </button>
        </div>
      )}

      <button 
        onClick={takeNumber} 
        disabled={printing}
        className="btn btn-blue btn-block btn-large disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {printing ? '⏳ Mencetak...' : label}
      </button>
    </div>
  )
}
