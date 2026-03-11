"use client"

import { useEffect, useState } from "react"

export default function Admin() {

  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])

  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")

  const [studentName, setStudentName] = useState("")

  const [className, setClassName] = useState("")
  const [year, setYear] = useState("")

  const [selectedTeacher, setSelectedTeacher] = useState("")
  const [selectedClass, setSelectedClass] = useState("")

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null

  // -------------------------
  // LOAD DATA
  // -------------------------

  const loadTeachers = async () => {
    const res = await fetch(
      "https://calia-backend.onrender.com/teachers",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    const data = await res.json()
    setTeachers(data)
  }

  const loadStudents = async () => {
    const res = await fetch(
      "https://calia-backend.onrender.com/students",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    const data = await res.json()
    setStudents(data)
  }

  const loadClasses = async () => {
    const res = await fetch(
      "https://calia-backend.onrender.com/classes",
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    const data = await res.json()
    setClasses(data)
  }

  useEffect(() => {
    loadTeachers()
    loadStudents()
    loadClasses()
  }, [])

  // -------------------------
  // CREATE TEACHER
  // -------------------------

  const handleCreateTeacher = async () => {

    const res = await fetch(
      "https://calia-backend.onrender.com/teachers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          email,
          full_name: fullName
        })
      }
    )

    const result = await res.json()

    alert(
      `Professor criado!\n\nEmail: ${result.email}\nSenha: ${result.temporary_password}`
    )

    setEmail("")
    setFullName("")

    loadTeachers()
  }

  // -------------------------
  // CREATE STUDENT
  // -------------------------

  const handleCreateStudent = async () => {

    const res = await fetch(
      "https://calia-backend.onrender.com/students",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: studentName
        })
      }
    )

    await res.json()

    alert("Aluno criado com sucesso")

    setStudentName("")

    loadStudents()
  }

  // -------------------------
  // CREATE CLASS
  // -------------------------

  const handleCreateClass = async () => {

    const res = await fetch(
      "https://calia-backend.onrender.com/classes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: className,
          year: year
        })
      }
    )

    await res.json()

    alert("Turma criada")

    setClassName("")
    setYear("")

    loadClasses()
  }

  // -------------------------
  // ASSIGN TEACHER TO CLASS
  // -------------------------

  const handleAssignTeacher = async () => {

    if (!selectedTeacher || !selectedClass) {
      alert("Selecione professor e turma")
      return
    }

    await fetch(
      "https://calia-backend.onrender.com/assign-teacher",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          teacher_id: selectedTeacher,
          class_id: selectedClass
        })
      }
    )

    alert("Professor vinculado à turma")

    setSelectedTeacher("")
    setSelectedClass("")
  }

  // -------------------------
  // UI
  // -------------------------

  return (
    <div>

      <h2>Painel da Escola 🏫</h2>

      <hr />

      {/* CREATE TEACHER */}

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

      <hr style={{ margin: "40px 0" }} />

      {/* CREATE STUDENT */}

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

      <hr style={{ margin: "40px 0" }} />

      {/* CREATE CLASS */}

      <h3>Criar Turma</h3>

      <input
        placeholder="Nome da turma"
        value={className}
        onChange={(e) => setClassName(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Ano"
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />

      <br /><br />

      <button onClick={handleCreateClass}>
        Criar Turma
      </button>

      <hr style={{ margin: "40px 0" }} />

      {/* ASSIGN TEACHER */}

      <h3>Vincular Professor à Turma</h3>

      <select
        value={selectedTeacher}
        onChange={(e) => setSelectedTeacher(e.target.value)}
      >
        <option value="">Selecione Professor</option>

        {teachers.map((t) => (
          <option key={t.id} value={t.id}>
            {t.full_name}
          </option>
        ))}

      </select>

      <br /><br />

      <select
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
      >
        <option value="">Selecione Turma</option>

        {classes.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} - {c.year}
          </option>
        ))}

      </select>

      <br /><br />

      <button onClick={handleAssignTeacher}>
        Vincular
      </button>

      <hr style={{ margin: "40px 0" }} />

      {/* LIST TEACHERS */}

      <h3>Professores</h3>

      <ul>
        {teachers.map((t) => (
          <li key={t.id}>{t.full_name}</li>
        ))}
      </ul>

      <hr />

      {/* LIST STUDENTS */}

      <h3>Alunos</h3>

      <ul>
        {students.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>

      <hr />

      {/* LIST CLASSES */}

      <h3>Turmas</h3>

      <ul>
        {classes.map((c) => (
          <li key={c.id}>
            {c.name} - {c.year}
          </li>
        ))}
      </ul>

    </div>
  )
}
