// Calia Digital — Aluno Dashboard Home (Profissional)
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import EmptyState from "@/components/EmptyState";
import { FileText, BarChart3, TrendingUp, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function AlunoHome() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Try to get student submissions
        const data = await apiFetch("/dashboard/student-results").catch(() => []);
        setSubmissions(data || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const totalAvaliacoes = submissions.length;
  const mediaGeral = totalAvaliacoes > 0
    ? (submissions.reduce((sum, s) => sum + (s.score || 0), 0) / totalAvaliacoes).toFixed(1)
    : "—";
  const melhorNota = totalAvaliacoes > 0
    ? Math.max(...submissions.map(s => s.score || 0)).toFixed(1)
    : "—";

  const chartData = submissions.map((s) => ({
    name: s.assessment_title || "Avaliação",
    nota: s.score || 0,
  }));

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
        title="Meu Painel"
        description="Acompanhe suas notas e desempenho"
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Avaliações Realizadas" value={totalAvaliacoes} icon={FileText} />
        <StatCard title="Média Geral" value={mediaGeral} icon={BarChart3} />
        <StatCard title="Melhor Nota" value={melhorNota} icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Chart */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Notas por Avaliação</CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} domain={[0, 10]} />
                  <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#ffffff" }} labelStyle={{ color: "#e7e5e3" }} />
                  <Bar dataKey="nota" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState icon={BarChart3} title="Sem dados" description="Suas notas aparecerão aqui após as correções" />
            )}
          </CardContent>
        </Card>

        {/* Submissions List */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Minhas Notas</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <EmptyState icon={FileText} title="Nenhuma avaliação" description="Suas notas aparecerão conforme as avaliações forem corrigidas" />
            ) : (
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {submissions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/30">
                    <div className="flex items-center gap-3">
                      {(s.score || 0) >= 6 ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{s.assessment_title || "Avaliação"}</p>
                        <p className="text-xs text-muted-foreground">{s.subject_name || ""} {s.date ? `• ${new Date(s.date).toLocaleDateString("pt-BR")}` : ""}</p>
                      </div>
                    </div>
                    <Badge variant={(s.score || 0) >= 6 ? "default" : "destructive"} className="text-sm font-bold">
                      {(s.score || 0).toFixed(1)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
