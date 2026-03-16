// Calia Digital — Admin: Alunos (CRUD completo com busca, edição, exclusão, importação CSV)
import { useEffect, useState, useRef } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import EmptyState from "@/components/EmptyState";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Plus, GraduationCap, Loader2, MoreHorizontal, Pencil, Trash2, Upload, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";

export default function Alunos() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", registration: "", class_id: "" });
  const [filterClass, setFilterClass] = useState("all");
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [editForm, setEditForm] = useState<any>({ id: "", name: "", registration: "", class_id: "" });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const csvRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  const loadData = async () => {
    try {
      const [s, c] = await Promise.all([
        apiFetch("/students"),
        apiFetch("/classes"),
      ]);
      setStudents(s || []);
      setClasses(c || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const createStudent = async () => {
    if (!form.name || !form.class_id) { toast.error("Preencha nome e turma"); return; }
    setCreating(true);
    try {
      await apiFetch("/students", { method: "POST", body: JSON.stringify(form) });
      toast.success("Aluno cadastrado com sucesso");
      setForm({ name: "", registration: "", class_id: "" });
      setDialogOpen(false);
      loadData();
    } catch (err: any) { toast.error(err.message || "Erro ao cadastrar aluno"); }
    finally { setCreating(false); }
  };

  const updateStudent = async () => {
    if (!editForm.name) { toast.error("Nome é obrigatório"); return; }
    setSaving(true);
    try {
      await apiFetch(`/students/${editForm.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editForm.name, registration: editForm.registration, class_id: editForm.class_id }),
      });
      toast.success("Aluno atualizado");
      setEditDialog(false);
      loadData();
    } catch (err: any) { toast.error(err.message || "Erro ao atualizar"); }
    finally { setSaving(false); }
  };

  const deleteStudent = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/students/${deleteTarget.id}`, { method: "DELETE" });
      toast.success("Aluno removido");
      setDeleteTarget(null);
      loadData();
    } catch (err: any) { toast.error(err.message || "Erro ao remover"); }
    finally { setDeleting(false); }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const lines = text.split("\n").filter((l) => l.trim());
      const header = lines[0].toLowerCase();
      const hasHeader = header.includes("nome") || header.includes("name");
      const dataLines = hasHeader ? lines.slice(1) : lines;

      let imported = 0;
      for (const line of dataLines) {
        const parts = line.split(/[,;]/).map((p) => p.trim().replace(/^"|"$/g, ""));
        if (parts.length < 2) continue;
        const [name, registration, className] = parts;
        const cls = classes.find((c) => c.name === className);
        try {
          await apiFetch("/students", {
            method: "POST",
            body: JSON.stringify({ name, registration, class_id: cls?.id || classes[0]?.id || "" }),
          });
          imported++;
        } catch {}
      }
      toast.success(`${imported} aluno(s) importado(s) com sucesso`);
      loadData();
    } catch (err: any) { toast.error("Erro ao importar CSV"); }
    finally {
      setImporting(false);
      if (csvRef.current) csvRef.current.value = "";
    }
  };

  const filtered = students
    .filter((s) => filterClass === "all" || s.class_id === filterClass)
    .filter((s) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (s.name || "").toLowerCase().includes(q) || (s.registration || "").toLowerCase().includes(q);
    });

  return (
    <div>
      <PageHeader
        title="Alunos"
        description={`${students.length} aluno(s) cadastrado(s)`}
        actions={
          <div className="flex items-center gap-2">
            <input ref={csvRef} type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
            <Button variant="outline" onClick={() => csvRef.current?.click()} disabled={importing} className="gap-2">
              {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              Importar CSV
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  <Plus className="w-4 h-4" /> Novo Aluno
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader><DialogTitle>Cadastrar Aluno</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome Completo</Label>
                    <Input placeholder="Ex: João da Silva" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Matrícula</Label>
                    <Input placeholder="Ex: 2026001" value={form.registration} onChange={(e) => setForm({ ...form, registration: e.target.value })} className="bg-background/50" />
                  </div>
                  <div className="space-y-2">
                    <Label>Turma</Label>
                    <Select value={form.class_id} onValueChange={(v) => setForm({ ...form, class_id: v })}>
                      <SelectTrigger className="bg-background/50"><SelectValue placeholder="Selecione a turma" /></SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                  <Button onClick={createStudent} disabled={creating} className="bg-primary text-primary-foreground">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar por nome ou matrícula..." className="sm:w-72" />
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-[200px] bg-card/50"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as turmas</SelectItem>
            {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
          </SelectContent>
        </Select>
        <div className="text-sm text-muted-foreground self-center ml-auto">
          {filtered.length} resultado(s)
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Nenhum aluno encontrado"
          description={search ? "Tente alterar os filtros de busca." : "Cadastre o primeiro aluno ou importe via CSV."}
        />
      ) : (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Nome</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => {
                const cls = classes.find((c) => c.id === s.class_id);
                return (
                  <TableRow key={s.id} className="border-border/30">
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{s.registration || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{cls?.name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={s.status === "CURSANDO" ? "default" : "secondary"}>{s.status || "CURSANDO"}</Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => { setEditForm({ id: s.id, name: s.name, registration: s.registration || "", class_id: s.class_id || "" }); setEditDialog(true); }}>
                            <Pencil className="w-4 h-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setDeleteTarget(s)} className="text-destructive">
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

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Editar Aluno</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Matrícula</Label>
              <Input value={editForm.registration} onChange={(e) => setEditForm({ ...editForm, registration: e.target.value })} className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Turma</Label>
              <Select value={editForm.class_id} onValueChange={(v) => setEditForm({ ...editForm, class_id: v })}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={updateStudent} disabled={saving} className="bg-primary text-primary-foreground">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Excluir Aluno"
        description={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={deleteStudent}
        loading={deleting}
      />
    </div>
  );
}
