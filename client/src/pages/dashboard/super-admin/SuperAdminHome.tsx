// Calia Digital — Super Admin Dashboard Home (Profissional)
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { School, Users, GraduationCap, BarChart3, Loader2, Plus, Settings, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { toast } from "sonner";

export default function SuperAdminHome() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const s = await apiFetch("/schools/");
        setSchools(s || []);
      } catch {}
      setLoading(false);
    };
    loadStats();
  }, []);

  const handleMigrateStudents = async () => {
    if (!window.confirm("Tem certeza que deseja migrar alunos antigos para users? Esta ação não pode ser desfeita.")) {
      return;
    }

    setMigrating(true);
    try {
      const result = await apiFetch("/admin/migrate-students-to-users", {
        method: "POST"
      });
      toast.success(`Migração concluída: ${result.success} sucesso, ${result.errors} erros`);
      if (result.errors > 0) {
        console.log("Erros:", result.errors_list);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao migrar alunos");
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Painel Super Admin"
        description="Visão geral de todas as escolas e operações do sistema"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Escolas" value={schools.length} icon={School} />
        <StatCard title="Planos Ativos" value={schools.filter(s => s.plan).length} icon={Settings} />
        <StatCard title="Plano Free" value={schools.filter(s => s.plan === "free").length} icon={GraduationCap} />
        <StatCard title="Plano Pro" value={schools.filter(s => s.plan === "pro").length} icon={BarChart3} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Schools List */}
        <Card className="bg-card/50 border-border/50 lg:col-span-2">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Escolas Cadastradas</CardTitle>
            <Link href="/dashboard/escolas">
              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 gap-1"><Plus className="w-3 h-3" /> Nova</Badge>
            </Link>
          </CardHeader>
          <CardContent>
            {schools.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">Nenhuma escola cadastrada.</p>
            ) : (
              <div className="space-y-2">
                {schools.map((school) => (
                  <div key={school.id} className="flex items-center justify-between p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <School className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{school.name}</p>
                        <p className="text-xs text-muted-foreground">{school.slug || "—"}</p>
                      </div>
                    </div>
                    <Badge variant={school.plan === "pro" ? "default" : "secondary"} className="text-xs">
                      {school.plan || "free"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/dashboard/escolas" className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><School className="w-4 h-4 text-primary" /></div>
              <div><p className="text-sm font-medium">Gerenciar Escolas</p><p className="text-xs text-muted-foreground">Criar e editar</p></div>
            </Link>
            <Link href="/dashboard/usuarios" className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center"><Users className="w-4 h-4 text-violet-400" /></div>
              <div><p className="text-sm font-medium">Gerenciar Usuários</p><p className="text-xs text-muted-foreground">Todos os perfis</p></div>
            </Link>
            <Link href="/dashboard/relatorios" className="flex items-center gap-3 p-3 rounded-lg bg-background/30 hover:bg-background/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center"><BarChart3 className="w-4 h-4 text-amber-400" /></div>
              <div><p className="text-sm font-medium">Relatórios Globais</p><p className="text-xs text-muted-foreground">Visão do sistema</p></div>
            </Link>
            <Button
              onClick={handleMigrateStudents}
              disabled={migrating}
              className="w-full flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {migrating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {migrating ? "Migrando..." : "Migrar Alunos Antigos"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
