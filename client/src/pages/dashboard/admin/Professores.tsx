// Calia Digital — Admin: Professores
// Backend: GET /teachers, POST /teachers (full_name, email, subject_ids, class_ids)
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Plus, UserCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Professores() {
  const [professors, setProfessors] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "" });
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const loadData = async () => {
    try {
      const [p, s, c] = await Promise.all([
        apiFetch("/teachers"),
        apiFetch("/subjects"),
        apiFetch("/classes"),
      ]);
      setProfessors(p || []);
      setSubjects(s || []);
      setClasses(c || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const toggleSubject = (id: string) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const toggleClass = (id: string) => {
    setSelectedClasses((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const createProfessor = async () => {
    if (!form.full_name || !form.email) {
      toast.error("Preencha nome e email");
      return;
    }
    setCreating(true);
    try {
      const result = await apiFetch("/teachers", {
        method: "POST",
        body: JSON.stringify({
          full_name: form.full_name,
          email: form.email,
          subject_ids: selectedSubjects,
          class_ids: selectedClasses,
        }),
      });
      toast.success(`Professor cadastrado! Senha inicial: ${result.password || "12345678"}`);
      setForm({ full_name: "", email: "" });
      setSelectedSubjects([]);
      setSelectedClasses([]);
      setDialogOpen(false);
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar professor");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Professores"
        description="Gerencie os professores da escola"
        actions={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" /> Novo Professor
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Professor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    placeholder="Ex: Maria da Silva"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="professor@escola.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  A senha inicial será <span className="font-mono font-medium">12345678</span>. O professor deve alterá-la no primeiro acesso.
                </p>

                {/* Disciplinas */}
                {subjects.length > 0 && (
                  <div className="space-y-2">
                    <Label>Disciplinas</Label>
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-background/30 border border-border/30">
                      {subjects.map((s) => (
                        <label key={s.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={selectedSubjects.includes(s.id)}
                            onCheckedChange={() => toggleSubject(s.id)}
                          />
                          {s.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Turmas */}
                {classes.length > 0 && (
                  <div className="space-y-2">
                    <Label>Turmas</Label>
                    <div className="grid grid-cols-2 gap-2 p-3 rounded-lg bg-background/30 border border-border/30">
                      {classes.map((c) => (
                        <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox
                            checked={selectedClasses.includes(c.id)}
                            onCheckedChange={() => toggleClass(c.id)}
                          />
                          {c.name}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={createProfessor} disabled={creating} className="bg-primary text-primary-foreground">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cadastrar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : professors.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-16 text-center">
            <UserCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum professor cadastrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professors.map((p) => (
                <TableRow key={p.id} className="border-border/30">
                  <TableCell className="font-medium">{p.full_name || p.name || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">{p.email || "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
