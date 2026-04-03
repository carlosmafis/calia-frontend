// Calia Digital — Professor Dashboard Home (Profissional)
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { BookOpen, FileText, ScanLine, BarChart3, PenLine, Loader2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function ProfessorHome() {
  const [classes, setClasses] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [corrections, setCorrections] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [c, a] = await Promise.all([
          apiFetch("/classes"),
          apiFetch("/assessments"),
        ]);
        setClasses(c || []);
        setAssessments(a || []);

        // Load students for each class
        const allStudents: any[] = [];
        for (const cls of (c || [])) {
          try {
            const s = await apiFetch(`/students?class_id=${cls.id}`);
            allStudents.push(...(s || []));
          } catch {}
        }
        setStudents(allStudents);

        // Load number of corrections
        try {
          const corr = await apiFetch("/ocr/submissions").catch(() => []);
          setCorrections((corr || []).length);
        } catch {}
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  // Students per class
  const studentsPerClass = classes.map((c) => ({
    name: c.name || "Sem nome",
    alunos: students.filter((s) => s.class_id === c.id).length,
  }));

  // Total unique students
  const totalStudents = new Set(students.map(s => s.id)).size;

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
        title="Painel do Professor"
        description="Suas turmas e avaliações"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Minhas Turmas" value={classes.length} icon={BookOpen} />
        <StatCard title="Meus Alunos" value={totalStudents} icon={Users} />
        <StatCard title="Avaliações" value={assessments.length} icon={FileText} />
        <StatCard title="Correções" value={corrections} icon={ScanLine} description="OCR + Manual" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Students per class */}
        <Card className="bg-card/50 border-border/50 lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Alunos por Turma</CardTitle>
          </CardHeader>
          <CardContent>
            {studentsPerClass.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={studentsPerClass}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: "#a1a1aa", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#a1a1aa", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#1c1917", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} labelStyle={{ color: "#ffffff" }} labelStyle={{ color: "#e7e5e3" }} />
                  <Bar dataKey="alunos" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground py-10 text-center">Nenhuma turma atribuída</p>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/avaliacoes" className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><FileText className="w-4 h-4 text-primary" /></div>
              <div><p className="text-sm font-medium">Nova Avaliação</p><p className="text-xs text-muted-foreground">Criar e configurar</p></div>
            </Link>
            <Link href="/dashboard/correcao" className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center"><ScanLine className="w-4 h-4 text-teal-400" /></div>
              <div><p className="text-sm font-medium">Correção OCR</p><p className="text-xs text-muted-foreground">Escanear gabarito</p></div>
            </Link>
            <Link href="/dashboard/correcao-manual" className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><PenLine className="w-4 h-4 text-amber-400" /></div>
              <div><p className="text-sm font-medium">Correção Manual</p><p className="text-xs text-muted-foreground">Inserir respostas</p></div>
            </Link>
            <Link href="/dashboard/relatorios" className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center"><BarChart3 className="w-4 h-4 text-violet-400" /></div>
              <div><p className="text-sm font-medium">Relatórios</p><p className="text-xs text-muted-foreground">Análise de desempenho</p></div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assessments */}
      {assessments.length > 0 && (
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Avaliações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assessments.slice(0, 5).map((a) => (
                <Link key={a.id} href={`/dashboard/avaliacoes/${a.id}`} className="flex items-center justify-between p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.assessment_questions?.length || 0} questões</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{a.created_at ? new Date(a.created_at).toLocaleDateString("pt-BR") : ""}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
