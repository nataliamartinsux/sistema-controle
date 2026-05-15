import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/layout/Layout";
import { LoginPage } from "./pages/LoginPage";
import { CanteenPage } from "./pages/CanteenPage";
import { StudentsPage } from "./pages/StudentsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const papel = localStorage.getItem('sysmerenda_papel');

  // Se não tem papel (não fez login), manda pro login
  if (!papel) {
    return <Navigate to="/login" replace />;
  }

  // REGRA NOVA: Se for admin, tem passe livre em todas as rotas!
  if (papel === 'admin') {
    return <>{children}</>;
  }

  // Se a rota exige papéis específicos e o usuário não tem, bloqueia
  if (allowedRoles && !allowedRoles.includes(papel)) {
    return <Navigate to={papel === 'cantina' ? "/cantina" : "/alunos"} replace />;
  }

  // Se passou em todos os testes, renderiza a página
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    // Protege o Layout todo: ninguém entra no sistema sem estar logado
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/cantina" replace /> },
      { 
        path: "cantina", 
        element: <ProtectedRoute allowedRoles={['cantina', 'empresa']}><CanteenPage /></ProtectedRoute> 
      },
      { 
        path: "alunos", 
        element: <ProtectedRoute allowedRoles={['operador', 'empresa']}><StudentsPage /></ProtectedRoute> 
      },
      { 
        path: "dashboard", 
        element: <ProtectedRoute allowedRoles={['operador', 'empresa', 'fiscal', 'gestor']}><DashboardPage /></ProtectedRoute> 
      },
      { 
        path: "relatorios", 
        element: <ProtectedRoute allowedRoles={['operador', 'empresa', 'fiscal', 'gestor']}><ReportsPage /></ProtectedRoute> 
      },
      { 
        path: "configuracoes", 
        element: <ProtectedRoute allowedRoles={['empresa']}><SettingsPage /></ProtectedRoute> 
      },
    ],
  },
  {
    path: "*", // Qualquer URL não mapeada
    element: <Navigate to="/login" replace />,
  },
]);