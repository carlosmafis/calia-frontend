"use client"

import { useEffect, useState } from "react"

export default function Admin() {

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null

  const [classes,setClasses] = useState([])
  const [students,setStudents] = useState([])

  const [className,setClassName] = useState("")
  const [classYear,setClassYear] = useState("")

  const [selectedClass,setSelectedClass] = useState("")
  const [studentName,setStudentName] = useState("")

  const [file,setFile] = useState(null)

  // =============================
  // CARREGAR TURMAS
  // =============================

  const loadClasses = async () => {

    const res = await fetch(
      "https://calia-backend.onrender.com/classes",
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    )

    const data = await res.json()

    setClasses(data)

  }

  // =============================
  // CARREGAR ALUNOS
  // =============================

  const loadStudents = async () => {

    const res = await fetch(
      "https://calia-backend.onrender.com/students",
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    )

    const data = await res.json()

    setStudents(data)

  }

  // =============================
  // CRIAR TURMA
  // =============================

  const handleCreateClass = async () => {

    if(!className || !classYear){
      alert("Preencha nome e ano")
      return
    }

    await fetch(
      "https://calia-backend.onrender.com/classes",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({
          name:className,
          year:classYear
        })
      }
    )

    setClassName("")
    setClassYear("")

    loadClasses()

  }

  // =============================
  // CRIAR ALUNO
  // =============================

  const handleCreateStudent = async () => {

    if(!selectedClass){
      alert("Selecione a turma")
      return
    }

    if(!studentName){
      alert("Digite o nome do aluno")
      return
    }

    await fetch(
      "https://calia-backend.onrender.com/students",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({
          name:studentName,
          class_id:selectedClass
        })
      }
    )

    setStudentName("")

    loadStudents()

  }

  // =============================
  // IMPORTAR ALUNOS
  // =============================

  const handleImportStudents = async () => {

    if(!file || !selectedClass){
      alert("Selecione turma e planilha")
      return
    }

    const formData = new FormData()

    formData.append("class_id",selectedClass)
    formData.append("file",file)

    await fetch(
      "https://calia-backend.onrender.com/students-upload",
      {
        method:"POST",
        headers:{
          Authorization:`Bearer ${token}`
        },
        body:formData
      }
    )

    loadStudents()

  }

  // =============================
  // ALTERAR STATUS
  // =============================

  const updateStatus = async (id,status) => {

    await fetch(
      `https://calia-backend.onrender.com/students/${id}`,
      {
        method:"PUT",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({
          status:status
        })
      }
    )

    loadStudents()

  }

  // =============================
  // LOAD INICIAL
  // =============================

  useEffect(()=>{

    loadClasses()
    loadStudents()

  },[])

  return (

    <div style={{padding:40}}>

      <h1>Painel Admin</h1>

      <hr/>

      <h2>Criar Turma</h2>

      <input
        placeholder="Nome da turma"
        value={className}
        onChange={(e)=>setClassName(e.target.value)}
      />

      <br/><br/>

      <input
        placeholder="Ano"
        value={classYear}
        onChange={(e)=>setClassYear(e.target.value)}
      />

      <br/><br/>

      <button onClick={handleCreateClass}>
        Criar Turma
      </button>

      <hr/>

      <h2>Criar Aluno</h2>

      <label>Turma</label>

      <br/>

      <select
        value={selectedClass}
        onChange={(e)=>setSelectedClass(e.target.value)}
      >

        <option value="">Selecione</option>

        {classes.map(c=>(
          <option key={c.id} value={c.id}>
            {c.name} - {c.year}
          </option>
        ))}

      </select>

      <br/><br/>

      <input
        placeholder="Nome do aluno"
        value={studentName}
        onChange={(e)=>setStudentName(e.target.value)}
      />

      <br/><br/>

      <button onClick={handleCreateStudent}>
        Criar aluno
      </button>

      <hr/>

      <h2>Importar alunos (planilha)</h2>

      <input
        type="file"
        accept=".csv"
        onChange={(e)=>setFile(e.target.files[0])}
      />

      <br/><br/>

      <button onClick={handleImportStudents}>
        Importar
      </button>

      <hr/>

      <h2>Alunos cadastrados</h2>

      {students.map(s=>(

        <div
          key={s.id}
          style={{
            border:"1px solid #ddd",
            padding:10,
            marginBottom:10
          }}
        >

          <strong>{s.name}</strong>

          <br/>

          Status: {s.status}

          <br/><br/>

          <button
            onClick={()=>updateStatus(s.id,"CURSANDO")}
          >
            Cursando
          </button>

          <button
            onClick={()=>updateStatus(s.id,"TRANSFERIDO")}
          >
            Transferido
          </button>

          <button
            onClick={()=>updateStatus(s.id,"ABANDONO")}
          >
            Abandono
          </button>

        </div>

      ))}

    </div>

  )

}