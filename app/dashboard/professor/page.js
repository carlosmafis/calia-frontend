"use client"

import { useEffect, useState } from "react"

export default function Professor() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const token = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null

  const loadHistory = async () => {
    const res = await fetch("https://calia-backend.onrender.com/ocr-history", {
      headers: { Authorization: `Bearer ${token}` }
    })
    const data = await res.json()
    setHistory(data)
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const handleUpload = async () => {
    if (!file) {
      alert("Selecione um arquivo")
      return
    }

    setLoading(true)

    const formData = new FormData()
    formData.append("file", file)

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

      <h3>Enviar Arquivo para OCR</h3>

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

      <h3>Histórico de OCR</h3>

      {history.length === 0 && <p>Nenhum upload ainda.</p>}

      <ul>
        {history.map((item) => (
          <li key={item.id}>
            <strong>{item.file_url}</strong> <br />
            <small>{new Date(item.created_at).toLocaleString()}</small>
            <p>{item.extracted_text}</p>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  )
}