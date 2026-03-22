// IMPORTANTE: A lógica de OCR do backend NÃO foi alterada. Esta página apenas consome a API.
// Backend endpoint: POST /ocr/correct (FormData: assessment_id, student_id, file)
import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScanLine, Upload, Loader2, CheckCircle2, XCircle, Image as ImageIcon, RotateCcw, History, Edit2, Save } from "lucide-react";
import { toast } from "sonner";

const OPTIONS = ["A", "B", "C", "D", "E"];

export default function CorrecaoOCR() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [editingAnswers, setEditingAnswers] = useState<Record<string, string>>({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [a, s] = await Promise.all([
          apiFetch("/assessments"),
          apiFetch("/students"),
        ]);
        setAssessments(a || []);
        setStudents(s || []);
      } catch {}
    };
    load();
  }, []);

  // Carregar submissões quando mudar avaliação
  useEffect(() => {
    if (!selectedAssessment) {
      setSubmissions([]);
      return;
    }

    const loadSubmissions = async () => {
      setLoadingSubmissions(true);
      try {
        const subs = await apiFetch(`/assessments/${selectedAssessment}/submissions`);
        console.log("Submissões carregadas:", subs);
        setSubmissions(subs || []);
      } catch (err) {
        console.error("Erro ao carregar submissões:", err);
        setSubmissions([]);
      } finally {
        setLoadingSubmissions(false);
      }
    };

    loadSubmissions();
  }, [selectedAssessment]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setResult(null);
      setEditingAnswers({});
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(f);
    }
  };

  const processOCR = async () => {
    if (!file) { toast.error("Selecione uma imagem"); return; }
    if (!selectedAssessment) { toast.error("Selecione uma avaliação"); return; }
    if (!selectedStudent) { toast.error("Selecione um aluno"); return; }

    setProcessing(true);
    setResult(null);
    setEditingAnswers({});
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assessment_id", selectedAssessment);
      formData.append("student_id", selectedStudent);

      const data = await apiFetch("/ocr/correct", {
        method: "POST",
        body: formData,
      });
      setResult(data);

      // Inicializar respostas editáveis com as respostas do OCR
      const initialAnswers: Record<string, string> = {};
      if (data.details) {
        data.details.forEach((d: any) => {
          initialAnswers[d.question || (data.details.indexOf(d) + 1)] = d.student_answer;
        });
      } else if (data.answers) {
        Object.entries(data.answers).forEach(([num, ans]) => {
          initialAnswers[num] = ans as string;
        });
      }
      setEditingAnswers(initialAnswers);

      // Add to local history
      const studentName = students.find(s => s.id === selectedStudent)?.name || "Aluno";
      const assessmentTitle = assessments.find(a => a.id === selectedAssessment)?.title || "Avaliação";
      setHistory(prev => [{ ...data, studentName, assessmentTitle, timestamp: new Date().toLocaleTimeString("pt-BR") }, ...prev.slice(0, 9)]);

      toast.success("Correção concluída!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar OCR");
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setSelectedStudent("");
    setEditingAnswers({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const confirmCorrection = async () => {
    if (!selectedAssessment || !selectedStudent) {
      toast.error("Dados incompletos");
      return;
    }

    setConfirming(true);
    try {
      await apiFetch("/ocr/confirm", {
        method: "POST",
        body: JSON.stringify({
          assessment_id: selectedAssessment,
          student_id: selectedStudent,
          answers: editingAnswers,
        }),
      });
      toast.success("Correção confirmada e salva!");
      
      // Recarregar submissões após confirmar
      if (selectedAssessment) {
        try {
          const subs = await apiFetch(`/assessments/${selectedAssessment}/submissions`);
          setSubmissions(subs || []);
        } catch (err) {
          console.error("Erro ao recarregar submissões:", err);
        }
      }
      
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Erro ao confirmar correção");
    } finally {
      setConfirming(false);
    }
  };

  const selectedAssessmentObj = assessments.find((a) => a.id === selectedAssessment);
  const filteredStudents = selectedAssessmentObj
    ? students.filter((s) => s.class_id === selectedAssessmentObj.class_id)
    : students;

  // Mapa de submissões por student_id para fácil lookup
  const submissionMap = new Map(submissions.map((s) => [s.student_id, s]));

  // Contar quantos alunos têm submissão
  const correctedCount = submissions.length;
  const totalStudents = filteredStudents.length;

  // Count correct/wrong from result
  const correctCount = result?.details ? result.details.filter((d: any) => d.correct).length : null;
  const totalQuestions = result?.details?.length || (result?.answers ? Object.keys(result.answers).length : null);

  return (
    <div>
      <PageHeader
        title="Correção por OCR"
        description="Digitalize folhas de respostas para correção automática com inteligência artificial"
      />

      {/* Resumo de Correções */}
      {selectedAssessment && (
        <Card className="bg-card/50 border-border/50 mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Progresso da Correção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">{correctedCount}</p>
                <p className="text-xs text-muted-foreground">de {totalStudents} aluno(s) corrigido(s)</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{totalStudents > 0 ? Math.round((correctedCount / totalStudents) * 100) : 0}%</p>
                <p className="text-xs text-muted-foreground">Completo</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload Area */}
        <div className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ScanLine className="w-5 h-5 text-primary" /> Digitalizar Prova
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Avaliação</Label>
                <Select value={selectedAssessment} onValueChange={(v) => { setSelectedAssessment(v); setSelectedStudent(""); setResult(null); }}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Selecione a avaliação" />
                  </SelectTrigger>
                  <SelectContent>
                    {assessments.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.title} {a.questions?.length ? `(${a.questions.length}q)` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Aluno</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="bg-background/50">
                    <SelectValue placeholder="Selecione o aluno" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStudents.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${preview ? "border-primary/40 bg-primary/5" : "border-border/50 hover:border-primary/40"}`}
              >
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                {preview ? (
                  <div className="space-y-3">
                    <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-lg" />
                    <p className="text-xs text-muted-foreground">{file?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                      <ImageIcon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">Clique para selecionar a imagem</p>
                    <p className="text-xs text-muted-foreground">Foto da folha de respostas (JPG, PNG)</p>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={processOCR}
                  disabled={processing || !file || !selectedAssessment || !selectedStudent}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  {processing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>
                  ) : (
                    <><Upload className="w-4 h-4" /> Corrigir Prova</>
                  )}
                </Button>
                {result && (
                  <Button variant="outline" onClick={resetForm} className="gap-1">
                    <RotateCcw className="w-4 h-4" /> Nova
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Session History */}
          {history.length > 0 && (
            <Card className="bg-card/50 border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <History className="w-4 h-4" /> Correções desta Sessão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-background/30 text-sm">
                      <div>
                        <span className="font-medium">{h.studentName}</span>
                        <span className="text-muted-foreground text-xs ml-2">{h.assessmentTitle}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={Number(h.score) >= 6 ? "default" : "destructive"} className="text-xs">
                          {h.score != null ? Number(h.score).toFixed(1) : "—"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{h.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Students Status + Result Area */}
        <div className="space-y-4">
          {/* Students Status */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status dos Alunos</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSubmissions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : filteredStudents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Selecione uma avaliação para ver os alunos</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredStudents.map((student) => {
                    const submission = submissionMap.get(student.id);
                    const isCorreected = !!submission;
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-background/30 border border-border/50">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{student.name}</p>
                          <p className="text-xs text-muted-foreground">Matrícula: {student.registration_number}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {isCorreected && (
                            <Badge variant="default" className="text-xs gap-1">
                              <CheckCircle2 className="w-3 h-3" /> {Number(submission.score).toFixed(1)}
                            </Badge>
                          )}
                          <Badge variant={isCorreected ? "secondary" : "outline"} className="text-xs">
                            {isCorreected ? "Corrigido" : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Result Area */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Resultado da Correção</CardTitle>
            </CardHeader>
            <CardContent>
              {result ? (
                <div className="space-y-4">
                  {/* Score */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-4 rounded-lg bg-background/50 text-center">
                      <p className="text-xs text-muted-foreground mb-1">Nota</p>
                      <p className="text-3xl font-bold font-mono text-primary">
                        {result.score != null ? Number(result.score).toFixed(1) : "—"}
                      </p>
                    </div>
                    {correctCount != null && (
                      <>
                        <div className="p-4 rounded-lg bg-green-500/10 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Acertos</p>
                          <p className="text-3xl font-bold font-mono text-green-400">{correctCount}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-red-500/10 text-center">
                          <p className="text-xs text-muted-foreground mb-1">Erros</p>
                          <p className="text-3xl font-bold font-mono text-red-400">{(totalQuestions || 0) - correctCount}</p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Debug image from OCR */}
                  {result.debug_image && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Imagem de Verificação</p>
                      <img
                        src={`data:image/jpeg;base64,${result.debug_image}`}
                        alt="Debug OCR"
                        className="w-full rounded-lg border border-border/50"
                      />
                    </div>
                  )}

                  {/* Answers detail with comparison and edit */}
                  {result.details ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Detalhes por Questão</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditDialogOpen(true)}
                          className="gap-1 text-xs"
                        >
                          <Edit2 className="w-3 h-3" /> Editar Respostas
                        </Button>
                      </div>
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border/50 hover:bg-transparent">
                            <TableHead className="w-16">Q.</TableHead>
                            <TableHead>Resposta</TableHead>
                            <TableHead>Gabarito</TableHead>
                            <TableHead className="w-16 text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.details.map((d: any, i: number) => (
                            <TableRow key={i} className="border-border/30">
                              <TableCell className="font-mono text-muted-foreground">{d.question || i + 1}</TableCell>
                              <TableCell className="font-mono font-medium">
                                {editingAnswers[d.question || (i + 1)] === "BRANCO" ? <span className="text-yellow-400">BRANCO</span>
                                  : editingAnswers[d.question || (i + 1)] === "ANULADA" ? <span className="text-red-400">ANULADA</span>
                                  : <span>{editingAnswers[d.question || (i + 1)]}</span>}
                              </TableCell>
                              <TableCell className="font-mono text-muted-foreground">{d.correct_answer}</TableCell>
                              <TableCell className="text-center">
                                {editingAnswers[d.question || (i + 1)] === d.correct_answer ? <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400 mx-auto" />}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : result.answers ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Respostas Extraídas</p>
                      <div className="grid grid-cols-5 gap-2">
                        {Object.entries(result.answers).map(([q, a]) => (
                          <div key={q} className="p-2 rounded-lg bg-background/50 text-center">
                            <p className="text-xs text-muted-foreground">Q{q}</p>
                            <p className="text-sm font-mono font-bold text-primary">{a as string}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {/* Confirm button */}
                  <Button
                    onClick={confirmCorrection}
                    disabled={confirming}
                    className="w-full bg-green-600 hover:bg-green-700 text-white gap-2"
                  >
                    {confirming ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                    ) : (
                      <><Save className="w-4 h-4" /> Confirmar e Salvar</>
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma correção em andamento</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Respostas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {result?.details?.map((d: any, i: number) => (
              <div key={i} className="space-y-2">
                <Label className="text-sm">
                  Questão {d.question || i + 1} (Gabarito: {d.correct_answer})
                </Label>
                <Select
                  value={editingAnswers[d.question || (i + 1)] || ""}
                  onValueChange={(v) => {
                    setEditingAnswers(prev => ({
                      ...prev,
                      [d.question || (i + 1)]: v
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a resposta" />
                  </SelectTrigger>
                  <SelectContent>
                    {OPTIONS.map(opt => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                    <SelectItem value="BRANCO">BRANCO</SelectItem>
                    <SelectItem value="ANULADA">ANULADA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Fechar</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
