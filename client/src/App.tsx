// Calia Digital — App Root
// Design: Dashboard Geométrico | Dark theme
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Public pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Dashboard pages
import DashboardHome from "./pages/dashboard/DashboardHome";
import Perfil from "./pages/dashboard/Perfil";

// Super Admin
import Escolas from "./pages/dashboard/super-admin/Escolas";
import UsuariosSuperAdmin from "./pages/dashboard/super-admin/Usuarios";

// Admin
import Professores from "./pages/dashboard/admin/Professores";
import Alunos from "./pages/dashboard/admin/Alunos";
import Disciplinas from "./pages/dashboard/admin/Disciplinas";

// Shared
import Turmas from "./pages/dashboard/shared/Turmas";
import Avaliacoes from "./pages/dashboard/shared/Avaliacoes";
import AvaliacaoDetalhes from "./pages/dashboard/shared/AvaliacaoDetalhes";
import Relatorios from "./pages/dashboard/Relatorios";

// Professor
import CorrecaoOCR from "./pages/dashboard/professor/CorrecaoOCR";
import CorrecaoManual from "./pages/dashboard/professor/CorrecaoManual";
import TeacherDashboard from "./pages/dashboard/professor/TeacherDashboard";
import StudentProgress from "./pages/dashboard/professor/StudentProgress";
import QuestionAnalysis from "./pages/dashboard/professor/QuestionAnalysis";

// Admin Dashboard
import AdminDashboard from "./pages/dashboard/admin/AdminDashboard";

// Aluno
import Notas from "./pages/dashboard/aluno/Notas";
import Desempenho from "./pages/dashboard/aluno/Desempenho";

function Router() {
  return (
    <Switch>
      {/* Public */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />

      {/* Dashboard Home (all roles) */}
      <Route path="/dashboard">
        <ProtectedRoute><DashboardHome /></ProtectedRoute>
      </Route>

      {/* Perfil (all roles) */}
      <Route path="/dashboard/perfil">
        <ProtectedRoute><Perfil /></ProtectedRoute>
      </Route>

      {/* Super Admin */}
      <Route path="/dashboard/escolas">
        <ProtectedRoute allowedRoles={["super_admin"]}><Escolas /></ProtectedRoute>
      </Route>
      <Route path="/dashboard/usuarios">
        <ProtectedRoute allowedRoles={["super_admin"]}><UsuariosSuperAdmin /></ProtectedRoute>
      </Route>

      {/* Admin */}
      <Route path="/dashboard/admin">
        <ProtectedRoute allowedRoles={["admin", "super_admin"]}><AdminDashboard /></ProtectedRoute>
      </Route>
      <Route path="/dashboard/professores">
        <ProtectedRoute allowedRoles={["admin", "super_admin"]}><Professores /></ProtectedRoute>
      </Route>
      <Route path="/dashboard/alunos">
        <ProtectedRoute allowedRoles={["admin", "super_admin"]}><Alunos /></ProtectedRoute>
      </Route>
      <Route path="/dashboard/disciplinas">
        <ProtectedRoute allowedRoles={["admin", "super_admin"]}><Disciplinas /></ProtectedRoute>
      </Route>

      {/* Shared: Admin + Professor */}
      <Route path="/dashboard/turmas">
        <ProtectedRoute allowedRoles={["admin", "super_admin", "professor"]}><Turmas /></ProtectedRoute>
      </Route>
      <Route path="/dashboard/avaliacoes">
        <ProtectedRoute allowedRoles={["admin", "super_admin", "professor"]}><Avaliacoes /></ProtectedRoute>
      </Route>
      <Route path="/dashboard/avaliacoes/:id">
        {(params) => (
          <ProtectedRoute allowedRoles={["admin", "super_admin", "professor"]}>
            <AvaliacaoDetalhes id={params.id} />
          </ProtectedRoute>
        )}
      </Route>

      {/* Professor */}
      <Route path="/dashboard/teacher">
        <ProtectedRoute allowedRoles={["professor"]}><TeacherDashboard /></ProtectedRoute>
      </Route>
      <Route path="/dashboard/student/:id">
        {(params) => (
          <ProtectedRoute allowedRoles={["professor"]}>
            <StudentProgress id={params.id} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/questions-analysis">
        <ProtectedRoute allowedRoles={["professor"]}><QuestionAnalysis /></ProtectedRoute>
      </Route>
      <Route path="/dashboard/correcao">
        <ProtectedRoute allowedRoles={["professor"]}><CorrecaoOCR /></ProtectedRoute>
      </Route>
      <Route path="/dashboard/correcao-manual">
        <ProtectedRoute allowedRoles={["professor"]}><CorrecaoManual /></ProtectedRoute>
      </Route>

      {/* All roles */}
      <Route path="/dashboard/relatorios">
        <ProtectedRoute><Relatorios /></ProtectedRoute>
      </Route>

      {/* Aluno */}
      <Route path="/dashboard/notas">
        <ProtectedRoute allowedRoles={["aluno"]}><Notas /></ProtectedRoute>
      </Route>
      <Route path="/dashboard/desempenho">
        <ProtectedRoute allowedRoles={["aluno"]}><Desempenho /></ProtectedRoute>
      </Route>

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
