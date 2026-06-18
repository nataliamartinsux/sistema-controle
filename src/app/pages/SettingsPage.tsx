import { useState, useEffect } from "react";
import {
  Clock,
  DollarSign,
  Users,
  Shield,
  Save,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  AlertTriangle,
  Info,
} from "lucide-react";
import { type User } from "../types";
import { api } from "../services/api";
import { toast } from "sonner";

type Role = User["role"];
const ROLES: Role[] = ["Operador", "Empresa", "Fiscal", "Gestão", "Admin"];

const ROLE_COLORS: Record<Role, string> = {
  Operador: "bg-blue-100 text-blue-700",
  Empresa: "bg-violet-100 text-violet-700",
  Fiscal: "bg-amber-100 text-amber-700",
  Gestão: "bg-emerald-100 text-emerald-700",
  Admin: "bg-red-100 text-red-700",
};

const ROLE_PERMISSIONS: Record<Role, string[]> = {
  Operador: ["Registrar refeições", "Busca manual", "Registrar ocorrências"],
  Empresa: ["Dashboard Empresa", "Relatórios de consumo", "Exportar CSV"],
  Fiscal: ["Dashboard Fiscal", "Gerar Protocolo", "Exportar PDF/CSV", "Relatórios completos"],
  Gestão: ["Dashboard Gestão", "Ocorrências", "Comparecimento por turma"],
  Admin: ["Acesso total", "Configurações", "Gerenciar usuários", "Gerenciar alunos", "Todos os relatórios"],
};

