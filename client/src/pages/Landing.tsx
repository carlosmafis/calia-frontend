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
                  <Zap className="w-3 h-3" /> Plataforma Educacional Inteligente
                </span>
              </motion.div>

              <motion.h1
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={1}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] mb-6"
              >
                Gestão escolar com{" "}
                <span className="text-primary">correção automática</span>{" "}
                de provas
              </motion.h1>

              <motion.p
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={2}
                className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed"
              >
                O Calia Digital transforma a gestão educacional com OCR para correção de avaliações,
                dashboards inteligentes e controle completo de escolas, turmas e alunos.
              </motion.p>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={3}
                className="flex flex-wrap gap-4"
              >
                <Link href="/login">
                  <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                    Acessar Plataforma <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button size="lg" variant="outline" className="border-border text-foreground hover:bg-accent">
                    Conhecer Recursos
                  </Button>
                </a>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="hidden lg:block"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/5 rounded-2xl blur-2xl" />
                <img
                  src={DASHBOARD_IMG}
                  alt="Dashboard do Calia Digital"
                  className="relative rounded-xl border border-border/50 shadow-2xl shadow-primary/5"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
            custom={0}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Tudo que sua escola precisa
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Uma plataforma completa para digitalizar e otimizar a gestão educacional
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                variants={fadeUp}
                custom={i}
              >
                <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all duration-300 h-full group">
                  <CardContent className="p-6">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* OCR Showcase */}
      <section className="py-20 lg:py-28 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/5 rounded-2xl blur-2xl" />
                <img
                  src={GABARITO_IMG}
                  alt="Gabarito padrão do Calia"
                  className="relative rounded-xl border border-border/50"
                />
              </div>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 mb-4">
                <ScanLine className="w-3 h-3" /> Tecnologia OCR
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Correção automática com visão computacional
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Basta fotografar a folha de respostas. Nosso algoritmo de OCR detecta automaticamente
                as marcações, compara com o gabarito e calcula a nota instantaneamente.
                O professor pode revisar e ajustar antes de confirmar.
              </p>
              <ul className="space-y-3">
                {benefits.map((benefit, i) => (
                  <motion.li
                    key={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeUp}
                    custom={i + 1}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Analytics Showcase */}
      <section className="py-20 lg:py-28 border-t border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={0}
              className="order-2 lg:order-1"
            >
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20 mb-4">
                <BarChart3 className="w-3 h-3" /> Analytics
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-6">
                Dados que transformam a educação
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                Dashboards completos com gráficos de desempenho, evolução de notas,
                comparativos entre turmas e indicadores pedagógicos.
                Cada nível de acesso visualiza os dados relevantes para sua função.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-primary/5 rounded-2xl blur-2xl" />
                <img
                  src={ANALYTICS_IMG}
                  alt="Relatórios e Analytics"
                  className="relative rounded-xl border border-border/50"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 border-t border-border/30">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Pronto para transformar sua escola?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Acesse agora e comece a usar o Calia Digital para gestão educacional inteligente.
            </p>
            <Link href="/login">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
                Acessar Plataforma <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 py-12 bg-background/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            {/* Logo e Descrição */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src={CALIA_LOGO} alt="Calia" className="w-8 h-8 object-contain" />
                <span className="font-semibold text-foreground">Cal.IA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Sistema Inteligente de Avaliação para gestão educacional com OCR.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Recursos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition">Recursos</a></li>
                <li><a href="#features" className="hover:text-foreground transition">Documentação</a></li>
                <li><a href="/login" className="hover:text-foreground transition">Acessar</a></li>
              </ul>
            </div>

            {/* Contato */}
            <div>
              <h4 className="font-semibold text-foreground mb-3">Contato</h4>
              <p className="text-sm text-muted-foreground mb-2">caliadigital.com.br</p>
              <p className="text-sm text-primary font-semibold">Desenvolvido por: Prof. Carlos Adriano</p>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-border/30 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} Calia Digital. Todos os direitos reservados.
            </p>
            <p className="text-xs text-muted-foreground">
              Desenvolvido por: <span className="font-semibold text-primary">Prof. Carlos Adriano</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
