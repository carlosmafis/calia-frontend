"use client"

import { useEffect, useState } from "react"

export default function Admin() {
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])

  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")

  const [studentName, setStudentName] = useState("")

  const token = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null

  const loadTeachers = async () => {
    const res = await fetch("https://calia-backend.onrender.com/teachers", {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setTeachers(data)
  }

  const loadStudents = async () => {
    const res = await fetch("https://calia-backend.onrender.com/students", {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setStudents(data)
  }

  useEffect(() => {
    loadTeachers()
    loadStudents()
  }, [])

  const handleCreateTeacher = async () => {
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
      `Professor criado!\n\nEmail: ${result.email}\nSenha: ${result.temporary_password}`
    )

    setEmail("")
    setFullName("")
    loadTeachers()
  }

  const handleCreateStudent = async () => {
    const res = await fetch("https://calia-backend.onrender.com/students", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        name: studentName
      })
    })

    await res.json()

    alert("Aluno criado com sucesso")

    setStudentName("")
    loadStudents()
  }

  return (
    <div>

      <h2>Painel da Escola 🏫</h2>

      <hr />

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

      <button onClick={handleCreateTeacher}>
        Criar Professor
      </button>

      <hr style={{margin:"40px 0"}}/>

      <h3>Criar Aluno</h3>

      <input
        placeholder="Nome do aluno"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
      />

      <br /><br />

      <button onClick={handleCreateStudent}>
        Criar Aluno
      </button>

      <hr style={{margin:"40px 0"}}/>

      <h3>Professores</h3>

      <ul>
        {teachers.map((t) => (
          <li key={t.id}>{t.full_name}</li>
        ))}
      </ul>

      <hr />

      <h3>Alunos</h3>

      <ul>
        {students.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>

    </div>
  )
}
