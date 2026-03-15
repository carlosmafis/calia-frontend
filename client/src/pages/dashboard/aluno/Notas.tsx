// Calia Digital — Aluno: Minhas Notas
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

export default function Notas() {
  return (
    <div>
      <PageHeader
        title="Minhas Notas"
        description="Veja suas notas em cada avaliação"
      />
      <Card className="bg-card/50 border-border/50">
        <CardContent className="py-16 text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Suas notas aparecerão aqui conforme as avaliações forem corrigidas pelo professor.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
