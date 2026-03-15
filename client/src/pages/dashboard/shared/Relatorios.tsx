// Calia Digital — Relatórios (todos os roles)
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from "recharts";

const COLORS = ["#14B8A6", "#D97706", "#059669", "#8B5CF6", "#EF4444", "#3B82F6"];

export default function Relatorios() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, a, s] = await Promise.all([
          apiFetch("/classes"),
          apiFetch("/assessments"),
          apiFetch("/students"),
        ]);
        setClasses(c || []);
        setAssessments(a || []);
        setStudents(s || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  // Chart data
  const studentsPerClass = classes.map((c) => ({
    name: c.name || "Sem nome",
    alunos: students.filter((s) => s.class_id === c.id).length,
  }));

  const assessmentsPerClass = classes.map((c) => ({
    name: c.name || "Sem nome",
    avaliacoes: assessments.filter((a) => a.class_id === c.id).length,
  }));

  const statusCounts = students.reduce((acc: Record<string, number>, s) => {
    acc[s.status || "CURSANDO"] = (acc[s.status || "CURSANDO"] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Relatórios"
        description="Visualize dados e métricas de desempenho"
      />

      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="bg-card/50 border border-border/50">
          <TabsTrigger value="geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="turmas">Por Turma</TabsTrigger>
          <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Alunos por Turma</CardTitle>
              </CardHeader>
              <CardContent>
                {studentsPerClass.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={studentsPerClass}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                      <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                      <Bar dataKey="alunos" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-10 text-center">Sem dados</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Status dos Alunos</CardTitle>
              </CardHeader>
              <CardContent>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {statusData.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                      <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground py-10 text-center">Sem dados</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="turmas" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Avaliações por Turma</CardTitle>
            </CardHeader>
            <CardContent>
              {assessmentsPerClass.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={assessmentsPerClass}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                    <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                    <Bar dataKey="avaliacoes" fill="#D97706" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-muted-foreground py-10 text-center">Sem dados</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="avaliacoes" className="space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Resumo de Avaliações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-lg bg-background/50 text-center">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold font-mono">{assessments.length}</p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 text-center">
                  <p className="text-sm text-muted-foreground">Com Gabarito</p>
                  <p className="text-2xl font-bold font-mono text-primary">
                    {assessments.filter((a) => a.answer_key).length}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-background/50 text-center">
                  <p className="text-sm text-muted-foreground">Turmas</p>
                  <p className="text-2xl font-bold font-mono">
                    {new Set(assessments.map((a) => a.class_id)).size}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Relatórios detalhados de notas estarão disponíveis conforme as correções forem realizadas.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
