// Calia Digital — Super Admin Dashboard Home
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { School, Users, GraduationCap, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuperAdminHome() {
  const [stats, setStats] = useState({ schools: 0, users: 0, students: 0, assessments: 0 });

  useEffect(() => {
    // Load stats - these would come from dedicated endpoints
    const loadStats = async () => {
      try {
        const schools = await apiFetch("/schools");
        setStats((s) => ({ ...s, schools: schools.length || 0 }));
      } catch {}
    };
    loadStats();
  }, []);

  return (
    <div>
      <PageHeader
        title="Painel Super Admin"
        description="Visão geral de todas as escolas e operações do sistema"
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Escolas" value={stats.schools} icon={School} />
        <StatCard title="Usuários" value={stats.users} icon={Users} />
        <StatCard title="Alunos" value={stats.students} icon={GraduationCap} />
        <StatCard title="Avaliações" value={stats.assessments} icon={BarChart3} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Escolas Cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Gerencie as escolas na seção "Escolas" do menu lateral.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Acompanhe as últimas ações realizadas no sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
