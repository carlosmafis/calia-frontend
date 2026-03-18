// Calia Digital — Dashboard Layout
// Design: Dashboard Geométrico | Sidebar colapsável + header + perfil

import { useState, type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, School, Users, GraduationCap, BookOpen,
  FileText, BarChart3, ScanLine, LogOut, ChevronLeft, ChevronRight,
  Menu, X, UserCircle, BookMarked, PenLine, Settings, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case "super_admin":
      return [
        { label: "Painel Geral", href: "/dashboard", icon: LayoutDashboard },
        { label: "Escolas", href: "/dashboard/escolas", icon: School },
        { label: "Usuários", href: "/dashboard/usuarios", icon: Users },
        { label: "Relatórios", href: "/dashboard/relatorios", icon: BarChart3 },
      ];
    case "admin":
      return [
        { label: "Painel", href: "/dashboard", icon: LayoutDashboard },
        { label: "Turmas", href: "/dashboard/turmas", icon: BookOpen },
        { label: "Professores", href: "/dashboard/professores", icon: UserCircle },
        { label: "Alunos", href: "/dashboard/alunos", icon: GraduationCap },
        { label: "Disciplinas", href: "/dashboard/disciplinas", icon: BookMarked },
        { label: "Avaliações", href: "/dashboard/avaliacoes", icon: FileText },
        { label: "Relatórios", href: "/dashboard/relatorios", icon: BarChart3 },
      ];
    case "professor":
      return [
        { label: "Painel", href: "/dashboard", icon: LayoutDashboard },
        { label: "Minhas Turmas", href: "/dashboard/turmas", icon: BookOpen },
        { label: "Avaliações", href: "/dashboard/avaliacoes", icon: FileText },
        { label: "Correção OCR", href: "/dashboard/correcao", icon: ScanLine },
        { label: "Correção Manual", href: "/dashboard/correcao-manual", icon: PenLine },
        { label: "Relatórios", href: "/dashboard/relatorios", icon: BarChart3 },
      ];
    case "aluno":
      return [
        { label: "Painel", href: "/dashboard", icon: LayoutDashboard },
        { label: "Minhas Notas", href: "/dashboard/notas", icon: FileText },
        { label: "Desempenho", href: "/dashboard/desempenho", icon: BarChart3 },
      ];
    default:
      return [];
  }
}

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  admin: "Administrador",
  professor: "Professor",
  aluno: "Aluno",
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const navItems = getNavItems(user.role);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 shrink-0">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663377716985/mbGHqRvCcm8pC8pAncoxX9/logo-calia_aeef9d89.png"
          alt="Cal.IA"
          className="w-8 h-8 object-contain"
        />
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold text-lg tracking-tight"
          >
            Cal.IA
          </motion.span>
        )}
      </div>

      <Separator className="opacity-50" />

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || 
            (item.href !== "/dashboard" && location.startsWith(item.href));
          const Icon = item.icon;

          const linkContent = (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }
                ${collapsed ? "justify-center" : ""}
              `}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                <TooltipContent side="right">{item.label}</TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      <Separator className="opacity-50" />

      {/* User Info */}
      <div className="p-4 space-y-3">
        {!collapsed && (
          <div className="space-y-1">
            <p className="text-sm font-medium truncate">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground">{roleLabels[user.role]}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          onClick={logout}
          className="w-full text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span className="ml-2">Sair</span>}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden lg:flex flex-col border-r border-border bg-sidebar shrink-0 relative"
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 -right-3 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 bottom-0 w-[260px] bg-sidebar border-r border-border z-50 lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 border-b border-border flex items-center px-4 lg:px-6 gap-4 shrink-0 bg-card/50 backdrop-blur-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="w-5 h-5" />
          </button>
          {/* Logo no Header (Mobile) */}
          <div className="lg:hidden flex items-center gap-2">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663377716985/mbGHqRvCcm8pC8pAncoxX9/logo-calia_aeef9d89.png"
              alt="Cal.IA"
              className="w-6 h-6 object-contain"
            />
            <span className="text-sm font-bold">Cal.IA</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{user.name || user.email}</p>
              <p className="text-xs text-muted-foreground">{roleLabels[user.role]}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center hover:bg-primary/30 transition-colors">
                  <span className="text-primary font-semibold text-sm">
                    {(user.name || user.email || "U").charAt(0).toUpperCase()}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-card border-border w-48">
                <DropdownMenuItem onClick={() => setLocation("/dashboard/perfil")}>
                  <User className="w-4 h-4 mr-2" /> Meu Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
