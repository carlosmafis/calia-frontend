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
  const [months, setMonths] = useState("6");

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
        const data = await apiFetch(`/historical/school/evolution?months=${months}`);
        setSchoolData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "school") load();
  }, [activeTab, months]);

  // Carregar dados de turmas
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/historical/classes/comparison?months=${months}`);
        setClassesData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "classes") load();
  }, [activeTab, months]);

  // Carregar dados de turma específica
  useEffect(() => {
    if (!selectedClassId) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/historical/class/${selectedClassId}/evolution?months=${months}`);
        setClassData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "class") load();
  }, [activeTab, selectedClassId, months]);

  // Carregar dados de professor
  useEffect(() => {
    if (!selectedTeacherId) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/historical/teacher/${selectedTeacherId}/evolution?months=${months}`);
        setTeacherData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "teacher") load();
  }, [activeTab, selectedTeacherId, months]);

  // Carregar dados de aluno
  useEffect(() => {
    if (!selectedStudentId) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/historical/student/${selectedStudentId}/evolution?months=${months}`);
        setStudentData(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (activeTab === "student") load();
  }, [activeTab, selectedStudentId, months]);

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

        {/* ESCOLA */}
        <TabsContent value="school" className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : schoolData ? (
            <>
              {renderSummaryCards(schoolData)}
              
              {schoolData.periods && (
                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Evolução da Escola</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={schoolData.periods}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="period" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px" }} />
                        <Legend />
                        <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} name="Média" />
                        <Line type="monotone" dataKey="approval_rate" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} name="Taxa Aprovação %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {renderPeriodTable(schoolData.periods || [])}
            </>
          ) : null}
        </TabsContent>

        {/* TURMAS */}
        <TabsContent value="classes" className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : classesData && Array.isArray(classesData) ? (
            <>
              <Card className="bg-background/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Ranking de Turmas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {classesData.map((cls: any, idx: number) => (
                      <div key={cls.class_id} className="p-4 bg-background/50 rounded-lg border border-border/50">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-bold text-sm">
                              #{idx + 1}
                            </div>
                            <div>
                              <h4 className="font-medium">{cls.class_name}</h4>
                              <p className="text-xs text-muted-foreground">{cls.monthly_averages?.length || 0} períodos</p>
                            </div>
                          </div>
                          <Badge className={getTrendColor(cls.trend)}>
                            {getTrendLabel(cls.trend)}
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-sm mb-3">
                          <div>
                            <p className="text-muted-foreground">Média</p>
                            <p className="text-2xl font-bold">{cls.average}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Aprovação</p>
                            <p className="text-2xl font-bold text-emerald-400">{cls.approval_rate}%</p>
                          </div>
                        </div>
                        {cls.monthly_averages && cls.monthly_averages.length > 0 && (
                          <div className="h-12">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={cls.monthly_averages.map((v: number) => ({ value: v }))}>
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

              <Card className="bg-background/50 border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Comparativo de Médias</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={classesData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="class_name" stroke="rgba(255,255,255,0.5)" angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px" }} />
                      <Bar dataKey="average" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          ) : null}
        </TabsContent>

        {/* TURMA ESPECÍFICA */}
        <TabsContent value="class" className="space-y-6">
          <Card className="bg-background/50 border-border/50">
            <CardContent className="pt-6">
              <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma turma" />
                </SelectTrigger>
                <SelectContent>
                  {classes && classes.length > 0 ? (
                    classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>Nenhuma turma disponível</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : classData ? (
            <>
              {renderSummaryCards(classData)}
              
              {classData.periods && (
                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Evolução da Turma</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={classData.periods}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="period" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px" }} />
                        <Legend />
                        <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} name="Média" />
                        <Line type="monotone" dataKey="approval_rate" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} name="Taxa Aprovação %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {renderPeriodTable(classData.periods || [])}
            </>
          ) : null}
        </TabsContent>

        {/* PROFESSOR */}
        <TabsContent value="teacher" className="space-y-6">
          <Card className="bg-background/50 border-border/50">
            <CardContent className="pt-6">
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um professor" />
                </SelectTrigger>
                <SelectContent>
                  {teachers && teachers.length > 0 ? (
                    teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.full_name || t.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>Nenhum professor disponível</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : teacherData ? (
            <>
              {renderSummaryCards(teacherData)}
              
              {teacherData.periods && (
                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Desempenho do Professor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={teacherData.periods}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="period" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" />
                        <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px" }} />
                        <Legend />
                        <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} name="Média" />
                        <Line type="monotone" dataKey="approval_rate" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} name="Taxa Aprovação %" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {renderPeriodTable(teacherData.periods || [])}
            </>
          ) : null}
        </TabsContent>

        {/* ALUNO */}
        <TabsContent value="student" className="space-y-6">
          <Card className="bg-background/50 border-border/50">
            <CardContent className="pt-6">
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um aluno" />
                </SelectTrigger>
                <SelectContent>
                  {students && students.length > 0 ? (
                    students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>Nenhum aluno disponível</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : studentData ? (
            <>
              {renderSummaryCards(studentData)}
              
              {studentData.periods && (
                <Card className="bg-background/50 border-border/50">
                  <CardHeader>
                    <CardTitle className="text-lg">Progresso do Aluno</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={studentData.periods}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="period" stroke="rgba(255,255,255,0.5)" />
                        <YAxis stroke="rgba(255,255,255,0.5)" domain={[0, 10]} />
                        <Tooltip contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px" }} />
                        <Legend />
                        <Line type="monotone" dataKey="average" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} name="Nota" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {renderPeriodTable(studentData.periods || [])}
            </>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}
