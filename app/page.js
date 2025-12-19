'use client'
import { useState, useEffect, useRef } from 'react'
import QueueButton from './components/QueueButton'
import QueueCard from './components/QueueCard'
import { QUEUE_EVENT, emitQueueUpdate } from './lib/queueEvents'

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState('pelanggan')
  const [current, setCurrent] = useState('-')
  const bellRef = useRef(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const speak = (text) => {
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(text)
      msg.lang = 'id-ID'
      msg.pitch = 1
      msg.rate = 0.9

      const voices = window.speechSynthesis.getVoices()
      let chosen = voices.find(v => v.lang.toLowerCase().includes('id'))
      let femaleLike = voices.find(v =>
        ['female','woman','google','microsoft'].some(key =>
          v.name.toLowerCase().includes(key)
        ) && v.lang.toLowerCase().includes('id')
      )
      if (femaleLike) chosen = femaleLike
      if (chosen) msg.voice = chosen

      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(msg)
    }
  }

  const load = () => {
    if (typeof window === 'undefined') return
    const newNumber = localStorage.getItem('queue_current') || '-'
    if(newNumber !== current && newNumber !== '-') {
      if (bellRef.current) {
        bellRef.current.currentTime = 0
        bellRef.current.play()
      }
      setTimeout(() => {
        speak(`Nomor antrian ${newNumber}. Dipersilakan menuju loket`)
      }, 1200)
    }
    setCurrent(newNumber)
  }

  const resetAntrian = () => {
    if (typeof window === 'undefined') return
    localStorage.removeItem('queue_last_A')
    localStorage.removeItem('queue_current')
    localStorage.removeItem('queue_history')
    localStorage.removeItem('queue_called')
    emitQueueUpdate()
    alert('Semua antrian berhasil direset.')
  }

  useEffect(() => {
    if (activeTab === 'display') {
      load()
      window.addEventListener('storage', load)
      window.addEventListener(QUEUE_EVENT, load)
      window.speechSynthesis.onvoiceschanged = () => {}
      return () => {
        window.removeEventListener('storage', load)
        window.removeEventListener(QUEUE_EVENT, load)
      }
    }
  }, [activeTab, current])

  const layanan = [{ key: 'A', label: 'Layanan A' }]

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    background: isActive ? '#2563eb' : '#e5e7eb',
    color: isActive ? 'white' : '#374151',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'all 0.2s'
  })

  if (!mounted) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      <h1 style={{ fontSize: '42px', margin: 0, color: '#2563eb', fontWeight: 800 }}>
        Sistem Antrian
      </h1>
      <p style={{ color: '#6b7280', marginTop: '8px', marginBottom: '24px' }}>
        Sistem Manajemen Antrian
      </p>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '28px' }}>
        <button onClick={() => setActiveTab('pelanggan')} style={tabStyle(activeTab === 'pelanggan')}>
          👤 Pelanggan
        </button>
        <button onClick={() => setActiveTab('petugas')} style={tabStyle(activeTab === 'petugas')}>
          💼 Petugas
        </button>
        <button onClick={() => setActiveTab('display')} style={tabStyle(activeTab === 'display')}>
          📺 Display
        </button>
      </div>

      {/* Pelanggan Tab */}
      {activeTab === 'pelanggan' && (
        <div style={{ 
          maxWidth: '760px', 
          margin: '0 auto', 
          background: 'rgba(255,255,255,0.85)', 
          backdropFilter: 'blur(6px)', 
          padding: '28px', 
          borderRadius: '20px', 
          boxShadow: '0 12px 30px rgba(2,6,23,0.06)', 
          border: '1px solid rgba(255,255,255,0.6)'
        }}>
          <h2 style={{ fontSize: '28px', margin: '0 0 6px 0', color:'#0f172a' }}>Ambil Nomor Antrian</h2>
          <p style={{ color: '#6b7280' }}>Pilih layanan yang Anda butuhkan</p>
          <div style={{marginTop:20,display:'grid',gap:12}}>
            {layanan.map(l=>(
              <QueueButton key={l.key} label={l.label} service={l.key} />
            ))}
          </div>
        </div>
      )}

      {/* Petugas Tab */}
      {activeTab === 'petugas' && (
        <div style={{ 
          maxWidth: '760px', 
          margin: '0 auto', 
          background: 'rgba(255,255,255,0.85)', 
          backdropFilter: 'blur(6px)', 
          padding: '28px', 
          borderRadius: '20px', 
          boxShadow: '0 12px 30px rgba(2,6,23,0.06)', 
          border: '1px solid rgba(255,255,255,0.6)'
        }}>
          <h2 style={{ fontSize: '28px', margin: '0 0 6px 0', color: '#064e3b' }}>Panel Petugas</h2>
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
      )}

      {/* Display Tab */}
      {activeTab === 'display' && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          borderRadius: '18px', 
          background: 'white', 
          maxWidth: '760px', 
          margin: '0 auto'
        }}>
          <audio src="/sounds/dingdong.mp3" ref={bellRef}></audio>
          <h2 style={{ fontSize: '28px', margin: '0 0 6px 0', color: '#5b21b6' }}>Nomor Antrian</h2>
          <div style={{ fontSize: '56px', fontWeight: 800, color: '#2563eb', margin: '20px 0' }}>{current}</div>
          <p style={{ color: '#6b7280', marginTop: 12 }}>Silakan menuju loket</p>
        </div>
      )}
    </div>
  )
}
