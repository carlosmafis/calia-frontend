import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { ScanLine, Upload, Loader2, CheckCircle2, Clock, AlertCircle, Camera, X } from "lucide-react";
import { toast } from "sonner";

const OPTIONS = ["A", "B", "C", "D", "E", "ANULAR"];

export default function CorrecaoOCR() {
  const [classes, setClasses] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Para upload de prova
  const [uploadingStudent, setUploadingStudent] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [editingAnswers, setEditingAnswers] = useState<Record<string, string>>({});
  const [confirming, setConfirming] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [studentProofStatus, setStudentProofStatus] = useState<Record<string, any>>({});
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [answersWithWeight, setAnswersWithWeight] = useState<Record<string, any>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const [c, a, s] = await Promise.all([
          apiFetch("/classes").catch(() => []),
          apiFetch("/assessments").catch(() => []),
          apiFetch("/students").catch(() => []),
        ]);
        setClasses(c || []);
        setAssessments(a || []);
        setStudents(s || []);
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  // Carregar status das provas quando turma/avaliação mudam
  useEffect(() => {
    if (selectedClass && selectedAssessment) {
      loadProofStatus();
    }
  }, [selectedClass, selectedAssessment]);

  const markAsAbsent = async (studentId: string) => {
    try {
      await apiFetch(`/ocr/mark-absent`, {
        method: "POST",
        body: JSON.stringify({ 
          assessment_id: selectedAssessment,
          student_id: studentId 
        }),
      });
      
      setStudentProofStatus(prev => ({
        ...prev,
        [studentId]: {
          status: "absent",
          score: null,
        }
      }));
      
      toast.success("Aluno marcado como ausente");
    } catch (err: any) {
      toast.error(err.message || "Erro ao marcar ausência");
    }
  };

  const removeAbsent = async (studentId: string) => {
    try {
      // Remover a submissão de ausência
      await apiFetch(`/ocr/remove-absent`, {
        method: "POST",
        body: JSON.stringify({ 
          assessment_id: selectedAssessment,
          student_id: studentId 
        }),
      });
      
      setStudentProofStatus(prev => {
        const updated = { ...prev };
        delete updated[studentId];
        return updated;
      });
      
      toast.success("Ausência removida");
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover ausência");
    }
  };

  const loadProofStatus = async () => {
    try {
      // Buscar resultados da avaliação para verificar quais alunos já foram corrigidos
      const results = await apiFetch(
        `/assessments/${selectedAssessment}/submissions`
      ).catch(() => []);

      const status: Record<string, any> = {};
      if (Array.isArray(results)) {
        results.forEach((result: any) => {
          if (result.student_id) {
            if (result.status === "ausente" || result.status === "absent") {
              status[result.student_id] = {
                status: "absent",
                score: null,
              };
            } else if (result.score !== null && result.score !== undefined) {
              status[result.student_id] = {
                status: "corrected",
                score: result.score,
              };
            }
          }
        });
      }
      setStudentProofStatus(status);
    } catch (err) {
      // Erro ao carregar status das provas
    }
  };

  // Filtrar avaliações pela turma selecionada
  const filteredAssessments = selectedClass
    ? assessments.filter((a) => a.class_id === selectedClass)
    : [];

  // Filtrar alunos pela turma selecionada
  const filteredStudents = selectedClass
    ? students.filter((s) => s.class_id === selectedClass)
    : [];

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
    if (!uploadingStudent) { toast.error("Erro ao processar"); return; }

    setProcessing(true);
    setResult(null);
    setEditingAnswers({});
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assessment_id", selectedAssessment);
      formData.append("student_id", uploadingStudent);

      const data = await apiFetch("/ocr/correct", {
        method: "POST",
        body: formData,
      });
      setResult(data);
      setAnswersWithWeight(data.answers_with_weight || {});
      // Converter answers de objeto para array se necessário
      const answersArray = Array.isArray(data.answers)
        ? data.answers
        : Object.values(data.answers || {});
      setEditingAnswers(
        Object.fromEntries(
          answersArray.map((a: any, i: number) => [i, a])
        )
      );
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar OCR");
    } finally {
      setProcessing(false);
    }
  };

  const confirmCorrection = async () => {
    if (!result || !uploadingStudent) return;
    setConfirming(true);
    try {
      await apiFetch("/ocr/confirm", {
        method: "POST",
        body: JSON.stringify({
          assessment_id: selectedAssessment,
          student_id: uploadingStudent,
          answers: editingAnswers,
          answers_with_weight: answersWithWeight,
        }),
      });
      toast.success("Correção confirmada e salva!");
      
      // Recarregar status das provas após confirmar
      await loadProofStatus();

      // Limpar formulário
      setFile(null);
      setPreview(null);
      setResult(null);
      setEditingAnswers({});
      setAnswersWithWeight({});
      setUploadingStudent(null);
      setUploadDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao confirmar correção");
    } finally {
      setConfirming(false);
    }
  };


  const getStudentStatus = (studentId: string) => {
    // Verificar se já tem status no estado
    if (studentProofStatus[studentId]) {
      return studentProofStatus[studentId];
    }
    // Se não tem, retornar pendente
    return { status: "pending" };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "corrected":
        return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 gap-1"><CheckCircle2 className="w-3 h-3" /> Corrigida</Badge>;
      case "error":
        return <Badge className="bg-red-500/20 text-red-700 dark:text-red-400 gap-1"><AlertCircle className="w-3 h-3" /> Erro</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-700 dark:text-gray-400 gap-1"><Clock className="w-3 h-3" /> Pendente</Badge>;
    }
  };

  const correctedCount = Object.values(studentProofStatus).filter((s: any) => s.status === "corrected").length;

  return (
    <div>
      <PageHeader
        title="Correção de Provas"
        description={`${correctedCount} de ${filteredStudents.length} aluno(s) corrigido(s)`}
      />

      {/* Seleção de Turma e Avaliação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <Label>Selecione a Turma</Label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="bg-card/50">
              <SelectValue placeholder="Escolha a turma..." />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Selecione a Avaliação</Label>
          <Select value={selectedAssessment} onValueChange={setSelectedAssessment} disabled={!selectedClass}>
            <SelectTrigger className="bg-card/50">
              <SelectValue placeholder={selectedClass ? "Escolha a avaliação..." : "Selecione uma turma primeiro"} />
            </SelectTrigger>
            <SelectContent>
              {filteredAssessments.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Progresso */}
      {selectedAssessment && (
        <Card className="bg-blue-500/10 border-blue-500/20 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Progresso da Correção</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{correctedCount} de {filteredStudents.length}</p>
              </div>
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-white">{filteredStudents.length > 0 ? Math.round((correctedCount / filteredStudents.length) * 100) : 0}%</p>
                  <p className="text-xs text-blue-100">Completo</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Alunos */}
      {selectedAssessment ? (
        <div className="space-y-3">
          {filteredStudents.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="pt-6 text-center text-muted-foreground">
                Nenhum aluno nesta turma
              </CardContent>
            </Card>
          ) : (
            filteredStudents.map((student) => {
              const status = getStudentStatus(student.id);
              return (
                <Card key={student.id} className="bg-card/50 border-border/50 hover:border-border transition-colors">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">Matrícula: {student.registration_number}</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 w-full md:w-auto">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(status.status)}
                        {status.status === "corrected" && (
                          <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">
                            {status.score}/10
                          </Badge>
                        )}
                      </div>
                      <Dialog open={uploadDialogOpen && uploadingStudent === student.id} onOpenChange={(open) => {
                        if (!open) {
                          setUploadingStudent(null);
                          setFile(null);
                          setPreview(null);
                          setResult(null);
                          setEditingAnswers({});
                        }
                        setUploadDialogOpen(open);
                      }}>
                        <div className="flex gap-2 w-full md:w-auto flex-wrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setUploadingStudent(student.id);
                              setUploadDialogOpen(true);
                            }}
                            className="gap-2 flex-1 md:flex-none"
                            disabled={status.status === "absent"}
                          >
                            {status.status === "corrected" ? (
                              <>
                                <CheckCircle2 className="w-4 h-4" /> Corrigida
                              </>
                            ) : status.status === "absent" ? (
                              <>
                                <AlertCircle className="w-4 h-4" /> Ausente
                              </>
                            ) : (
                              <>
                                <Upload className="w-4 h-4" /> Upload
                              </>
                            )}
                          </Button>
                          
                          {status.status !== "absent" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsAbsent(student.id)}
                              className="gap-2 flex-1 md:flex-none"
                            >
                              <AlertCircle className="w-4 h-4" /> Ausente
                            </Button>
                          )}
                          
                          {status.status === "absent" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => removeAbsent(student.id)}
                              className="gap-2 flex-1 md:flex-none"
                            >
                              <X className="w-4 h-4" /> Remover Ausência
                            </Button>
                          )}
                        </div>

                        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Corrigir Prova - {student.name}</DialogTitle>
                          </DialogHeader>

                          {!result ? (
                            <div className="space-y-4 py-4">
                              {!preview && (
                                <div
                                  onClick={() => fileInputRef.current?.click()}
                                  className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                                >
                                  <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                                  <p className="font-medium">Clique para fazer upload ou tirar foto</p>
                                  <p className="text-sm text-muted-foreground">PNG, JPG até 10MB</p>
                                </div>
                              )}

                              <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                              />

                              {preview && (
                                <div className="space-y-3">
                                  <div className="relative">
                                    <img src={preview} alt="Preview" className="w-full rounded-lg border border-border/50" />
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      className="absolute top-2 right-2"
                                      onClick={() => {
                                        setFile(null);
                                        setPreview(null);
                                      }}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                                  <Button
                                    onClick={processOCR}
                                    disabled={processing}
                                    className="w-full bg-primary text-primary-foreground gap-2"
                                  >
                                    {processing ? (
                                      <>
                                        <Loader2 className="w-4 h-4 animate-spin" /> Processando OCR...
                                      </>
                                    ) : (
                                      <>
                                        <ScanLine className="w-4 h-4" /> Processar OCR
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-4 py-4">
                              {result.debug_image && (
                                <div className="space-y-2">
                                  <Label className="text-base">Imagem Processada (Debug)</Label>
                                  <img
                                    src={`data:image/jpeg;base64,${result.debug_image}`}
                                    alt="Debug OCR"
                                    className="w-full rounded-lg border border-border/50 max-h-96 object-contain"
                                  />
                                </div>
                              )}
                              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                <p className="text-sm font-medium text-green-900 dark:text-green-200">
                                  ✓ OCR Processado com Sucesso
                                </p>
                                <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                                  Nota: {result.score}
                                </p>
                              </div>

                              <div className="space-y-2">
                                <Label className="text-base">Respostas Detectadas</Label>
                                <div className="grid grid-cols-5 gap-2">
                                  {(Array.isArray(result.answers) ? result.answers : Object.values(result.answers || {})).map((answer: string, i: number) => {
                                    const questionNum = String(i + 1);
                                    return (
                                    <Button
                                      key={i}
                                      variant={editingAnswers[questionNum] ? "default" : "outline"}
                                      onClick={() => setEditingQuestion(i)}
                                      className="h-12 text-lg font-semibold"
                                    >
                                      Q{i + 1}: {editingAnswers[questionNum] || answer || "—"}
                                    </Button>
                                  );
                                  })}
                                </div>
                              </div>

                              {/* Dialog para editar resposta */}
                              <Dialog open={editingQuestion !== null} onOpenChange={(open) => {
                                if (!open) setEditingQuestion(null);
                              }}>
                                <DialogContent className="bg-card border-border">
                                  <DialogHeader>
                                    <DialogTitle>Editar Resposta - Questão {editingQuestion !== null ? editingQuestion + 1 : ""}</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <p className="text-sm text-muted-foreground">
                                      Resposta detectada: <strong>{editingQuestion !== null && (Array.isArray(result.answers) ? result.answers[editingQuestion] : Object.values(result.answers || {})[editingQuestion])}</strong>
                                    </p>
                                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                      {OPTIONS.map((option) => {
                                        const questionNum = String(editingQuestion! + 1);
                                        return (
                                        <Button
                                          key={option}
                                          variant={editingAnswers[questionNum] === option ? "default" : "outline"}
                                          onClick={() => {
                                            const newAnswers = { ...editingAnswers };
                                            newAnswers[questionNum] = option;
                                            setEditingAnswers(newAnswers);
                                            
                                            // Atualizar answersWithWeight com o tipo correto
                                            const newWeights = { ...answersWithWeight };
                                            if (option === "ANULAR") {
                                              newWeights[questionNum] = {
                                                type: "ANULADA",
                                                answer: null,
                                                weight: 1
                                              };
                                            } else {
                                              newWeights[questionNum] = {
                                                type: "MARCADA",
                                                answer: option,
                                                weight: 1
                                              };
                                            }
                                            setAnswersWithWeight(newWeights);
                                            setEditingQuestion(null);
                                          }}
                                          className="h-12 text-lg font-semibold"
                                        >
                                          {option}
                                        </Button>
                                      );
                                      })}
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <p className="text-xs text-blue-900 dark:text-blue-200">
                                  💡 Você pode editar as respostas acima se o OCR detectou incorretamente
                                </p>
                              </div>
                            </div>
                          )}

                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            {result && (
                              <Button
                                onClick={confirmCorrection}
                                disabled={confirming}
                                className="bg-primary text-primary-foreground gap-2"
                              >
                                {confirming ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-4 h-4" /> Confirmar Correção
                                  </>
                                )}
                              </Button>
                            )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="pt-6 text-center text-muted-foreground py-12">
            Selecione uma turma e avaliação para começar a corrigir
          </CardContent>
        </Card>
      )}
    </div>
  );
}
