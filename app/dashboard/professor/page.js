"use client"

import { useState } from "react"

export default function Professor() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const token = typeof window !== "undefined"
    ? localStorage.getItem("access_token")
    : null

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
  }

  return (
    <div>
      <h2>Painel do Professor 📚</h2>

      <h3>Enviar Arquivo para OCR</h3>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <br /><br />

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processando..." : "Processar OCR"}
      </button>

      {result && (
        <div style={{ marginTop: 30 }}>
          <h3>Resultado:</h3>
          <p>{result}</p>
        </div>
      )}
    </div>
  )
}
