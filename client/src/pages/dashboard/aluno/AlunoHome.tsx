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

export default function AlunoHome() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Try to get student submissions
        const data = await apiFetch("/dashboard/student-results/");
        setSubmissions(data || []);
        setError(null);
      } catch (err: any) {
        console.error("Erro ao carregar submissões:", err);
        setError(err.message || "Erro ao carregar dados");
        setSubmissions([]);
      }
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

  if (error) {
    return (
      <div>
        <PageHeader
          title="Meu Painel"
          description="Acompanhe suas notas e desempenho"
        />
        <Card className="bg-red-950/20 border-red-500/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="font-semibold text-red-500">Erro ao carregar dados</p>
                <p className="text-sm text-red-400 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
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
                  <Tooltip content={<CustomTooltip />} />
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
