'use client'
import { useEffect, useState } from 'react'
import { QUEUE_EVENT, emitQueueUpdate } from '../lib/queueEvents'

export default function QueueCard({ service }){
  const [mounted, setMounted] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [lastCalled, setLastCalled] = useState('-')
  const [printers, setPrinters] = useState([])
  const [selectedPrinter, setSelectedPrinter] = useState('')

  const loadData = () => {
    if (typeof window === 'undefined') return
    const hist = JSON.parse(localStorage.getItem('queue_history') || '[]')
    const called = JSON.parse(localStorage.getItem('queue_called') || '[]')

    const calledSet = new Set(called.map(c => c.code))
    const pending = hist.filter(h => h.service === service && !calledSet.has(h.code))
    setPendingCount(pending.length)

    const last = called.filter(c => c.service === service).slice(-1)[0]
    setLastCalled(last ? last.code : '-')
  }

  useEffect(() => {
    setMounted(true)
    loadData()

    // Load printer list - hanya printer yang terdeteksi
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.getPrinters().then(printerList => {
        // Filter hanya printer yang statusnya available/ready
        const availablePrinters = printerList.filter(p => 
          p.status === 0 || // Status 0 = ready
          p.status === undefined || // Tidak ada info status, anggap available
          !p.status // Fallback
        )
        setPrinters(availablePrinters)
        
        // Pilih default printer kalau ada
        const defaultPrinter = availablePrinters.find(p => p.isDefault)
        if (defaultPrinter) {
          setSelectedPrinter(defaultPrinter.name)
        } else if (availablePrinters.length > 0) {
          // Kalau tidak ada default, pilih yang pertama
          setSelectedPrinter(availablePrinters[0].name)
        }
      }).catch(err => {
        console.error('Error loading printers:', err)
      })
    }

    window.addEventListener('storage', loadData)
    window.addEventListener(QUEUE_EVENT, loadData)

    return () => {
      window.removeEventListener('storage', loadData)
      window.removeEventListener(QUEUE_EVENT, loadData)
    }
  }, [service])

  const callNext = () => {
    const hist = JSON.parse(localStorage.getItem('queue_history') || '[]')
    const called = JSON.parse(localStorage.getItem('queue_called') || '[]')

    const calledSet = new Set(called.map(c => c.code))
    const pending = hist.filter(h => h.service === service && !calledSet.has(h.code))

    if (!pending.length) return alert(`Tidak ada antrian untuk ${service}`)

    const next = pending[0]
    called.push({ ...next, ts: Date.now() })

    localStorage.setItem('queue_called', JSON.stringify(called))
    localStorage.setItem('queue_current', next.code)

    emitQueueUpdate()
    alert(`Memanggil ${next.code}`)
  }

  const printThermal = async () => {
    if (!window.electronAPI) {
      return alert('Fitur print hanya tersedia di aplikasi desktop')
    }

    const hist = JSON.parse(localStorage.getItem('queue_history') || '[]')
    const called = JSON.parse(localStorage.getItem('queue_called') || '[]')

    const calledSet = new Set(called.map(c => c.code))
    const pending = hist.filter(h => h.service === service && !calledSet.has(h.code))

    if (!pending.length) return alert(`Tidak ada antrian untuk ${service}`)

    const next = pending[0]

    if (!selectedPrinter) {
      return alert('⚠️ Pilih printer thermal terlebih dahulu!\n\nPastikan printer sudah terhubung dan terdeteksi di dropdown.')
    }

    try {
      const result = await window.electronAPI.printThermal({ 
        queueCode: next.code, 
        service, 
        printerName: selectedPrinter 
      })
      
      if (result.success) {
        const driverInfo = result.driver ? ` (driver: ${result.driver})` : ''
        alert(`✅ Tiket ${next.code} berhasil dicetak!\n\nPrinter: ${selectedPrinter}${driverInfo}`)
      } else {
        const errorDetail = result.detail ? `\n\n${result.detail}` : ''
        alert(`❌ Gagal print ke ${selectedPrinter}:\n${result.error}${errorDetail}`)
      }
    } catch (error) {
      alert(`❌ Error saat print: ${error.message}`)
    }
  }

  if (!mounted) {
    return <div className="service-card">Loading...</div>
  }

  return (
    <div className="service-card">
      <div>
        <div style={{ fontWeight: 700 }}>Layanan {service}</div>
        <div style={{ marginTop: 6, fontSize: 20, color: '#334155' }}>
          Terakhir dipanggil: <strong>{lastCalled}</strong>
        </div>
        <div style={{ marginTop: 8, color: '#64748b' }}>
          Menunggu: {pendingCount}
        </div>
        
        {printers.length > 0 ? (
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 4 }}>
              Printer Thermal ({printers.length} terdeteksi):
            </label>
            <select 
              value={selectedPrinter} 
              onChange={(e) => setSelectedPrinter(e.target.value)}
              style={{ 
                padding: '6px 10px', 
                borderRadius: 6, 
                border: '1px solid #cbd5e1',
                fontSize: 14,
                width: '100%'
              }}
            >
              <option value="">-- Pilih Printer --</option>
              {printers.map(p => (
                <option key={p.name} value={p.name}>
                  {p.name} {p.isDefault ? '⭐ (Default)' : ''}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div style={{ 
            marginTop: 12, 
            padding: '8px 12px', 
            background: '#fef3c7', 
            borderRadius: 6,
            fontSize: 13,
            color: '#92400e'
          }}>
            ⚠️ Tidak ada printer terdeteksi. Pastikan printer sudah terhubung.
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button onClick={callNext} className="btn btn-green">
          Panggil Berikutnya
        </button>
        {printers.length > 0 && (
          <button 
            onClick={printThermal} 
            className="btn"
            style={{ background: '#8b5cf6', color: 'white' }}
          >
            🖨️ Print Thermal
          </button>
        )}
      </div>
    </div>
  )
}
