// Calia Digital — Professor Dashboard Home
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { BookOpen, FileText, ScanLine, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function ProfessorHome() {
  const [classes, setClasses] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, a] = await Promise.all([
          apiFetch("/classes"),
          apiFetch("/assessments"),
        ]);
        setClasses(c || []);
        setAssessments(a || []);
      } catch {}
    };
    load();
  }, []);

  // Mock performance data for chart
  const performanceData = assessments.slice(0, 10).map((a, i) => ({
    name: a.title || `Av. ${i + 1}`,
    media: Math.round(Math.random() * 40 + 50),
  }));

  return (
    <div>
      <PageHeader
        title="Painel do Professor"
        description="Suas turmas e avaliações"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Minhas Turmas" value={classes.length} icon={BookOpen} />
        <StatCard title="Avaliações" value={assessments.length} icon={FileText} />
        <StatCard title="Correções OCR" value="—" icon={ScanLine} description="Acesse pelo menu" />
        <StatCard title="Média Geral" value="—" icon={BarChart3} description="Em breve" />
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Desempenho por Avaliação</CardTitle>
        </CardHeader>
        <CardContent>
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }}
                  labelStyle={{ color: "#e7e5e3" }}
                />
                <Line type="monotone" dataKey="media" stroke="#14B8A6" strokeWidth={2} dot={{ fill: "#14B8A6", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-10 text-center">Crie avaliações para ver o desempenho</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
