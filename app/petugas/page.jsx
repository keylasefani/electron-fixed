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
    <div style={{ 
      maxWidth: '760px', 
      margin: '40px auto', 
      background: 'rgba(255,255,255,0.85)', 
      backdropFilter: 'blur(6px)', 
      padding: '28px', 
      borderRadius: '20px', 
      boxShadow: '0 12px 30px rgba(2,6,23,0.06)', 
      border: '1px solid rgba(255,255,255,0.6)',
      paddingTop: '45px' 
    }}>
      <BackButton />

      <h2 style={{ fontSize: '32px', margin: '0 0 6px 0', color: '#064e3b' }}>Panel Petugas</h2>
      <p style={{ color: '#6b7280' }}>Kelola dan panggil nomor antrian</p>

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
