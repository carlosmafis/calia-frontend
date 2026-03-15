// Calia Digital — Aluno Dashboard Home
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { FileText, BarChart3, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AlunoHome() {
  return (
    <div>
      <PageHeader
        title="Meu Painel"
        description="Acompanhe suas notas e desempenho"
      />

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <StatCard title="Avaliações Realizadas" value="—" icon={FileText} description="Em breve" />
        <StatCard title="Média Geral" value="—" icon={BarChart3} description="Em breve" />
        <StatCard title="Evolução" value="—" icon={TrendingUp} description="Em breve" />
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Minhas Notas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground py-10 text-center">
            Suas notas aparecerão aqui conforme as avaliações forem corrigidas.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
