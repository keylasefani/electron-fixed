'use client'
import QueueButton from '../components/QueueButton'
import BackButton from '../components/BackButton'

export default function PelangganPage(){
  const layanan = [
    { key: 'A', label: 'Layanan A' },
  ]

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
      textAlign:'center', 
      position:'relative', 
      paddingTop:'45px'
    }}>
      <BackButton />

      <h2 style={{ fontSize: '32px', margin: '0 0 6px 0', color:'#0f172a' }}>Ambil Nomor Antrian</h2>
      <p style={{ color: '#6b7280' }}>Pilih layanan yang Anda butuhkan</p>

      <div style={{marginTop:20,display:'grid',gap:12}}>
        {layanan.map(l=>(
          <QueueButton key={l.key} label={l.label} service={l.key} />
        ))}
      </div>
    </div>
  )
}
