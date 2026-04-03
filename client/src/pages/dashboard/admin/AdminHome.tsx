// Calia Digital — Admin Dashboard Home (Profissional)
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { BookOpen, GraduationCap, UserCircle, FileText, BarChart3, TrendingUp, TrendingDown, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HistoricalAnalysisAdmin from "../HistoricalAnalysisAdmin";
import ComparisonBySubject from "@/components/admin/ComparisonBySubject";
import ComparisonByGrade from "@/components/admin/ComparisonByGrade";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts";

const COLORS = ["#14B8A6", "#D97706", "#059669", "#8B5CF6", "#EF4444", "#3B82F6"];

export default function AdminHome() {
  const [, navigate] = useLocation();
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const load = async () => {
      try {
        const [c, s, a, t, sub] = await Promise.all([
          apiFetch("/classes"),
          apiFetch("/students"),
          apiFetch("/assessments"),
          apiFetch("/teachers").catch(() => []),
          apiFetch("/subjects").catch(() => []),
        ]);
        setClasses(c || []);
        setStudents(s || []);
        setAssessments(a || []);
        setTeachers(t || []);
        setSubjects(sub || []);

        // Try to get dashboard stats from historical/school/overview
        try {
          const st = await apiFetch("/historical/school/overview");
          setStats(st);
        } catch (e) {
          console.error("Erro ao buscar overview:", e);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  // Students per class chart data
  const studentsPerClass = classes.map((c) => ({
    name: c.name || "Sem nome",
    alunos: students.filter((s) => s.class_id === c.id).length,
  })).sort((a, b) => b.alunos - a.alunos);

  // Status distribution
  const statusCounts = students.reduce((acc: Record<string, number>, s) => {
    acc[s.status || "CURSANDO"] = (acc[s.status || "CURSANDO"] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  // Assessments per subject
  const assessPerSubject = subjects.map((sub) => ({
    name: sub.name,
    avaliacoes: assessments.filter((a) => a.subject_id === sub.id).length,
  })).filter((a) => a.avaliacoes > 0);

  // Calculate average if stats available
  const avgGeral = stats?.average_score != null ? Number(stats.average_score).toFixed(1) : "—";

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Painel Administrativo"
        description="Visão geral da sua escola"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card/50 border border-border/50">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="comparatives">Comparativos</TabsTrigger>
          <TabsTrigger value="historical">Análise Histórica</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Turmas" value={classes.length} icon={BookOpen} />
        <StatCard title="Alunos" value={students.length} icon={GraduationCap} />
        <StatCard title="Professores" value={teachers.length} icon={UserCircle} />
        <StatCard title="Avaliações" value={assessments.length} icon={FileText} />
        <StatCard title="Disciplinas" value={subjects.length} icon={BarChart3} />
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Alunos por Turma</CardTitle>
          </CardHeader>
          <CardContent>
            {studentsPerClass.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={studentsPerClass}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#ffffff" }} labelStyle={{ color: "#e7e5e3" }} />
                  <Bar dataKey="alunos" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-10 text-center">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Status dos Alunos</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {statusData.map((_, i) => (<Cell key={i} fill={COLORS[i % COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#ffffff" }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-10 text-center">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Assessments per Subject */}
        {assessPerSubject.length > 0 && (
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Avaliações por Disciplina</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={assessPerSubject} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" tick={{ fill: "#a1a1aa", fontSize: 11 }} allowDecimals={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill: "#a1a1aa", fontSize: 11 }} width={100} />
                  <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#ffffff" }} />
                  <Bar dataKey="avaliacoes" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Quick Links */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/alunos" className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><GraduationCap className="w-4 h-4 text-primary" /></div>
              <div><p className="text-sm font-medium">Cadastrar Aluno</p><p className="text-xs text-muted-foreground">Adicionar novo aluno</p></div>
            </Link>
            <Link href="/dashboard/turmas" className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><BookOpen className="w-4 h-4 text-primary" /></div>
              <div><p className="text-sm font-medium">Criar Turma</p><p className="text-xs text-muted-foreground">Nova turma escolar</p></div>
            </Link>
            <Link href="/dashboard/avaliacoes" className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="w-4 h-4 text-primary" /></div>
              <div><p className="text-sm font-medium">Nova Avaliação</p><p className="text-xs text-muted-foreground">Criar avaliação</p></div>
            </Link>
            <Link href="/dashboard/relatorios" className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><BarChart3 className="w-4 h-4 text-primary" /></div>
              <div><p className="text-sm font-medium">Ver Relatórios</p><p className="text-xs text-muted-foreground">Análise de desempenho</p></div>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Activity / Summary */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Resumo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/30">
              <span className="text-sm text-muted-foreground">Média Geral</span>
              <span className="text-lg font-bold text-primary">{avgGeral}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/30">
              <span className="text-sm text-muted-foreground">Total de Correções</span>
              <span className="text-lg font-bold">{stats?.total_corrections || "—"}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/30">
              <span className="text-sm text-muted-foreground">Alunos Ativos</span>
              <span className="text-lg font-bold text-green-400">{students.filter(s => (s.status || "CURSANDO") === "CURSANDO").length}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-background/30">
              <span className="text-sm text-muted-foreground">Turmas Ativas</span>
              <span className="text-lg font-bold">{classes.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

        </TabsContent>

        <TabsContent value="comparatives" className="space-y-4">
          <ComparisonBySubject />
          <ComparisonByGrade />
        </TabsContent>

        <TabsContent value="historical">
          <HistoricalAnalysisAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}
