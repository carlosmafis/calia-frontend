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
import { Plus, GraduationCap, Loader2, MoreHorizontal, Pencil, Trash2, Upload, FileSpreadsheet, Download, AlertCircle } from "lucide-react";
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
  const [selectedClassForImport, setSelectedClassForImport] = useState("");
  const [importDialogOpen, setImportDialogOpen] = useState(false);

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
    if (!form.name || !form.registration || !form.class_id) { toast.error("Preencha todos os campos"); return; }
    setCreating(true);
    try {
      await apiFetch("/students", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          registration_number: form.registration,
          class_id: form.class_id
        }),
      });
      toast.success("Aluno cadastrado");
      setForm({ name: "", registration: "", class_id: "" });
      setDialogOpen(false);
      loadData();
    } catch (err: any) { toast.error(err.message || "Erro ao cadastrar"); }
    finally { setCreating(false); }
  };

  const updateStudent = async () => {
    if (!editForm.name || !editForm.registration || !editForm.class_id) { toast.error("Preencha todos os campos"); return; }
    setSaving(true);
    try {
      await apiFetch(`/students/${editForm.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: editForm.name,
          registration_number: editForm.registration,
          class_id: editForm.class_id
        }),
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

  const downloadTemplate = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "https://calia-backend.onrender.com"}/templates/students`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("access_token")}` }
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "modelo_alunos.csv";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Modelo baixado!");
    } catch (err: any) {
      toast.error("Erro ao baixar modelo");
    }
  };

  const handleCSVImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!selectedClassForImport) {
      toast.error("Selecione uma turma antes de importar");
      if (csvRef.current) csvRef.current.value = "";
      return;
    }

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("class_id", selectedClassForImport);

      const result = await apiFetch("/students/upload", {
        method: "POST",
        body: formData,
      });

      toast.success(`${result.message}. ${result.errors?.length || 0} erro(s).`);
      if (csvRef.current) csvRef.current.value = "";
      setImportDialogOpen(false);
      setSelectedClassForImport("");
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao importar alunos");
    } finally {
      setImporting(false);
    }
  };

  const filtered = students
    .filter((s) => filterClass === "all" || s.class_id === filterClass)
    .filter((s) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (s.name || "").toLowerCase().includes(q) || (s.registration_number || "").toLowerCase().includes(q);
    });

  return (
    <div>
      <PageHeader
        title="Alunos"
        description={`${students.length} aluno(s) cadastrado(s)`}
        actions={
          <div className="flex items-center gap-2">
            <input ref={csvRef} type="file" accept=".csv" onChange={handleCSVImport} className="hidden" />
            <Button variant="outline" onClick={downloadTemplate} className="gap-2">
              <Download className="w-4 h-4" /> Modelo
            </Button>
            <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                  Importar CSV
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader><DialogTitle>Importar Alunos em Lote</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-900 dark:text-amber-200">
                      Selecione a turma antes de fazer upload. Todos os alunos da planilha serão adicionados a essa turma.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>Selecione a Turma</Label>
                    <Select value={selectedClassForImport} onValueChange={setSelectedClassForImport}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Escolha a turma..." />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                  <Button
                    onClick={() => csvRef.current?.click()}
                    disabled={!selectedClassForImport || importing}
                    className="bg-primary text-primary-foreground gap-2"
                  >
                    {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    Selecionar Arquivo
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
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
          description={search ? "Tente alterar a busca." : "Cadastre o primeiro aluno."}
        />
      ) : (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Nome</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className="border-border/30">
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell className="font-mono text-sm text-muted-foreground">{s.registration_number}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{s.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs gap-1">
                      <GraduationCap className="w-3 h-3" /> {classes.find((c) => c.id === s.class_id)?.name || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-card border-border">
                        <DropdownMenuItem
                          onClick={() => {
                            setEditForm(s);
                            setEditDialog(true);
                          }}
                          className="gap-2"
                        >
                          <Pencil className="w-4 h-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteTarget(s)} className="text-destructive gap-2">
                          <Trash2 className="w-4 h-4" /> Remover
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

      {/* Edit Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Editar Aluno</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Remover Aluno"
        description={`Tem certeza que deseja remover "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={deleteStudent}
        loading={deleting}
      />

      <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-sm text-blue-900 dark:text-blue-200">
        <p className="font-medium mb-2">📋 Como importar alunos em lote:</p>
        <ol className="list-decimal list-inside space-y-1 text-xs">
          <li>Clique em "Modelo" para baixar o arquivo CSV</li>
          <li>Preencha com os dados dos alunos (Nome e Matrícula)</li>
          <li>Clique em "Importar CSV"</li>
          <li>Selecione a turma onde os alunos serão adicionados</li>
          <li>Clique em "Selecionar Arquivo" e escolha o arquivo CSV</li>
          <li>Email gerado automaticamente: <span className="font-mono font-medium">matricula@escola.com</span></li>
          <li>Senha padrão: <span className="font-mono font-medium">matricula</span></li>
        </ol>
      </div>
    </div>
  );
}
