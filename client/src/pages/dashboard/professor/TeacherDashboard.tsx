import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import {
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Loader2,
  BarChart3, Users, ArrowRight
} from "lucide-react";
import { useLocation } from "wouter";
import HistoricalAnalysisTeacher from "../HistoricalAnalysisTeacher";

// Componente customizado para Tooltip com texto branco garantido
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: "#1c1917",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "8px",
        padding: "8px 12px",
        color: "#ffffff"
      }}>
        <p style={{ margin: 0, color: "#ffffff" }}>{`${label || payload[0].payload?.name || ''}`}</p>
        <p style={{ margin: "4px 0 0 0", color: "#ffffff" }}>{`${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

export default function TeacherDashboard() {
  const [, navigate] = useLocation();
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [atRisk, setAtRisk] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const cls = await apiFetch("/classes").catch(() => []);
        setClasses(cls || []);
        if (cls && cls.length > 0) {
          setSelectedClass(cls[0].id);
        }
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedClass) return;

    const load = async () => {
      try {
        const [sum, stu, risk] = await Promise.all([
          apiFetch(`/teacher/dashboard/class/${selectedClass}/summary`).catch(() => null),
          apiFetch(`/teacher/dashboard/class/${selectedClass}/students`).catch(() => []),
          apiFetch(`/teacher/dashboard/class/${selectedClass}/at-risk`).catch(() => []),
        ]);
        setSummary(sum);
        setStudents(stu || []);
        setAtRisk(risk || []);
      } catch {}
    };
    load();
  }, [selectedClass]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const distributionData = summary ? [
    { range: "0-2", count: 0 },
    { range: "2-4", count: 0 },
    { range: "4-6", count: 0 },
    { range: "6-8", count: 0 },
    { range: "8-10", count: 0 }
  ] : [];

  return (
    <div>
      <PageHeader
        title="Dashboard da Turma"
        description="Monitoramento e análise detalhada"
      />

      {/* Seletor de Turma */}
      <div className="mb-6">
        <Select value={selectedClass} onValueChange={setSelectedClass}>
          <SelectTrigger className="w-full md:w-64 bg-card/50 border-border/50">
            <SelectValue placeholder="Selecione uma turma" />
          </SelectTrigger>
          <SelectContent>
            {classes.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {cls.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="resumo" className="space-y-6">
        <TabsList className="bg-card/50 border border-border/50 grid grid-cols-5 w-full">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="alunos">Alunos</TabsTrigger>
          <TabsTrigger value="risco">Em Risco</TabsTrigger>
          <TabsTrigger value="questoes">Questões</TabsTrigger>
          <TabsTrigger value="historical">Análise Histórica</TabsTrigger>
        </TabsList>

        {/* RESUMO */}
        <TabsContent value="resumo" className="space-y-6">
          {/* KPIs */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Média</p>
                <p className="text-2xl font-bold font-mono text-primary">{summary?.average || 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Mediana</p>
                <p className="text-2xl font-bold font-mono">{summary?.median || 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Desvio Padrão</p>
                <p className="text-2xl font-bold font-mono">{summary?.std_dev || 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Maior Nota</p>
                <p className="text-2xl font-bold font-mono text-emerald-400">{summary?.max_score || 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-muted-foreground">Menor Nota</p>
                <p className="text-2xl font-bold font-mono text-red-400">{summary?.min_score || 0}</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" /> Distribuição de Notas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={distributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="range" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Alunos" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" /> Status da Turma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Aprovados</span>
                      <span className="font-mono text-emerald-400">{summary?.approved || 0}</span>
                    </div>
                    <Progress value={(summary?.approved || 0) / (summary?.total || 1) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Reprovados</span>
                      <span className="font-mono text-red-400">{summary?.failed || 0}</span>
                    </div>
                    <Progress value={(summary?.failed || 0) / (summary?.total || 1) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Ausentes</span>
                      <span className="font-mono text-muted-foreground">{summary?.absent || 0}</span>
                    </div>
                    <Progress value={(summary?.absent || 0) / (summary?.total || 1) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ALUNOS */}
        <TabsContent value="alunos">
          <Card className="bg-card/50 border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Aluno</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead className="text-center">Nota</TableHead>
                  <TableHead className="text-center">Tendência</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.student_id} className="border-border/30">
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{student.registration}</TableCell>
                    <TableCell className="text-center font-mono font-bold">{student.score}</TableCell>
                    <TableCell className="text-center">
                      {student.trend === "up" ? (
                        <TrendingUp className="w-4 h-4 text-emerald-400 mx-auto" />
                      ) : student.trend === "down" ? (
                        <TrendingDown className="w-4 h-4 text-red-400 mx-auto" />
                      ) : (
                        <div className="w-4 h-4 mx-auto text-muted-foreground">—</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={
                        student.status === "approved" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                        student.status === "at_risk" ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                        student.status === "failed" ? "bg-red-500/15 text-red-400 border-red-500/30" :
                        "bg-gray-500/15 text-gray-400 border-gray-500/30"
                      }>
                        {student.status === "approved" ? "Aprovado" :
                         student.status === "at_risk" ? "Em Risco" :
                         student.status === "failed" ? "Reprovado" : "Ausente"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/dashboard/student/${student.student_id}`)}>
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ALUNOS EM RISCO */}
        <TabsContent value="risco">
          {atRisk.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum aluno em risco no momento</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {atRisk.map((student) => (
                <Card key={student.student_id} className="bg-red-500/5 border-red-500/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{student.name}</h3>
                          <Badge className="bg-red-500/15 text-red-400 border-red-500/30">
                            {student.risk_level === "high" ? "Risco Alto" : "Risco Médio"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Matrícula: {student.registration}
                        </p>
                        <div className="flex gap-4 text-sm">
                          <span className="text-muted-foreground">Média: <span className="font-mono font-bold text-red-400">{student.average_score}</span></span>
                          <span className="text-muted-foreground">Tendência: <span className={student.trend === "improving" ? "text-emerald-400" : student.trend === "worsening" ? "text-red-400" : "text-muted-foreground"}>
                            {student.trend === "improving" ? "Melhorando" : student.trend === "worsening" ? "Piorando" : "Estável"}
                          </span></span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/student/${student.student_id}`)}>
                        Ver Detalhes
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* QUESTÕES */}
        <TabsContent value="questoes">
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Selecione uma avaliação para ver análise de questões</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ANALISE HISTORICA */}
        <TabsContent value="historical">
          <HistoricalAnalysisTeacher classId={selectedClass} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
