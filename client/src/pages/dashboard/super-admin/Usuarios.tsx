// Calia Digital — Super Admin: Usuários
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Loader2 } from "lucide-react";

const roleBadge: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  super_admin: { label: "Super Admin", variant: "default" },
  admin: { label: "Admin", variant: "secondary" },
  professor: { label: "Professor", variant: "outline" },
  aluno: { label: "Aluno", variant: "outline" },
};

export default function UsuariosSuperAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await apiFetch("/users");
        setUsers(data || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div>
      <PageHeader
        title="Usuários"
        description="Todos os usuários cadastrados no sistema"
      />

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : users.length === 0 ? (
        <Card className="bg-card/50 border-border/50">
          <CardContent className="py-16 text-center">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum usuário encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card/50 border-border/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Papel</TableHead>
                <TableHead>Escola</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => {
                const badge = roleBadge[u.role] || { label: u.role, variant: "outline" as const };
                return (
                  <TableRow key={u.id} className="border-border/30">
                    <TableCell className="font-medium">{u.name || "—"}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      {u.school_id || "—"}
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
