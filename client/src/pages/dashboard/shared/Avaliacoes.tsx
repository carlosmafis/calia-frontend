// Calia Digital — Avaliações (Admin e Professor)
// Backend endpoint: POST /assessments/create-full (JSON: class_id, subject_id, title, questions[])
// Backend endpoint: GET /assessments
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

const OPTIONS = ["A", "B", "C", "D", "E"];

export default function Avaliacoes() {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    class_id: "",
    subject_id: "",
    total_questions: "10",
  });
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const loadData = async () => {
    try {
      const [a, c, s] = await Promise.all([
        apiFetch("/assessments"),
        apiFetch("/classes"),
        apiFetch("/subjects"),
      ]);
      setAssessments(a || []);
      setClasses(c || []);
      setSubjects(s || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const totalQ = parseInt(form.total_questions) || 10;

  const createAssessment = async () => {
    if (!form.title || !form.class_id || !form.subject_id) {
      toast.error("Preencha título, turma e disciplina");
      return;
    }
    // Build questions array matching backend model
    const questions = Array.from({ length: totalQ }, (_, i) => ({
      question_number: i + 1,
      correct_answer: answers[i + 1] || "A",
    }));

    setCreating(true);
    try {
      await apiFetch("/assessments/create-full", {
        method: "POST",
        body: JSON.stringify({
          title: form.title,
          class_id: form.class_id,
          subject_id: form.subject_id,
          questions,
        }),
      });
      toast.success("Avaliação criada com sucesso");
      setForm({ title: "", class_id: "", subject_id: "", total_questions: "10" });
      setAnswers({});
      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar avaliação");
    } finally {
      setCreating(false);
    }
  };

  const canCreate = user?.role === "professor" || user?.role === "admin" || user?.role === "super_admin";

  return (
    <div>
      <PageHeader
        title="Avaliações"
        description="Crie e gerencie avaliações"
        actions={
          canCreate ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  <Plus className="w-4 h-4" /> Nova Avaliação
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Criar Avaliação com Gabarito</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      placeholder="Ex: Prova de Matemática - Bimestre 1"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Turma</Label>
                      <Select value={form.class_id} onValueChange={(v) => setForm({ ...form, class_id: v })}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Disciplina</Label>
                      <Select value={form.subject_id} onValueChange={(v) => setForm({ ...form, subject_id: v })}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((s) => (
                            <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Número de Questões</Label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={form.total_questions}
                      onChange={(e) => setForm({ ...form, total_questions: e.target.value })}
                      className="bg-background/50 w-32"
                    />
                  </div>

                  {/* Gabarito Grid */}
                  <div className="space-y-2">
                    <Label>Gabarito</Label>
                    <div className="grid sm:grid-cols-2 gap-2 p-4 rounded-lg bg-background/30 border border-border/30">
                      {Array.from({ length: totalQ }, (_, i) => i + 1).map((num) => (
                        <div key={num} className="flex items-center gap-2">
                          <span className="w-7 text-xs font-mono text-muted-foreground text-right">{num}.</span>
                          <div className="flex gap-1">
                            {OPTIONS.map((opt) => (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => setAnswers((prev) => ({ ...prev, [num]: opt }))}
                                className={`
                                  w-8 h-8 rounded text-xs font-mono font-medium transition-all
                                  ${answers[num] === opt
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background/50 text-muted-foreground hover:bg-accent border border-border/50"
                                  }
                                `}
                              >
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={createAssessment} disabled={creating} className="bg-primary text-primary-foreground">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Avaliação"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : assessments.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-16 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma avaliação criada ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Título</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Questões</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assessments.map((a) => {
                const cls = classes.find((c) => c.id === a.class_id);
                return (
                  <TableRow key={a.id} className="border-border/30">
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell className="text-muted-foreground">{cls?.name || "—"}</TableCell>
                    <TableCell className="font-mono">{a.total_questions || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {a.created_at ? new Date(a.created_at).toLocaleDateString("pt-BR") : "—"}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
