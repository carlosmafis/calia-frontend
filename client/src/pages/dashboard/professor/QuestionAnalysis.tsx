import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, AlertTriangle, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";

export default function QuestionAnalysis() {
  const [, navigate] = useLocation();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const assessments = await apiFetch("/assessments").catch(() => []);
        setAssessments(assessments || []);
        if (assessments && assessments.length > 0) {
          setSelectedAssessment(assessments[0].id);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedAssessment) return;

    const load = async () => {
      try {
        const qs = await apiFetch(`/teacher/dashboard/assessment/${selectedAssessment}/questions/analysis`).catch(() => []);
        setQuestions(qs || []);
        if (qs && qs.length > 0) {
          setSelectedQuestion(qs[0]);
        }
      } catch {}
    };
    load();
  }, [selectedAssessment]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const chartData = selectedQuestion ? [
    { option: "A", count: selectedQuestion.option_counts.A },
    { option: "B", count: selectedQuestion.option_counts.B },
    { option: "C", count: selectedQuestion.option_counts.C },
    { option: "D", count: selectedQuestion.option_counts.D },
    { option: "E", count: selectedQuestion.option_counts.E },
    { option: "Branco", count: selectedQuestion.option_counts.BRANCO },
  ] : [];

  return (
    <div>
      <PageHeader
        title="Análise de Questões"
        description="Análise detalhada de cada questão"
        actions={
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        }
      />

      {/* Seletores */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
          <SelectTrigger className="bg-card/50 border-border/50">
            <SelectValue placeholder="Selecione uma avaliação" />
          </SelectTrigger>
          <SelectContent>
            {assessments.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedQuestion?.question || ""} onValueChange={(q) => {
          const question = questions.find(x => x.question === q);
          setSelectedQuestion(question);
        }}>
          <SelectTrigger className="bg-card/50 border-border/50">
            <SelectValue placeholder="Selecione uma questão" />
          </SelectTrigger>
          <SelectContent>
            {questions.map((q) => (
              <SelectItem key={q.question} value={q.question}>
                Questão {q.question}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedQuestion && (
        <div className="space-y-6">
          {/* Resumo da Questão */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">Questão {selectedQuestion.question}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Gabarito: <span className="font-mono font-bold text-primary">{selectedQuestion.expected}</span></p>
                </div>
                <Badge className={
                  selectedQuestion.difficulty === "easy" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                  selectedQuestion.difficulty === "medium" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                  "bg-red-500/15 text-red-400 border-red-500/30"
                }>
                  {selectedQuestion.difficulty === "easy" ? "Fácil" :
                   selectedQuestion.difficulty === "medium" ? "Média" : "Difícil"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Taxa de Acerto</span>
                  <span className="font-mono font-bold">{selectedQuestion.pct}%</span>
                </div>
                <Progress value={selectedQuestion.pct} className="h-3" />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <p className="text-xs text-muted-foreground">Alunos que Acertaram</p>
                  <p className="text-2xl font-bold text-emerald-400">{selectedQuestion.correct_count}/{selectedQuestion.total}</p>
                </div>
                <div className="p-3 rounded-lg bg-background/50 border border-border/30">
                  <p className="text-xs text-muted-foreground">Distrator Mais Escolhido</p>
                  <p className="text-2xl font-bold text-amber-400">{selectedQuestion.most_chosen_distractor || "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribuição de Respostas */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Distribuição de Respostas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="option" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#ffffff" }} />
                  <Bar dataKey="count" name="Alunos" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.option === selectedQuestion.expected ? "#059669" : "#14B8A6"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Análise de Distratores */}
          {selectedQuestion.most_chosen_distractor && (
            <Card className="bg-amber-500/5 border-amber-500/20">
              <CardContent className="p-4 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-400">Atenção: Distrator Problemático</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    A alternativa <span className="font-mono font-bold">{selectedQuestion.most_chosen_distractor}</span> foi escolhida por muitos alunos. 
                    Considere revisar o conteúdo ou reformular a questão.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Todas as Questões */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Todas as Questões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {questions.map((q) => (
                  <button
                    key={q.question}
                    onClick={() => setSelectedQuestion(q)}
                    className={`p-3 rounded-lg border transition-all ${
                      selectedQuestion.question === q.question
                        ? "bg-primary/15 border-primary/50"
                        : "bg-background/50 border-border/30 hover:border-border/50"
                    }`}
                  >
                    <div className="text-left">
                      <p className="font-mono font-bold text-sm">Q{q.question}</p>
                      <p className="text-xs text-muted-foreground mt-1">{q.pct}% acerto</p>
                      <Badge className="mt-2 text-xs" variant="outline">
                        {q.difficulty === "easy" ? "Fácil" :
                         q.difficulty === "medium" ? "Média" : "Difícil"}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
