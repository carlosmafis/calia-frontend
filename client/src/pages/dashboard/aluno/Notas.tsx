// Calia Digital — Aluno: Minhas Notas (Profissional)
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import EmptyState from "@/components/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

export default function Notas() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/dashboard/student-results").catch(() => []);
        setSubmissions(data || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Minhas Notas"
        description="Veja suas notas em cada avaliação"
      />

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : submissions.length === 0 ? (
        <EmptyState icon={FileText} title="Nenhuma nota disponível" description="Suas notas aparecerão aqui conforme as avaliações forem corrigidas pelo professor." />
      ) : (
        <div className="space-y-3">
          {submissions.map((s, i) => {
            const isExpanded = expandedId === (s.id || i.toString());
            const passed = (s.score || 0) >= 6;
            return (
              <Card key={s.id || i} className="bg-card/50 border-border/50">
                <CardContent className="p-0">
                  <button
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-background/30 transition-colors rounded-lg"
                    onClick={() => setExpandedId(isExpanded ? null : (s.id || i.toString()))}
                  >
                    <div className="flex items-center gap-3">
                      {passed ? <CheckCircle className="w-5 h-5 text-green-400 shrink-0" /> : <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                      <div>
                        <p className="text-sm font-medium">{s.assessment_title || `Avaliação ${i + 1}`}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.subject_name || ""}
                          {s.date ? ` • ${new Date(s.date).toLocaleDateString("pt-BR")}` : ""}
                          {s.total_questions ? ` • ${s.total_questions} questões` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={passed ? "default" : "destructive"} className="text-sm font-bold px-3">
                        {(s.score || 0).toFixed(1)}
                      </Badge>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-border/30 pt-3">
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center p-2 rounded-lg bg-background/30">
                          <p className="text-xs text-muted-foreground">Acertos</p>
                          <p className="text-lg font-bold text-green-400">{s.correct_count || "—"}</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-background/30">
                          <p className="text-xs text-muted-foreground">Erros</p>
                          <p className="text-lg font-bold text-red-400">{s.wrong_count || "—"}</p>
                        </div>
                        <div className="text-center p-2 rounded-lg bg-background/30">
                          <p className="text-xs text-muted-foreground">Aproveitamento</p>
                          <p className="text-lg font-bold text-primary">
                            {s.total_questions ? `${((s.correct_count || 0) / s.total_questions * 100).toFixed(0)}%` : "—"}
                          </p>
                        </div>
                      </div>
                      {s.answers && s.answers.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Detalhes por questão:</p>
                          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                            {s.answers.map((ans: any, qi: number) => (
                              <div key={qi} className={`text-center p-1 rounded text-xs font-mono ${ans.correct ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                Q{qi + 1}: {ans.answer || "—"}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
