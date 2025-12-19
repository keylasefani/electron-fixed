'use client'
import QueueButton from '../components/QueueButton'
import BackButton from '../components/BackButton'

export default function PelangganPage(){
  const layanan = [
    { key: 'A', label: 'Layanan A' },
  ]

  return (
    <div className="panel" style={{textAlign:'center', position:'relative', paddingTop:'45px'}}>
      <BackButton />

      <h2 className="h1" style={{color:'#0f172a'}}>Ambil Nomor Antrian</h2>
      <p className="muted">Pilih layanan yang Anda butuhkan</p>

      <div style={{marginTop:20,display:'grid',gap:12}}>
        {layanan.map(l=>(
          <QueueButton key={l.key} label={l.label} service={l.key} />
        ))}
      </div>
    </div>
  )
}
