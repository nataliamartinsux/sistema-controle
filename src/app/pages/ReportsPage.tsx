import { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  Printer,
} from "lucide-react";
import { REPORT_DATA } from "../mockData";

export function ReportsPage() {
  const [startDate, setStartDate] = useState("2026-03-01");
  const [endDate, setEndDate] = useState("2026-03-31");
  const [view, setView] = useState<"table" | "summary">("table");
  const [loading, setLoading] = useState(false);
  const [hasResult, setHasResult] = useState(true);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setHasResult(true);
      setView("table");
    }, 800);
  };

  const totalNormais = REPORT_DATA.reduce((acc, r) => acc + r.normais, 0);
  const totalManuais = REPORT_DATA.reduce((acc, r) => acc + r.manuais, 0);
  const totalRefeicoes = REPORT_DATA.reduce((acc, r) => acc + r.total, 0);
  const totalValor = REPORT_DATA.reduce((acc, r) => acc + r.valor, 0);
  const valorUnitario = 4.50;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900 text-2xl font-bold">Relatórios e Validação Fiscal</h1>
          <p className="text-gray-500 text-sm mt-0.5">Geração de relatórios, exportação e protocolo de validação</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          Acesso restrito: Fiscal e Admin
        </div>
      </div>

      {/* Period Selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="text-gray-800 font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-400" />
          Seleção de Período
        </h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Data Início</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-1.5">Data Fim</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
          <div className="flex gap-2">
            {["Semana atual", "Mês atual", "Mês anterior"].map((label) => (
              <button
                key={label}
                className="px-3 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2.5 bg-slate-900 hover:bg-slate-700 disabled:bg-slate-400 text-white rounded-lg text-sm font-semibold transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Ver em Tela
              </>
            )}
          </button>
        </div>
      </div>

      {hasResult && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <p className="text-gray-500 text-sm">Biométricas</p>
              </div>
              <p className="text-3xl font-bold text-emerald-600">{totalNormais.toLocaleString("pt-BR")}</p>
              <p className="text-gray-400 text-xs mt-1">{((totalNormais / totalRefeicoes) * 100).toFixed(1)}% do total</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-amber-500" />
                <p className="text-gray-500 text-sm">Manuais (Exceções)</p>
              </div>
              <p className="text-3xl font-bold text-amber-600">{totalManuais}</p>
              <p className="text-gray-400 text-xs mt-1">{((totalManuais / totalRefeicoes) * 100).toFixed(1)}% do total</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <p className="text-gray-500 text-sm">Total Refeições</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">{totalRefeicoes.toLocaleString("pt-BR")}</p>
              <p className="text-gray-400 text-xs mt-1">Valor unit.: R$ {valorUnitario.toFixed(2).replace(".", ",")}</p>
            </div>
            <div className="bg-white rounded-xl border-2 border-slate-800 p-5">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-slate-600" />
                <p className="text-gray-500 text-sm">Valor Total a Pagar</p>
              </div>
              <p className="text-3xl font-bold text-slate-800">
                R$ {totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-gray-400 text-xs mt-1">Março/2026</p>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl border border-gray-200 px-5 py-3">
            <div className="flex items-center gap-2">
              <p className="text-gray-600 text-sm font-medium">Exportar relatório:</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
                <Eye className="w-4 h-4" />
                Ver em Tela
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors">
                <Download className="w-4 h-4" />
                Baixar PDF
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors">
                <Download className="w-4 h-4" />
                Baixar CSV
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-semibold transition-colors">
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
            </div>
          </div>

          {/* Detailed Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-gray-800 font-semibold">Resumo por Semana — Março/2026</h3>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                Biométricas
                <div className="w-2 h-2 rounded-full bg-amber-400 ml-2" />
                Manuais
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Período</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Biométricas</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Manuais</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor (R$)</th>
                    <th className="px-5 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {REPORT_DATA.map((row, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-sm text-gray-700 font-medium">{row.periodo}</td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-sm text-emerald-700 font-semibold">{row.normais.toLocaleString("pt-BR")}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                          <span className="text-sm text-amber-700 font-semibold">{row.manuais}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="text-sm text-gray-800 font-bold">{row.total.toLocaleString("pt-BR")}</span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className="text-sm text-gray-800 font-bold">
                          R$ {row.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          row.status === "Validado"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {row.status === "Validado" ? "✓ Validado" : "⏳ Pendente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-900">
                    <td className="px-5 py-4 text-sm text-white font-bold">TOTAL DO PERÍODO</td>
                    <td className="px-5 py-4 text-center text-sm text-emerald-300 font-bold">
                      {totalNormais.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-5 py-4 text-center text-sm text-amber-300 font-bold">{totalManuais}</td>
                    <td className="px-5 py-4 text-center text-sm text-white font-bold">
                      {totalRefeicoes.toLocaleString("pt-BR")}
                    </td>
                    <td className="px-5 py-4 text-right text-sm text-white font-bold">
                      R$ {totalValor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-4" />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Compliance Note */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
            <h4 className="text-slate-700 font-semibold text-sm mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-slate-500" />
              Nota de Conformidade LGPD
            </h4>
            <p className="text-slate-500 text-xs leading-relaxed">
              Este relatório contém dados agregados de consumo alimentar. Informações pessoais dos alunos 
              (biometria, foto, endereço) são omitidas neste documento conforme Art. 7º da Lei nº 13.709/2018. 
              O acesso a dados individuais requer autorização formal e é auditado. 
              Protocolo de geração: SYS-RPT-{new Date().getFullYear()}-{String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0")}.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
