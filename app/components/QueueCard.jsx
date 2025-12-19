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

    // Load printer list
    if (typeof window !== 'undefined' && window.electronAPI) {
      window.electronAPI.getPrinters().then(printerList => {
        setPrinters(printerList)
        const defaultPrinter = printerList.find(p => p.isDefault)
        if (defaultPrinter) {
          setSelectedPrinter(defaultPrinter.name)
        }
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
      return alert('Pilih printer thermal terlebih dahulu')
    }

    const result = await window.electronAPI.printThermal(next.code, service, selectedPrinter)
    
    if (result.success) {
      alert(`Tiket ${next.code} berhasil dicetak ke printer thermal!`)
    } else {
      alert(`Gagal print: ${result.error}`)
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
        
        {printers.length > 0 && (
          <div style={{ marginTop: 12 }}>
            <label style={{ fontSize: 13, color: '#64748b', display: 'block', marginBottom: 4 }}>
              Printer Thermal:
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
              <option value="">Pilih Printer</option>
              {printers.map(p => (
                <option key={p.name} value={p.name}>
                  {p.name} {p.isDefault ? '(Default)' : ''}
                </option>
              ))}
            </select>
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
