import { useState } from "react";
import {
  Plus,
  Upload,
  Search,
  Filter,
  Edit,
  Trash2,
  X,
  User,
  Camera,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { STUDENTS, type Student, type StudentStatus } from "../mockData";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const GRADES = ["6º Ano A", "6º Ano B", "7º Ano A", "7º Ano C", "8º Ano A", "8º Ano B", "9º Ano A", "9º Ano B"];

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(STUDENTS);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | StudentStatus>("");
  const [filterGrade, setFilterGrade] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [showBiometricCodes, setShowBiometricCodes] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
  nome: "",
  matricula: "",
  data_nascimento: "",
  serie: "",
  curso: "",
  turma: "",
  ativo: true,
  bio1: "",
  bio2: "",
  bio3: "",
  photoPreview: "",
  foto: null as File | null,
});

const openAdd = () => {
  setEditingStudent(null);
  setFormData({
    nome: "", matricula: "", data_nascimento: "", serie: "", 
    curso: "", turma: "", ativo: true, bio1: "", bio2: "", 
    bio3: "", photoPreview: "", foto: null 
  });
  setShowModal(true);
};

  const ITEMS_PER_PAGE = 6;

  const filtered = students.filter((s) => {
    const matchSearch =
      s.nome.toLowerCase().includes(search.toLowerCase()) ||
      s.matricula.includes(search);
    const matchStatus = filterStatus === "Ativo" ? s.ativo === true : 
                        filterStatus === "Inativo" ? s.ativo === false : true;
    const matchGrade = filterGrade ? s.serie === filterGrade : true;
    return matchSearch && matchStatus && matchGrade;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const openEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      nome: student.nome,
      matricula: student.matricula,
      data_nascimento: student.data_nascimento,
      serie: student.serie,
      curso: student.curso || "",
      turma: student.turma || "",
      ativo: student.ativo,
      bio1: student.biometricCodes[0],
      bio2: student.biometricCodes[1],
      bio3: student.biometricCodes[2],
      photoPreview: student.foto || "",
      foto: null,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.nome || !formData.matricula || !formData.serie) return;
    if (editingStudent) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingStudent.id
            ? { ...s, nome: formData.nome, matricula: formData.matricula, data_nascimento: formData.data_nascimento, serie: formData.serie, curso: formData.curso, turma: formData.turma, ativo: formData.ativo, biometricCodes: [formData.bio1, formData.bio2, formData.bio3] }
            : s
        )
      );
    } else {
      const newStudent: Student = {
        id: String(Date.now()),
        nome: formData.nome,
        matricula: formData.matricula,
        data_nascimento: formData.data_nascimento,
        serie: formData.serie,
        curso: formData.curso,
        turma: formData.turma,
        ativo: formData.ativo,
        foto: "https://images.unsplash.com/photo-1681070909604-f555aa006564?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
        biometricCodes: [formData.bio1 || "A0000000", formData.bio2 || "B0000000", formData.bio3 || "C0000000"],
        hasConsumedToday: false,
      };
      setStudents((prev) => [...prev, newStudent]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Confirmar exclusão deste aluno?")) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ 
          ...prev, 
          photoPreview: reader.result as string,
          foto: file // Campo que o backend espera 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleStatus = (id: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, ativo: !s.ativo } : s
      )
    );
  };

  return (
    <div className="p-6 space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-gray-900 text-2xl font-bold">Gestão de Alunos</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {students.length} alunos cadastrados • {students.filter((s) => s.ativo).length} ativos
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Importar CSV
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <Plus className="w-4 h-4" />
            Adicionar Aluno
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Buscar por nome ou matrícula..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as "" | StudentStatus); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-white focus:ring-2 focus:ring-slate-500"
          >
            <option value="">Todos os status</option>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
          <select
            value={filterGrade}
            onChange={(e) => { setFilterGrade(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none bg-white focus:ring-2 focus:ring-slate-500"
          >
            <option value="">Todas as turmas</option>
            {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div className="text-sm text-gray-500 ml-auto">
          {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-16">Foto</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nome</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Matrícula</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Turma</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Refeição Hoje</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((student) => (
                <tr key={student.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                  
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                        <ImageWithFallback
                          src={student.foto} 
                          alt={student.nome} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{student.nome}</p>
                        <p className="text-xs text-gray-500">{student.matricula}</p>
                      </div>
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-700 font-medium">{student.serie}</span>
                      <span className="text-xs text-gray-400">{student.turma || 'Sem turma'}</span>
                    </div>
                  </td>

                  <td className="p-4">
                    <Badge variant={student.ativo ? "success" : "secondary"} className="rounded-full font-medium">
                      {student.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      student.hasConsumedToday
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {student.hasConsumedToday ? "✓ Consumiu" : "Pendente"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(student)}
                        className="p-1.5 text-gray-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              Página {currentPage} de {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Student Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">
                {editingStudent ? "Editar Aluno" : "Adicionar Aluno"}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {/* Photo Upload */}
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-50 flex-shrink-0">
                  <Camera className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-400">Foto</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Foto do Aluno</p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG até 5MB. A foto é exibida na validação biométrica.</p>
                  <div className="flex items-center gap-2 mt-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-600">Dados biométricos protegidos pela LGPD</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Nome Completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Matrícula <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.matricula}
                    onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Número da matrícula"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Data de Nascimento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Série (Ano) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serie}
                    onChange={(e) => setFormData({ ...formData, serie: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Ex: 7EF"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.curso}
                    onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Curso"
                  />
                  <input
                    type="text"
                    value={formData.turma}
                    onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Turma"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                  <div className="flex gap-3">
                    {(["Ativo", "Inativo"] as StudentStatus[]).map((s) => (
                      <select
                        value={formData.ativo ? "true" : "false"}
                        onChange={(e) => setFormData({ ...formData, ativo: e.target.value === "true" })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                        <option value="true">Ativo</option>
                        <option value="false">Inativo</option>
                      </select>
                    ))}
                  </div>
                </div>
              </div>

              {/* Biometric Codes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Códigos Hexadecimais da Digital
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowBiometricCodes(!showBiometricCodes)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    {showBiometricCodes ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {showBiometricCodes ? "Ocultar" : "Exibir"}
                  </button>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Dados biométricos sensíveis (LGPD Art. 5º, II). Acesso restrito a operadores autorizados. 
                    Registro de acesso auditado.
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Digital 1 (Indicador)", key: "bio1" as keyof typeof formData },
                    { label: "Digital 2 (Médio)", key: "bio2" as keyof typeof formData },
                    { label: "Digital 3 (Backup)", key: "bio3" as keyof typeof formData },
                  ].map(({ label, key }) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-36 flex-shrink-0">{label}</span>
                      <input
                        type={showBiometricCodes ? "text" : "password"}
                        value={formData[key]}
                        onChange={(e) => setFormData({ ...formData, [key]: e.target.value.toUpperCase() })}
                        placeholder="Ex: A3F8C2D1"
                        maxLength={8}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 font-mono"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.nome || !formData.matricula || !formData.serie}
                className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold"
              >
                {editingStudent ? "Salvar Alterações" : "Cadastrar Aluno"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Importar Alunos via CSV</h3>
              <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 cursor-pointer transition-colors">
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 text-sm font-medium">Clique para selecionar o arquivo CSV</p>
                <p className="text-gray-400 text-xs mt-1">ou arraste e solte aqui</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Formato esperado do CSV:</p>
                <pre className="text-xs text-gray-500 font-mono bg-white border border-gray-200 rounded-lg p-3">
                  nome,matricula,turma,status,digital1,digital2,digital3{"\n"}
                  João Silva,2024010,9A,Ativo,A3F8C2D1,B7E4A9F2,C1D6B3E8
                </pre>
              </div>
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  A importação será auditada. Dados biométricos são criptografados em repouso conforme LGPD.
                  Matrículas duplicadas serão ignoradas.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button onClick={() => setShowImportModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50">
                Cancelar
              </button>
              <button
                onClick={() => { setShowImportModal(false); }}
                className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold"
              >
                Importar Arquivo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}