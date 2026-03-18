// Calia Digital — Landing Page
// Design: Dashboard Geométrico | Bauhaus funcionalista
// Dark theme, teal accents, geometric shapes, DM Sans typography


import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ScanLine, BarChart3, Users, Shield, Zap, School,
  ArrowRight, CheckCircle2
} from "lucide-react";


const CALIA_LOGO = "https://d2xsxph8kpxj0f.cloudfront.net/310519663377716985/mbGHqRvCcm8pC8pAncoxX9/logo-calia_aeef9d89.png";
const GABARITO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663377716985/mbGHqRvCcm8pC8pAncoxX9/gabarito-padrao_e7bb2ac1.png";
const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663377716985/mbGHqRvCcm8pC8pAncoxX9/hero-landing-AejJu9SksdyRcUCfzjhiz2.webp";
const DASHBOARD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663377716985/mbGHqRvCcm8pC8pAncoxX9/dashboard-preview-TmsZ6gXoFWfBirRJugdCpW.webp";
const OCR_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663377716985/mbGHqRvCcm8pC8pAncoxX9/ocr-feature-QoBwTxMYwbPFbvFoJjiUgD.webp";
const ANALYTICS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663377716985/mbGHqRvCcm8pC8pAncoxX9/analytics-feature-84vDXSKmnenwP72r7Wivqn.webp";


const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6 },
  }),
};


const features = [
  {
    icon: ScanLine,
    title: "Correção por OCR",
    description: "Digitalize folhas de respostas e obtenha correções automáticas em segundos com nossa tecnologia de visão computacional.",
  },
  {
    icon: BarChart3,
    title: "Relatórios Inteligentes",
    description: "Dashboards com gráficos detalhados de desempenho por turma, aluno e avaliação para tomada de decisão baseada em dados.",
  },
  {
    icon: Users,
    title: "Gestão Completa",
    description: "Gerencie escolas, turmas, professores e alunos em uma única plataforma integrada e intuitiva.",
  },
  {
    icon: Shield,
    title: "Controle de Acesso",
    description: "Níveis de permissão para Super Admin, Administrador, Professor e Aluno com áreas exclusivas para cada perfil.",
  },
  {
    icon: Zap,
    title: "Correção Manual",
    description: "Além do OCR, insira respostas manualmente com interface otimizada para velocidade e precisão.",
  },
  {
    icon: School,
    title: "Multi-Escola",
    description: "Arquitetura multi-tenant que permite gerenciar múltiplas escolas de forma independente e segura.",
  },
];


const benefits = [
  "Reduza em até 90% o tempo de correção de provas",
  "Acompanhe o desempenho dos alunos em tempo real",
  "Elimine erros humanos na tabulação de notas",
  "Gere relatórios automatizados para reuniões pedagógicas",
  "Escale sua operação para centenas de turmas",
];


export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={CALIA_LOGO} alt="Calia" className="w-9 h-9 rounded-lg object-contain" />
            <span className="font-bold text-lg tracking-tight">Cal.IA</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Entrar
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Começar Agora
              </Button>
            </Link>
          </div>
        </div>
      </nav>


      {/* Hero Section */}
      <section className="relative pt-16 overflow-hidden">
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />


        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20 lg:pt-32 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0}
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 mb-6">
