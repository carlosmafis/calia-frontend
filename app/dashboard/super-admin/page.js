"use client"

import { useEffect, useState } from "react"

export default function SuperAdmin() {
  const [schools, setSchools] = useState([])
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const token = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null

  const loadSchools = async () => {
    const res = await fetch("https://calia-backend.onrender.com/schools", {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    const data = await res.json()
    setSchools(data)
    setLoading(false)
  }

  useEffect(() => {
    loadSchools()
  }, [])

  const handleCreate = async () => {
    if (!name || !slug) {
      alert("Preencha nome e slug")
      return
    }

    setCreating(true)

    const res = await fetch("https://calia-backend.onrender.com/schools", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name,
        slug,
        plan: "free"
      })
    })

    if (!res.ok) {
      alert("Erro ao criar escola")
      setCreating(false)
      return
    }

    setName("")
    setSlug("")
    await loadSchools()
    setCreating(false)
  }

  if (loading) return <p>Carregando escolas...</p>

  return (
    <div>
      <h2>Painel Global 👑</h2>

      <div style={{
        border: "1px solid #ddd",
        padding: 20,
        marginBottom: 30
      }}>
        <h3>Criar Nova Escola</h3>

        <input
          placeholder="Nome da escola"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <br /><br />

        <input
          placeholder="Slug (ex: escola-abc)"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        />
        <br /><br />

        <button onClick={handleCreate} disabled={creating}>
          {creating ? "Criando..." : "Criar Escola"}
        </button>
      </div>

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
