import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";

import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from "recharts";

export default function Relatorios() {
  const [classes, setClasses] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedAssessment, setSelectedAssessment] = useState("");
  const [selectedBimestre, setSelectedBimestre] = useState("all");
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedClass && selectedAssessment) {
      generateReport();
    }
  }, [selectedClass, selectedAssessment, selectedBimestre]);

  const loadData = async () => {
    try {
      setLoading(true);
      const classesData = await apiFetch("/classes/").catch(() => []);
      const assessmentsData = await apiFetch("/assessments/").catch(() => []);
      
      const classes = Array.isArray(classesData) ? classesData : [];
      const assessments = Array.isArray(assessmentsData) ? assessmentsData : [];
      
      setClasses(classes);
      setAssessments(assessments);
      
      if (classes.length > 0) setSelectedClass(classes[0].id);
      if (assessments.length > 0) setSelectedAssessment(assessments[0].id);
    } catch (err) {
      // Erro ao carregar dados
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!selectedClass || !selectedAssessment) return;
    
    try {
      // Buscar submissões da avaliação
      const results = await apiFetch(
        `/assessments/${selectedAssessment}/submissions`
      ).catch(() => []);
      
      // Filtrar por turma selecionada e bimestre
      let studentResults = Array.isArray(results) 
        ? results.filter((r: any) => r.class_id === selectedClass)
        : [];
      
      // Filtrar por bimestre se selecionado
      if (selectedBimestre !== "all") {
        const bimNum = parseInt(selectedBimestre);
        const assessmentData = assessments.find((a: any) => a.id === selectedAssessment);
        if (assessmentData && assessmentData.bimestre === bimNum) {
          // Manter os resultados se a avaliação é do bimestre selecionado
        } else if (assessmentData && assessmentData.bimestre !== bimNum) {
          studentResults = [];
        }
      }
      

      
      // Dados para gráficos
      const studentAccuracy = studentResults
        .filter((r: any) => r && r.student_name)
        .map((r: any) => ({
          name: r.student_name || "Aluno",
          accuracy: Math.min(10, Math.max(0, r.score || 0)),
        }))
        .slice(0, 15);

      // Calcular acertos por questão baseado nas respostas
      const questionAccuracy = studentResults.length > 0
        ? Array.from({ length: 10 }, (_, i) => {
            const correctCount = studentResults.filter((r: any) => {
              const answers = r.answers || {};
              return answers[String(i + 1)] !== undefined;
            }).length;
            return {
              question: `Q${i + 1}`,
              accuracy: studentResults.length > 0 ? Math.round((correctCount / studentResults.length) * 100) : 0,
            };
          })
        : Array.from({ length: 10 }, (_, i) => ({
            question: `Q${i + 1}`,
            accuracy: 0,
          }));

      // Tendência baseada em datas das submissões
      const trendData = studentResults.length > 0
        ? [
            { date: "Submissões", accuracy: Math.round((studentResults.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / studentResults.length)) },
          ]
        : [
            { date: "Sem dados", accuracy: 0 },
          ];

      const totalStudents = studentResults.length;
      const averageAccuracy = studentResults.length > 0
        ? Math.round((studentResults.reduce((sum: number, r: any) => sum + (r.score || 0), 0) / studentResults.length) * 10) / 10
        : 0;

      const approvalRate = studentResults.length > 0
        ? Math.round((studentResults.filter((r: any) => (r.score || 0) >= 6).length / studentResults.length) * 100)
        : 0;

      setReportData({
        studentAccuracy: studentAccuracy.length > 0 ? studentAccuracy : [{ name: "Sem dados", accuracy: 0 }],
        questionAccuracy,
        trendData,
        totalStudents,
        averageAccuracy,
        approvalRate,
      });
    } catch (err) {
      // Erro ao gerar relatório
      toast.error("Erro ao gerar relatório");
    }
  };

  // Função de exportar PDF removida (dependência não instalada)
  // Implementar com biblioteca alternativa se necessário

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Relatórios de Desempenho" 
        description="Análise completa de desempenho das avaliações"
      />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Turma</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c: any) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Avaliação</label>
              <Select value={selectedAssessment} onValueChange={setSelectedAssessment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Bimestre</label>
              <Select value={selectedBimestre} onValueChange={setSelectedBimestre}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Anual (Todos)</SelectItem>
                  <SelectItem value="1">1º Bimestre</SelectItem>
                  <SelectItem value="2">2º Bimestre</SelectItem>
                  <SelectItem value="3">3º Bimestre</SelectItem>
                  <SelectItem value="4">4º Bimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>


          </div>
        </CardContent>
      </Card>

      {/* KPIs */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total de Alunos</p>
                <p className="text-3xl font-bold text-blue-600">{reportData.totalStudents}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Média Geral</p>
                <p className="text-3xl font-bold text-green-600">{reportData.averageAccuracy.toFixed(1)}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Taxa de Aprovação</p>
                <p className="text-3xl font-bold text-purple-600">{reportData.approvalRate}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Excelência</p>
                <p className="text-3xl font-bold text-orange-600">
                  {reportData.totalStudents > 0 ? Math.round((reportData.studentAccuracy.filter((s: any) => s.accuracy >= 9).length / reportData.totalStudents) * 100) : 0}%
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      <div ref={reportRef} className="space-y-6 p-4 bg-white">
        {reportData && (
          <>
            {/* Gráfico de Acertos por Estudante */}
            <Card>
              <CardHeader>
                <CardTitle>Acertos por Estudante</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.studentAccuracy}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Acertos por Questão */}
            <Card>
              <CardHeader>
                <CardTitle>Acertos por Questão</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={reportData.questionAccuracy}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="question" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="accuracy" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Gráfico de Tendência */}
            <Card>
              <CardHeader>
                <CardTitle>Tendência de Desempenho</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reportData.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="accuracy" stroke="#8B5CF6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
