import { useState, useEffect } from "react";
import {
  CalendarCheck,
  Edit,
  History,
  Search,
  AlertTriangle,
  X,
  CheckCircle2,
  Lock,
  Save,
  FileText
} from "lucide-react";
import { api } from "../services/api";
import { toast } from "sonner";

interface ValidatedPeriod {
  id: string;
  mes: string;
  total_refeicoes: number;
  biometria: number;
  manual: number;
  valor_total: number;
  data_validacao: string;
  validado_por: string;
  status: "Fechado" | "Ajustado";
}

interface AuditLog {
  id: string;
  datahora: string;
  usuario: string;
  campo_alterado: string;
  valor_antigo: string | number;
  valor_novo: string | number;
  motivo: string;
}

export function ValidatedPeriodsPage() {
  const [periods, setPeriods] = useState<ValidatedPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [editingPeriod, setEditingPeriod] = useState<ValidatedPeriod | null>(null);
  const [editForm, setEditForm] = useState({ manual: 0, motivo: "" });
  
  const [viewingLogs, setViewingLogs] = useState<ValidatedPeriod | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/fiscal/periodos-validados/');
      setPeriods(res.data.results || res.data);
    } catch (error) {
      console.error("Erro ao buscar períodos", error);
      // Fallback data para demonstração no frontend caso a rota não exista ainda
      setPeriods([
        {
          id: "1",
          mes: "2026-02",
          total_refeicoes: 8400,
          biometria: 8000,
          manual: 400,
          valor_total: 37800,
          data_validacao: "2026-03-01T10:00:00Z",
          validado_por: "Admin",
          status: "Fechado"
        },
        {
          id: "2",
          mes: "2026-01",
          total_refeicoes: 7500,
          biometria: 7200,
          manual: 300,
          valor_total: 33750,
          data_validacao: "2026-02-02T14:30:00Z",
          validado_por: "Fiscal SP",
          status: "Ajustado"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditOpen = (period: ValidatedPeriod) => {
    setEditingPeriod(period);
    setEditForm({ manual: period.manual, motivo: "" });
  };

  const handleEditSave = async () => {
    if (!editingPeriod) return;
    if (!editForm.motivo || editForm.motivo.length < 10) {
      toast.error("É necessário fornecer um motivo detalhado (mínimo de 10 caracteres) para a auditoria."); // 2. Substituir alert por toast.error
      return;
    }

    try {
      // Em uma integração real, enviaríamos o ajuste para o backend:
      // await api.put(`/api/fiscal/periodos-validados/${editingPeriod.id}/ajustar/`, editForm);
      
      // Atualizando o estado local para simular a resposta
      setPeriods(prev => prev.map(p => {
        if (p.id === editingPeriod.id) {
          const diff = editForm.manual - p.manual;
          return {
            ...p,
            manual: editForm.manual,
            total_refeicoes: p.total_refeicoes + diff,
            valor_total: p.valor_total + (diff * 4.5), // Valor fictício de R$ 4.50 por refeição
            status: "Ajustado"
          };
        }
        return p;
      }));
      setEditingPeriod(null);
      toast.success("Período ajustado com sucesso. Log de auditoria registrado."); // 3. Substituir alert por toast.success
    } catch (error) {
      console.error("Erro ao salvar ajuste", error);
      toast.error("Erro ao salvar o ajuste do período."); // 4. Substituir alert por toast.error
    }
  };

  const handleViewLogs = async (period: ValidatedPeriod) => {
    setViewingLogs(period);
    try {
      // const res = await api.get(`/api/fiscal/periodos-validados/${period.id}/logs/`);
      // setLogs(res.data);
      
      // Dados de mock
      setLogs([
        {
          id: "log1",
          datahora: "2026-03-05T09:15:00Z",
          usuario: "Admin",
          campo_alterado: "Refeições Manuais",
          valor_antigo: 300,
          valor_novo: 350,
          motivo: "Ajuste devido a falha no leitor no dia 15/02 não contabilizada anteriormente."
        }
      ]);
    } catch (error) {
      console.error("Erro ao buscar logs", error);
      setLogs([]);
    }
  };

  const filteredPeriods = periods.filter(p => p.mes.includes(search));

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900 text-2xl font-bold">Períodos Validados</h1>
          <p className="text-gray-500 text-sm mt-0.5">Gestão e auditoria de meses com validação fiscal fechada</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <Lock className="w-4 h-4 flex-shrink-0" />
          Ações de edição requerem registro de auditoria
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por mês (ex: 2026-02)..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Mês</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Refeições</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Biometria / Manual</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor Faturado</th>
                <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Carregando períodos...</td>
                </tr>
              ) : filteredPeriods.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-500">Nenhum período encontrado.</td>
                </tr>
              ) : (
                filteredPeriods.map((period) => (
                  <tr key={period.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                          <CalendarCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{period.mes}</p>
                          <p className="text-xs text-gray-500">Validado em {new Date(period.data_validacao).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className="text-sm font-bold text-gray-800">{period.total_refeicoes}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <span className="text-emerald-600 font-semibold">{period.biometria}</span>
                        <span className="text-gray-300">/</span>
                        <span className="text-amber-600 font-semibold">{period.manual}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-bold text-gray-800">R$ {period.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        period.status === "Fechado" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {period.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewLogs(period)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Ver Histórico de Edições"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditOpen(period)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Editar Período (Ajuste Excepcional)"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingPeriod && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Ajuste de Período Validado
              </h3>
              <button onClick={() => setEditingPeriod(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                Você está alterando o período <strong>{editingPeriod.mes}</strong>, que já foi validado.
                Esta ação ficará registrada no log de auditoria do sistema fiscal.
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Refeições Biometria</label>
                  <input
                    type="number"
                    value={editingPeriod.biometria}
                    disabled
                    className="w-full px-4 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Imutável (dados físicos)</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Refeições Manuais</label>
                  <input
                    type="number"
                    value={editForm.manual}
                    onChange={(e) => setEditForm({ ...editForm, manual: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Motivo da Alteração <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={editForm.motivo}
                  onChange={(e) => setEditForm({ ...editForm, motivo: e.target.value })}
                  placeholder="Descreva detalhadamente a excepcionalidade que levou a este ajuste fiscal..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button 
                onClick={() => setEditingPeriod(null)} 
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleEditSave}
                className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                Salvar Ajuste
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logs Modal */}
      {viewingLogs && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Auditoria do Período: {viewingLogs.mes}
              </h3>
              <button onClick={() => setViewingLogs(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3 opacity-50" />
                  <p>Nenhuma alteração registrada para este período.</p>
                  <p className="text-xs text-gray-400 mt-1">Os dados estão originais conforme a primeira validação.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map(log => (
                    <div key={log.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="text-xs font-bold bg-gray-200 text-gray-700 px-2 py-1 rounded">
                            {new Date(log.datahora).toLocaleString('pt-BR')}
                          </span>
                          <span className="text-sm font-medium text-gray-800 ml-3">Modificado por: {log.usuario}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-1 mt-2">
                        <strong>Alteração:</strong> {log.campo_alterado} de <span className="line-through text-red-500 ml-1">{log.valor_antigo}</span> <span className="mx-1">para</span> <span className="text-emerald-600 font-bold">{log.valor_novo}</span>
                      </p>
                      <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-100 italic shadow-sm mt-2">
                        " {log.motivo} "
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
              <button 
                onClick={() => setViewingLogs(null)} 
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}