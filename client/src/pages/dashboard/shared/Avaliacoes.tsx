// Calia Digital — Avaliações (Admin e Professor)
// Com link para detalhes, edição, exclusão, busca
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Loader2, Calendar, MoreHorizontal, Eye, Trash2, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const OPTIONS = ["A", "B", "C", "D", "E", "ANULAR"];

export default function Avaliacoes() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [assessments, setAssessments] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [professors, setProfessors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    title: "",
    class_id: "",
    subject_id: "",
    total_questions: "10",
    bimestre: "1",
    shared_with: "",
  });
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    total_questions: "10",
    bimestre: "1",
  });
  const [editAnswers, setEditAnswers] = useState<Record<number, string>>({});

  const loadData = async () => {
    try {
      const [a, c, s, p] = await Promise.all([
        apiFetch("/assessments"),
        apiFetch("/classes"),
        apiFetch("/subjects"),
        apiFetch("/teachers/school/list"),
      ]);
      setAssessments(a || []);
      setClasses(c || []);
      setSubjects(s || []);
      setProfessors(p || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const totalQ = parseInt(form.total_questions) || 10;

  const createAssessment = async () => {
    console.log("[DEBUG] createAssessment called");
    console.log("[DEBUG] form:", form);
    console.log("[DEBUG] answers:", answers);
    
    if (!form.title || !form.class_id || !form.subject_id) {
      toast.error("Preencha título, turma e disciplina");
      return;
    }
    const questions = Array.from({ length: Number(form.total_questions) }, (_, i) => ({
      question_number: i + 1,
      correct_answer: (answers[i + 1] || "").toUpperCase(), // 🔥 garante formato
      weight: 1,
    }));
    
    console.log("[DEBUG] questions:", questions);
    
    setCreating(true);
    try {
      const body: any = {
        title: form.title,
        class_id: form.class_id,
        subject_id: form.subject_id,
        total_questions: Number(form.total_questions),
        bimestre: Number(form.bimestre),
        questions,
      };
    
      // 🔥 só envia se existir
      if (form.shared_with) {
        body.shared_with = form.shared_with;
      }
    
      await apiFetch("/assessments/create-full", {
        method: "POST",
        body: JSON.stringify(body),
      });
    
      toast.success("Avaliação criada com sucesso");
    
      setForm({
        title: "",
        class_id: "",
        subject_id: "",
        total_questions: "10",
        bimestre: "1",
        shared_with: ""
      });
    
      setAnswers({});
      setDialogOpen(false);
      loadData();
    
    } catch (err: any) {
      console.error("ERRO COMPLETO:", err); // 🔥 ajuda MUITO
      toast.error(err.message || "Erro ao criar avaliação");
    } finally {
      setCreating(false);
    }

  const deleteAssessment = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/assessments/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("Avaliação removida");
      setDeleteTarget(null);
      loadData();
    } catch (err: any) { toast.error(err.message || "Erro ao remover"); }
    finally { setDeleting(false); }
  };

  const startEdit = (assessment: any) => {
    setEditingId(assessment.id);
    setEditForm({ title: assessment.title, total_questions: String(assessment.total_questions || 10), bimestre: String(assessment.bimestre || 1) });
    setEditAnswers({});
  };

  const saveEdit = async () => {
    if (!editingId || !editForm.title) {
      toast.error("Preencha o título");
      return;
    }
    const totalQ = parseInt(editForm.total_questions) || 10;
    const questions = Array.from({ length: totalQ }, (_, i) => ({
      question_number: i + 1,
      correct_answer: editAnswers[i + 1] || "A",
    }));

    setCreating(true);
    try {
      // Buscar avaliação original para comparar
      const originalAssessment = assessments.find(a => a.id === editingId);
      const originalQuestions = originalAssessment?.questions || [];
      
      // Verificar se alguma questão foi anulada
      for (let i = 1; i <= totalQ; i++) {
        const newAnswer = editAnswers[i] || "A";
        const oldAnswer = originalQuestions[i-1]?.correct_answer || "A";
        
        if (newAnswer === "ANULAR" && oldAnswer !== "ANULAR") {
          // Questão foi anulada agora
          console.log(`[DEBUG] Questão ${i} foi anulada`);
          await apiFetch(`/assessments/${editingId}/annul-question`, {
            method: "POST",
            body: JSON.stringify({ question_number: i }),
          });
        }
      }
      
      await apiFetch(`/assessments/${editingId}`, {
        method: "PUT",
        body: JSON.stringify({
          title: editForm.title,
          questions,
          bimestre: parseInt(editForm.bimestre),
              }),
      });
      toast.success("Avaliação atualizada com sucesso");
      setEditingId(null);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar avaliação");
    } finally {
      setCreating(false);
    }
  };

  const canCreate = user?.role === "professor" || user?.role === "admin" || user?.role === "super_admin";

  const filtered = assessments
    .filter((a) => filterClass === "all" || a.class_id === filterClass)
    .filter((a) => {
      if (!search) return true;
      return (a.title || "").toLowerCase().includes(search.toLowerCase());
    });

  return (
    <div>
      <PageHeader
        title="Avaliações"
        description={`${assessments.length} avaliação(ões) cadastrada(s)`}
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
                        <SelectTrigger className="bg-background/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Disciplina</Label>
                      <Select value={form.subject_id} onValueChange={(v) => setForm({ ...form, subject_id: v })}>
                        <SelectTrigger className="bg-background/50"><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          {subjects.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="space-y-2">
                      <Label>Número de Questões</Label>
                      <Input
                        type="number" min="1" max="50"
                        value={form.total_questions}
                        onChange={(e) => setForm({ ...form, total_questions: e.target.value })}
                        className="bg-background/50 w-32"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Bimestre</Label>
                      <Select value={form.bimestre} onValueChange={(v) => setForm({ ...form, bimestre: v })}>
                        <SelectTrigger className="bg-background/50 w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1º Bimestre</SelectItem>
                          <SelectItem value="2">2º Bimestre</SelectItem>
                          <SelectItem value="3">3º Bimestre</SelectItem>
                          <SelectItem value="4">4º Bimestre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Compartilhar com Professor (Opcional)</Label>
                      <Select value={form.shared_with || "none"} onValueChange={(v) => setForm({ ...form, shared_with: v === "none" ? "" : v })}>
                        <SelectTrigger className="bg-background/50"><SelectValue placeholder="Nenhum" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhum</SelectItem>
                          {professors && professors.map((p) => (<SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Gabarito</Label>
                    <div className="grid sm:grid-cols-2 gap-2 p-4 rounded-lg bg-background/30 border border-border/30">
                      {Array.from({ length: totalQ }, (_, i) => i + 1).map((num) => (
                        <div key={num} className="flex items-center gap-2">
                          <span className="w-7 text-xs font-mono text-muted-foreground text-right">{num}.</span>
                          <div className="flex gap-0.5 flex-wrap">
                            {OPTIONS.map((opt) => (
                              <button
                                key={opt} type="button"
                                onClick={() => setAnswers((prev) => ({ ...prev, [num]: opt }))}
                                className={`w-8 h-8 rounded text-xs font-mono font-medium transition-all ${
                                  answers[num] === opt
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-background/50 text-muted-foreground hover:bg-accent border border-border/50"
                                }`}
                              >{opt}</button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                  <Button onClick={createAssessment} disabled={creating} className="bg-primary text-primary-foreground">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Avaliação"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar avaliação..." className="sm:w-72" />
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-[200px] bg-card/50"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as turmas</SelectItem>
            {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Nenhuma avaliação encontrada"
          description={search ? "Tente alterar os filtros." : "Crie a primeira avaliação para começar a corrigir provas."}
        />
      ) : (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Título</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Disciplina</TableHead>
                <TableHead>Bimestre</TableHead>
                <TableHead>Questões</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => {
                const cls = classes.find((c) => c.id === a.class_id);
                const subj = subjects.find((s) => s.id === a.subject_id);
                return (
                  <TableRow key={a.id} className="border-border/30 cursor-pointer hover:bg-accent/30" onClick={() => navigate(`/dashboard/avaliacoes/${a.id}`)}>
                    <TableCell className="font-medium">{a.title}</TableCell>
                    <TableCell className="text-muted-foreground">{cls?.name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{subj?.name || "—"}</TableCell>
                    <TableCell><Badge variant="outline" className="font-mono">{a.bimestre || 1}º Bim</Badge></TableCell>
                    <TableCell className="font-mono">{a.total_questions || "—"}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {a.created_at ? new Date(a.created_at).toLocaleDateString("pt-BR") : "—"}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => navigate(`/dashboard/avaliacoes/${a.id}`)}>
                            <Eye className="w-4 h-4 mr-2" /> Ver Detalhes
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => startEdit(a)}>
                            <Edit2 className="w-4 h-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(a)} className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={!!editingId} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Avaliação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Ex: Prova de Matemática - Bimestre 1"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="bg-background/50"
              />
            </div>
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label>Número de Questões</Label>
                <Input
                  type="number" min="1" max="50"
                  value={editForm.total_questions}
                  onChange={(e) => setEditForm({ ...editForm, total_questions: e.target.value })}
                  className="bg-background/50 w-32"
                />
              </div>
              <div className="space-y-2">
                <Label>Bimestre</Label>
                <Select value={editForm.bimestre} onValueChange={(v) => setEditForm({ ...editForm, bimestre: v })}>
                  <SelectTrigger className="bg-background/50 w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1º Bimestre</SelectItem>
                    <SelectItem value="2">2º Bimestre</SelectItem>
                    <SelectItem value="3">3º Bimestre</SelectItem>
                    <SelectItem value="4">4º Bimestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
            <div className="space-y-2">
              <Label>Gabarito</Label>
              <div className="grid sm:grid-cols-2 gap-2 p-4 rounded-lg bg-background/30 border border-border/30">
                {Array.from({ length: parseInt(editForm.total_questions) || 10 }, (_, i) => i + 1).map((num) => (
                  <div key={num} className="flex items-center gap-2">
                    <span className="w-7 text-xs font-mono text-muted-foreground text-right">{num}.</span>
                    <div className="flex gap-0.5 flex-wrap">
                      {OPTIONS.map((opt) => (
                        <button
                          key={opt} type="button"
                          onClick={() => setEditAnswers((prev) => ({ ...prev, [num]: opt }))}
                          className={`w-8 h-8 rounded text-xs font-mono font-medium transition-all ${
                            editAnswers[num] === opt
                              ? "bg-primary text-primary-foreground"
                              : "bg-background/50 text-muted-foreground hover:bg-accent border border-border/50"
                          }`}
                        >{opt}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={saveEdit} disabled={creating} className="bg-primary text-primary-foreground">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir Avaliação"
        description={`Tem certeza que deseja excluir "${deleteTarget?.title}"? Todas as correções serão perdidas.`}
        onConfirm={deleteAssessment}
        loading={deleting}
      />
    </div>
  );
}
