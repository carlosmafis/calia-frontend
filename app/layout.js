export const metadata = {
  title: "CALIA 2.0",
  description: "Sistema Inteligente Educacional"
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body style={{ fontFamily: "Arial", padding: 20 }}>
        {children}
      </body>
    </html>
  )
}
