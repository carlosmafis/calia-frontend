// Calia Digital — Detalhes da Avaliação
// Mostra gabarito, resultados por aluno, análise por questão, estatísticas
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, CheckCircle2, XCircle, Minus, BarChart3, Users, FileText,
  TrendingUp, TrendingDown, AlertTriangle, Loader2, Download
} from "lucide-react";
import { useLocation } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";

const COLORS = ["#14B8A6", "#D97706", "#059669", "#8B5CF6", "#EF4444", "#3B82F6"];

export default function AvaliacaoDetalhes({ id }: { id: string }) {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [assessment, setAssessment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [a, sub, stu] = await Promise.all([
          apiFetch(`/assessments/${id}`).catch(() => null),
          apiFetch(`/assessments/${id}/submissions`).catch(() => []),
          apiFetch("/students").catch(() => []),
        ]);
        setAssessment(a);
        setSubmissions(sub || []);
        setStudents(stu || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Avaliação não encontrada.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard/avaliacoes")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  // Parse answer_key
  let answerKey: Record<string, string> = {};
  try {
    if (typeof assessment.answer_key === "string") {
      answerKey = JSON.parse(assessment.answer_key);
    } else if (assessment.answer_key) {
      answerKey = assessment.answer_key;
    }
  } catch {}

  // Compute scores
  const scores = submissions.map((sub) => {
    let answers: Record<string, string> = {};
    try {
      // Tentar usar extracted_answers primeiro (campo correto do backend)
      const answerField = sub.extracted_answers || sub.answers;
      if (typeof answerField === "string") answers = JSON.parse(answerField);
      else if (answerField) answers = answerField;
    } catch {}

    const student = students.find((s) => s.id === sub.student_id);
    const totalQ = Object.keys(answerKey).length || assessment.total_questions || 10;
    let correct = 0;
    let wrong = 0;
    let blank = 0;
    const details: { q: string; answer: string; expected: string; isCorrect: boolean }[] = [];

    Object.entries(answerKey).forEach(([q, expected]) => {
      const answer = answers[q] || "BRANCO";
      const isCorrect = answer.toUpperCase() === (expected as string).toUpperCase();
      if (answer === "BRANCO" || answer === "") blank++;
      else if (isCorrect) correct++;
      else wrong++;
      details.push({ q, answer, expected: expected as string, isCorrect });
    });

    const score = totalQ > 0 ? Math.round((correct / totalQ) * 100) / 10 : 0;

    return {
      student_id: sub.student_id,
      student_name: student?.name || "Aluno desconhecido",
      registration: student?.registration || "—",
      correct,
      wrong,
      blank,
      score: sub.score != null ? sub.score : score,
      details,
      answers,
    };
  });

  // Statistics
  const allScores = scores.map((s) => s.score);
  const avg = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
  const sorted = [...allScores].sort((a, b) => a - b);
  const median = sorted.length > 0
    ? sorted.length % 2 === 0
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)]
    : 0;
  const stdDev = allScores.length > 0
    ? Math.sqrt(allScores.reduce((sum, s) => sum + Math.pow(s - avg, 2), 0) / allScores.length)
    : 0;
  const maxScore = allScores.length > 0 ? Math.max(...allScores) : 0;
  const minScore = allScores.length > 0 ? Math.min(...allScores) : 0;
  const approvedCount = allScores.filter((s) => s >= 6).length;
  const failedCount = allScores.filter((s) => s < 6).length;

  // Distribution histogram
  const distribution = [
    { range: "0-2", count: allScores.filter((s) => s >= 0 && s < 2).length },
    { range: "2-4", count: allScores.filter((s) => s >= 2 && s < 4).length },
    { range: "4-6", count: allScores.filter((s) => s >= 4 && s < 6).length },
    { range: "6-8", count: allScores.filter((s) => s >= 6 && s < 8).length },
    { range: "8-10", count: allScores.filter((s) => s >= 8 && s <= 10).length },
  ];

  // Per-question analysis
  const totalQ = Object.keys(answerKey).length || assessment.total_questions || 10;
  const questionAnalysis = Array.from({ length: totalQ }, (_, i) => {
    const qNum = String(i + 1);
    const expected = answerKey[qNum] || "?";
    let correctCount = 0;
    const optionCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, BRANCO: 0 };

    scores.forEach((s) => {
      const ans = (s.answers && s.answers[qNum]) || "BRANCO";
      if (ans.toUpperCase() === expected.toUpperCase()) correctCount++;
      if (optionCounts[ans.toUpperCase()] !== undefined) optionCounts[ans.toUpperCase()]++;
      else optionCounts["BRANCO"]++;
    });

    const pct = submissions.length > 0 ? Math.round((correctCount / submissions.length) * 100) : 0;
    return { question: qNum, expected, correctCount, pct, optionCounts };
  });

  const hardQuestions = questionAnalysis.filter((q) => q.pct < 40);
  const easyQuestions = questionAnalysis.filter((q) => q.pct > 80);

  // Ranking
  const ranking = [...scores].sort((a, b) => b.score - a.score);

  // Approved vs Failed pie
  const approvalData = [
    { name: "Aprovados (≥6)", value: approvedCount },
    { name: "Reprovados (<6)", value: failedCount },
  ];

  return (
    <div>
      <PageHeader
        title={assessment.title || "Avaliação"}
        description={`${assessment.total_questions || totalQ} questões · ${submissions.length} correções realizadas`}
        actions={
          <Button variant="outline" onClick={() => navigate("/dashboard/avaliacoes")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        }
      />

      {submissions.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma correção realizada ainda para esta avaliação.</p>
            <p className="text-xs text-muted-foreground mt-2">
              Use a Correção OCR ou Manual para corrigir as provas dos alunos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="resumo" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="ranking">Ranking</TabsTrigger>
            <TabsTrigger value="questoes">Por Questão</TabsTrigger>
            <TabsTrigger value="gabarito">Gabarito</TabsTrigger>
          </TabsList>

          {/* RESUMO */}
          <TabsContent value="resumo" className="space-y-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Média</p>
                  <p className="text-2xl font-bold font-mono text-primary">{avg.toFixed(1)}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Mediana</p>
                  <p className="text-2xl font-bold font-mono">{median.toFixed(1)}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Desvio Padrão</p>
                  <p className="text-2xl font-bold font-mono">{stdDev.toFixed(2)}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Maior Nota</p>
                  <p className="text-2xl font-bold font-mono text-emerald-400">{maxScore.toFixed(1)}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Menor Nota</p>
                  <p className="text-2xl font-bold font-mono text-red-400">{minScore.toFixed(1)}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Distribution */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" /> Distribuição de Notas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={distribution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="range" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} labelStyle={{ color: "#ffffff" }} />
                      <Bar dataKey="count" name="Alunos" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Approval Pie */}
              <Card className="bg-card/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" /> Taxa de Aprovação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={approvalData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                        <Cell fill="#059669" />
                        <Cell fill="#EF4444" />
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} labelStyle={{ color: "#ffffff" }} />
                      <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            {hardQuestions.length > 0 && (
              <Card className="bg-red-500/5 border-red-500/20">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400">Questões Difíceis (acerto &lt; 40%)</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Questões {hardQuestions.map((q) => q.question).join(", ")} tiveram baixo índice de acerto.
                      Considere revisar o conteúdo com os alunos.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* RANKING */}
          <TabsContent value="ranking">
            <Card className="bg-card/50 border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="w-16">#</TableHead>
                    <TableHead>Aluno</TableHead>
                    <TableHead>Matrícula</TableHead>
                    <TableHead className="text-center">Acertos</TableHead>
                    <TableHead className="text-center">Erros</TableHead>
                    <TableHead className="text-center">Em Branco</TableHead>
                    <TableHead className="text-center">Nota</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ranking.map((r, idx) => (
                    <TableRow key={r.student_id} className="border-border/30">
                      <TableCell className="font-mono text-muted-foreground">
                        {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}º`}
                      </TableCell>
                      <TableCell className="font-medium">{r.student_name}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">{r.registration}</TableCell>
                      <TableCell className="text-center font-mono text-emerald-400">{r.correct}</TableCell>
                      <TableCell className="text-center font-mono text-red-400">{r.wrong}</TableCell>
                      <TableCell className="text-center font-mono text-muted-foreground">{r.blank}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-mono font-bold text-lg ${r.score >= 6 ? "text-emerald-400" : "text-red-400"}`}>
                          {typeof r.score === "number" ? r.score.toFixed(1) : r.score}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={r.score >= 6 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}>
                          {r.score >= 6 ? "Aprovado" : "Reprovado"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* POR QUESTÃO */}
          <TabsContent value="questoes" className="space-y-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Índice de Acerto por Questão</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={questionAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="question" tick={{ fill: "#a1a1aa", fontSize: 11 }} label={{ value: "Questão", position: "insideBottom", offset: -5, fill: "#a1a1aa" }} />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} domain={[0, 100]} unit="%" />
                    <Tooltip
                      contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} labelStyle={{ color: "#ffffff" }}
                      formatter={(value: number) => [`${value}%`, "Acerto"]}
                    />
                    <Bar dataKey="pct" name="% Acerto" radius={[4, 4, 0, 0]}>
                      {questionAnalysis.map((q, i) => (
                        <Cell key={i} fill={q.pct >= 70 ? "#059669" : q.pct >= 40 ? "#D97706" : "#EF4444"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Question detail table */}
            <Card className="bg-card/50 border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="w-20">Questão</TableHead>
                    <TableHead className="w-20">Gabarito</TableHead>
                    <TableHead>% Acerto</TableHead>
                    <TableHead className="text-center">A</TableHead>
                    <TableHead className="text-center">B</TableHead>
                    <TableHead className="text-center">C</TableHead>
                    <TableHead className="text-center">D</TableHead>
                    <TableHead className="text-center">E</TableHead>
                    <TableHead className="text-center">Branco</TableHead>
                    <TableHead>Dificuldade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {questionAnalysis.map((q) => (
                    <TableRow key={q.question} className="border-border/30">
                      <TableCell className="font-mono font-medium">{q.question}</TableCell>
                      <TableCell>
                        <Badge className="bg-primary/15 text-primary border-primary/30 font-mono">{q.expected}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={q.pct} className="h-2 w-20" />
                          <span className="font-mono text-xs w-10">{q.pct}%</span>
                        </div>
                      </TableCell>
                      {["A", "B", "C", "D", "E", "BRANCO"].map((opt) => (
                        <TableCell key={opt} className="text-center">
                          <span className={`font-mono text-xs ${opt === q.expected ? "text-primary font-bold" : "text-muted-foreground"}`}>
                            {q.optionCounts[opt] || 0}
                          </span>
                        </TableCell>
                      ))}
                      <TableCell>
                        <Badge className={
                          q.pct >= 70
                            ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                            : q.pct >= 40
                            ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                            : "bg-red-500/15 text-red-400 border-red-500/30"
                        }>
                          {q.pct >= 70 ? "Fácil" : q.pct >= 40 ? "Média" : "Difícil"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* GABARITO */}
          <TabsContent value="gabarito">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Gabarito Oficial</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Object.entries(answerKey).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([q, ans]) => (
                    <div key={q} className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/30">
                      <span className="font-mono text-sm text-muted-foreground w-8">{q}.</span>
                      <Badge className="bg-primary/15 text-primary border-primary/30 font-mono text-base px-3">
                        {ans as string}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
