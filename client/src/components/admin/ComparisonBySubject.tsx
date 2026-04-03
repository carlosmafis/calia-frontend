// Calia Digital — Comparativo por Disciplina
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";

interface SubjectComparison {
  subject: string;
  class: string;
  average: number;
  approval_rate: number;
  approved: number;
  failed: number;
  total: number;
}

export default function ComparisonBySubject() {
  const [data, setData] = useState<SubjectComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [bimestre, setBimestre] = useState<string>("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const params = bimestre !== "all" ? `?bimestre=${bimestre}` : "";
        const result = await apiFetch(`/historical/school/by-subject${params}`);
        setData(result || []);
      } catch (err) {
        console.error("Erro ao carregar comparativo:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [bimestre]);

  // Preparar dados para gráfico (agrupar por disciplina)
  const chartData = Array.from(
    new Map(
      data.map((item) => [
        item.subject,
        {
          subject: item.subject,
          average: parseFloat(
            (
              data
                .filter((d) => d.subject === item.subject)
                .reduce((sum, d) => sum + d.average, 0) / data.filter((d) => d.subject === item.subject).length
            ).toFixed(2)
          ),
        },
      ])
    ).values()
  );

  // Cores para as barras
  const getColor = (value: number) => {
    if (value >= 8) return "#10b981"; // Verde
    if (value >= 6) return "#3b82f6"; // Azul
    if (value >= 4) return "#f59e0b"; // Âmbar
    return "#ef4444"; // Vermelho
  };

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Comparativo por Disciplina
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Comparativo por Disciplina
          </CardTitle>
          <Select value={bimestre} onValueChange={setBimestre}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Selecione um bimestre..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Anual</SelectItem>
              <SelectItem value="1">1º Bimestre</SelectItem>
              <SelectItem value="2">2º Bimestre</SelectItem>
              <SelectItem value="3">3º Bimestre</SelectItem>
              <SelectItem value="4">4º Bimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Gráfico de Médias por Disciplina */}
        {chartData.length > 0 && (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="subject" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 10]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-background)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    color: "var(--color-foreground)"
                  }}
                  formatter={(value: number) => value.toFixed(2)}
                />
                <Bar dataKey="average" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getColor(entry.average)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tabela Detalhada */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-background/30">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Disciplina</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Turma</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">Média</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">Taxa Aprovação</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">Aprovados</th>
                <th className="px-4 py-3 text-center font-semibold text-foreground">Reprovados</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum dado disponível
                  </td>
                </tr>
              ) : (
                data.map((item, idx) => (
                  <tr key={idx} className="border-b border-border/30 hover:bg-background/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{item.subject}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.class}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                        item.average >= 8 ? "bg-green-500/20 text-green-600" :
                        item.average >= 6 ? "bg-blue-500/20 text-blue-600" :
                        item.average >= 4 ? "bg-amber-500/20 text-amber-600" :
                        "bg-red-500/20 text-red-600"
                      }`}>
                        {item.average.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{item.approval_rate.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center text-green-600 font-semibold">{item.approved}</td>
                    <td className="px-4 py-3 text-center text-red-600 font-semibold">{item.failed}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
