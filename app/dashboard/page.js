"use client"

import { useEffect, useState } from "react"

export default function Dashboard() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem("access_token")

    fetch("https://SEU_BACKEND.onrender.com/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => setUser(data))
  }, [])

  if (!user) return <p>Carregando...</p>

  return (
    <div>
      <h2>Dashboard</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
    </div>
  )
}
