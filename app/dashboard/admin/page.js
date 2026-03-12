"use client"

import { useEffect, useState } from "react"

export default function Admin() {

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null

  const [classes,setClasses] = useState([])
  const [students,setStudents] = useState([])
  const [teachers,setTeachers] = useState([])

  const [className,setClassName] = useState("")
  const [classYear,setClassYear] = useState("")

  const [teacherName,setTeacherName] = useState("")
  const [teacherEmail,setTeacherEmail] = useState("")

  const [selectedClass,setSelectedClass] = useState("")
  const [studentName,setStudentName] = useState("")

  const [file,setFile] = useState(null)

  const loadClasses = async () => {

    const res = await fetch(
      "https://calia-backend.onrender.com/classes",
      {
        headers:{ Authorization:`Bearer ${token}` }
      }
    )

    const data = await res.json()

    setClasses(data)

  }

  const loadStudents = async () => {

    const res = await fetch(
      "https://calia-backend.onrender.com/students",
      {
        headers:{ Authorization:`Bearer ${token}` }
      }
    )

    const data = await res.json()

    const filtered = data.filter(
      s => s.class_id === selectedClass
    )

    setStudents(filtered)

  }

  const loadTeachers = async () => {

    const res = await fetch(
      "https://calia-backend.onrender.com/teachers",
      {
        headers:{ Authorization:`Bearer ${token}` }
      }
    )

    const data = await res.json()

    setTeachers(data)

  }

  const handleCreateClass = async () => {

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

  const handleCreateTeacher = async () => {

    await fetch(
      "https://calia-backend.onrender.com/teachers",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({
          full_name:teacherName,
          email:teacherEmail
        })
      }
    )

    setTeacherName("")
    setTeacherEmail("")

    loadTeachers()

  }

  const handleCreateStudent = async () => {

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

  const handleImportStudents = async () => {

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

  const saveStudentChanges = async (student) => {

    await fetch(
      `https://calia-backend.onrender.com/students/${student.id}`,
      {
        method:"PUT",
        headers:{
          "Content-Type":"application/json",
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({
          name:student.name,
          status:student.status,
          class_id:student.class_id
        })
      }
    )

    loadStudents()

  }

  const updateStudentField = (index,field,value) => {

    const updated = [...students]

    updated[index][field] = value

    setStudents(updated)

  }

  useEffect(()=>{
    loadClasses()
    loadTeachers()
  },[])

  useEffect(()=>{
    if(selectedClass){
      loadStudents()
    }
  },[selectedClass])

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

      <h2>Criar Professor</h2>

      <input
        placeholder="Nome do professor"
        value={teacherName}
        onChange={(e)=>setTeacherName(e.target.value)}
      />

      <br/><br/>

      <input
        placeholder="Email"
        value={teacherEmail}
        onChange={(e)=>setTeacherEmail(e.target.value)}
      />

      <br/><br/>

      <button onClick={handleCreateTeacher}>
        Criar Professor
      </button>

      <hr/>

      <h2>Selecionar Turma</h2>

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

      {selectedClass && (

        <>
        <hr/>

        <h2>Criar aluno manualmente</h2>

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

        <h2>Importar alunos por planilha</h2>

        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={(e)=>setFile(e.target.files[0])}
        />

        <br/><br/>

        <button onClick={handleImportStudents}>
          Importar planilha
        </button>

        <hr/>

        <h2>Alunos da turma</h2>

        {students.map((s,index)=>(
          <div
            key={s.id}
            style={{
              border:"1px solid #ddd",
              padding:12,
              marginBottom:10,
              borderRadius:6
            }}
          >

            <input
              value={s.name}
              onChange={(e)=>updateStudentField(index,"name",e.target.value)}
            />

            <br/><br/>

            <label>Status:</label>

            <select
              value={s.status}
              onChange={(e)=>updateStudentField(index,"status",e.target.value)}
            >

              <option value="CURSANDO">CURSANDO</option>
              <option value="TRANSFERIDO">TRANSFERIDO</option>
              <option value="ABANDONO">ABANDONO</option>

            </select>

            <br/><br/>

            <label>Turma:</label>

            <select
              value={s.class_id}
              onChange={(e)=>updateStudentField(index,"class_id",e.target.value)}
            >

              {classes.map(c=>(
                <option key={c.id} value={c.id}>
                  {c.name} - {c.year}
                </option>
              ))}

            </select>

            <br/><br/>

            <button onClick={()=>saveStudentChanges(s)}>
              Salvar Alterações
            </button>

          </div>
        ))}

        </>

      )}

    </div>

  )

}
