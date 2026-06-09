import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/cantina", icon: UtensilsCrossed, label: "Operação Diária", allowedRoles: ['cantina', 'empresa', 'operador'] },
  { to: "/alunos", icon: Users, label: "Alunos", allowedRoles: ['operador', 'empresa', 'gestor'] },
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", allowedRoles: ['operador', 'empresa', 'fiscal', 'gestor'] },
  { to: "/relatorios", icon: FileText, label: "Relatórios", allowedRoles: ['operador', 'empresa', 'fiscal', 'gestor'] },
  { to: "/configuracoes", icon: Settings, label: "Configurações", allowedRoles: ['empresa'] },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const papelDoUsuario = localStorage.getItem('sysmerenda_papel');
  const userName = localStorage.getItem('sysmerenda_nome') || localStorage.getItem('sysmerenda_email') || 'SysMerenda';

  const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    operador: 'Operador',
    empresa: 'Empresa',
    gestor: 'Gestor',
    fiscal: 'Fiscal',
    cantina: 'Cantina',
    responsavel: 'Responsável',
  };

  const userRoleLabel = papelDoUsuario ? ROLE_LABELS[papelDoUsuario] || papelDoUsuario : 'Usuário';

  const userInitials = userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('') || userRoleLabel.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    navigate("/login");
  };

  const today = new Date();
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  }).format(today);
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">SysMerenda</p>
            <p className="text-slate-400 text-xs">Controle de Acesso</p>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LGPD Notice */}
        <div className="mx-3 mt-3 px-3 py-2 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-xs">
            🔒 Sistema em conformidade com a LGPD. Dados auditados.
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS
            // REGRA NOVA: Se for admin, passa tudo. Se não, verifica a lista.
            .filter((item) => papelDoUsuario === 'admin' || item.allowedRoles.includes(papelDoUsuario || ''))
            .map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm ${
                  isActive
                    ? "bg-emerald-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-800 cursor-pointer">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {userInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{userName}</p>
              <p className="text-slate-400 text-xs truncate">Perfil: {userRoleLabel}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 mt-1 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors text-sm"
          >
            <LogOut className="w-4 h-4" />
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <p className="text-gray-500 text-xs">IFB - Campus São Sebastião</p>
              <p className="text-gray-800 text-sm font-medium">{capitalizedDate}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                  {userInitials}
                </div>
                <span className="hidden sm:block">{userRoleLabel}</span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">{userName}</p>
                    <p className="text-xs text-gray-500">Perfil: {userRoleLabel}</p>
                  </div>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    Sair do Sistema
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
