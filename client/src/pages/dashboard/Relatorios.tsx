import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, BarChart3, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell, PieChart, Pie, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";

export default function Relatorios() {
  const [classes, setClasses] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);

  const COLORS = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6"];

  const loadData = async () => {
    try {
      const [c, a] = await Promise.all([
        apiFetch("/classes"),
        apiFetch("/assessments"),
      ]);
      setClasses(c || []);
      setAssessments(a || []);
      if (c?.length > 0) setSelectedClass(c[0].id);
      if (a?.length > 0) setSelectedAssessment(a[0].id);
    } catch (err: any) {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedClass || !selectedAssessment) return;
    
    try {
      setLoading(true);
      const data = await apiFetch(
        `/assessments/${selectedAssessment}/results?class_id=${selectedClass}`
      );
      
      // Processar dados para gráficos
      const processedData = processReportData(data);
      setReportData(processedData);
    } catch (err: any) {
      toast.error("Erro ao gerar relatório");
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (data: any) => {
    // Simular processamento de dados
    // Em produção, isso viria do backend
    return {
      studentAccuracy: [
        { name: "Ana Silva", accuracy: 80 },
        { name: "Bruno Costa", accuracy: 70 },
        { name: "Carlos Santos", accuracy: 90 },
        { name: "Diana Lima", accuracy: 65 },
        { name: "Eduardo Oliveira", accuracy: 85 },
      ],
      questionAccuracy: [
        { question: "Q1", accuracy: 85 },
        { question: "Q2", accuracy: 72 },
        { question: "Q3", accuracy: 90 },
        { question: "Q4", accuracy: 68 },
        { question: "Q5", accuracy: 78 },
        { question: "Q6", accuracy: 82 },
        { question: "Q7", accuracy: 75 },
        { question: "Q8", accuracy: 88 },
        { question: "Q9", accuracy: 70 },
        { question: "Q10", accuracy: 80 },
      ],
      classPerformance: [
        { subject: "Português", value: 78 },
        { subject: "Matemática", value: 72 },
        { subject: "Inglês", value: 65 },
        { subject: "História", value: 80 },
        { subject: "Geografia", value: 75 },
      ],
      overallStats: {
        totalStudents: 45,
        averageAccuracy: 76.5,
        passRate: 82,
        excellenceRate: 28,
      },
    };
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedAssessment) {
      generateReport();
    }
  }, [selectedClass, selectedAssessment]);

  if (loading && !reportData) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Relatórios"
        description="Análise detalhada de desempenho e acertos"
      />

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Turma</label>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Avaliação</label>
          <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {assessments.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {reportData && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Total de Alunos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{reportData.overallStats.totalStudents}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-900">Média Geral</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{reportData.overallStats.averageAccuracy.toFixed(1)}%</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-900">Taxa de Aprovação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{reportData.overallStats.passRate}%</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-orange-900">Excelência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{reportData.overallStats.excellenceRate}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Acertos por Estudante */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Acertos por Estudante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.studentAccuracy} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="accuracy" fill="#3B82F6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Acertos por Questão */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Acertos por Questão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.questionAccuracy}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="question" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Bar dataKey="accuracy" fill="#10B981" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Desempenho por Disciplina */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Desempenho por Disciplina</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={reportData.classPerformance}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis />
                    <Radar name="Acertos %" dataKey="value" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} />
                    <Tooltip formatter={(value) => `${value}%`} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Distribuição de Notas */}
            <Card className="bg-card/50 border-border/50">
              <CardHeader>
                <CardTitle>Distribuição de Desempenho</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Excelente (90-100%)</span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "28%" }}></div>
                    </div>
                    <span className="text-sm font-medium">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Bom (70-89%)</span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "45%" }}></div>
                    </div>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Regular (50-69%)</span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "20%" }}></div>
                    </div>
                    <span className="text-sm font-medium">20%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Insuficiente (&lt;50%)</span>
                    <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: "7%" }}></div>
                    </div>
                    <span className="text-sm font-medium">7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Resumo */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Resumo Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/50">
                    <tr>
                      <th className="text-left py-2 px-4 font-medium">Métrica</th>
                      <th className="text-right py-2 px-4 font-medium">Valor</th>
                      <th className="text-right py-2 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/30 hover:bg-background/50">
                      <td className="py-2 px-4">Média Geral</td>
                      <td className="text-right py-2 px-4">{reportData.overallStats.averageAccuracy.toFixed(1)}%</td>
                      <td className="text-right py-2 px-4">
                        <Badge variant={reportData.overallStats.averageAccuracy >= 70 ? "default" : "secondary"}>
                          {reportData.overallStats.averageAccuracy >= 70 ? "Bom" : "Atenção"}
                        </Badge>
                      </td>
                    </tr>
                    <tr className="border-b border-border/30 hover:bg-background/50">
                      <td className="py-2 px-4">Taxa de Aprovação</td>
                      <td className="text-right py-2 px-4">{reportData.overallStats.passRate}%</td>
                      <td className="text-right py-2 px-4">
                        <Badge variant={reportData.overallStats.passRate >= 70 ? "default" : "secondary"}>
                          {reportData.overallStats.passRate >= 70 ? "Excelente" : "Atenção"}
                        </Badge>
                      </td>
                    </tr>
                    <tr className="hover:bg-background/50">
                      <td className="py-2 px-4">Taxa de Excelência</td>
                      <td className="text-right py-2 px-4">{reportData.overallStats.excellenceRate}%</td>
                      <td className="text-right py-2 px-4">
                        <Badge variant={reportData.overallStats.excellenceRate >= 25 ? "default" : "secondary"}>
                          {reportData.overallStats.excellenceRate >= 25 ? "Ótimo" : "Baixo"}
                        </Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
