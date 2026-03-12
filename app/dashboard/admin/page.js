<h2>Adicionar alunos à turma</h2>

<label>Selecione a turma</label>

<br/>

<select
 value={selectedClass}
 onChange={(e)=>setSelectedClass(e.target.value)}
>

<option value="">Escolha a turma</option>

{classes.map((c)=>(
<option key={c.id} value={c.id}>
{c.name} - {c.year}
</option>
))}

</select>

<br/><br/>

<hr/>

<h3>Criar aluno manualmente</h3>

<input
 placeholder="Nome do aluno"
 value={studentName}
 onChange={(e)=>setStudentName(e.target.value)}
/>

<br/><br/>

<button onClick={handleCreateStudent}>
Adicionar aluno
</button>

<hr/>

<h3>Importar alunos por planilha</h3>

<input
 type="file"
 accept=".csv"
 onChange={(e)=>setFile(e.target.files[0])}
/>

<br/><br/>

<button onClick={handleImportStudents}>
Importar lista de alunos
</button>
