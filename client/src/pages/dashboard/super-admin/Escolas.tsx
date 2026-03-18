// Calia Digital — Super Admin: Escolas (CRUD completo com criação de admin)
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
  const [form, setForm] = useState<any>({ name: "", slug: "", plan: "free", admin_name: "", admin_email: "" });
  const [editForm, setEditForm] = useState<any>({ id: "", name: "", slug: "", plan: "free" });
  const [credentialsDialog, setCredentialsDialog] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);

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
    setForm({ ...form, name, slug } as any);
  };

  const createSchool = async () => {
    if (!form.name.trim()) { toast.error("Informe o nome da escola"); return; }
    if (!form.slug.trim()) { toast.error("Informe o slug da escola"); return; }
    setCreating(true);
    try {
      // Se admin_email for fornecido, usar endpoint com-admin
      let endpoint = "/schools";
      let body: any = { name: form.name, slug: form.slug, plan: form.plan };
      
      if (form.admin_email?.trim()) {
        endpoint = "/schools/with-admin";
        body = { ...body, admin_name: form.admin_name, admin_email: form.admin_email };
      }
      
      const result = await apiFetch(endpoint, { method: "POST", body: JSON.stringify(body) });
      
      toast.success("Escola criada com sucesso");
      
      // Se houver credenciais, exibir dialog
      if (result.credentials) {
        setCredentials(result.credentials);
        setCredentialsDialog(true);
      }
      
      setForm({ name: "", slug: "", plan: "free", admin_name: "", admin_email: "" } as any);
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copiado para a área de transferência");
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
            <DialogContent className="bg-card border-border max-w-lg">
              <DialogHeader><DialogTitle>Criar Nova Escola</DialogTitle></DialogHeader>
              <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label>Nome da Escola</Label>
                  <Input placeholder="Ex: Escola Municipal São Paulo" value={form.name} onChange={(e) => handleNameChange(e.target.value as any)} className="bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Label>Slug (identificador único)</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <Input placeholder="escola-municipal-sp" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value } as any)} className="bg-background/50 font-mono text-sm" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Plano</Label>
                  <Select value={form.plan} onValueChange={(v) => setForm({ ...form, plan: v } as any)}>
                    <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="border-t border-border/30 pt-4">
                  <p className="text-sm font-medium mb-3">Administrador da Escola</p>
                  <div className="space-y-2">
                    <Label>Nome do Admin</Label>
                    <Input placeholder="Ex: João Silva" value={form.admin_name} onChange={(e) => setForm({ ...form, admin_name: e.target.value } as any)} className="bg-background/50" />
                  </div>
                  <div className="space-y-2 mt-2">
                    <Label>Email do Admin</Label>
                    <Input type="email" placeholder="admin@escola.com" value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value } as any)} className="bg-background/50" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Um usuário admin será criado automaticamente com senha temporária.</p>
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

      {/* Credentials Dialog */}
      <Dialog open={credentialsDialog} onOpenChange={setCredentialsDialog}>
        <DialogContent className="bg-card border-border max-w-md">
          <DialogHeader><DialogTitle>Credenciais do Admin da Escola</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-background/50 border border-border rounded-lg p-4 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-background px-3 py-2 rounded text-sm font-mono border border-border/50">
                    {credentials?.email}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(credentials?.email || "")}
                    className="h-8 w-8 p-0"
                  >
                    📋
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Senha Temporária</Label>
                <div className="flex items-center gap-2 mt-1">
                  <code className="flex-1 bg-background px-3 py-2 rounded text-sm font-mono border border-border/50">
                    {credentials?.temp_password}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(credentials?.temp_password || "")}
                    className="h-8 w-8 p-0"
                  >
                    📋
                  </Button>
                </div>
              </div>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                ⚠️ {credentials?.message} Compartilhe estas credenciais com segurança.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setCredentialsDialog(false)} className="bg-primary text-primary-foreground">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
