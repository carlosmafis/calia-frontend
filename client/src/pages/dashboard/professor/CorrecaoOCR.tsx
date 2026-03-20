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

  // Count correct/wrong from result
  const correctCount = result?.details ? result.details.filter((d: any) => d.correct).length : null;
  const totalQuestions = result?.details?.length || (result?.answers ? Object.keys(result.answers).length : null);

  return (
    <div>
      <PageHeader
        title="Correção por OCR"
        description="Digitalize folhas de respostas para correção automática com inteligência artificial"
      />

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
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Respostas Detectadas</p>
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
                          <TableHead className="w-16">Questão</TableHead>
                          <TableHead>Resposta</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(editingAnswers).map(([num, ans]) => (
                          <TableRow key={num} className="border-border/30">
                            <TableCell className="font-mono text-muted-foreground">{num}</TableCell>
                            <TableCell className="font-mono font-medium">
                              {ans === "BRANCO" ? <span className="text-yellow-400">BRANCO</span>
                                : ans === "ANULADA" ? <span className="text-red-400">ANULADA</span>
                                : <span>{ans}</span>}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : null}

                {/* Confirm Button */}
                <Button
                  onClick={confirmCorrection}
                  disabled={confirming}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                >
                  {confirming ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Salvando...</>
                  ) : (
                    <><Save className="w-4 h-4" /> Confirmar e Salvar Correção</>
                  )}
                </Button>
              </div>
            ) : (
              <div className="py-16 text-center">
                <ScanLine className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground text-sm">
                  Selecione uma avaliação, um aluno e envie a imagem da folha de respostas para ver o resultado.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Use o gabarito padrão com marcadores nos 4 cantos para melhor precisão.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Respostas do OCR</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(editingAnswers).map(([num, ans]) => (
                <div key={num} className="space-y-2">
                  <Label>Questão {num}</Label>
                  <div className="flex gap-1 flex-wrap">
                    {["BRANCO", "ANULADA", ...OPTIONS].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setEditingAnswers((prev) => ({ ...prev, [num]: opt }))}
                        className={`flex-1 min-w-12 h-10 rounded text-sm font-mono font-medium transition-all ${
                          editingAnswers[num] === opt
                            ? "bg-primary text-primary-foreground"
                            : "bg-background/50 text-muted-foreground hover:bg-accent border border-border/50"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button
              onClick={() => setEditDialogOpen(false)}
              className="bg-primary text-primary-foreground"
            >
              Pronto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
