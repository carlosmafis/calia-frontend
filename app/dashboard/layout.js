"use client"

export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: "flex" }}>
      
      <div style={{
        width: "220px",
        background: "#111",
        color: "white",
        minHeight: "100vh",
        padding: "20px"
      }}>
        <h3>CALIA</h3>
        <p>Menu</p>
        <a href="/dashboard" style={{ color: "white" }}>Início</a>
        <br /><br />
        <button
          onClick={() => {
            localStorage.removeItem("access_token")
            window.location.href = "/login"
          }}
        >
          Sair
        </button>
      </div>

      <div style={{ flex: 1, padding: "30px" }}>
        {children}
      </div>

    </div>
  )
}
