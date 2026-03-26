import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";

export default function HistoricalAnalysisAdmin() {
  const [analysisType, setAnalysisType] = useState<"school" | "classes" | "class">("school");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [classes, setClasses] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [months, setMonths] = useState("6");

  // Carregar turmas
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const cls = await apiFetch("/classes");
        setClasses(cls || []);
        if (cls && cls.length > 0) {
          setSelectedClassId(cls[0].id);
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadClasses();
  }, []);

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      let endpoint = "";

      switch (analysisType) {
        case "school":
          endpoint = `/historical/school/evolution?months=${months}`;
          break;
        case "classes":
          endpoint = `/historical/classes/comparison?months=${months}`;
          break;
        case "class":
          if (!selectedClassId) return;
          endpoint = `/historical/class/${selectedClassId}/comparison?months=${months}`;
          break;
      }

      const result = await apiFetch(endpoint);
      setData(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [analysisType, selectedClassId, months]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving":
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case "declining":
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      case "stable":
        return <Minus className="w-5 h-5 text-blue-400" />;
      default:
        return null;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case "improving":
        return "Melhorando";
      case "declining":
        return "Piorando";
      case "stable":
        return "Estável";
      default:
        return "Sem dados";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "declining":
        return "bg-red-500/15 text-red-400 border-red-500/30";
      case "stable":
        return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/15 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="space-y-6">
      {/* Controles */}
      <Card className="bg-background/50 border-border/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Análise</label>
              <Select value={analysisType} onValueChange={(v: any) => setAnalysisType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="school">Evolução Geral da Escola</SelectItem>
                  <SelectItem value="classes">Comparativo entre Turmas</SelectItem>
                  <SelectItem value="class">Evolução de Turma Específica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {analysisType === "class" && (
              <div>
                <label className="text-sm font-medium mb-2 block">Selecionar Turma</label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger>
                    <SelectValue />
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
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Período (meses)</label>
              <Select value={months} onValueChange={setMonths}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Últimos 3 meses</SelectItem>
                  <SelectItem value="6">Últimos 6 meses</SelectItem>
                  <SelectItem value="12">Últimos 12 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Resumo */}
          {(analysisType === "school" || analysisType === "class") && (
            <Card className="bg-background/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">Tendência</p>
                    <div className="flex items-center gap-2">
                      {getTrendIcon(data.trend)}
                      <span className="font-medium">{getTrendLabel(data.trend)}</span>
                    </div>
                  </div>
                  <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">Melhoria</p>
                    <p className="text-2xl font-bold">{data.improvement > 0 ? "+" : ""}{data.improvement}</p>
                  </div>
                  <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                    <p className="text-sm text-muted-foreground mb-1">Períodos Analisados</p>
                    <p className="text-2xl font-bold">{data.total_periods || data.periods?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gráfico de Linha - Evolução */}
          {(analysisType === "school" || analysisType === "class") && data.periods && (
            <Card className="bg-background/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Evolução de Média</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.periods}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="period" stroke="rgba(255,255,255,0.5)" />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0,0,0,0.8)",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="average"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6" }}
                      name="Média"
                    />
                    {data.periods[0]?.approval_rate !== undefined && (
                      <Line
                        type="monotone"
                        dataKey="approval_rate"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: "#10b981" }}
                        name="Taxa Aprovação %"
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Gráfico de Barras - Comparativo Turmas */}
          {analysisType === "classes" && Array.isArray(data) && (
            <Card className="bg-background/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Comparativo de Turmas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.map((cls: any) => (
                    <div key={cls.class_id} className="p-4 bg-background/50 rounded-lg border border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{cls.class_name}</h4>
                        <Badge className={getTrendColor(cls.trend)}>
                          {getTrendLabel(cls.trend)}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{cls.average}</span>
                        <span className="text-sm text-muted-foreground">
                          {cls.monthly_averages?.length || 0} períodos
                        </span>
                      </div>
                      {cls.monthly_averages && cls.monthly_averages.length > 0 && (
                        <div className="mt-3 h-12">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={cls.monthly_averages.map((v: number, i: number) => ({ value: v }))}>
                              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                              <Bar dataKey="value" fill="#3b82f6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detalhes por Período */}
          {data.periods && (
            <Card className="bg-background/50 border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Detalhes por Período</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 px-3 font-medium">Período</th>
                        <th className="text-center py-2 px-3 font-medium">Média</th>
                        {data.periods[0]?.approval_rate !== undefined && (
                          <th className="text-center py-2 px-3 font-medium">Aprovação</th>
                        )}
                        {data.periods[0]?.approved !== undefined && (
                          <>
                            <th className="text-center py-2 px-3 font-medium">Aprovados</th>
                            <th className="text-center py-2 px-3 font-medium">Reprovados</th>
                          </>
                        )}
                        <th className="text-center py-2 px-3 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.periods.map((period: any, idx: number) => (
                        <tr key={idx} className="border-b border-border/30 hover:bg-background/30">
                          <td className="py-2 px-3">{period.period || period.month}</td>
                          <td className="text-center py-2 px-3 font-medium">{period.average}</td>
                          {period.approval_rate !== undefined && (
                            <td className="text-center py-2 px-3">{period.approval_rate}%</td>
                          )}
                          {period.approved !== undefined && (
                            <>
                              <td className="text-center py-2 px-3 text-emerald-400">{period.approved}</td>
                              <td className="text-center py-2 px-3 text-red-400">{period.failed}</td>
                            </>
                          )}
                          <td className="text-center py-2 px-3">{period.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : null}
    </div>
  );
}
