// Calia Digital — Admin: Alunos
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
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
import { Plus, GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Alunos() {
  const [students, setStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", registration: "", class_id: "" });
  const [filterClass, setFilterClass] = useState("all");

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
    if (!form.name || !form.class_id) {
      toast.error("Preencha nome e turma");
      return;
    }
    setCreating(true);
    try {
      await apiFetch("/students", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Aluno cadastrado com sucesso");
      setForm({ name: "", registration: "", class_id: "" });
      loadData();
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar aluno");
    } finally {
      setCreating(false);
    }
  };

  const filtered = filterClass === "all"
    ? students
    : students.filter((s) => s.class_id === filterClass);

  return (
    <div>
      <PageHeader
        title="Alunos"
        description="Gerencie os alunos da escola"
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" /> Novo Aluno
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Cadastrar Aluno</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    placeholder="Ex: João da Silva"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Matrícula</Label>
                  <Input
                    placeholder="Ex: 2026001"
                    value={form.registration}
                    onChange={(e) => setForm({ ...form, registration: e.target.value })}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Turma</Label>
                  <Select value={form.class_id} onValueChange={(v) => setForm({ ...form, class_id: v })}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Selecione a turma" />
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
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={createStudent} disabled={creating} className="bg-primary text-primary-foreground">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Cadastrar"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Filter */}
      <div className="mb-4 flex items-center gap-3">
        <Label className="text-sm text-muted-foreground">Filtrar por turma:</Label>
        <Select value={filterClass} onValueChange={setFilterClass}>
          <SelectTrigger className="w-[200px] bg-card/50">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as turmas</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-16 text-center">
            <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum aluno encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Nome</TableHead>
                <TableHead>Matrícula</TableHead>
                <TableHead>Turma</TableHead>
                <TableHead>Status</TableHead>
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
                      <Badge variant={s.status === "CURSANDO" ? "default" : "secondary"}>
                        {s.status || "CURSANDO"}
                      </Badge>
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
