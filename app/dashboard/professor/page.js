"use client"

import { useEffect,useState } from "react"

export default function Professor(){

const token =
typeof window !== "undefined"
? localStorage.getItem("access_token")
: null

if(!token) return <div>Carregando...</div>

const [classes,setClasses] = useState([])
const [students,setStudents] = useState([])
const [assessments,setAssessments] = useState([])

const [selectedClass,setSelectedClass] = useState("")
const [selectedAssessment,setSelectedAssessment] = useState("")
const [selectedStudent,setSelectedStudent] = useState("")

const [assessmentTitle,setAssessmentTitle] = useState("")

const [answers,setAnswers] = useState(
Array(10).fill("A")
)

const [file,setFile] = useState(null)
const [manualAnswers,setManualAnswers] = useState("")
const [result,setResult] = useState(null)


// =======================
// LOAD CLASSES
// =======================

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


// =======================
// LOAD STUDENTS
// =======================

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


// =======================
// LOAD ASSESSMENTS
// =======================

const loadAssessments = async ()=>{

const res = await fetch(
"https://calia-backend.onrender.com/assessments",
{
headers:{Authorization:`Bearer ${token}`}
}
)

const data = await res.json()

const filtered = data.filter(
a=>a.class_id===selectedClass
)

setAssessments(filtered)

}


// =======================
// CREATE ASSESSMENT + ANSWER KEY
// =======================

const createAssessment = async ()=>{

const payload = {

class_id:selectedClass,

title:assessmentTitle,

questions:answers.map((a,i)=>({

question_number:i+1,
correct_answer:a

}))

}

const res = await fetch(

"https://calia-backend.onrender.com/assessments/create-full",

{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify(payload)
}

)

const data = await res.json()

alert("Avaliação criada com gabarito")

setAssessmentTitle("")

loadAssessments()

setSelectedAssessment(data.id)

}


// =======================
// OCR
// =======================

const sendOCR = async ()=>{

const formData = new FormData()

formData.append("assessment_id",selectedAssessment)
formData.append("student_id",selectedStudent)
formData.append("file",file)

const res = await fetch(

"https://calia-backend.onrender.com/ocr/correct",

{
method:"POST",
headers:{Authorization:`Bearer ${token}`},
body:formData
}

)

const data = await res.json()

setResult(data.score)

}


// =======================
// MANUAL
// =======================

const sendManual = async ()=>{

const answersArray = manualAnswers.split(",")

const payload = {

assessment_id:selectedAssessment,
student_id:selectedStudent,
answers:answersArray

}

const res = await fetch(

"https://calia-backend.onrender.com/submit-answers",

{
method:"POST",
headers:{
"Content-Type":"application/json",
Authorization:`Bearer ${token}`
},
body:JSON.stringify(payload)
}

)

const data = await res.json()

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



return(

<div style={{padding:40}}>

<h1>Painel Professor</h1>

<hr/>

<h3>Turma</h3>

<select
value={selectedClass}
onChange={(e)=>setSelectedClass(e.target.value)}
>

<option>Selecione</option>

{classes.map(c=>(
<option key={c.id} value={c.id}>
{c.name} - {c.year}
</option>
))}

</select>


<hr/>

<h3>Criar Avaliação</h3>

<input
placeholder="Nome da avaliação"
value={assessmentTitle}
onChange={(e)=>setAssessmentTitle(e.target.value)}
/>


<h4>Gabarito</h4>

{answers.map((a,i)=>(

<select
key={i}
value={a}
onChange={(e)=>{

const updated=[...answers]

updated[i]=e.target.value

setAnswers(updated)

}}
>

<option>A</option>
<option>B</option>
<option>C</option>
<option>D</option>
<option>E</option>

</select>

))}

<br/><br/>

<button onClick={createAssessment}>
Criar Avaliação + Gabarito
</button>


<hr/>

<h3>Avaliação</h3>

<select
value={selectedAssessment}
onChange={(e)=>setSelectedAssessment(e.target.value)}
>

<option>Selecione</option>

{assessments.map(a=>(
<option key={a.id} value={a.id}>
{a.title}
</option>
))}

</select>


<hr/>

<h3>Aluno</h3>

<select
value={selectedStudent}
onChange={(e)=>setSelectedStudent(e.target.value)}
>

<option>Selecione</option>

{students.map(s=>(
<option key={s.id} value={s.id}>
{s.name}
</option>
))}

</select>


<hr/>

<h3>Correção OCR</h3>

<input
type="file"
onChange={(e)=>setFile(e.target.files[0])}
/>

<button onClick={sendOCR}>
Corrigir com OCR
</button>


<hr/>

<h3>Correção Manual</h3>

<input
placeholder="A,B,C,D,E,A,B,C,D,E"
value={manualAnswers}
onChange={(e)=>setManualAnswers(e.target.value)}
/>

<button onClick={sendManual}>
Corrigir Manual
</button>


{result!==null &&(

<>
<hr/>
<h2>Nota: {result}</h2>
</>

)}

</div>

)

}