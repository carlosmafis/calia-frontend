// Calia Digital — Empty State Component
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export default function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-primary/60" />
        </div>
        <h3 className="font-semibold text-lg mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">{description}</p>
        {action && (
          <Button onClick={action.onClick} className="mt-4 bg-primary text-primary-foreground">
            {action.label}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
