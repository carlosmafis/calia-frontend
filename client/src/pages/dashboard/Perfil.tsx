// Calia Digital — Perfil do Usuário
// Permite editar nome e visualizar informações da conta
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Shield, School, Save, Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

const roleLabels: Record<string, string> = {
  super_admin: "Super Administrador",
  admin: "Administrador da Escola",
  professor: "Professor",
  aluno: "Aluno",
};

const roleColors: Record<string, string> = {
  super_admin: "bg-red-500/15 text-red-400 border-red-500/30",
  admin: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  professor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  aluno: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

export default function Perfil() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  if (!user) return null;

  const saveName = async () => {
    if (!name.trim()) { toast.error("Nome não pode ficar vazio"); return; }
    setSaving(true);
    try {
      await apiFetch("/me/update", {
        method: "PUT",
        body: JSON.stringify({ name: name.trim() }),
      });
      toast.success("Nome atualizado com sucesso");
      refreshUser();
    } catch (err: any) {
      toast.error(err.message || "Erro ao atualizar nome");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    setChangingPassword(true);
    try {
      await apiFetch("/me/change-password", {
        method: "PUT",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      toast.success("Senha alterada com sucesso");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao alterar senha");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div>
      <PageHeader title="Meu Perfil" description="Gerencie suas informações pessoais" />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="bg-card/50 border-border/50 lg:col-span-1">
          <CardContent className="pt-8 pb-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <span className="text-primary font-bold text-3xl">
                {(user.name || user.email || "U").charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-lg font-semibold">{user.name || "Sem nome"}</h3>
            <p className="text-sm text-muted-foreground mt-1">{user.email}</p>
            <Badge className={`mt-3 ${roleColors[user.role] || ""}`}>
              {roleLabels[user.role] || user.role}
            </Badge>
          </CardContent>
        </Card>

        {/* Edit Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" /> Informações Pessoais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Nome Completo
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50"
                    placeholder="Seu nome"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </Label>
                  <Input
                    value={user.email}
                    disabled
                    className="bg-background/30 opacity-60"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Nível de Acesso
                  </Label>
                  <Input
                    value={roleLabels[user.role] || user.role}
                    disabled
                    className="bg-background/30 opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5">
                    <School className="w-3.5 h-3.5" /> ID da Escola
                  </Label>
                  <Input
                    value={user.school_id || "—"}
                    disabled
                    className="bg-background/30 opacity-60 font-mono text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveName} disabled={saving} className="bg-primary text-primary-foreground gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Alterações
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card className="bg-card/50 border-border/50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" /> Alterar Senha
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Senha Atual</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-background/50"
                  placeholder="Digite sua senha atual"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nova Senha</Label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-background/50"
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Confirmar Nova Senha</Label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-background/50"
                    placeholder="Repita a nova senha"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={changePassword} disabled={changingPassword} variant="outline" className="gap-2">
                  {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                  Alterar Senha
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
