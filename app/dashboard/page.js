"use client"

import { useEffect } from "react"

export default function Dashboard() {

  useEffect(() => {
    const token = localStorage.getItem("access_token")

    if (!token) {
      window.location.href = "/login"
      return
    }

    fetch("https://calia-backend.onrender.com/me", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (!data.role) {
          window.location.href = "/login"
          return
        }

        if (data.role === "super_admin") {
          window.location.href = "/dashboard/super-admin"
        }

        if (data.role === "admin") {
          window.location.href = "/dashboard/admin"
        }

        if (data.role === "professor") {
          window.location.href = "/dashboard/professor"
        }

        if (data.role === "aluno") {
          window.location.href = "/dashboard/aluno"
        }
      })
  }, [])

  return <p>Carregando painel...</p>
}
