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
          className="w-8 h-8 rounded-lg object-contain"
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
