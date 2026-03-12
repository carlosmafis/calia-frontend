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
  
  "use client"

import { useEffect, useState } from "react"

export default function Professor() {

  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])
  const [assessments, setAssessments] = useState([])

  const [selectedClass, setSelectedClass] = useState("")
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedAssessment, setSelectedAssessment] = useState("")

  const [file, setFile] = useState(null)

  const [result, setResult] = useState(null)
  const [answers, setAnswers] = useState([])

  const [loading, setLoading] = useState(false)

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null

  // ==========================
  // CARREGAR TURMAS
  // ==========================

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

  // ==========================
  // CARREGAR ALUNOS
  // ==========================

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

  // ==========================
  // CARREGAR AVALIAÇÕES
  // ==========================

  const loadAssessments = async () => {

    if (!selectedClass) return

    const res = await fetch(
      `https://calia-backend.onrender.com/assessments/${selectedClass}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )

    const data = await res.json()

    setAssessments(data)

  }

  // ==========================
  // OCR UPLOAD
  // ==========================

  const handleUpload = async () => {

    if (!file || !selectedStudent || !selectedAssessment) {

      alert("Selecione avaliação, aluno e arquivo")

      return
    }

    setLoading(true)

    const formData = new FormData()

    formData.append("assessment_id", selectedAssessment)
    formData.append("student_id", selectedStudent)
    formData.append("file", file)

    const res = await fetch(
      "https://calia-backend.onrender.com/ocr/correct",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      }
    )

    const data = await res.json()

    setResult(data.score)

    setAnswers(data.answers)

    setLoading(false)

  }

  // ==========================
  // LOAD INICIAL
  // ==========================

  useEffect(() => {

    loadClasses()

    loadStudents()

  }, [])

  useEffect(() => {

    loadAssessments()

  }, [selectedClass])

  return (

    <div style={{ padding: 40 }}>

      <h1>Painel do Professor</h1>

      <hr />

      <h2>Correção de Avaliação</h2>

      {/* ======================= */}
      {/* TURMA */}
      {/* ======================= */}

      <label>Turma</label>

      <br />

      <select
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
      >

        <option value="">Selecione</option>

        {classes.map((c) => (

          <option key={c.id} value={c.id}>
            {c.name} - {c.year}
          </option>

        ))}

      </select>

      <br /><br />

      {/* ======================= */}
      {/* AVALIAÇÃO */}
      {/* ======================= */}

      <label>Avaliação</label>

      <br />

      <select
        value={selectedAssessment}
        onChange={(e) => setSelectedAssessment(e.target.value)}
      >

        <option value="">Selecione</option>

        {assessments.map((a) => (

          <option key={a.id} value={a.id}>
            {a.title}
          </option>

        ))}

      </select>

      <br /><br />

      {/* ======================= */}
      {/* ALUNO */}
      {/* ======================= */}

      <label>Aluno</label>

      <br />

      <select
        value={selectedStudent}
        onChange={(e) => setSelectedStudent(e.target.value)}
      >

        <option value="">Selecione</option>

        {students.map((s) => (

          <option key={s.id} value={s.id}>
            {s.name}
          </option>

        ))}

      </select>

      <br /><br />

      {/* ======================= */}
      {/* UPLOAD */}
      {/* ======================= */}

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload} disabled={loading}>

        {loading ? "Processando..." : "Enviar Foto"}

      </button>

      <hr />

      {/* ======================= */}
      {/* RESULTADO */}
      {/* ======================= */}

      {result !== null && (

        <div>

          <h2>Resultado</h2>

          <h1>Nota: {result}</h1>

          <h3>Respostas detectadas</h3>

          {answers.map((a, i) => (

            <p key={i}>
              Questão {i + 1}: {a}
            </p>

          ))}

        </div>

      )}

    </div>

  )

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
