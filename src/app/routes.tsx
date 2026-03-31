import { createBrowserRouter, Navigate } from "react-router";
import { Layout } from "./components/layout/Layout";
import { LoginPage } from "./pages/LoginPage";
import { CanteenPage } from "./pages/CanteenPage";
import { StudentsPage } from "./pages/StudentsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, element: <Navigate to="/cantina" replace /> },
      { path: "cantina", Component: CanteenPage },
      { path: "alunos", Component: StudentsPage },
      { path: "dashboard", Component: DashboardPage },
      { path: "relatorios", Component: ReportsPage },
      { path: "configuracoes", Component: SettingsPage },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/cantina" replace />,
  },
]);
