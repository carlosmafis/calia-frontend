"use client"

import { useEffect, useState } from "react"

export default function Admin() {
  const [teachers, setTeachers] = useState([])
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(true)

  const token = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null

  const loadTeachers = async () => {
    const res = await fetch("https://calia-backend.onrender.com/teachers", {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setTeachers(data)
    setLoading(false)
  }

  useEffect(() => {
    loadTeachers()
  }, [])

  const handleCreate = async () => {
    const res = await fetch("https://calia-backend.onrender.com/teachers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        email,
        full_name: fullName
      })
    })

    const result = await res.json()

    alert(
      `Professor criado!\n\nEmail: ${result.email}\nSenha temporária: ${result.temporary_password}`
    )

    setEmail("")
    setFullName("")
    loadTeachers()
  }

  if (loading) return <p>Carregando professores...</p>

  return (
    <div>
      <h2>Painel da Escola 🏫</h2>

      <h3>Criar Professor</h3>

      <input
        placeholder="Nome completo"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
      <br /><br />

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <button onClick={handleCreate}>
        Criar Professor
      </button>

      <hr />

      <h3>Professores da Escola</h3>

      {teachers.length === 0 && <p>Nenhum professor cadastrado.</p>}

      <ul>
        {teachers.map((t) => (
          <li key={t.id}>{t.full_name} — {t.role}</li>
        ))}
      </ul>
    </div>
  )
}
