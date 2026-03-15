// Calia Digital — Turmas (Admin e Professor)
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Plus, BookOpen, Loader2, Users } from "lucide-react";
import { toast } from "sonner";

export default function Turmas() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  const loadClasses = async () => {
    try {
      const data = await apiFetch("/classes");
      setClasses(data || []);
    } catch {
      toast.error("Erro ao carregar turmas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClasses(); }, []);

  const createClass = async () => {
    if (!name.trim()) { toast.error("Informe o nome da turma"); return; }
    setCreating(true);
    try {
      await apiFetch("/classes", {
        method: "POST",
        body: JSON.stringify({ name, year: parseInt(year) }),
      });
      toast.success("Turma criada com sucesso");
      setName("");
      loadClasses();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar turma");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={user?.role === "professor" ? "Minhas Turmas" : "Turmas"}
        description={user?.role === "professor" ? "Turmas atribuídas a você" : "Gerencie as turmas da escola"}
        actions={
          isAdmin ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                  <Plus className="w-4 h-4" /> Nova Turma
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle>Criar Nova Turma</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Nome da Turma</Label>
                    <Input
                      placeholder="Ex: 9° Ano A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ano Letivo</Label>
                    <Input
                      type="number"
                      placeholder="2026"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <Button onClick={createClass} disabled={creating} className="bg-primary text-primary-foreground">
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar Turma"}
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
      ) : classes.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma turma encontrada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{cls.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">Ano: {cls.year || "—"}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-3.5 h-3.5" />
                  <span>{cls.student_count || 0} alunos</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
