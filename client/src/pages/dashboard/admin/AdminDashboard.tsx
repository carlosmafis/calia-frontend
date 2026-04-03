import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import {
  Users, TrendingUp, AlertTriangle, CheckCircle2, XCircle, Loader2,
  BookOpen, Award, AlertCircle
} from "lucide-react";
import { useLocation } from "wouter";

const COLORS = ["#059669", "#EF4444"];

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

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const [overview, setOverview] = useState<any>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, cls, stu, tch, alr] = await Promise.all([
          apiFetch("/admin/dashboard/overview").catch(() => null),
          apiFetch("/admin/dashboard/classes").catch(() => []),
          apiFetch("/admin/dashboard/students?limit=10").catch(() => ({ students: [] })),
          apiFetch("/admin/dashboard/teachers").catch(() => []),
          apiFetch("/admin/dashboard/alerts").catch(() => []),
        ]);
        setOverview(ov);
        setClasses(cls || []);
        setStudents(stu?.students || []);
        setTeachers(tch || []);
        setAlerts(alr || []);
      } catch {}
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

  const approvalData = overview ? [
    { name: "Aprovados", value: overview.approved },
    { name: "Reprovados", value: overview.failed }
  ] : [];

  return (
    <div>
      <PageHeader
        title="Dashboard Administrativo"
        description="Monitoramento geral da escola"
      />

      <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-card/50 border border-border/50">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="classes">Turmas</TabsTrigger>
            <TabsTrigger value="students">Alunos</TabsTrigger>
            <TabsTrigger value="teachers">Professores</TabsTrigger>
            <TabsTrigger value="alerts">Alertas</TabsTrigger>
          </TabsList>

          {/* VISÃO GERAL */}
          <TabsContent value="overview" className="space-y-6">
          {/* KPIs */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total de Alunos</p>
                    <p className="text-2xl font-bold text-primary">{overview?.total_students || 0}</p>
                  </div>
                  <Users className="w-8 h-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Média Geral</p>
                    <p className="text-2xl font-bold text-primary">{overview?.average || 0}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Taxa Aprovação</p>
                    <p className="text-2xl font-bold text-emerald-400">{overview?.approval_rate || 0}%</p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-emerald-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Em Risco</p>
                    <p className="text-2xl font-bold text-red-400">{overview?.at_risk || 0}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500/50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Avaliações</p>
                    <p className="text-2xl font-bold text-primary">{overview?.assessments_count || 0}</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-primary/50" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Taxa de Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={approvalData} cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={4} dataKey="value">
                      <Cell fill="#059669" />
                      <Cell fill="#EF4444" />
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Desempenho por Turma</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={classes.slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="class_name" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="average" name="Média" fill="#14B8A6" radius={[4, 4, 0, 0]} label={{ position: "top", fill: "#ffffff", fontSize: 11, formatter: (value: number) => value.toFixed(1) }} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TURMAS */}
        <TabsContent value="classes">
          <Card className="bg-card/50 border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Turma</TableHead>
                  <TableHead className="text-center">Média</TableHead>
                  <TableHead className="text-center">Aprovação</TableHead>
                  <TableHead className="text-center">Aprovados</TableHead>
                  <TableHead className="text-center">Reprovados</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {classes.map((cls) => (
                  <TableRow key={cls.class_id} className="border-border/30">
                    <TableCell className="font-medium">{cls.class_name}</TableCell>
                    <TableCell className="text-center font-mono">{cls.average}</TableCell>
                    <TableCell className="text-center">
                      <Badge className={cls.approval_rate >= 70 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"}>
                        {cls.approval_rate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-emerald-400">{cls.approved}</TableCell>
                    <TableCell className="text-center text-red-400">{cls.failed}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/dashboard/class/${cls.class_id}`)}>
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ALUNOS */}
        <TabsContent value="students">
          <Card className="bg-card/50 border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Aluno</TableHead>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Turma</TableHead>
                  <TableHead className="text-center">Última Nota</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.student_id} className="border-border/30">
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{student.registration}</TableCell>
                    <TableCell>{student.class_id}</TableCell>
                    <TableCell className="text-center font-mono">{student.latest_score}</TableCell>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* PROFESSORES */}
        <TabsContent value="teachers">
          <Card className="bg-card/50 border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead>Professor</TableHead>
                  <TableHead className="text-center">Média</TableHead>
                  <TableHead className="text-center">Desvio Padrão</TableHead>
                  <TableHead className="text-center">Aprovação</TableHead>
                  <TableHead className="text-center">Turmas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teachers.map((teacher) => (
                  <TableRow key={teacher.teacher_id} className="border-border/30">
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell className="text-center font-mono">{teacher.average}</TableCell>
                    <TableCell className="text-center font-mono text-muted-foreground">{teacher.std_dev}</TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-primary/15 text-primary border-primary/30">
                        {teacher.approval_rate}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{teacher.classes_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* ALERTAS */}
        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card className="bg-card/50 border-border/50">
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum alerta no momento</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert, idx) => (
              <Card key={idx} className={
                alert.severity === "high" ? "bg-red-500/5 border-red-500/20" :
                "bg-amber-500/5 border-amber-500/20"
              }>
                <CardContent className="p-4 flex items-start gap-3">
                  <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${
                    alert.severity === "high" ? "text-red-400" : "text-amber-400"
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      alert.severity === "high" ? "text-red-400" : "text-amber-400"
                    }`}>
                      {alert.message}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      <Button
        onClick={() => navigate("/dashboard/historical")}
        variant="outline"
        className="mt-6"
      >
        📊 Análise Histórica
      </Button>
    </div>
  );
}
