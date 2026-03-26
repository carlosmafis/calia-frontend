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

interface HistoricalAnalysisTeacherProps {
  classId?: string;
}

export default function HistoricalAnalysisTeacher({ classId }: HistoricalAnalysisTeacherProps) {
  const [analysisType, setAnalysisType] = useState<"class" | "student">("class");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [months, setMonths] = useState("6");

  // Carregar alunos
  useEffect(() => {
    if (!classId) return;
    const loadStudents = async () => {
      try {
        const stu = await apiFetch(`/classes/${classId}/students`);
        setStudents(stu || []);
        if (stu && stu.length > 0) {
          setSelectedStudentId(stu[0].id);
        }
      } catch (error) {
        console.error(error);
      }
    };
    loadStudents();
  }, [classId]);

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      let endpoint = "";

      switch (analysisType) {
        case "class":
          if (!classId) return;
          endpoint = `/historical/class/${classId}/comparison?months=${months}`;
          break;
        case "student":
          if (!selectedStudentId) return;
          endpoint = `/historical/student/${selectedStudentId}/comparison?months=${months}`;
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
  }, [analysisType, selectedStudentId, months, classId]);

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
                  <SelectItem value="class">Evolução da Turma</SelectItem>
                  <SelectItem value="student">Evolução de Aluno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {analysisType === "student" && (
              <div>
                <label className="text-sm font-medium mb-2 block">Selecionar Aluno</label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((stu) => (
                      <SelectItem key={stu.id} value={stu.id}>
                        {stu.name}
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

          {/* Gráfico de Linha - Evolução */}
          {data.periods && (
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
