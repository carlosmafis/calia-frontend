// Calia Digital — Super Admin: Escolas (CRUD completo)
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import SearchInput from "@/components/SearchInput";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Plus, School, Loader2, Globe, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function Escolas() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", slug: "", plan: "free" });
  const [editForm, setEditForm] = useState<any>({ id: "", name: "", slug: "", plan: "free" });

  const loadSchools = async () => {
    try {
      const data = await apiFetch("/schools");
      setSchools(data || []);
    } catch {
      toast.error("Erro ao carregar escolas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadSchools(); }, []);

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    setForm({ ...form, name, slug });
  };

  const createSchool = async () => {
    if (!form.name.trim()) { toast.error("Informe o nome da escola"); return; }
    if (!form.slug.trim()) { toast.error("Informe o slug da escola"); return; }
    setCreating(true);
    try {
      await apiFetch("/schools", { method: "POST", body: JSON.stringify({ name: form.name, slug: form.slug, plan: form.plan }) });
      toast.success("Escola criada com sucesso");
      setForm({ name: "", slug: "", plan: "free" });
      setDialogOpen(false);
      loadSchools();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar escola");
    } finally {
      setCreating(false);
    }
  };

  const updateSchool = async () => {
    if (!editForm.name.trim()) { toast.error("Informe o nome"); return; }
    try {
      await apiFetch(`/schools/${editForm.id}`, { method: "PUT", body: JSON.stringify({ name: editForm.name, slug: editForm.slug, plan: editForm.plan }) });
      toast.success("Escola atualizada");
      setEditDialogOpen(false);
      loadSchools();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar");
    }
  };

  const deleteSchool = async () => {
    if (!deleteId) return;
    try {
      await apiFetch(`/schools/${deleteId}`, { method: "DELETE" });
      toast.success("Escola removida");
      setDeleteId(null);
      loadSchools();
    } catch (err: any) {
      toast.error(err.message || "Erro ao remover");
    }
  };

  const filtered = schools.filter(s => s.name?.toLowerCase().includes(search.toLowerCase()) || s.slug?.toLowerCase().includes(search.toLowerCase()));

  const planColors: Record<string, string> = {
    free: "bg-zinc-500/20 text-zinc-400",
    basic: "bg-blue-500/20 text-blue-400",
    pro: "bg-amber-500/20 text-amber-400",
    premium: "bg-amber-500/20 text-amber-400",
  };

  return (
    <div>
      <PageHeader
        title="Escolas"
        description="Gerencie todas as escolas cadastradas no sistema"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"><Plus className="w-4 h-4" /> Nova Escola</Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader><DialogTitle>Criar Nova Escola</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da Escola</Label>
                  <Input placeholder="Ex: Escola Municipal São Paulo" value={form.name} onChange={(e) => handleNameChange(e.target.value)} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Slug (identificador único)</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <Input placeholder="escola-municipal-sp" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-background/50 font-mono text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Plano</Label>
                  <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v })}>
                    <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
                <Button onClick={createSchool} disabled={creating} className="bg-primary text-primary-foreground">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Escola"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="mb-4">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar escola..." />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={School} title="Nenhuma escola encontrada" description={search ? "Tente outra busca" : "Clique em 'Nova Escola' para começar"} />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((school) => (
            <Card key={school.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center"><School className="w-5 h-5 text-primary" /></div>
                    <CardTitle className="text-base">{school.name}</CardTitle>
                  </div>
                  <Badge className={`text-xs ${planColors[school.plan] || planColors.free}`}>{(school.plan || "free").toUpperCase()}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground font-mono mb-3">/{school.slug || school.id}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => { setEditForm({ id: school.id, name: school.name, slug: school.slug, plan: school.plan || "free" }); setEditDialogOpen(true); }}>
                    <Pencil className="w-3 h-3" /> Editar
                  </Button>
                  <Button variant="outline" size="sm" className="gap-1 text-xs text-destructive hover:text-destructive" onClick={() => setDeleteId(school.id)}>
                    <Trash2 className="w-3 h-3" /> Excluir
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader><DialogTitle>Editar Escola</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="bg-background/50" />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={editForm.slug} onChange={(e) => setEditForm({ ...editForm, slug: e.target.value })} className="bg-background/50 font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={editForm.plan} onValueChange={(v) => setEditForm({ ...editForm, plan: v })}>
                <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancelar</Button></DialogClose>
            <Button onClick={updateSchool} className="bg-primary text-primary-foreground">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Excluir Escola"
        description="Tem certeza que deseja excluir esta escola? Esta ação não pode ser desfeita."
        onConfirm={deleteSchool}
      />
    </div>
  );
}
