"use client"

import { useEffect, useState } from "react"

export default function Professor() {
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState("")
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [assessmentTitle,setAssessmentTitle] = useState("")
  const [questions,setQuestions] = useState("")
  const [classId,setClassId] = useState("")

  const token = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null

  const loadStudents = async () => {
    const res = await fetch("https://calia-backend.onrender.com/students", {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setStudents(data)
  }

  const loadHistory = async () => {
    const res = await fetch("https://calia-backend.onrender.com/ocr-history", {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setHistory(data)
  }

  useEffect(() => {
    loadStudents()
    loadHistory()
  }, [])

const handleCreateAssessment = async ()=>{

 const res = await fetch("https://calia-backend.onrender.com/assessments",{

  method:"POST",

  headers:{
   "Content-Type":"application/json",
   Authorization:`Bearer ${token}`
  },

  body:JSON.stringify({
   class_id:classId,
   title:assessmentTitle,
   total_questions:Number(questions)
  })

 })

 const data = await res.json()

 alert("Avaliação criada")

}
  
  const handleUpload = async () => {
    if (!file || !selectedStudent) {
      alert("Selecione aluno e arquivo")
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("student_id", selectedStudent)

    const res = await fetch("https://calia-backend.onrender.com/ocr-upload", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })

    const data = await res.json()

    setResult(data.extracted_text)
    setLoading(false)
    loadHistory()
  }

  return (
    <div>
      <h2>Painel do Professor 📚</h2>

      <h3>Selecionar Aluno</h3>

      <select
        value={selectedStudent}
        onChange={(e) => setSelectedStudent(e.target.value)}
      >
        <option value="">Escolha um aluno</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <br /><br />

      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br /><br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processando..." : "Processar OCR"}
      </button>

      {result && (
        <div style={{ marginTop: 30 }}>
          <h3>Resultado Atual:</h3>
          <p>{result}</p>
        </div>
      )}

      <hr style={{ margin: "40px 0" }} />

      <h3>Histórico Geral</h3>

      {history.map((item) => (
        <div key={item.id}>
          <strong>{item.file_url}</strong>
          <br />
          <small>{new Date(item.created_at).toLocaleString()}</small>
          <p>{item.extracted_text}</p>
          <hr />
        </div>
      ))}
    </div>
  )
}
