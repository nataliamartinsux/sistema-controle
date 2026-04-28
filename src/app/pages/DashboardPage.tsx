import { useState, useEffect } from "react";
import { useSearchParams } from "react-router";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  Users,
  UtensilsCrossed,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileCheck,
  ChevronRight,
} from "lucide-react";
import {
  HOURLY_DATA,
  WEEKLY_DATA,
  CLASS_DATA,
  OCCURRENCES,
  MEAL_RECORDS_TODAY,
} from "../mockData";

const PIE_COLORS = ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#EF4444", "#EC4899", "#06B6D4", "#84CC16"];

// Pre-compute class data with fill colors to avoid Cell children (which cause recharts key conflicts)
const CLASS_DATA_COLORED = CLASS_DATA.map((item, index) => ({
  ...item,
  fill: PIE_COLORS[index % PIE_COLORS.length],
}));

const TAB_IDS = ["empresa", "fiscal", "gestao"] as const;
type TabId = (typeof TAB_IDS)[number];

const TAB_LABELS: Record<TabId, string> = {
  empresa: "Empresa",
  fiscal: "Fiscal",
  gestao: "Gestão Escolar",
};

const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
        {sub && <p className="text-gray-400 text-xs mt-1">{sub}</p>}
      </div>
      <div className={`p-2.5 rounded-xl bg-opacity-10 ${color.replace("text-", "bg-")}/10`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

function EmpresaTab() {
  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={UtensilsCrossed} label="Refeições Hoje" value={495} sub="Meta: 520" color="text-emerald-600" />
        <StatCard icon={Users} label="Alunos Ativos" value={520} sub="Total matriculados" color="text-blue-600" />
        <StatCard icon={TrendingUp} label="Comparecimento" value="95,2%" sub="↑ 2.1% vs ontem" color="text-violet-600" />
        <StatCard icon={Clock} label="Pico de Acesso" value="12:00" sub="187 refeições na hora" color="text-amber-600" />
      </div>

      {/* Bar Chart - Hourly */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-800 font-semibold">Consumo por Hora — Hoje</h3>
            <p className="text-gray-400 text-xs mt-0.5">31/03/2026</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={HOURLY_DATA} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "#9CA3AF" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }}
              formatter={(value) => [value, "Refeições"]}
            />
            <Bar dataKey="consumo" fill="#10B981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Line Chart - Weekly */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-gray-800 font-semibold">Consumo — Últimos 7 dias</h3>
            <p className="text-gray-400 text-xs mt-0.5">Comparativo com meta diária</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-1 bg-emerald-500 rounded inline-block" />Consumo</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1 bg-gray-300 rounded inline-block border border-dashed" />Previsto</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={WEEKLY_DATA} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
            <XAxis dataKey="dia" tick={{ fontSize: 10, fill: "#9CA3AF" }} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} domain={[380, 560]} />
            <Tooltip
              contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }}
            />
            <Line type="monotone" dataKey="consumo" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} name="Consumo" />
            <Line type="monotone" dataKey="previsto" stroke="#D1D5DB" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Previsto" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Today's records table */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-gray-800 font-semibold mb-4">Últimas Refeições Registradas</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Aluno</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Turma</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Horário</th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase">Tipo</th>
                <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase">Valor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MEAL_RECORDS_TODAY.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700 font-medium">{r.nome}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.serie}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.time}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      r.type === "biometric"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}>
                      {r.type === "biometric" ? "Biométrica" : "Manual"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 text-right font-medium">
                    R$ {r.value.toFixed(2).replace(".", ",")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FiscalTab() {
  const [locked, setLocked] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("Marco 2026");

  const weeklyTotals = [
    { semana: "23/03 – 29/03/2026", normais: 2340, manuais: 41, total: 2381, valor: 10714.50 },
    { semana: "16/03 – 22/03/2026", normais: 2190, manuais: 38, total: 2228, valor: 10026.00 },
    { semana: "09/03 – 15/03/2026", normais: 2280, manuais: 52, total: 2332, valor: 10494.00 },
    { semana: "02/03 – 08/03/2026", normais: 2310, manuais: 45, total: 2355, valor: 10597.50 },
  ];

  return (
    <div className="space-y-5">
      {/* Period Selector + Action */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-gray-800 font-semibold">Validação Fiscal do Período</h3>
            <p className="text-gray-400 text-xs mt-0.5">Gerar protocolo trava edições do período selecionado</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              disabled={locked}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none disabled:opacity-50"
            >
              <option>Marco 2026</option>
              <option>Fevereiro 2026</option>
              <option>Janeiro 2026</option>
            </select>
            <button
              onClick={() => setLocked(true)}
              disabled={locked}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                locked
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg"
              }`}
            >
              <FileCheck className="w-5 h-5" />
              {locked ? "✓ Protocolo Gerado" : "Gerar Protocolo de Validação"}
            </button>
          </div>
        </div>
        {locked && (
          <div className="mt-4 flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <p className="text-blue-800 text-sm font-semibold">
                Protocolo #{Math.floor(Math.random() * 9000 + 1000)}/2026 gerado com sucesso
              </p>
              <p className="text-blue-600 text-xs mt-0.5">
                Período validado em 31/03/2026 às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}. Edições bloqueadas.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Weekly Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-gray-800 font-semibold">Totais por Semana — {selectedPeriod}</h3>
          {locked && <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">🔒 Período Validado</span>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Período</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Biométricas</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Manuais</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Valor (R$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {weeklyTotals.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm text-gray-700 font-medium">{row.semana}</td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-sm text-emerald-700 font-semibold">{row.normais}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-sm text-amber-700 font-semibold">{row.manuais}</span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className="text-sm text-gray-800 font-bold">{row.total}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <span className="text-sm text-gray-800 font-bold">
                      R$ {row.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-slate-800">
              <tr>
                <td className="px-5 py-3 text-sm text-white font-bold">TOTAL DO MÊS</td>
                <td className="px-5 py-3 text-center text-sm text-emerald-300 font-bold">9.120</td>
                <td className="px-5 py-3 text-center text-sm text-amber-300 font-bold">176</td>
                <td className="px-5 py-3 text-center text-sm text-white font-bold">9.296</td>
                <td className="px-5 py-3 text-right text-sm text-white font-bold">R$ 41.832,00</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Exceptions Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-amber-800 text-sm font-semibold">Atenção: 176 liberações manuais no período</p>
          <p className="text-amber-600 text-xs mt-1">
            Representa 1,89% do total de refeições. Dentro do limite aceitável de 5%. 
            Todas as liberações manuais possuem motivo registrado e operador identificado.
          </p>
        </div>
      </div>
    </div>
  );
}

function GestaoTab() {
  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Comparecimento Geral" value="95,2%" sub="Meta: 90%" color="text-emerald-600" />
        <StatCard icon={Users} label="Turmas Monitoradas" value={8} sub="Todas as turmas" color="text-blue-600" />
        <StatCard icon={AlertTriangle} label="Ocorrências (mês)" value={12} sub="↓ 3 vs mês anterior" color="text-amber-600" />
        <StatCard icon={CheckCircle2} label="Taxa Biométrica" value="98,1%" sub="Sem falha" color="text-violet-600" />
      </div>

      {/* Pie Chart - Classes */}
      <div className="grid lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-gray-800 font-semibold mb-4">Comparecimento por Turma</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={CLASS_DATA_COLORED}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #E5E7EB" }}
                formatter={(value) => [value, "Alunos"]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-1 mt-2">
            {CLASS_DATA_COLORED.map((item) => (
              <div key={`legend-${item.name}`} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.fill }} />
                <span className="text-xs text-gray-600">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Occurrences */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 font-semibold">Ocorrências Recentes</h3>
            <button className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700">
              Ver todas <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {OCCURRENCES.map((occ) => (
              <div key={occ.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  occ.type === "Falha Biométrica" ? "bg-amber-400" :
                  occ.type === "Comportamento" ? "bg-red-400" : "bg-blue-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      occ.type === "Falha Biométrica" ? "bg-amber-100 text-amber-700" :
                      occ.type === "Comportamento" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {occ.type}
                    </span>
                    <span className="text-xs text-gray-400 flex-shrink-0">{occ.date} {occ.time}</span>
                  </div>
                  <p className="text-gray-600 text-xs mt-1 leading-relaxed">{occ.description}</p>
                  {occ.nome && (
                    <p className="text-gray-400 text-xs mt-1">Aluno: {occ.nome}</p>
                  )}
                  <p className="text-gray-400 text-xs">Operador: {occ.operator}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bar chart per class */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-gray-800 font-semibold mb-4">Consumo por Turma — Hoje</h3>
        <div className="space-y-3">
          {CLASS_DATA_COLORED.map((item) => {
            const maxVal = Math.max(...CLASS_DATA.map((d) => d.value));
            const pct = Math.round((item.value / maxVal) * 100);
            return (
              <div key={`bar-${item.name}`} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-16 shrink-0 text-right">{item.name}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full rounded-full flex items-center justify-end pr-2 transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: item.fill }}
                  >
                    <span className="text-white text-xs font-semibold">{item.value}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<TabId>("empresa");
  const [searchParams, setSearchParams] = useSearchParams();
  // Lê o valor que foi definido lá na SettingsPage
  const diasUteis = parseInt(localStorage.getItem('sysmerenda_dias_uteis') || '22');
  // Exemplo de uso no cálculo:
  const totalAlunos = 520;
  const metaMensal = totalAlunos * diasUteis;

  useEffect(() => {
    const error = searchParams.get("error");
    const access = searchParams.get("access");
    const refresh = searchParams.get("refresh");
    const papel = searchParams.get("papel");

    if (error) {
      alert(`Erro no login com Google: ${error}`);
      setSearchParams({});
    } else if (access) {
      localStorage.setItem("sysmerenda_access", access);
      localStorage.setItem("sysmerenda_refresh", refresh || "");
      localStorage.setItem("sysmerenda_papel", papel || "");
      
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-gray-900 text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-0.5">Visão consolidada por perfil — 31/03/2026</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1.5 flex gap-1">
        {TAB_IDS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab
                ? "bg-slate-900 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "empresa" && <EmpresaTab />}
      {activeTab === "fiscal" && <FiscalTab />}
      {activeTab === "gestao" && <GestaoTab />}
    </div>
  );
}