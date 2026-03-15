// Calia Digital — Professor: Correção Manual
// Backend endpoint: POST /submit-answers (JSON: assessment_id, student_id, answers)
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, PenLine, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const OPTIONS = ["A", "B", "C", "D", "E"];

export default function CorrecaoManual() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

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

  const selectedAssessmentObj = assessments.find((a) => a.id === selectedAssessment);
  const totalQuestions = selectedAssessmentObj?.total_questions || 10;
  const filteredStudents = selectedAssessmentObj
    ? students.filter((s) => s.class_id === selectedAssessmentObj.class_id)
    : students;

  const handleAnswer = (questionNum: number, answer: string) => {
    setAnswers((prev) => ({ ...prev, [String(questionNum)]: answer }));
  };

  const submitManual = async () => {
    if (!selectedAssessment || !selectedStudent) {
      toast.error("Selecione avaliação e aluno");
      return;
    }
    if (Object.keys(answers).length === 0) {
      toast.error("Marque pelo menos uma resposta");
      return;
    }
    setSubmitting(true);
    setResult(null);
    try {
      const data = await apiFetch("/submit-answers", {
        method: "POST",
        body: JSON.stringify({
          assessment_id: selectedAssessment,
          student_id: selectedStudent,
          answers,
        }),
      });
      setResult(data);
      toast.success("Correção salva com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar correção");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Correção Manual"
        description="Insira as respostas do aluno manualmente"
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Selection */}
        <Card className="bg-card/50 border-border/50 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PenLine className="w-5 h-5 text-primary" /> Configuração
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Avaliação</Label>
              <Select value={selectedAssessment} onValueChange={(v) => { setSelectedAssessment(v); setSelectedStudent(""); setAnswers({}); setResult(null); }}>
                <SelectTrigger className="bg-background/50">
                  <SelectValue placeholder="Selecione a avaliação" />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>
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

            {result && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-center">
                <CheckCircle2 className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-sm font-medium">Nota: <span className="text-xl font-bold font-mono">{result.score}</span></p>
              </div>
            )}

            <Button
              onClick={submitManual}
              disabled={submitting || !selectedAssessment || !selectedStudent}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Correção"}
            </Button>
          </CardContent>
        </Card>

        {/* Answer Grid */}
        <Card className="bg-card/50 border-border/50 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Folha de Respostas</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedAssessment ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => (
                  <div key={num} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/30 transition-colors">
                    <span className="w-8 text-sm font-mono text-muted-foreground text-right">{num}.</span>
                    <div className="flex gap-1.5">
                      {OPTIONS.map((opt) => (
                        <button
                          key={opt}
                          onClick={() => handleAnswer(num, opt)}
                          className={`
                            w-9 h-9 rounded-lg text-sm font-mono font-medium transition-all duration-150
                            ${answers[String(num)] === opt
                              ? "bg-primary text-primary-foreground shadow-sm"
                              : "bg-background/50 text-muted-foreground hover:bg-accent hover:text-foreground border border-border/50"
                            }
                          `}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center">
                <PenLine className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Selecione uma avaliação para exibir a folha de respostas.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
