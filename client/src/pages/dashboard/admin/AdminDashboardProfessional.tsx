// Painel Administrativo Profissional - Gestão Escolar Completa
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, Cell
} from "recharts";
import { AlertTriangle, TrendingUp, TrendingDown, Download, Loader2, Users, BookOpen, Award } from "lucide-react";

const COLORS = ["#14B8A6", "#D97706", "#059669", "#8B5CF6", "#EF4444", "#3B82F6"];

export default function AdminDashboardProfessional() {
  const [activeTab, setActiveTab] = useState("risk");
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [riskStudents, setRiskStudents] = useState<any[]>([]);
  const [classComparison, setClassComparison] = useState<any[]>([]);
  const [subjectAnalysis, setSubjectAnalysis] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, s, a] = await Promise.all([
          apiFetch("/classes/").catch(() => []),
          apiFetch("/students/").catch(() => []),
          apiFetch("/assessments/").catch(() => []),
        ]);
        setClasses(c || []);
        setStudents(s || []);
        setAssessments(a || []);
        if (c && c.length > 0) setSelectedClass(c[0].id);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Calcular alunos em risco (nota < 5)
  useEffect(() => {
    const calculateRisk = async () => {
      try {
        // Buscar submissões de alunos
        const submissions = await apiFetch("/student-submissions/").catch(() => []);
        
        // Agrupar por aluno e calcular média
        const studentScores: Record<string, any> = {};
        submissions.forEach((sub: any) => {
          if (!studentScores[sub.student_id]) {
            const student = students.find(s => s.id === sub.student_id);
            studentScores[sub.student_id] = {
              student_id: sub.student_id,
              name: student?.full_name || "Desconhecido",
              scores: [],
              class: student?.class_id
            };
          }
          if (sub.score) {
            studentScores[sub.student_id].scores.push(sub.score);
          }
        });

        // Calcular média e identificar em risco
        const risk = Object.values(studentScores)
          .map((s: any) => ({
            ...s,
            average: s.scores.length > 0 ? (s.scores.reduce((a: number, b: number) => a + b, 0) / s.scores.length).toFixed(1) : 0,
            total_assessments: s.scores.length
          }))
          .filter((s: any) => parseFloat(s.average) < 5 && s.total_assessments > 0)
          .sort((a: any, b: any) => parseFloat(a.average) - parseFloat(b.average));

        setRiskStudents(risk);
      } catch (error) {
        console.error(error);
      }
    };
    
    if (students.length > 0) {
      calculateRisk();
    }
  }, [students]);

  // Comparação de turmas
  useEffect(() => {
    const loadComparison = async () => {
      try {
        const data = await apiFetch("/historical/classes/comparison?months=6").catch(() => []);
        setClassComparison(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadComparison();
  }, []);

  // Análise por disciplina
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subjects = await apiFetch("/subjects/").catch(() => []);
        const submissions = await apiFetch("/student-submissions/").catch(() => []);
        
        const subjectData: Record<string, any> = {};
        subjects.forEach((sub: any) => {
          subjectData[sub.id] = {
            name: sub.name,
            scores: [],
            assessments: 0
          };
        });

        assessments.forEach((a: any) => {
          if (a.subject_id && subjectData[a.subject_id]) {
            subjectData[a.subject_id].assessments += 1;
          }
        });

        submissions.forEach((sub: any) => {
          const assessment = assessments.find(a => a.id === sub.assessment_id);
          if (assessment && assessment.subject_id && subjectData[assessment.subject_id]) {
            if (sub.score) {
              subjectData[assessment.subject_id].scores.push(sub.score);
            }
          }
        });

        const analysis = Object.values(subjectData)
          .map((s: any) => ({
            name: s.name,
            average: s.scores.length > 0 ? (s.scores.reduce((a: number, b: number) => a + b, 0) / s.scores.length).toFixed(1) : 0,
            total_assessments: s.assessments,
            approval_rate: s.scores.length > 0 ? ((s.scores.filter((sc: number) => sc >= 6).length / s.scores.length) * 100).toFixed(1) : 0
          }))
          .filter((s: any) => s.total_assessments > 0)
          .sort((a: any, b: any) => parseFloat(b.average) - parseFloat(a.average));

        setSubjectAnalysis(analysis);
      } catch (error) {
        console.error(error);
      }
    };

    if (assessments.length > 0) {
      loadSubjects();
    }
  }, [assessments]);

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
        title="Gestão Escolar Profissional"
        description="Análise completa e relatórios avançados"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card/50 border border-border/50">
          <TabsTrigger value="risk">Alunos em Risco</TabsTrigger>
          <TabsTrigger value="classes">Comparação de Turmas</TabsTrigger>
          <TabsTrigger value="subjects">Análise por Disciplina</TabsTrigger>
        </TabsList>

        {/* Alunos em Risco */}
        <TabsContent value="risk" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Alunos com Baixo Desempenho (Nota &lt; 5)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {riskStudents.length > 0 ? (
                <div className="space-y-3">
                  {riskStudents.map((student: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-background/30 border border-red-500/20">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-muted-foreground">{student.total_assessments} avaliações</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-red-500">{student.average}</p>
                        <Badge variant="outline" className="text-red-500 border-red-500/50">Risco</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">✅ Nenhum aluno em risco!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Comparação de Turmas */}
        <TabsContent value="classes" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Desempenho por Turma</CardTitle>
            </CardHeader>
            <CardContent>
              {classComparison.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={classComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="class_name" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                      <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)" }} />
                      <Bar dataKey="average" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classComparison.map((cls: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-lg bg-background/30 border border-border/50">
                        <p className="font-medium mb-2">{cls.class_name}</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Média:</span>
                            <span className="font-bold">{cls.average}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Aprovação:</span>
                            <span className="font-bold text-emerald-400">{cls.approval_rate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total:</span>
                            <span>{cls.total_submissions}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">Sem dados disponíveis</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análise por Disciplina */}
        <TabsContent value="subjects" className="space-y-4">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle>Desempenho por Disciplina</CardTitle>
            </CardHeader>
            <CardContent>
              {subjectAnalysis.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={subjectAnalysis} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: "#a1a1aa", fontSize: 11 }} width={120} />
                      <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)" }} />
                      <Bar dataKey="average" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjectAnalysis.map((subject: any, idx: number) => (
                      <div key={idx} className="p-4 rounded-lg bg-background/30 border border-border/50">
                        <p className="font-medium mb-2">{subject.name}</p>
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Média:</span>
                            <span className="font-bold">{subject.average}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Aprovação:</span>
                            <span className="font-bold text-emerald-400">{subject.approval_rate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Avaliações:</span>
                            <span>{subject.total_assessments}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-center text-muted-foreground py-8">Sem dados disponíveis</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
