// Calia Digital — Login Page
// Design: Dashboard Geométrico | Dark theme, teal accents

import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { setToken, clearToken, getToken } from "@/lib/api";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663377716985/mbGHqRvCcm8pC8pAncoxX9/hero-landing-AejJu9SksdyRcUCfzjhiz2.webp";

// Supabase auth via REST API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://lhydfllckxuzotondmla.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoeWRmbGxja3h1em90b25kbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTYxNTQsImV4cCI6MjA4Nzk3MjE1NH0.PvwKkuSX8tJXHmoztSodHqMoFCsbJyslhDHnxeAGHjs";

export default function Login() {
  if (getToken()) {
  window.location.replace("/dashboard");
}
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
  
    setLoading(true);
  
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await res.json();
  
      if (!res.ok || !data?.access_token) {
        throw new Error(
          data?.error_description ||
          data?.error ||
          "Credenciais inválidas"
        );
      }
  
      console.log("LOGIN OK - TOKEN:", data.access_token);
  
      clearToken();
      setToken(data.access_token);
  
      window.location.replace("/dashboard");
  
    } catch (err: any) {
      toast.error(err.message || "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center p-4">
      {/* Background */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `url(${HERO_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-background" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao início
        </Link>

        <Card className="bg-card/80 backdrop-blur-xl border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663377716985/mbGHqRvCcm8pC8pAncoxX9/logo-calia_aeef9d89.png"
                alt="Cal.IA"
                className="w-16 h-16 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Bem-vindo de volta</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Entre com suas credenciais para acessar o painel
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </Button>

              <div className="text-center pt-2">
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Esqueci a Senha
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Cal.IA — Sistema Inteligente de Avaliação
        </p>
      </motion.div>
    </div>
  );
}
