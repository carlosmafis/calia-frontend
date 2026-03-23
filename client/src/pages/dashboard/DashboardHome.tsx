// Calia Digital — Dashboard Home (role-based content)
import { useAuth } from "@/contexts/AuthContext";
import SuperAdminHome from "./super-admin/SuperAdminHome";
import AdminHome from "./admin/AdminHome";
import ProfessorHome from "./professor/ProfessorHome";
import AlunoHome from "./aluno/AlunoHome";

export default function DashboardHome() {
  const { user } = useAuth();
  if (!user) return null;

  console.log("[DashboardHome] user.role:", user.role);
  console.log("[DashboardHome] user:", user);

  switch (user.role) {
    case "super_admin":
      return <SuperAdminHome />;
    case "admin":
      return <AdminHome />;
    case "professor":
      return <ProfessorHome />;
    case "aluno":
      return <AlunoHome />;
    default:
      return <div className="text-muted-foreground">Papel não reconhecido.</div>;
  }
}
