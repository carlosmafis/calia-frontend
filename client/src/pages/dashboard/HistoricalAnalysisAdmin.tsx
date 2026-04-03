import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter } from "recharts";
import { TrendingUp, TrendingDown, Minus, Loader2, Download, Filter } from "lucide-react";

const COLORS = ["#14B8A6", "#D97706", "#059669", "#8B5CF6", "#EF4444", "#3B82F6", "#EC4899", "#F59E0B"];

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

export default function HistoricalAnalysisAdmin() {
  const [activeTab, setActiveTab] = useState("school");
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  
  const [schoolData, setSchoolData] = useState<any>(null);
  const [classesData, setClassesData] = useState<any>(null);
  const [classData, setClassData] = useState<any>(null);
  const [teacherData, setTeacherData] = useState<any>(null);
  const [studentData, setStudentData] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [bimestre, setBimestre] = useState<string>("all"); // "all" = anual, "1", "2", "3", "4"

  // Carregar dados iniciais
  useEffect(() => {
    const load = async () => {
      try {
        const [c, t, s] = await Promise.all([
          apiFetch("/classes").catch(() => []),
          apiFetch("/teachers").catch(() => []),
          apiFetch("/students").catch(() => []),
        ]);
        setClasses(c || []);
        setTeachers(t || []);
        setStudents(s || []);
        if (c && c.length > 0) setSelectedClassId(c[0].id);
        if (t && t.length > 0) setSelectedTeacherId(t[0].id);
        if (s && s.length > 0) setSelectedStudentId(s[0].id);
      } catch (error) {
        console.error(error);
      }
    };
    load();
  }, []);

  // Carregar dados de escola
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const query = bimestre !== "all" ? `?bimestre=${bimestre}` : "";
        const data = await apiFetch(`/historical/school/evolution${query}`);
        setSchoolData(data || { periods: [], trend: "stable", improvement: 0 });
      } catch (error) {
        console.error("Erro ao carregar evolução da escola:", error);
        setSchoolData({ periods: [], trend: "stable", improvement: 0 });
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "school") load();
  }, [activeTab, bimestre]);

  // Carregar dados de turmas
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const query = bimestre !== "all" ? `?bimestre=${bimestre}` : "";
        const data = await apiFetch(`/historical/classes/comparison${query}`);
        setClassesData(data || []);
      } catch (error) {
        console.error("Erro ao carregar comparação de turmas:", error);
        setClassesData([]);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "classes") load();
  }, [activeTab, bimestre]);

  // Carregar dados de turma específica
  useEffect(() => {
    if (!selectedClassId) return;
    const load = async () => {
      try {
        setLoading(true);
        const query = bimestre !== "all" ? `?bimestre=${bimestre}` : "";
        const data = await apiFetch(`/historical/class/${selectedClassId}/evolution${query}`);
        setClassData(data || { periods: [], trend: "stable", improvement: 0 });
      } catch (error) {
        console.error("Erro ao carregar evolução da turma:", error);
        setClassData({ periods: [], trend: "stable", improvement: 0 });
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "class") load();
  }, [activeTab, selectedClassId, bimestre]);

  // Carregar dados de professor
  useEffect(() => {
    if (!selectedTeacherId) return;
    const load = async () => {
      try {
        setLoading(true);
        const query = bimestre !== "all" ? `?bimestre=${bimestre}` : "";
        const data = await apiFetch(`/historical/teacher/${selectedTeacherId}/evolution${query}`);
        setTeacherData(data || { periods: [], trend: "stable", improvement: 0 });
      } catch (error) {
        console.error("Erro ao carregar evolução do professor:", error);
        setTeacherData({ periods: [], trend: "stable", improvement: 0 });
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "teacher") load();
  }, [activeTab, selectedTeacherId, bimestre]);

  // Carregar dados de aluno
  useEffect(() => {
    if (!selectedStudentId) return;
    const load = async () => {
      try {
        setLoading(true);
        const query = bimestre !== "all" ? `?bimestre=${bimestre}` : "";
        const data = await apiFetch(`/historical/student/${selectedStudentId}/evolution${query}`);
        setStudentData(data || { periods: [], trend: "stable", improvement: 0 });
      } catch (error) {
        console.error("Erro ao carregar evolução do aluno:", error);
        setStudentData({ periods: [], trend: "stable", improvement: 0 });
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "student") load();
  }, [activeTab, selectedStudentId, bimestre]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case "declining": return <TrendingDown className="w-5 h-5 text-red-400" />;
      case "stable": return <Minus className="w-5 h-5 text-blue-400" />;
      default: return null;
    }
  };

  const getTrendLabel = (trend: string) => {
    switch (trend) {
      case "improving": return "Melhorando";
      case "declining": return "Piorando";
      case "stable": return "Estável";
      default: return "Sem dados";
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "improving": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "declining": return "bg-red-500/15 text-red-400 border-red-500/30";
      case "stable": return "bg-blue-500/15 text-blue-400 border-blue-500/30";
      default: return "bg-gray-500/15 text-gray-400 border-gray-500/30";
    }
  };

  const renderSummaryCards = (data: any) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-background/50 border-border/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Tendência</p>
          <div className="flex items-center gap-2">
            {getTrendIcon(data?.trend)}
            <span className="font-medium text-sm">{getTrendLabel(data?.trend)}</span>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-background/50 border-border/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Melhoria</p>
          <p className="text-2xl font-bold">{data?.improvement > 0 ? "+" : ""}{data?.improvement}</p>
        </CardContent>
      </Card>
      <Card className="bg-background/50 border-border/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Períodos</p>
          <p className="text-2xl font-bold">{data?.total_periods || data?.periods?.length || 0}</p>
        </CardContent>
      </Card>
      <Card className="bg-background/50 border-border/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Média Atual</p>
          <p className="text-2xl font-bold">{data?.periods?.[data.periods.length - 1]?.average || "—"}</p>
        </CardContent>
      </Card>
    </div>
  );

  const renderPeriodTable = (periods: any[]) => (
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
                {periods[0]?.approval_rate !== undefined && <th className="text-center py-2 px-3 font-medium">Aprovação %</th>}
                {periods[0]?.approved !== undefined && <>
                  <th className="text-center py-2 px-3 font-medium">✓ Aprovados</th>
                  <th className="text-center py-2 px-3 font-medium">✗ Reprovados</th>
                </>}
                <th className="text-center py-2 px-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {periods.map((period: any, idx: number) => (
                <tr key={idx} className="border-b border-border/30 hover:bg-background/30">
                  <td className="py-2 px-3">{period.period || period.month}</td>
                  <td className="text-center py-2 px-3 font-medium">{period.average}</td>
                  {period.approval_rate !== undefined && <td className="text-center py-2 px-3">{period.approval_rate}%</td>}
                  {period.approved !== undefined && <>
                    <td className="text-center py-2 px-3 text-emerald-400">{period.approved}</td>
                    <td className="text-center py-2 px-3 text-red-400">{period.failed}</td>
                  </>}
                  <td className="text-center py-2 px-3">{period.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Controles Globais */}
      <Card className="bg-background/50 border-border/50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Bimestre</label>
              <Select value={bimestre} onValueChange={setBimestre}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um bimestre..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Anual (Todos os bimestres)</SelectItem>
                  <SelectItem value="1">1º Bimestre</SelectItem>
                  <SelectItem value="2">2º Bimestre</SelectItem>
                  <SelectItem value="3">3º Bimestre</SelectItem>
                  <SelectItem value="4">4º Bimestre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar Relatório
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Abas de Análise */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-card/50 border border-border/50 grid grid-cols-5 w-full">
          <TabsTrigger value="school">Escola</TabsTrigger>
          <TabsTrigger value="classes">Turmas</TabsTrigger>
          <TabsTrigger value="class">Turma</TabsTrigger>
          <TabsTrigger value="teacher">Professor</TabsTrigger>
          <TabsTrigger value="student">Aluno</TabsTrigger>
        </TabsList>

        {/* Análise de Escola */}
        <TabsContent value="school" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : schoolData ? (
            <>
              {renderSummaryCards(schoolData)}
              
              {schoolData.periods && schoolData.periods.length > 0 && (
                <>
                  <Card className="bg-background/50 border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Evolução de Desempenho</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={schoolData.periods}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="period" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                          <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} domain={[0, 10]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Line type="monotone" dataKey="average" stroke="#14B8A6" strokeWidth={2} dot={{ fill: "#14B8A6", r: 4 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {renderPeriodTable(schoolData.periods)}
                </>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-12">Nenhum dado disponível</p>
          )}
        </TabsContent>

        {/* Análise de Turmas */}
        <TabsContent value="classes" className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : classesData && classesData.length > 0 ? (
            <>
              <Card className="bg-background/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Comparação de Turmas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={classesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="class_name" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} domain={[0, 10]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="average" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="bg-background/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Detalhes das Turmas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left py-2 px-3 font-medium">Turma</th>
                          <th className="text-center py-2 px-3 font-medium">Média</th>
                          <th className="text-center py-2 px-3 font-medium">Aprovação %</th>
                          <th className="text-center py-2 px-3 font-medium">✓ Aprovados</th>
                          <th className="text-center py-2 px-3 font-medium">✗ Reprovados</th>
                          <th className="text-center py-2 px-3 font-medium">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classesData.map((cls: any, idx: number) => (
                          <tr key={idx} className="border-b border-border/30 hover:bg-background/30">
                            <td className="py-2 px-3">{cls.class_name}</td>
                            <td className="text-center py-2 px-3 font-medium">{cls.average}</td>
                            <td className="text-center py-2 px-3">{cls.approval_rate}%</td>
                            <td className="text-center py-2 px-3 text-emerald-400">{cls.approved}</td>
                            <td className="text-center py-2 px-3 text-red-400">{cls.failed}</td>
                            <td className="text-center py-2 px-3">{cls.total_submissions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <p className="text-center text-muted-foreground py-12">Nenhum dado disponível</p>
          )}
        </TabsContent>

        {/* Análise de Turma Específica */}
        <TabsContent value="class" className="space-y-4">
          <Card className="bg-background/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Selecionar Turma</label>
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : classData && classData.periods && classData.periods.length > 0 ? (
            <>
              {renderSummaryCards(classData)}
              
              <Card className="bg-background/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Evolução da Turma</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={classData.periods}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="period" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} domain={[0, 10]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="average" stroke="#14B8A6" strokeWidth={2} dot={{ fill: "#14B8A6", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {renderPeriodTable(classData.periods)}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-12">Nenhum dado disponível</p>
          )}
        </TabsContent>

        {/* Análise de Professor */}
        <TabsContent value="teacher" className="space-y-4">
          <Card className="bg-background/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Selecionar Professor</label>
                <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>{teacher.full_name || teacher.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : teacherData && teacherData.periods && teacherData.periods.length > 0 ? (
            <>
              {renderSummaryCards(teacherData)}
              
              <Card className="bg-background/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Evolução do Professor</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={teacherData.periods}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="period" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} domain={[0, 10]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="average" stroke="#14B8A6" strokeWidth={2} dot={{ fill: "#14B8A6", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {renderPeriodTable(teacherData.periods)}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-12">Nenhum dado disponível</p>
          )}
        </TabsContent>

        {/* Análise de Aluno */}
        <TabsContent value="student" className="space-y-4">
          <Card className="bg-background/50 border-border/50">
            <CardContent className="pt-6">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">Selecionar Aluno</label>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>{student.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : studentData && studentData.periods && studentData.periods.length > 0 ? (
            <>
              {renderSummaryCards(studentData)}
              
              <Card className="bg-background/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Evolução do Aluno</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={studentData.periods}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="period" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                      <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} domain={[0, 10]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="average" stroke="#14B8A6" strokeWidth={2} dot={{ fill: "#14B8A6", r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {renderPeriodTable(studentData.periods)}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-12">Nenhum dado disponível</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
