'use client'
import { useEffect, useState } from 'react'
import { QUEUE_EVENT, emitQueueUpdate } from '../lib/queueEvents'

export default function QueueCard({ service }){

  const [pendingCount, setPendingCount] = useState(0)
  const [lastCalled, setLastCalled] = useState('-')

  const loadData = () => {
    const hist = JSON.parse(localStorage.getItem('queue_history') || '[]')
    const called = JSON.parse(localStorage.getItem('queue_called') || '[]')

    const calledSet = new Set(called.map(c => c.code))
    const pending = hist.filter(h => h.service === service && !calledSet.has(h.code))
    setPendingCount(pending.length)

    const last = called.filter(c => c.service === service).slice(-1)[0]
    setLastCalled(last ? last.code : '-')
  }

  useEffect(() => {
    loadData()

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
      </div>
      <button onClick={callNext} className="btn btn-green">Panggil Berikutnya</button>
    </div>
  )
}
