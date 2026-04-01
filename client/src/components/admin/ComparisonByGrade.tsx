// Calia Digital — Comparativo por Série
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, LineChart, Line } from "recharts";

interface GradeComparison {
  grade: string;
  average: number;
  approval_rate: number;
  approved: number;
  failed: number;
  total: number;
  classes_count: number;
}

export default function ComparisonByGrade() {
  const [data, setData] = useState<GradeComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [bimestre, setBimestre] = useState<string>("");
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const params = bimestre ? `?bimestre=${bimestre}` : "";
        const result = await apiFetch(`/admin/dashboard/by-grade${params}`);
        setData(result || []);
      } catch (err) {
        console.error("Erro ao carregar comparativo:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [bimestre]);

  // Preparar dados para o gráfico
  const chartData = data.map((item) => ({
    grade: item.grade,
    "Média Geral": parseFloat(item.average.toFixed(2)),
    "Taxa Aprovação": parseFloat(item.approval_rate.toFixed(1)),
  }));

  const getGradeColor = (index: number) => {
    const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Comparativo por Série
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
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Comparativo por Série
          </CardTitle>
          <div className="flex gap-2">
            <Select value={bimestre} onValueChange={setBimestre}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Selecione um bimestre..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Anual</SelectItem>
                <SelectItem value="1">1º Bimestre</SelectItem>
                <SelectItem value="2">2º Bimestre</SelectItem>
                <SelectItem value="3">3º Bimestre</SelectItem>
                <SelectItem value="4">4º Bimestre</SelectItem>
              </SelectContent>
            </Select>
            <Select value={chartType} onValueChange={(v) => setChartType(v as "bar" | "line")}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Barras</SelectItem>
                <SelectItem value="line">Linhas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Gráfico */}
        {chartData.length > 0 && (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "bar" ? (
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="grade" angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" domain={[0, 10]} label={{ value: "Média", angle: -90, position: "insideLeft" }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} label={{ value: "Taxa (%)", angle: 90, position: "insideRight" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="Média Geral" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar yAxisId="right" dataKey="Taxa Aprovação" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="grade" angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" domain={[0, 10]} label={{ value: "Média", angle: -90, position: "insideLeft" }} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 100]} label={{ value: "Taxa (%)", angle: 90, position: "insideRight" }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-background)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="Média Geral" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 6 }} />
                  <Line yAxisId="right" type="monotone" dataKey="Taxa Aprovação" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 6 }} />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Tabela Resumida */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.length === 0 ? (
            <div className="col-span-full text-center text-muted-foreground py-8">
              Nenhum dado disponível
            </div>
          ) : (
            data.map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-background/30 border border-border/30 hover:border-border/50 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-foreground">{item.grade}</h3>
                  <span className="text-xs text-muted-foreground">{item.classes_count} turma(s)</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Média:</span>
                    <span className="font-semibold text-lg" style={{
                      color: item.average >= 8 ? "#10b981" :
                             item.average >= 6 ? "#3b82f6" :
                             item.average >= 4 ? "#f59e0b" : "#ef4444"
                    }}>
                      {item.average.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Aprovação:</span>
                    <span className="font-semibold text-green-600">{item.approval_rate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-green-600">✓ {item.approved}</span>
                    <span className="text-red-600">✗ {item.failed}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
