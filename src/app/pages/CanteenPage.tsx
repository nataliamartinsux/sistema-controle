import { useState, useRef } from "react";
import {
  Fingerprint,
  CheckCircle2,
  XCircle,
  Search,
  X,
  AlertTriangle,
  Clock,
  User,
  ChevronRight,
  Wifi,
  WifiOff,
  ClipboardList,
  Zap,
} from "lucide-react";
import { STUDENTS, MANUAL_REASONS, MEAL_RECORDS_TODAY, type Student } from "../mockData";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

type CanteenState = "idle" | "success" | "blocked";
type BlockReason = "Refeição já consumida hoje" | "Aluno Inativo" | "Biometria não cadastrada";

interface ConsumedRecord {
  studentId: string;
  time: string;
}

export function CanteenPage() {
  const [state, setState] = useState<CanteenState>("idle");
  const [hexCode, setHexCode] = useState("");
  const [blockReason, setBlockReason] = useState<BlockReason>("Refeição já consumida hoje");
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showOccurrenceModal, setShowOccurrenceModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [manualReason, setManualReason] = useState("");
  const [occurrenceType, setOccurrenceType] = useState("");
  const [occurrenceDesc, setOccurrenceDesc] = useState("");
  const [consumedToday, setConsumedToday] = useState<ConsumedRecord[]>(
    MEAL_RECORDS_TODAY.map((r) => ({ studentId: r.studentId, time: r.time }))
  );
  const [readerOnline, setReaderOnline] = useState(true);
  const [successCount, setSuccessCount] = useState(MEAL_RECORDS_TODAY.length);
  const [notification, setNotification] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentTime = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const resetToIdle = (delay = 5000) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setState("idle");
      setCurrentStudent(null);
    }, delay);
  };

  const simulateSuccess = (student?: Student) => {
    const s = student || STUDENTS.find((s) => !consumedToday.find((c) => c.studentId === s.id) && s.status === "Ativo");
    if (!s) {
      simulateBlock("Refeição já consumida hoje");
      return;
    }
    setState("success");
    setCurrentStudent(s);
    const now = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    setConsumedToday((prev) => [...prev, { studentId: s.id, time: now }]);
    setSuccessCount((c) => c + 1);
    resetToIdle();
  };

  const simulateBlock = (reason: BlockReason) => {
    const student = STUDENTS.find((s) => {
      if (reason === "Refeição já consumida hoje") return consumedToday.find((c) => c.studentId === s.id);
      if (reason === "Aluno Inativo") return s.status === "Inativo";
      return true;
    });
    setState("blocked");
    setBlockReason(reason);
    setCurrentStudent(student || STUDENTS[0]);
    resetToIdle();
  };

  const filteredStudents = STUDENTS.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.registration.includes(searchQuery)
  );

  const handleManualRelease = () => {
    if (!selectedStudent || !manualReason) return;
    simulateSuccess(selectedStudent);
    setShowSearchModal(false);
    setSelectedStudent(null);
    setManualReason("");
    setSearchQuery("");
    showNotification(`✅ Liberação manual registrada para ${selectedStudent.name}`);
  };

  const handleOccurrence = () => {
    if (!occurrenceType || !occurrenceDesc) return;
    setShowOccurrenceModal(false);
    setOccurrenceType("");
    setOccurrenceDesc("");
    showNotification("📋 Ocorrência registrada com sucesso");
  };

  // Função central para processar o código
  const processHexCode = (code: string) => {
    const student = STUDENTS.find(s => 
      s.biometricCodes.includes(code.toUpperCase())
    );
    
    if (student) {
      simulateSuccess(student);
    } else {
      simulateBlock("Biometria não cadastrada");
    }
    
    setHexCode(""); // Limpa o campo após a leitura
  };

  const handleHexSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hexCode) processHexCode(hexCode);
  };

  // Função que escuta a digitação e envia automaticamente
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHexCode(value);

    // Se atingir exatamente 1024 caracteres, dispara a validação
    if (value.length === 1024) {
      processHexCode(value);
    }
  };

  return (
    <div className="min-h-full flex flex-col">
      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl text-sm flex items-center gap-2 animate-fade-in">
          {notification}
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${readerOnline ? "bg-emerald-900/50 text-emerald-300" : "bg-red-900/50 text-red-300"}`}>
            {readerOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            Leitor Biométrico: {readerOnline ? "Online" : "Offline"}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-white">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-lg font-mono font-bold">{currentTime}</span>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs">Refeições hoje</p>
            <p className="text-emerald-400 text-xl font-bold">{successCount}</p>
          </div>
        </div>
      </div>

      {/* Main Area */}
      <div
        className={`flex-1 flex flex-col items-center justify-center p-8 transition-all duration-500 ${
          state === "success"
            ? "bg-emerald-50"
            : state === "blocked"
            ? "bg-red-50"
            : "bg-gray-100"
        }`}
      >
        {/* IDLE STATE */}
        {state === "idle" && (
          <div className="text-center">
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="absolute w-48 h-48 bg-slate-200 rounded-full animate-ping opacity-20" />
              <div className="absolute w-36 h-36 bg-slate-300 rounded-full animate-pulse opacity-30" />
              <div className="relative w-40 h-40 bg-white rounded-full shadow-2xl flex items-center justify-center border-4 border-slate-200">
                <Fingerprint className="w-20 h-20 text-slate-400" strokeWidth={1.5} />
              </div>
            </div>
            
            <h2 className="text-slate-700 text-4xl font-bold mb-2">Aguardando Leitura</h2>
            <p className="text-slate-500 text-xl mb-6">Aproxime o dedo ou insira a biometria</p>
            
            {/* Formulário de Input Hexadecimal */}
            <form onSubmit={handleHexSubmit} className="max-w-xs mx-auto mb-6">
              <input
                type="text"
                value={hexCode}
                onChange={handleHexChange}
                maxLength={1024}           /* <-- Limite máximo para evitar bugs */
                placeholder="Código da digital..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl text-xl font-mono uppercase focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-center"
                autoFocus
              />
              <button type="submit" className="hidden">Enviar</button>
            </form>

            <p className="text-slate-400 text-base">Horário de funcionamento: 07:00 – 14:00</p>
          </div>
        )}

        {/* SUCCESS STATE */}
        {state === "success" && currentStudent && (
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-emerald-400">
              {/* Header */}
              <div className="bg-emerald-500 px-8 py-6 flex items-center gap-4">
                <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2} />
                <div>
                  <p className="text-emerald-100 text-base font-medium">ACESSO</p>
                  <p className="text-white text-5xl font-black tracking-wide">LIBERADO</p>
                </div>
              </div>
              {/* Student Info */}
              <div className="p-8 flex items-center gap-6">
                <div className="w-28 h-28 rounded-2xl overflow-hidden border-3 border-emerald-200 shadow-md flex-shrink-0">
                  <ImageWithFallback
                    src={currentStudent.photo}
                    alt={currentStudent.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-gray-800 text-3xl font-bold leading-tight">{currentStudent.name}</p>
                  <div className="mt-2 space-y-1">
                    <p className="text-gray-500 text-lg">
                      <span className="font-medium text-gray-700">Matrícula:</span> {currentStudent.registration}
                    </p>
                    <p className="text-gray-500 text-lg">
                      <span className="font-medium text-gray-700">Turma:</span> {currentStudent.grade}
                    </p>
                    <p className="text-emerald-600 text-base font-medium flex items-center gap-1">
                      <Fingerprint className="w-4 h-4" />
                      Biometria validada
                    </p>
                  </div>
                </div>
              </div>
              <div className="px-8 pb-6">
                <div className="bg-emerald-50 rounded-xl px-4 py-3 text-center">
                  <p className="text-emerald-700 text-base font-medium">
                    ✓ Refeição registrada às {new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BLOCKED STATE */}
        {state === "blocked" && (
          <div className="w-full max-w-lg">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-red-400">
              {/* Header */}
              <div className="bg-red-500 px-8 py-6 flex items-center gap-4">
                <XCircle className="w-14 h-14 text-white" strokeWidth={2} />
                <div>
                  <p className="text-red-100 text-base font-medium">ACESSO</p>
                  <p className="text-white text-5xl font-black tracking-wide">BLOQUEADO</p>
                </div>
              </div>
              {/* Info */}
              <div className="p-8">
                {currentStudent && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-red-200 shadow flex-shrink-0 opacity-70">
                      <ImageWithFallback
                        src={currentStudent.photo}
                        alt={currentStudent.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-gray-700 text-2xl font-bold">{currentStudent.name}</p>
                      <p className="text-gray-500 text-base">{currentStudent.registration} • {currentStudent.grade}</p>
                    </div>
                  </div>
                )}
                <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 text-lg font-bold">Motivo do Bloqueio</p>
                    <p className="text-red-700 text-base mt-1">{blockReason}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-base font-semibold transition-colors"
          >
            <Search className="w-5 h-5" />
            Busca Manual
          </button>
          <button
            onClick={() => setShowOccurrenceModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-base font-semibold transition-colors"
          >
            <ClipboardList className="w-5 h-5" />
            Registrar Ocorrência
          </button>
        </div>

        {/* Dev Test Buttons */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl border border-dashed border-slate-300">
          <Zap className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 text-xs font-medium mr-1">DEV</span>
          <button
            onClick={() => simulateSuccess()}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            ✓ Simular Sucesso
          </button>
          <button
            onClick={() => simulateBlock("Refeição já consumida hoje")}
            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            ✗ Já Consumiu
          </button>
          <button
            onClick={() => simulateBlock("Aluno Inativo")}
            className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            ✗ Inativo
          </button>
          <button
            onClick={() => setReaderOnline(!readerOnline)}
            className="px-3 py-1.5 bg-slate-500 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Toggle Reader
          </button>
        </div>
      </div>

      {/* Recent Activity Strip */}
      <div className="bg-slate-800 px-6 py-3">
        <div className="flex items-center gap-4 overflow-x-auto">
          <span className="text-slate-400 text-xs font-medium flex-shrink-0">ÚLTIMAS ENTRADAS:</span>
          {consumedToday.slice(-5).reverse().map((record, idx) => {
            const student = STUDENTS.find((s) => s.id === record.studentId);
            return (
              <div key={idx} className="flex items-center gap-2 flex-shrink-0 bg-slate-700 rounded-lg px-3 py-1.5">
                <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                  <User className="w-3 h-3 text-white" />
                </div>
                <span className="text-white text-xs font-medium">
                  {student ? student.name.split(" ")[0] : "Aluno"}
                </span>
                <span className="text-slate-400 text-xs">{record.time}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Liberação Manual</h3>
              <button onClick={() => { setShowSearchModal(false); setSelectedStudent(null); setManualReason(""); setSearchQuery(""); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {!selectedStudent ? (
                <>
                  <p className="text-gray-500 text-sm mb-4">Pesquise o aluno pelo nome ou matrícula</p>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Nome ou matrícula..."
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {filteredStudents.map((student) => {
                      const alreadyConsumed = consumedToday.find((c) => c.studentId === student.id);
                      return (
                        <button
                          key={student.id}
                          onClick={() => setSelectedStudent(student)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            <ImageWithFallback src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-800 font-medium text-sm truncate">{student.name}</p>
                            <p className="text-gray-500 text-xs">{student.registration} • {student.grade}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {alreadyConsumed && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                Já comeu
                              </span>
                            )}
                            {student.status === "Inativo" && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-medium">
                                Inativo
                              </span>
                            )}
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                          </div>
                        </button>
                      );
                    })}
                    {filteredStudents.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <User className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhum aluno encontrado</p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Selected student confirmation */}
                  <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 mb-5">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-slate-200 flex-shrink-0">
                      <ImageWithFallback src={selectedStudent.photo} alt={selectedStudent.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-gray-800 text-base font-bold">{selectedStudent.name}</p>
                      <p className="text-gray-500 text-sm">{selectedStudent.registration} • {selectedStudent.grade}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block ${selectedStudent.status === "Ativo" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {selectedStudent.status}
                      </span>
                    </div>
                    <button onClick={() => setSelectedStudent(null)} className="ml-auto text-gray-400 hover:text-gray-600">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Motivo da Liberação Manual <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={manualReason}
                      onChange={(e) => setManualReason(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white"
                      required
                    >
                      <option value="">— Selecione um motivo —</option>
                      {MANUAL_REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    {!manualReason && (
                      <p className="text-amber-600 text-xs mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Campo obrigatório para auditoria
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            {selectedStudent && (
              <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => { setShowSearchModal(false); setSelectedStudent(null); setManualReason(""); setSearchQuery(""); }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleManualRelease}
                  disabled={!manualReason}
                  className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold transition-colors"
                >
                  Liberar Refeição
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Occurrence Modal */}
      {showOccurrenceModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Registrar Ocorrência</h3>
              <button onClick={() => setShowOccurrenceModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Tipo de Ocorrência <span className="text-red-500">*</span>
                </label>
                <select
                  value={occurrenceType}
                  onChange={(e) => setOccurrenceType(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="">— Selecione —</option>
                  <option value="Falha Biométrica">Falha Biométrica</option>
                  <option value="Comportamento">Comportamento Inadequado</option>
                  <option value="Equipamento">Problema de Equipamento</option>
                  <option value="Sistema">Problema de Sistema</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={occurrenceDesc}
                  onChange={(e) => setOccurrenceDesc(e.target.value)}
                  placeholder="Descreva detalhadamente a ocorrência..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                Esta ocorrência será registrada com data/hora, operador e ficará disponível para auditoria fiscal.
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button onClick={() => setShowOccurrenceModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">
                Cancelar
              </button>
              <button
                onClick={handleOccurrence}
                disabled={!occurrenceType || !occurrenceDesc}
                className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold"
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}