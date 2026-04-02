// Calia Digital — Forgot Password Page
// Design: Dashboard Geométrico | Dark theme, teal accents

import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663377716985/mbGHqRvCcm8pC8pAncoxX9/hero-landing-AejJu9SksdyRcUCfzjhiz2.webp";

// Supabase auth via REST API
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://lhydfllckxuzotondmla.supabase.co";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoeWRmbGxja3h1em90b25kbWxhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzOTYxNTQsImV4cCI6MjA4Nzk3MjE1NH0.PvwKkuSX8tJXHmoztSodHqMoFCsbJyslhDHnxeAGHjs";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Por favor, insira seu email");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error_description || data.msg || "Erro ao enviar email de reset");
      }

      setSuccess(true);
      setEmail("");
      toast.success("Email de reset enviado com sucesso!");
      
      setTimeout(() => {
        window.location.href = "/login";
      }, 3000);
    } catch (err: any) {
      const errorMsg = err.message || "Erro ao processar solicitação. Tente novamente.";
      setError(errorMsg);
      toast.error(errorMsg);
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
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao login
        </Link>

        <Card className="bg-card/80 backdrop-blur-xl border-border/50">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663377716985/mbGHqRvCcm8pC8pAncoxX9/LOGOCALIA_cd390e4f.png"
                alt="Cal.IA"
                className="w-16 h-16 object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Recuperar Senha</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Insira seu email para receber um link de reset
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4 border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Email de reset enviado com sucesso! Redirecionando...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || success}
                  className="bg-background/50"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading || success}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" /> Enviando...
                  </>
                ) : success ? (
                  "Email Enviado"
                ) : (
                  "Enviar Link de Reset"
                )}
              </Button>
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
