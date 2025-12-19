import Link from 'next/link'

export default function Home() {
  return (
    <div className="home">
      <h1 className="title">Sistem Antrian</h1>
      <p className="subtitle">Silakan pilih halaman</p>

      <div className="grid3">
        <Link href="/pelanggan" className="card card-blue">Halaman Pelanggan</Link>
        <Link href="/petugas" className="card card-green">Halaman Petugas</Link>
        <Link href="/display" className="card card-purple">Layar Display</Link>
      </div>
    </div>
  )
}
