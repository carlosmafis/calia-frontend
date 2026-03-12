"use client"

import { useEffect, useState } from "react"

export default function Professor() {

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null

  if(!token){
    return <div>Carregando...</div>
  }

  const [classes,setClasses] = useState([])
  const [students,setStudents] = useState([])
  const [assessments,setAssessments] = useState([])

  const [selectedClass,setSelectedClass] = useState("")
  const [selectedStudent,setSelectedStudent] = useState("")
  const [selectedAssessment,setSelectedAssessment] = useState("")

  const [file,setFile] = useState(null)

  const [result,setResult] = useState(null)

  // =========================
  // CARREGAR TURMAS DO PROFESSOR
  // =========================

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

  // =========================
  // CARREGAR ALUNOS
  // =========================

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

    const filtered = data.filter(
      s => s.class_id === selectedClass
    )

    setStudents(filtered)

  }

  // =========================
  // CARREGAR AVALIAÇÕES
  // =========================

  const loadAssessments = async () => {

    const res = await fetch(
      "https://calia-backend.onrender.com/assessments",
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    )

    const data = await res.json()

    const filtered = data.filter(
      a => a.class_id === selectedClass
    )

    setAssessments(filtered)

  }

  // =========================
  // OCR CORREÇÃO
  // =========================

  const handleUpload = async () => {

    if(!file || !selectedStudent || !selectedAssessment){

      alert("Selecione avaliação, aluno e foto")

      return
    }

    const formData = new FormData()

    formData.append("assessment_id",selectedAssessment)
    formData.append("student_id",selectedStudent)
    formData.append("file",file)

    const res = await fetch(
      "https://calia-backend.onrender.com/ocr/correct",
      {
        method:"POST",
        headers:{
          Authorization:`Bearer ${token}`
        },
        body:formData
      }
    )

    const data = await res.json()

    if(!res.ok){

      alert(data.detail)

      return
    }

    setResult(data.score)

  }

  useEffect(()=>{
    loadClasses()
  },[])

  useEffect(()=>{
    if(selectedClass){
      loadStudents()
      loadAssessments()
    }
  },[selectedClass])

  return (

    <div style={{padding:40}}>

      <h1>Painel Professor</h1>

      <hr/>

      <h3>Turma</h3>

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

      <h3>Avaliação</h3>

      <select
        value={selectedAssessment}
        onChange={(e)=>setSelectedAssessment(e.target.value)}
      >

        <option value="">Selecione</option>

        {assessments.map(a=>(
          <option key={a.id} value={a.id}>
            {a.title}
          </option>
        ))}

      </select>

      <br/><br/>

      <h3>Aluno</h3>

      <select
        value={selectedStudent}
        onChange={(e)=>setSelectedStudent(e.target.value)}
      >

        <option value="">Selecione</option>

        {students.map(s=>(
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}

      </select>

      <br/><br/>

      <input
        type="file"
        accept="image/*"
        onChange={(e)=>setFile(e.target.files[0])}
      />

      <br/><br/>

      <button onClick={handleUpload}>
        Corrigir prova
      </button>

      {result !== null && (
        <>
        <hr/>
        <h2>Nota: {result}</h2>
        </>
      )}

    </div>

  )

}
