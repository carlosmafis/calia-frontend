import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Bell, Loader2, AlertTriangle, AlertCircle, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";

export default function AlertsPanel() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/alerts/?unread_only=true&limit=10").catch(() => ({ alerts: [] }));
      setAlerts(data?.alerts || []);
      
      const count = await apiFetch("/alerts/count/unread/").catch(() => ({ unread_count: 0 }));
      setUnreadCount(count?.unread_count || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    loadAlerts();
    // Recarregar a cada 30 segundos
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkAsRead = async (alertId: string) => {
    try {
      await apiFetch(`/alerts/${alertId}/read`, { method: "PUT" });
      setAlerts(alerts.filter(a => a.id !== alertId));
      setUnreadCount(Math.max(0, unreadCount - 1));
      toast.success("Alerta marcado como lido");
    } catch {
      toast.error("Erro ao marcar alerta");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiFetch("/alerts/read-all", { method: "PUT" });
      setAlerts([]);
      setUnreadCount(0);
      toast.success("Todos os alertas marcados como lidos");
    } catch {
      toast.error("Erro ao marcar alertas");
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-500/15 border-red-500/30 text-red-400";
      case "medium":
        return "bg-amber-500/15 border-amber-500/30 text-amber-400";
      default:
        return "bg-blue-500/15 border-blue-500/30 text-blue-400";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "low_score":
      case "low_approval_rate":
        return <AlertTriangle className="w-4 h-4" />;
      case "high_absence":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="Alertas"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-96 bg-background/95 border-border/50">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Alertas</span>
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Marcar tudo como lido
              </Button>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-3 max-h-[calc(100vh-200px)] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Nenhum alerta no momento</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <Card
                key={alert.id}
                className={`${getSeverityColor(alert.severity)} border cursor-pointer hover:bg-opacity-75 transition-all`}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2 flex-1">
                      <div className="mt-0.5">
                        {getAlertIcon(alert.alert_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">
                          {alert.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {new Date(alert.created_at).toLocaleString("pt-BR")}
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 shrink-0"
                      onClick={() => handleMarkAsRead(alert.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
