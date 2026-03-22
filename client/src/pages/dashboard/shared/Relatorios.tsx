// Calia Digital — Relatórios Profissionais
// Visão geral, comparativo entre turmas, análise por avaliação, indicadores de risco
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, BarChart3, TrendingUp, AlertTriangle, Users } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#14B8A6", "#8B5CF6", "#D97706", "#EF4444", "#3B82F6", "#059669", "#EC4899"];

export default function Relatorios() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cl, as_, stu] = await Promise.all([
          apiFetch("/classes").catch(() => []),
          apiFetch("/assessments").catch(() => []),
          apiFetch("/students").catch(() => []),
        ]);
        setClasses(cl || []);
        setAssessments(as_ || []);
        setStudents(stu || []);

        const allSubs: any[] = [];
        for (const a of (as_ || [])) {
          try {
            const subs = await apiFetch(`/assessments/${a.id}/submissions`);
            if (Array.isArray(subs) && subs.length > 0) {
              console.log(`Carregadas ${subs.length} submissões para avaliação ${a.id}`);
              allSubs.push(...subs.map((s: any) => ({
                ...s,
                assessment_id: a.id,
                assessment_title: a.title,
                class_id: a.class_id
              })));
            }
          } catch (err) {
            console.error(`Erro ao carregar submissões da avaliação ${a.id}:`, err);
          }
        }
        console.log(`Total de submissões carregadas: ${allSubs.length}`);
        setSubmissions(allSubs);
      } catch (err) {
        console.error("Erro ao carregar dados dos relatórios:", err);
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  // Class-level stats
  const classStats = classes.map((cls) => {
    const classStudents = students.filter((s) => s.class_id === cls.id);
    const classSubs = submissions.filter((s) => s.class_id === cls.id);
    const scores = classSubs.map((s) => s.score || 0);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const approved = scores.filter((s) => s >= 6).length;
    const approvalRate = scores.length > 0 ? (approved / scores.length) * 100 : 0;
    return { name: cls.name, id: cls.id, students: classStudents.length, submissions: classSubs.length, avg: Math.round(avg * 10) / 10, approvalRate: Math.round(approvalRate) };
  });

  // Per-assessment stats
  const assessmentStats = assessments.map((a) => {
    const subs = submissions.filter((s) => s.assessment_id === a.id);
    const scores = subs.map((s) => s.score || 0);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const cls = classes.find((c) => c.id === a.class_id);
    return { title: a.title, id: a.id, class_name: cls?.name || "—", submissions: subs.length, avg: Math.round(avg * 10) / 10, max: scores.length > 0 ? Math.max(...scores) : 0, min: scores.length > 0 ? Math.min(...scores) : 0 };
  });

  // Student performance
  const studentPerformance = students.map((stu) => {
    const stuSubs = submissions.filter((s) => s.student_id === stu.id);
    const scores = stuSubs.map((s) => s.score || 0);
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    const cls = classes.find((c) => c.id === stu.class_id);
    return { ...stu, class_name: cls?.name || "—", avg: Math.round(avg * 10) / 10, totalSubs: stuSubs.length };
  });

  const riskStudents = studentPerformance.filter((s) => s.totalSubs > 0 && s.avg < 5);
  const topStudents = [...studentPerformance].filter((s) => s.totalSubs > 0).sort((a, b) => b.avg - a.avg).slice(0, 10);

  // Overall
  const totalSubs = submissions.length;
  const allScores = submissions.map((s) => s.score || 0);
  const overallAvg = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : 0;
  const overallApproval = allScores.length > 0 ? (allScores.filter((s) => s >= 6).length / allScores.length) * 100 : 0;

  return (
    <div>
      <PageHeader title="Relatórios e Análises" description="Visão completa do desempenho acadêmico" />

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total de Correções</p>
            <p className="text-3xl font-bold font-mono text-primary">{totalSubs}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Média Geral</p>
            <p className="text-3xl font-bold font-mono">{overallAvg.toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Taxa de Aprovação</p>
            <p className="text-3xl font-bold font-mono text-emerald-400">{overallApproval.toFixed(0)}%</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Alunos em Risco</p>
            <p className="text-3xl font-bold font-mono text-red-400">{riskStudents.length}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="turmas" className="space-y-6">
        <TabsList className="bg-card/50 border border-border/50">
          <TabsTrigger value="turmas">Por Turma</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
          <TabsTrigger value="ranking">Ranking</TabsTrigger>
          <TabsTrigger value="risco">Indicadores de Risco</TabsTrigger>
        </TabsList>

        {/* POR TURMA */}
        <TabsContent value="turmas" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Média por Turma</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={classStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} domain={[0, 10]} />
                    <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                    <Bar dataKey="avg" name="Média" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Users className="w-5 h-5 text-primary" /> Taxa de Aprovação por Turma</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={classStats}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} domain={[0, 100]} unit="%" />
                    <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} formatter={(v: number) => [`${v}%`, "Aprovação"]} />
                    <Bar dataKey="approvalRate" name="Aprovação" radius={[4, 4, 0, 0]}>
                      {classStats.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          <Card className="bg-card/50 border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Turma</TableHead>
                  <TableHead className="text-center">Alunos</TableHead>
                  <TableHead className="text-center">Correções</TableHead>
                  <TableHead className="text-center">Média</TableHead>
                  <TableHead>Aprovação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classStats.map((c) => (
                  <TableRow key={c.id} className="border-border/30">
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-center font-mono">{c.students}</TableCell>
                    <TableCell className="text-center font-mono">{c.submissions}</TableCell>
                    <TableCell className="text-center">
                      <span className={`font-mono font-bold ${c.avg >= 6 ? "text-emerald-400" : c.avg >= 4 ? "text-amber-400" : "text-red-400"}`}>{c.avg.toFixed(1)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={c.approvalRate} className="h-2 w-24" />
                        <span className="font-mono text-xs w-10">{c.approvalRate}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* AVALIAÇÕES */}
        <TabsContent value="avaliacoes">
          <Card className="bg-card/50 border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Avaliação</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead className="text-center">Correções</TableHead>
                  <TableHead className="text-center">Média</TableHead>
                  <TableHead className="text-center">Maior</TableHead>
                  <TableHead className="text-center">Menor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assessmentStats.map((a) => (
                  <TableRow key={a.id} className="border-border/30">
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell className="text-muted-foreground">{a.class_name}</TableCell>
                    <TableCell className="text-center font-mono">{a.submissions}</TableCell>
                    <TableCell className="text-center"><span className={`font-mono font-bold ${a.avg >= 6 ? "text-emerald-400" : "text-red-400"}`}>{a.avg.toFixed(1)}</span></TableCell>
                    <TableCell className="text-center font-mono text-emerald-400">{a.max.toFixed(1)}</TableCell>
                    <TableCell className="text-center font-mono text-red-400">{a.min.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
                {assessmentStats.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhuma avaliação com correções.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* RANKING */}
        <TabsContent value="ranking">
          <Card className="bg-card/50 border-border/50 overflow-hidden">
            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Top 10 Alunos</CardTitle></CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Aluno</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead className="text-center">Avaliações</TableHead>
                  <TableHead className="text-center">Média</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topStudents.map((s, idx) => (
                  <TableRow key={s.id} className="border-border/30">
                    <TableCell className="font-mono text-muted-foreground">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `${idx + 1}º`}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground">{s.class_name}</TableCell>
                    <TableCell className="text-center font-mono">{s.totalSubs}</TableCell>
                    <TableCell className="text-center"><span className="font-mono font-bold text-lg text-emerald-400">{s.avg.toFixed(1)}</span></TableCell>
                  </TableRow>
                ))}
                {topStudents.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhum dado de desempenho disponível.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* INDICADORES DE RISCO */}
        <TabsContent value="risco" className="space-y-6">
          {riskStudents.length > 0 ? (
            <>
              <Card className="bg-red-500/5 border-red-500/20">
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-400">{riskStudents.length} aluno(s) com média abaixo de 5.0</p>
                    <p className="text-xs text-muted-foreground mt-1">Estes alunos precisam de atenção especial. Considere reforço escolar ou acompanhamento pedagógico.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead>Aluno</TableHead>
                      <TableHead>Turma</TableHead>
                      <TableHead>Matrícula</TableHead>
                      <TableHead className="text-center">Avaliações</TableHead>
                      <TableHead className="text-center">Média</TableHead>
                      <TableHead>Nível de Risco</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riskStudents.sort((a, b) => a.avg - b.avg).map((s) => (
                      <TableRow key={s.id} className="border-border/30">
                        <TableCell className="font-medium">{s.name}</TableCell>
                        <TableCell className="text-muted-foreground">{s.class_name}</TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">{s.registration || "—"}</TableCell>
                        <TableCell className="text-center font-mono">{s.totalSubs}</TableCell>
                        <TableCell className="text-center"><span className="font-mono font-bold text-red-400">{s.avg.toFixed(1)}</span></TableCell>
                        <TableCell>
                          <Badge className={s.avg < 3 ? "bg-red-500/15 text-red-400 border-red-500/30" : "bg-amber-500/15 text-amber-400 border-amber-500/30"}>
                            {s.avg < 3 ? "Crítico" : "Atenção"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </>
          ) : (
            <Card className="bg-emerald-500/5 border-emerald-500/20">
              <CardContent className="py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="font-medium text-emerald-400">Nenhum aluno em risco</p>
                <p className="text-sm text-muted-foreground mt-1">{totalSubs > 0 ? "Todos os alunos estão com média acima de 5.0." : "Ainda não há correções para analisar."}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