export function SettingsPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [saved, setSaved] = useState(false);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedRoleInfo, setSelectedRoleInfo] = useState<Role | null>(null);

  // Canteen settings
  const [canteenStart, setCanteenStart] = useState("07:00");
  const [canteenEnd, setCanteenEnd] = useState("14:00");
  const [mealValue, setMealValue] = useState("4.50");
  const [maxManualPct, setMaxManualPct] = useState("5");
  const [alertBeforeMinutes, setAlertBeforeMinutes] = useState("15");

  // New user form
  const [newUser, setNewUser] = useState({ nome: "", email: "", role: "Operador" as Role });
  const [editRole, setEditRole] = useState<Role>("Operador");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/api/usuarios/');
        if (res.data) setUsers(res.data.results || res.data);
      } catch (error) {
        console.error("Erro ao carregar usuários da API", error);
      }
    };
    fetchUsers();
  }, []);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAddUser = () => {
    if (!newUser.nome || !newUser.email) return;
    const user: User = {
      id: `u${Date.now()}`,
      nome: newUser.nome,
      email: newUser.email,
      role: newUser.role,
      status: "Ativo",
      lastAccess: "Nunca",
    };
    setUsers((prev) => [...prev, user]);
    setNewUser({ nome: "", email: "", role: "Operador" });
    setShowAddUser(false);
  };

  const handleToggleStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id ? { ...u, status: u.status === "Ativo" ? "Inativo" : "Ativo" } : u
      )
    );
  };

  const handleDeleteUser = (id: string) => {
    toast.warning("Confirmar remoção deste usuário?", {
      action: {
        label: "Confirmar Remoção",
        onClick: async () => {
          try {
            await api.delete(`/api/usuarios/${id}/`);
            setUsers((prev) => prev.filter((u) => u.id !== id));
            toast.success("Usuário removido com sucesso.");
          } catch (error) {
            toast.error("Falha ao remover o usuário.");
          }
        },
      },
    });
  };

  const handleUpdateRole = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role: editRole } : u)));
    setEditingUser(null);
  };

  const [diasUteis, setDiasUteis] = useState(() => {
    const salvo = localStorage.getItem('sysmerenda_dias_uteis');
    return salvo ? parseInt(salvo) : 22;
  });

  const handleSaveDias = (valor: string) => {
    const n = parseInt(valor) || 0;
    setDiasUteis(n);
    localStorage.setItem('sysmerenda_dias_uteis', n.toString());
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900 text-2xl font-bold">Configurações</h1>
          <p className="text-gray-500 text-sm mt-0.5">Administração do sistema — Acesso restrito: Admin</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <Shield className="w-4 h-4" />
          Perfil: Admin
        </div>
      </div>

      {/* Parâmetros de Cálculo */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-gray-800 font-semibold">Parâmetros de Cálculo</h2>
        </div>
        <div className="p-6">
          <div className="max-w-xs">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Dias Letivos (Mês Atual)
            </label>
            <input
              type="number"
              value={diasUteis}
              onChange={(e) => handleSaveDias(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              min="1"
              max="31"
            />
            <p className="text-gray-400 text-xs mt-1">Usado para projeções no Dashboard.</p>
          </div>
        </div>
      </div>

      {/* Canteen Settings */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Clock className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-gray-800 font-semibold">Configurações da Cantina</h2>
            <p className="text-gray-400 text-xs">Horários e regras de funcionamento</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Horário de Início</label>
              <input
                type="time"
                value={canteenStart}
                onChange={(e) => setCanteenStart(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
              <p className="text-gray-400 text-xs mt-1">Início do aceite de biometrias</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Horário de Fim</label>
              <input
                type="time"
                value={canteenEnd}
                onChange={(e) => setCanteenEnd(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
              <p className="text-gray-400 text-xs mt-1">Encerramento automático</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Alerta pré-encerramento (min)</label>
              <input
                type="number"
                value={alertBeforeMinutes}
                onChange={(e) => setAlertBeforeMinutes(e.target.value)}
                min={5}
                max={60}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
              <p className="text-gray-400 text-xs mt-1">Aviso antes do encerramento</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Limite de Liberações Manuais (%)
              </label>
              <input
                type="number"
                value={maxManualPct}
                onChange={(e) => setMaxManualPct(e.target.value)}
                min={1}
                max={20}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
              <p className="text-gray-400 text-xs mt-1">Alerta fiscal ao exceder este %</p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Settings */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-gray-800 font-semibold">Configurações Financeiras</h2>
            <p className="text-gray-400 text-xs">Valores e parâmetros de pagamento</p>
          </div>
        </div>
        <div className="p-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Valor Unitário da Refeição (R$)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">R$</span>
                <input
                  type="number"
                  step="0.01"
                  value={mealValue}
                  onChange={(e) => setMealValue(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                />
              </div>
              <p className="text-gray-400 text-xs mt-1">Conforme contrato vigente</p>
            </div>
            <div className="sm:col-span-2">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p className="text-emerald-800 text-sm font-semibold mb-1">Projeção Mensal</p>
                <p className="text-emerald-700 text-xs">
                  Com {mealValue ? `R$ ${parseFloat(mealValue).toFixed(2).replace(".", ",")}` : "—"} por refeição e
                  meta de 520 refeições/dia × 22 dias úteis ={" "}
                  <strong>
                    R${" "}
                    {mealValue && !isNaN(parseFloat(mealValue))
                      ? (parseFloat(mealValue) * 520 * 22).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                      : "—"}
                  </strong>
                  /mês
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
            saved
              ? "bg-emerald-500 text-white"
              : "bg-slate-900 hover:bg-slate-700 text-white"
          }`}
        >
          {saved ? (
            <>
              <Check className="w-4 h-4" />
              Salvo com Sucesso!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Salvar Configurações
            </>
          )}
        </button>
      </div>

      {/* User Management (RBAC) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-violet-50 rounded-lg">
              <Users className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h2 className="text-gray-800 font-semibold">Gerenciamento de Usuários (RBAC)</h2>
              <p className="text-gray-400 text-xs">Controle de acesso baseado em perfis</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddUser(!showAddUser)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Adicionar Usuário
          </button>
        </div>

        {/* Role legend */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-2">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRoleInfo(selectedRoleInfo === role ? null : role)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${ROLE_COLORS[role]} ${
                selectedRoleInfo === role ? "ring-2 ring-offset-1 ring-slate-400" : ""
              }`}
            >
              {role}
            </button>
          ))}
          <div className="flex items-center gap-1 text-xs text-gray-400 ml-1">
            <Info className="w-3.5 h-3.5" />
            Clique no perfil para ver permissões
          </div>
        </div>

        {/* Role Info Panel */}
        {selectedRoleInfo && (
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-100">
            <div className="flex items-start gap-3">
              <div>
                <p className="text-blue-800 text-sm font-semibold">
                  Permissões do perfil: {selectedRoleInfo}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {ROLE_PERMISSIONS[selectedRoleInfo].map((perm) => (
                    <span key={perm} className="px-2 py-0.5 bg-white border border-blue-200 text-blue-700 text-xs rounded-full">
                      ✓ {perm}
                    </span>
                  ))}
                </div>
              </div>
            <button onClick={() => setSelectedRoleInfo(null)} className="ml-auto text-blue-400 hover:text-blue-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Add User Form */}
        {showAddUser && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h4 className="text-gray-700 text-sm font-semibold mb-3">Novo Usuário</h4>
            <div className="flex flex-wrap gap-3">
              <input
                type="text"
                value={newUser.nome}
                onChange={(e) => setNewUser({ ...newUser, nome: e.target.value })}
                placeholder="Nome completo"
                className="flex-1 min-w-40 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
              <input
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="Email institucional"
                className="flex-1 min-w-52 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
              />
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as Role })}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-500 cursor-pointer"
              >
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <button
                onClick={handleAddUser}
                disabled={!newUser.nome || !newUser.email}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-semibold cursor-pointer"
              >
                Adicionar
              </button>
              <button
                onClick={() => setShowAddUser(false)}
            className="px-4 py-2 border border-gray-300 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-semibold cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Usuário</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Perfil</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Último Acesso</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 text-xs font-bold flex-shrink-0">
                        {user.nome.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                      </div>
                      <span className="text-sm text-gray-700 font-medium">{user.nome}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{user.email}</td>
                  <td className="px-5 py-3 text-center">
                    {editingUser === user.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value as Role)}
                      className="px-2 py-1 border border-gray-300 rounded text-xs bg-white cursor-pointer"
                        >
                          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                    <button onClick={() => handleUpdateRole(user.id)} className="text-emerald-600 hover:text-emerald-700 cursor-pointer">
                          <Check className="w-4 h-4" />
                        </button>
                    <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ROLE_COLORS[user.role]}`}>
                        {user.role}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => handleToggleStatus(user.id)}
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        user.status === "Ativo"
                          ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {user.status}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{user.lastAccess}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => { setEditingUser(user.id); setEditRole(user.role); }}
                    className="p-1.5 text-gray-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar perfil"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remover"
                        disabled={user.role === "Admin"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* LGPD / Audit */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-slate-700 font-semibold text-sm">Conformidade LGPD & Auditoria</h4>
            <p className="text-slate-500 text-xs leading-relaxed mt-1">
              Todas as alterações nestas configurações são registradas em log de auditoria imutável. 
              Dados biométricos são criptografados em repouso (AES-256) e em trânsito (TLS 1.3). 
              Retenção de logs: 5 anos conforme regulamentação. Base legal para tratamento: 
              Art. 7º, III da LGPD (execução de contrato de interesse público).
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {["Log de Auditoria", "Política de Privacidade", "DPA vigente", "Relatório de Impacto (RIPD)"].map((item) => (
            <button key={item} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 text-xs rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
