export const metadata = {
  title: 'Sistem Antrian',
  description: 'Sistem antrian - demo',
}

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <style>{`
          :root {
            --bg1: #e6f0ff;
            --bg2: #f3f6ff;
            --blue: #2563eb;
            --green: #059669;
            --purple: #7c3aed;
            --muted: #6b7280;
          }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { height: 100%; }
          body {
            margin: 0;
            font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
            background: linear-gradient(135deg, var(--bg1), var(--bg2));
            color: #0f172a;
            min-height: 100vh;
          }
        `}</style>
      </head>
      <body suppressHydrationWarning>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '48px' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
