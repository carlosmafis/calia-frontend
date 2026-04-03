import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { useLocation } from "wouter";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

export default function StudentProgress({ id }: { id: string }) {
  const [, navigate] = useLocation();
  const [student, setStudent] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [stu, prog] = await Promise.all([
          apiFetch(`/students/${id}`).catch(() => null),
          apiFetch(`/teacher/dashboard/student/${id}/progress`).catch(() => null),
        ]);
        setStudent(stu);
        setProgress(prog);
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!student || !progress) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Dados não encontrados</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const chartData = progress.progress.map((p: any, idx: number) => ({
    index: idx + 1,
    score: p.score,
    classAverage: progress.class_average
  }));

  const trend = progress.progress.length >= 2
    ? progress.progress[progress.progress.length - 1].score > progress.progress[0].score
      ? "up"
      : "down"
    : "stable";

  return (
    <div>
      <PageHeader
        title={`Progresso de ${student.name}`}
        description={`Matrícula: ${student.registration_number}`}
        actions={
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        }
      />

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Média do Aluno</p>
            <p className="text-2xl font-bold font-mono text-primary">{progress.student_average}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Média da Turma</p>
            <p className="text-2xl font-bold font-mono">{progress.class_average}</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Diferença</p>
            <p className={`text-2xl font-bold font-mono ${
              progress.student_average >= progress.class_average ? "text-emerald-400" : "text-red-400"
            }`}>
              {(progress.student_average - progress.class_average).toFixed(1)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Tendência</p>
            <div className="flex items-center gap-2 mt-2">
              {trend === "up" ? (
                <>
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <span className="text-lg font-bold text-emerald-400">Melhorando</span>
                </>
              ) : trend === "down" ? (
                <>
                  <TrendingDown className="w-5 h-5 text-red-400" />
                  <span className="text-lg font-bold text-red-400">Piorando</span>
                </>
              ) : (
                <span className="text-lg font-bold text-muted-foreground">Estável</span>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Progresso */}
      <Card className="bg-card/50 border-border/50 mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Evolução de Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="index" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
              <YAxis tick={{ fill: "#a1a1aa", fontSize: 12 }} domain={[0, 10]} />
              <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} labelStyle={{ color: "#ffffff" }} />
              <Legend wrapperStyle={{ color: "#a1a1aa", fontSize: 12 }} />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#14B8A6" 
                name="Nota do Aluno"
                strokeWidth={2}
                dot={{ fill: "#14B8A6", r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="classAverage" 
                stroke="#a1a1aa" 
                name="Média da Turma"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Histórico de Notas */}
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Avaliações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {progress.progress.map((p: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/30">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-muted-foreground">Avaliação {idx + 1}</span>
                  <span className="text-xs text-muted-foreground">{new Date(p.date).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={
                    p.score >= 6 ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" :
                    p.score >= 5 ? "bg-amber-500/15 text-amber-400 border-amber-500/30" :
                    "bg-red-500/15 text-red-400 border-red-500/30"
                  }>
                    {p.score >= 6 ? "Aprovado" : p.score >= 5 ? "Em Risco" : "Reprovado"}
                  </Badge>
                  <span className="text-lg font-mono font-bold">{p.score}/10</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
