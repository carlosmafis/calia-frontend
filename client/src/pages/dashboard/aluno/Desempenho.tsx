// Calia Digital — Aluno: Desempenho (Profissional)
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

export default function Desempenho() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/dashboard/student-results").catch(() => []);
        setSubmissions(data || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  // Evolution over time
  const evolutionData = submissions.map((s, i) => ({
    name: s.assessment_title || `Av. ${i + 1}`,
    nota: s.score || 0,
    media: submissions.slice(0, i + 1).reduce((sum, x) => sum + (x.score || 0), 0) / (i + 1),
  }));

  // By subject
  const bySubject: Record<string, { total: number; count: number }> = {};
  submissions.forEach((s) => {
    const subj = s.subject_name || "Geral";
    if (!bySubject[subj]) bySubject[subj] = { total: 0, count: 0 };
    bySubject[subj].total += s.score || 0;
    bySubject[subj].count += 1;
  });
  const subjectData = Object.entries(bySubject).map(([name, { total, count }]) => ({
    subject: name,
    media: Number((total / count).toFixed(1)),
    fullMark: 10,
  }));

  // Trend
  const lastTwo = submissions.slice(-2);
  const trend = lastTwo.length === 2 ? (lastTwo[1].score || 0) - (lastTwo[0].score || 0) : 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div>
        <PageHeader title="Meu Desempenho" description="Acompanhe sua evolução ao longo do tempo" />
        <EmptyState icon={BarChart3} title="Sem dados de desempenho" description="Gráficos de desempenho estarão disponíveis após a correção das avaliações." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Meu Desempenho" description="Acompanhe sua evolução ao longo do tempo" />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Média Geral</p>
            <p className="text-2xl font-bold text-primary">
              {(submissions.reduce((s, x) => s + (x.score || 0), 0) / submissions.length).toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Melhor Nota</p>
            <p className="text-2xl font-bold text-green-400">{Math.max(...submissions.map(s => s.score || 0)).toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Pior Nota</p>
            <p className="text-2xl font-bold text-red-400">{Math.min(...submissions.map(s => s.score || 0)).toFixed(1)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Tendência</p>
            <div className="flex items-center justify-center gap-1">
              {trend > 0 ? <TrendingUp className="w-5 h-5 text-green-400" /> : trend < 0 ? <TrendingDown className="w-5 h-5 text-red-400" /> : <Minus className="w-5 h-5 text-muted-foreground" />}
              <p className={`text-2xl font-bold ${trend > 0 ? "text-green-400" : trend < 0 ? "text-red-400" : "text-muted-foreground"}`}>
                {trend > 0 ? "+" : ""}{trend.toFixed(1)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Evolution Chart */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Evolução das Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={evolutionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} domain={[0, 10]} />
                <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} labelStyle={{ color: "#ffffff" }} />
                <Line type="monotone" dataKey="nota" stroke="#14B8A6" strokeWidth={2} dot={{ fill: "#14B8A6", r: 4 }} name="Nota" />
                <Line type="monotone" dataKey="media" stroke="#8B5CF6" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Média Acumulada" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Radar by Subject */}
        {subjectData.length > 1 ? (
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Desempenho por Disciplina</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={subjectData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: "#a1a1aa", fontSize: 10 }} />
                  <Radar name="Média" dataKey="media" stroke="#14B8A6" fill="#14B8A6" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-card/50 border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Notas por Avaliação</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={evolutionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} domain={[0, 10]} />
                  <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} labelStyle={{ color: "#ffffff" }} />
                  <Bar dataKey="nota" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
