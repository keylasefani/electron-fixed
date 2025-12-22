"use client"
import { useState, useEffect } from 'react'

export default function QueueButton({ label, service }) {
  const [mounted, setMounted] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const takeNumber = async () => {
    if (processing || !mounted) return

    setProcessing(true)
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

      // 🖨️ Print ke thermal printer (auto-detect)
      if (window.electronAPI) {
        try {
          // Printer akan di-auto detect di main process
          const result = await window.electronAPI.printThermal({
            queueCode: code,
            service: `Layanan ${service}`,
            printerName: '' // Kosongkan untuk auto-detect
          })
          
          if (result.success) {
            console.log('✅ Print berhasil!')
          } else {
            console.error('❌ Print gagal:', result.error)
            alert('⚠️ Gagal print: ' + result.error)
          }
        } catch (printErr) {
          console.error('Print error:', printErr)
          alert('⚠️ Error print: ' + printErr.message)
        }
      }

      alert(`✅ Nomor antrian Anda:\n\n${code}\n\nLayanan ${service}`)
    } catch (err) {
      console.error(err)
      alert('Terjadi kesalahan: ' + err.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <button 
      onClick={takeNumber} 
      disabled={processing}
      style={{
        width: '100%',
        padding: '16px 24px',
        background: processing ? '#9ca3af' : '#2563eb',
        color: 'white',
        border: 'none',
        borderRadius: '12px',
        fontSize: '18px',
        fontWeight: 600,
        cursor: processing ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s'
      }}
    >
      {processing ? '⏳ Memproses...' : label}
    </button>
  )
}
