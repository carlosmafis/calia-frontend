"use client"

import { useEffect, useState } from "react"

export default function SuperAdmin() {
  const [schools, setSchools] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("access_token")

    fetch("https://calia-backend.onrender.com/schools", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setSchools(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <p>Carregando escolas...</p>

  return (
    <div>
      <h2>Painel Global 👑</h2>
      <h3>Escolas cadastradas:</h3>

      {schools.length === 0 && <p>Nenhuma escola cadastrada.</p>}

      <ul>
        {schools.map((school) => (
          <li key={school.id}>
            <strong>{school.name}</strong> — Plano: {school.plan}
          </li>
        ))}
      </ul>
    </div>
  )
}
