// Calia Digital — Admin Dashboard Home
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { BookOpen, GraduationCap, UserCircle, FileText, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";

const COLORS = ["#14B8A6", "#D97706", "#059669", "#8B5CF6", "#EF4444"];

export default function AdminHome() {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, s, a] = await Promise.all([
          apiFetch("/classes"),
          apiFetch("/students"),
          apiFetch("/assessments"),
        ]);
        setClasses(c || []);
        setStudents(s || []);
        setAssessments(a || []);
      } catch {}
    };
    load();
  }, []);

  // Students per class chart data
  const studentsPerClass = classes.map((c) => ({
    name: c.name || "Sem nome",
    alunos: students.filter((s) => s.class_id === c.id).length,
  }));

  // Status distribution
  const statusCounts = students.reduce((acc: Record<string, number>, s) => {
    acc[s.status || "CURSANDO"] = (acc[s.status || "CURSANDO"] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader
        title="Painel Administrativo"
        description="Visão geral da sua escola"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Turmas" value={classes.length} icon={BookOpen} />
        <StatCard title="Alunos" value={students.length} icon={GraduationCap} />
        <StatCard title="Avaliações" value={assessments.length} icon={FileText} />
        <StatCard title="Média Geral" value="—" icon={BarChart3} description="Em breve" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Alunos por Turma</CardTitle>
          </CardHeader>
          <CardContent>
            {studentsPerClass.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={studentsPerClass}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                    labelStyle={{ color: "#e7e5e3" }}
                  />
                  <Bar dataKey="alunos" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-10 text-center">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Status dos Alunos</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {statusData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-10 text-center">Nenhum dado disponível</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
