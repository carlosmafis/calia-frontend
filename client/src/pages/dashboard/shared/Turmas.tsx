// Calia Digital — Turmas (Admin e Professor) com CRUD completo
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
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Loader2, MoreHorizontal, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // 🔥 NOVO

export default function Turmas() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // 🔥 ALTERADO
  const [form, setForm] = useState({
    name: "",
    school_year: new Date().getFullYear().toString(),
    level: "",
    year: "",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<any>({ id: "", name: "", year: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const canCreate = user?.role === "admin" || user?.role === "super_admin";

  const loadData = async () => {
    try {
      const [c, s] = await Promise.all([apiFetch("/classes"), apiFetch("/students").catch(() => [])]);
      setClasses(c || []);
      setStudents(s || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // 🔥 ALTERADO
  const createClass = async () => {
    if (!form.name) {
      toast.error("Nome da turma é obrigatório");
      return;
    }

    if (!form.level || !form.year) {
      toast.error("Selecione nível e série");
      return;
    }

    setCreating(true);
    try {
      await apiFetch("/classes", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          school_year: parseInt(form.school_year),
          level: form.level,
          year: parseInt(form.year),
        }),
      });

      toast.success("Turma criada com sucesso");

      setForm({
        name: "",
        school_year: new Date().getFullYear().toString(),
        level: "",
        year: "",
      });

      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar turma");
    } finally {
      setCreating(false);
    }
  };

  const updateClass = async () => {
    if (!editForm.name) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    try {
      await apiFetch(`/classes/${editForm.id}`, { method: "PUT", body: JSON.stringify({ name: editForm.name, year: parseInt(editForm.year) }) });
      toast.success("Turma atualizada");
      setEditDialog(false);
      loadData();
    } catch (err: any) { toast.error(err.message || "Erro ao atualizar"); }
    finally { setSaving(false); }
  };

  const deleteClass = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/classes/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("Turma removida");
      setDeleteTarget(null);
      loadData();
    } catch (err: any) { toast.error(err.message || "Erro ao remover"); }
    finally { setDeleting(false); }
  };

  const filtered = classes.filter((c) => {
    if (!search) return true;
    return (c.name || "").toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <PageHeader
        title={user?.role === "professor" ? "Minhas Turmas" : "Turmas"}
        description={`${classes.length} turma(s) cadastrada(s)`}
        actions={
          canCreate ? (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" /> Nova Turma</Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle>Criar Turma</DialogTitle></DialogHeader>

                <div className="space-y-4 py-4">
                  
                  <div className="space-y-2">
                    <Label>Nome da Turma</Label>
                    <Input placeholder="Ex: 9º Ano A" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background/50" />
                  </div>

                  {/* 🔥 NOVO */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Nível</Label>
                      <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fundamental">Fundamental</SelectItem>
                          <SelectItem value="medio">Médio</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Série</Label>
                      <Select value={form.year} onValueChange={(v) => setForm({ ...form, year: v })}>
                        <SelectTrigger className="bg-background/50">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {(form.level === "fundamental"
                            ? [1,2,3,4,5,6,7,8,9]
                            : [1,2,3]
                          ).map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {form.level === "fundamental"
                                ? `${y}º Ano`
                                : `${y}º EM`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 🔥 ALTERADO */}
                  <div className="space-y-2">
                    <Label>Ano Letivo</Label>
                    <Input
                      type="number"
                      value={form.school_year}
                      onChange={(e) => setForm({ ...form, school_year: e.target.value })}
                      className="bg-background/50 w-32"
                    />
                  </div>

                </div>

                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                  <Button onClick={createClass} disabled={creating} className="bg-primary text-primary-foreground">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          ) : undefined
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar turma..." className="sm:w-72" />
        <div className="text-sm text-muted-foreground self-center ml-auto">{filtered.length} resultado(s)</div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="Nenhuma turma encontrada" description={search ? "Tente alterar a busca." : "Crie a primeira turma para começar."} />
      ) : (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Nome</TableHead>
                <TableHead>Série</TableHead>
                <TableHead className="text-center">Alunos</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const count = students.filter((s) => s.class_id === c.id).length;
                return (
                  <TableRow key={c.id} className="border-border/30">
                    <TableCell className="font-medium">{c.name}</TableCell>

                    {/* 🔥 ALTERADO */}
                    <TableCell className="text-muted-foreground font-mono">
                      {c.year
                        ? (c.level === "medio"
                            ? `${c.year}º EM`
                            : `${c.year}º Ano`)
                        : "—"}
                    </TableCell>

                    <TableCell className="text-center">
                      <Badge variant="secondary" className="gap-1"><Users className="w-3 h-3" /> {count}</Badge>
                    </TableCell>

                    <TableCell>
                      {canCreate && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem onClick={() => { setEditForm({ id: c.id, name: c.name, year: String(c.year || "") }); setEditDialog(true); }}>
                              <Pencil className="w-4 h-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteTarget(c)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
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
