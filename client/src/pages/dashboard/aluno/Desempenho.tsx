// Calia Digital — Aluno: Desempenho
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export default function Desempenho() {
  return (
    <div>
      <PageHeader
        title="Meu Desempenho"
        description="Acompanhe sua evolução ao longo do tempo"
      />
      <Card className="bg-card/50 border-border/50">
        <CardContent className="py-16 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Gráficos de desempenho estarão disponíveis após a correção das avaliações.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
