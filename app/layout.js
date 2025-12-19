import './globals.css'

export const metadata = {
  title: 'Sistem Antrian',
  description: 'Sistem antrian - demo',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="bg-gradient min-h-screen">
        <div className="container">{children}</div>
      </body>
    </html>
  )
}
