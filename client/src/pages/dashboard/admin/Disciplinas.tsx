// Calia Digital — Admin: Disciplinas
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Plus, BookMarked, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Disciplinas() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");

  const loadSubjects = async () => {
    try {
      const data = await apiFetch("/subjects");
      setSubjects(data || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadSubjects(); }, []);

  const createSubject = async () => {
    if (!name.trim()) { toast.error("Informe o nome da disciplina"); return; }
    setCreating(true);
    try {
      await apiFetch("/subjects", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      toast.success("Disciplina criada com sucesso");
      setName("");
      loadSubjects();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar disciplina");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Disciplinas"
        description="Gerencie as disciplinas da escola"
        actions={
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                <Plus className="w-4 h-4" /> Nova Disciplina
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle>Criar Disciplina</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Nome da Disciplina</Label>
                  <Input
                    placeholder="Ex: Matemática"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button onClick={createSubject} disabled={creating} className="bg-primary text-primary-foreground">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar"}
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
      ) : subjects.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-16 text-center">
            <BookMarked className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma disciplina cadastrada.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((sub) => (
            <Card key={sub.id} className="bg-card/50 border-border/50 hover:border-primary/30 transition-colors">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookMarked className="w-5 h-5 text-primary" />
                  </div>
                  <CardTitle className="text-base">{sub.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground font-mono">ID: {sub.id}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
