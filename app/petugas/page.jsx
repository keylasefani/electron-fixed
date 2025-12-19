'use client'
import QueueCard from '../components/QueueCard'
import BackButton from '../components/BackButton'
import { QUEUE_EVENT, emitQueueUpdate } from '../lib/queueEvents'

export default function PetugasPage(){

  const resetAntrian = () => {
    localStorage.removeItem('queue_last_A')


    localStorage.removeItem('queue_current')
    localStorage.removeItem('queue_history')
    localStorage.removeItem('queue_called')

    emitQueueUpdate()
    alert('Semua antrian berhasil direset.')
  }

  return (
    <div className="panel" style={{ paddingTop: '45px' }}>
      <BackButton />

      <h2 className="h1" style={{ color: '#064e3b' }}>Panel Petugas</h2>
      <p className="muted">Kelola dan panggil nomor antrian</p>

      <button
        onClick={resetAntrian}
        style={{
          marginTop: 15,
          marginBottom: 20,
          padding: '10px 16px',
          background: '#ef4444',
          color: 'white',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 600
        }}
      >
        🔄 Reset Semua Antrian
      </button>

      <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
        <QueueCard service="A" />
      </div>
    </div>
  )
}
