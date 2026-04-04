// Calia Digital — Admin: Disciplinas com CRUD completo
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
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
import { Plus, BookMarked, Loader2, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Disciplinas() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<any>({ id: "", name: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const loadSubjects = async () => {
    try {
      const data = await apiFetch("/subjects/");
      setSubjects(data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadSubjects(); }, []);

  const createSubject = async () => {
    if (!name.trim()) { toast.error("Informe o nome da disciplina"); return; }
    setCreating(true);
    try {
      await apiFetch("/subjects", { method: "POST", body: JSON.stringify({ name }) });
      toast.success("Disciplina criada com sucesso");
      setName("");
      setDialogOpen(false);
      loadSubjects();
    } catch (err: any) { toast.error(err.message || "Erro ao criar disciplina"); }
    finally { setCreating(false); }
  };

  const updateSubject = async () => {
    if (!editForm.name.trim()) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    try {
      await apiFetch(`/subjects/${editForm.id}`, { method: "PUT", body: JSON.stringify({ name: editForm.name }) });
      toast.success("Disciplina atualizada");
      setEditDialog(false);
      loadSubjects();
    } catch (err: any) { toast.error(err.message || "Erro ao atualizar"); }
    finally { setSaving(false); }
  };

  const deleteSubject = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/subjects/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("Disciplina removida");
      setDeleteTarget(null);
      loadSubjects();
    } catch (err: any) { toast.error(err.message || "Erro ao remover"); }
    finally { setDeleting(false); }
  };

  const filtered = subjects.filter((s) => !search || (s.name || "").toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <PageHeader
        title="Disciplinas"
        description={`${subjects.length} disciplina(s) cadastrada(s)`}
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" /> Nova Disciplina</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle>Criar Disciplina</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da Disciplina</Label>
                  <Input placeholder="Ex: Matemática" value={name} onChange={(e) => setName(e.target.value)} className="bg-background/50" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={createSubject} disabled={creating} className="bg-primary text-primary-foreground">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar disciplina..." className="sm:w-72" />
        <div className="text-sm text-muted-foreground self-center ml-auto">{filtered.length} resultado(s)</div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookMarked} title="Nenhuma disciplina encontrada" description={search ? "Tente alterar a busca." : "Cadastre a primeira disciplina."} />
      ) : (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Nome</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((sub) => (
                <TableRow key={sub.id} className="border-border/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <BookMarked className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium">{sub.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem onClick={() => { setEditForm({ id: sub.id, name: sub.name }); setEditDialog(true); }}>
                          <Pencil className="w-4 h-4 mr-2" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(sub)} className="text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Editar Disciplina</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-background/50" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={updateSubject} disabled={saving} className="bg-primary text-primary-foreground">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir Disciplina"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"?`}
        onConfirm={deleteSubject}
        loading={deleting}
      />
    </div>
  );
}
