"use client"

import { useEffect, useState } from "react"

export default function Admin(){

const token =
typeof window !== "undefined"
? localStorage.getItem("access_token")
: null

if(!token){
return <div>Carregando...</div>
}

const [tab,setTab] = useState("subjects")

const [subjects,setSubjects] = useState([])
const [classes,setClasses] = useState([])
const [teachers,setTeachers] = useState([])
const [students,setStudents] = useState([])

const [newSubject,setNewSubject] = useState("")

const [className,setClassName] = useState("")
const [classYear,setClassYear] = useState("")

const [teacherName,setTeacherName] = useState("")
const [teacherEmail,setTeacherEmail] = useState("")
const [teacherSubjects,setTeacherSubjects] = useState([])
const [teacherClasses,setTeacherClasses] = useState([])

const [selectedClass,setSelectedClass] = useState("")
const [studentName,setStudentName] = useState("")

const [file,setFile] = useState(null)


// =====================
// LOAD DATA
// =====================

const loadSubjects = async ()=>{

const res = await fetch(
"https://calia-backend.onrender.com/subjects",
{
headers:{Authorization:`Bearer ${token}`}
}
)

const data = await res.json()

setSubjects(data)

}

const loadClasses = async ()=>{

const res = await fetch(
"https://calia-backend.onrender.com/classes",
{
headers:{Authorization:`Bearer ${token}`}
}
)

const data = await res.json()

setClasses(data)

}

const loadTeachers = async ()=>{

const res = await fetch(
"https://calia-backend.onrender.com/teachers",
{
headers:{Authorization:`Bearer ${token}`}
}
)

const data = await res.json()

setTeachers(data)

}

const loadStudents = async ()=>{

const res = await fetch(
"https://calia-backend.onrender.com/students",
{
headers:{Authorization:`Bearer ${token}`}
}
)

const data = await res.json()

const filtered = data.filter(
s=>s.class_id===selectedClass
)

setStudents(filtered)

}


// =====================
// SUBJECTS
// =====================

const createSubject = async ()=>{

if(!newSubject){
alert("Digite o nome da disciplina")
return
}

await fetch(
"https://calia-backend.onrender.com/subjects",
{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({name:newSubject})
}
)

setNewSubject("")
loadSubjects()

}


// =====================
// CLASSES
// =====================

const createClass = async ()=>{

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


// =====================
// TEACHER SELECT HELPERS
// =====================

const toggleTeacherSubject = (id)=>{

if(teacherSubjects.includes(id)){

setTeacherSubjects(
teacherSubjects.filter(s=>s!==id)
)

}else{

setTeacherSubjects([
...teacherSubjects,
id
])

}

}

const toggleTeacherClass = (id)=>{

if(teacherClasses.includes(id)){

setTeacherClasses(
teacherClasses.filter(s=>s!==id)
)

}else{

setTeacherClasses([
...teacherClasses,
id
])

}

}


// =====================
// CREATE TEACHER
// =====================

const createTeacher = async ()=>{

if(!teacherName || !teacherEmail){
alert("Preencha nome e email")
return
}

const res = await fetch(
"https://calia-backend.onrender.com/teachers",
{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify({

full_name:teacherName,
email:teacherEmail,
subject_ids:teacherSubjects,
class_ids:teacherClasses

})
}
)

const data = await res.json()

if(!res.ok){
alert(data.detail || "Erro ao criar professor")
return
}

alert("Professor criado")

setTeacherName("")
setTeacherEmail("")
setTeacherSubjects([])
setTeacherClasses([])

loadTeachers()

}


// =====================
// STUDENTS
// =====================

const createStudent = async ()=>{

if(!studentName || !selectedClass){
alert("Digite nome e selecione turma")
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

const importStudents = async ()=>{

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
headers:{Authorization:`Bearer ${token}`},
body:formData
}
)

loadStudents()

}


// =====================
// LOAD
// =====================

useEffect(()=>{

loadSubjects()
loadClasses()
loadTeachers()

},[])

useEffect(()=>{

if(selectedClass){
loadStudents()
}

},[selectedClass])


// =====================
// UI
// =====================

return(

<div style={{padding:40}}>

<h1>Painel Admin</h1>

<div style={{marginBottom:20}}>

<button onClick={()=>setTab("subjects")}>Disciplinas</button>
<button onClick={()=>setTab("classes")}>Turmas</button>
<button onClick={()=>setTab("teachers")}>Professores</button>
<button onClick={()=>setTab("students")}>Alunos</button>

</div>


{/* SUBJECTS */}

{tab==="subjects" &&(

<div>

<h2>Disciplinas</h2>

<input
placeholder="Nova disciplina"
value={newSubject}
onChange={(e)=>setNewSubject(e.target.value)}
/>

<button onClick={createSubject}>
Criar
</button>

<ul>

{subjects.map(s=>(
<li key={s.id}>{s.name}</li>
))}

</ul>

</div>

)}


{/* CLASSES */}

{tab==="classes" &&(

<div>

<h2>Criar Turma</h2>

<input
placeholder="Nome da turma"
value={className}
onChange={(e)=>setClassName(e.target.value)}
/>

<input
placeholder="Ano"
value={classYear}
onChange={(e)=>setClassYear(e.target.value)}
/>

<button onClick={createClass}>
Criar
</button>

</div>

)}


{/* TEACHERS */}

{tab==="teachers" &&(

<div>

<h2>Criar Professor</h2>

<input
placeholder="Nome"
value={teacherName}
onChange={(e)=>setTeacherName(e.target.value)}
/>

<input
placeholder="Email"
value={teacherEmail}
onChange={(e)=>setTeacherEmail(e.target.value)}
/>

<h3>Disciplinas</h3>

{subjects.map(s=>(
<div key={s.id}>

<label>

<input
type="checkbox"
checked={teacherSubjects.includes(s.id)}
onChange={()=>toggleTeacherSubject(s.id)}
/>

{s.name}

</label>

</div>
))}

<h3>Turmas</h3>

{classes.map(c=>(
<div key={c.id}>

<label>

<input
type="checkbox"
checked={teacherClasses.includes(c.id)}
onChange={()=>toggleTeacherClass(c.id)}
/>

{c.name} - {c.year}

</label>

</div>
))}

<button onClick={createTeacher}>
Criar Professor
</button>

</div>

)}


{/* STUDENTS */}

{tab==="students" &&(

<div>

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

<h3>Criar aluno</h3>

<input
placeholder="Nome"
value={studentName}
onChange={(e)=>setStudentName(e.target.value)}
/>

<button onClick={createStudent}>
Adicionar
</button>

<h3>Importar CSV</h3>

<input
type="file"
onChange={(e)=>setFile(e.target.files[0])}
/>

<button onClick={importStudents}>
Importar
</button>

<h3>Alunos</h3>

<ul>

{students.map(s=>(
<li key={s.id}>
{s.name} — {s.status}
</li>
))}

</ul>

</div>

)}

</div>

)

}