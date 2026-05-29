import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { api } from "../services/api";
import { Student, StudentStatus } from "../types";

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  // 1. Função para buscar os alunos do banco de dados
  const fetchStudents = async () => {
    try {
      // Puxa da rota /api/estudantes/ (que está configurada no seu router do urls.py)
      const response = await api.get('/api/estudantes/');
      
      // Lida com API paginada (ex: Django) onde os dados vêm dentro de "results"
      const data = response.data.results || response.data;
      console.log("Dados recebidos da API (Alunos):", data);
      
      if (Array.isArray(data)) {
        setStudents(data);
      } else {
        console.error("A API não retornou um array de alunos:", response.data);
        setApiError("Formato de dados incorreto recebido do servidor.");
      }
    } catch (error: any) {
      console.error("Erro ao carregar alunos reais:", error);
      if (error.response?.status === 404) {
        const urlTentada = error.config ? `${error.config.baseURL || ''}${error.config.url}` : '/api/estudantes/';
        setApiError(`Erro 404: O backend não encontrou a rota (${urlTentada}). Verifique os nomes das rotas no seu urls.py!`);
      } else if (error.response?.status === 401) {
        setApiError("Erro 401: Acesso não autorizado. Sua sessão expirou ou o token é inválido.");
      } else if (error.message === "Network Error") {
        setApiError("Erro de Rede (CORS). O Django bloqueou a requisição ou o servidor está desligado.");
      } else {
        setApiError("Falha de conexão com a API. Verifique se o servidor está rodando.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Executa a busca assim que a tela carregar
  useEffect(() => {
    fetchStudents();
  }, []);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"" | StudentStatus>("");
  const [filterGrade, setFilterGrade] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    nome: "",
    matricula: "",
    data_nascimento: "",
    curso: "",
    turma: "",
    ativo: true,
    photoPreview: "",
    foto: null as File | null,
  });
  const [turmas, setTurmas] = useState<any[]>([]);
  const [cursos, setCursos] = useState<any[]>([]);
  const [isTurmaModalOpen, setIsTurmaModalOpen] = useState(false);
  const [novaTurmaNome, setNovaTurmaNome] = useState("");
  const carregarTurmas = async () => {
    try {
      const response = await api.get('/api/turmas/');
      console.log("Turmas recebidas da API:", response.data);
      
      let data = response.data;
      // Extrai a array caso o backend coloque dentro de uma chave diferente (results, data, turmas, etc.)
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = data.results || data.data || data.turmas || Object.values(data).find(Array.isArray) || [];
      }
      
      setTurmas(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Erro ao buscar turmas", error);
      if (error.response?.status === 404) console.error("A rota de turmas não foi encontrada (404).");
      setTurmas([]);
    }
  };

  const carregarCursos = async () => {
    try {
      const response = await api.get('/api/cursos/');
      console.log("Cursos recebidos da API:", response.data);
      
      let data = response.data;
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        data = data.results || data.data || data.cursos || Object.values(data).find(Array.isArray) || [];
      }
      
      setCursos(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error("Erro ao buscar cursos", error);
      setCursos([]);
    }
  };

  useEffect(() => {
    carregarTurmas();
    carregarCursos();
  }, []);

  const handleSaveTurma = async () => {
    if (!novaTurmaNome) return;
    try {
      const response = await api.post('/api/turmas/', { nome: novaTurmaNome });
      
      setTurmas((prev) => [...prev, response.data]);
      // Vincula a turma recém-criada ao aluno que está sendo cadastrado
      setFormData((prev) => ({ ...prev, turma: response.data.id })); 
      
      setIsTurmaModalOpen(false);
      setNovaTurmaNome("");
    } catch (error: any) {
      console.error("Erro ao criar turma:", error);
      const errorMessage = error.response?.data?.nome?.[0] || error.response?.data?.detail || "Verifique se a turma já existe ou os dados estão corretos.";
      alert(`Erro ao criar turma: ${errorMessage}`);
    }
  };

const openAdd = () => {
  setEditingStudent(null);
  setFormData({ nome: "", matricula: "", data_nascimento: "", curso: "", turma: "", ativo: true, photoPreview: "", foto: null });
  setShowModal(true);
};

  const ITEMS_PER_PAGE = 6;

  const filtered = students.filter((s) => {
    const matchSearch =
      (s.nome || "").toLowerCase().includes(search.toLowerCase()) ||
      String(s.matricula || "").includes(search);
    const matchStatus = filterStatus === "Ativo" ? s.ativo === true : 
                        filterStatus === "Inativo" ? s.ativo === false : true;
    const matchGrade = filterGrade ? String(s.turma) === filterGrade || s.turma === filterGrade : true;
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
      curso: student.curso || "",
      turma: student.turma || "",
      ativo: student.ativo,
      photoPreview: student.foto_url || student.foto || "",
      foto: null,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.nome || !formData.matricula || !formData.curso || !formData.turma) return;

    try {
      const payload = new FormData();
      payload.append("nome", formData.nome);
      payload.append("matricula", formData.matricula);
      payload.append("data_nascimento", formData.data_nascimento);
      payload.append("curso", formData.curso);
      payload.append("turma", formData.turma);
      payload.append("ativo", String(formData.ativo));
      // Backend não expõe campos biométricos diretamente no model Student

      if (formData.foto) {
        payload.append("foto", formData.foto);
      }

      if (editingStudent) {
        await api.put(`/api/estudantes/${editingStudent.id}/`, payload, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        await api.post("/api/estudantes/", payload, { headers: { "Content-Type": "multipart/form-data" } });
      }

      fetchStudents(); // Atualiza a lista com o banco de dados
      setShowModal(false);
    } catch (error) {
      console.error("Erro ao salvar aluno:", error);
      alert("Ocorreu um erro ao salvar o aluno. Verifique os dados.");
    }
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

  // Função para importar o CSV
  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      const uint8Array = new Uint8Array(buffer);
      
      let text = "";
      try {
        // Tenta ler como UTF-8 primeiro
        text = new TextDecoder("utf-8", { fatal: true }).decode(uint8Array);
      } catch (err) {
        // Se falhar (ex: Excel exporta CSV com acentos em Windows-1252), usa o padrão brasileiro
        text = new TextDecoder("windows-1252").decode(uint8Array);
      }
      
      // Quebra o texto por linhas e remove linhas vazias
      const rows = text.split('\n').filter(row => row.trim() !== '');
      
      if (rows.length < 2) {
        alert("O arquivo CSV está vazio ou inválido.");
        return;
      }

      setIsLoading(true);
      setShowImportModal(false);

      let successCount = 0;
      let errorCount = 0;
      let errorDetails: string[] = [];

      // Detecta o separador (CSV brasileiro geralmente usa ponto e vírgula)
      const separator = rows[0].includes(';') ? ';' : ',';
      const headers = rows[0].toLowerCase().split(separator).map(h => h.trim().replace(/['"]/g, ''));
      
      // Função de comparação que ignora acentos (ex: "Eletrotécnica" == "eletrotecnica")
      const safeCompare = (a: string, b: string) => {
        const norm = (str: string) => (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
        return norm(a) === norm(b);
      };

      const hasHeaderKeywords = headers.some(h => h.includes("nome") || h.includes("aluno") || h.includes("curso") || h.includes("turma") || h.includes("matr"));
      const hasDateInFirstRow = headers.some(h => /^\d{2,4}[-/]\d{2}[-/]\d{2,4}$/.test(h));
      
      const isHeader = hasHeaderKeywords && !hasDateInFirstRow;
      const startIndex = isHeader ? 1 : 0;

      // Pegamos a primeira linha de DADOS para deduzir as posições inteligentemente
      const firstDataRow = rows[startIndex].split(separator).map(c => c.trim().replace(/^["']|["']$/g, ''));

      let idxNome = headers.findIndex(h => h.includes("nome") || h.includes("aluno") || h.includes("estudante"));
      let idxMat = headers.findIndex(h => h.includes("matr") || h.includes("registro"));
      let idxData = headers.findIndex(h => h.includes("data") || h.includes("nasc"));
      let idxCurso = headers.findIndex(h => h.includes("curso"));
      let idxTurma = headers.findIndex(h => h.includes("turma") || h.includes("serie") || h.includes("série") || h.includes("ano"));

      // Corrige os índices analisando o conteúdo real da primeira linha de dados
      if (!isHeader || idxData === -1 || (firstDataRow[idxData] && !/^\d{2,4}[-/]\d{2}[-/]\d{2,4}$/.test(firstDataRow[idxData]))) {
        const found = firstDataRow.findIndex(c => /^\d{2,4}[-/]\d{2}[-/]\d{2,4}$/.test(c));
        if (found !== -1) idxData = found;
      }

      if (!isHeader || idxCurso === -1 || (firstDataRow[idxCurso] && !cursos.some(c => safeCompare(c.nome || c.name || c.curso || String(c), firstDataRow[idxCurso])))) {
        const found = firstDataRow.findIndex(c => cursos.some(curso => safeCompare(curso.nome || curso.name || curso.curso || String(curso), c)));
        if (found !== -1) idxCurso = found;
      }

      if (!isHeader || idxTurma === -1 || (firstDataRow[idxTurma] && !turmas.some(t => safeCompare(t.nome || t.name || t.descricao || t.serie || String(t), firstDataRow[idxTurma])))) {
        let found = firstDataRow.findIndex(c => turmas.some(t => safeCompare(t.nome || t.name || t.descricao || t.serie || String(t), c)));
        if (found === -1) {
           found = firstDataRow.findIndex(c => c.toLowerCase().includes("ano") || c.toLowerCase().includes("turma") || c.toLowerCase().includes("série"));
        }
        if (found !== -1) idxTurma = found;
      }

      const usedIndices = [idxData, idxCurso, idxTurma].filter(i => i !== -1);
      
      if (idxNome === -1) {
        const found = firstDataRow.findIndex((c, i) => !usedIndices.includes(i) && isNaN(Number(c)));
        if (found !== -1) { idxNome = found; usedIndices.push(idxNome); }
      }
      
      if (idxMat === -1) {
        const found = firstDataRow.findIndex((c, i) => !usedIndices.includes(i));
        if (found !== -1) idxMat = found;
      }

      // Processa linha por linha a partir do startIndex
      for (let i = startIndex; i < rows.length; i++) {
        const row = rows[i];
        // Trata separador e eventuais aspas nas células
        const cols = row.split(separator).map(c => c.trim().replace(/^["']|["']$/g, ''));
        
        const nome = idxNome >= 0 ? cols[idxNome] || "" : "";
        const matricula = idxMat >= 0 ? cols[idxMat] || "" : "";
        const data_nascimento = idxData >= 0 ? cols[idxData] || "" : "";
        const cursoStr = idxCurso >= 0 ? cols[idxCurso] || "" : "";
        const turmaStr = idxTurma >= 0 ? cols[idxTurma] || "" : "";
        
        try {
          const payload = new FormData();
          payload.append("nome", nome || "Sem Nome");

          // Garante que a matrícula tenha no máximo 20 caracteres
          let matFinal = matricula || `MAT-${Math.floor(Math.random() * 100000)}-${i}`;
          if (matFinal.length > 20) matFinal = matFinal.substring(0, 20);
          payload.append("matricula", matFinal);

          // Trata data no formato DD/MM/YYYY para o padrão do banco (YYYY-MM-DD)
          let dataNascFormatada = "2010-01-01";
          if (data_nascimento) {
            if (data_nascimento.includes('/')) {
              const parts = data_nascimento.split('/');
              if (parts.length === 3) {
                dataNascFormatada = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            } else {
              dataNascFormatada = data_nascimento; // Pode já estar em YYYY-MM-DD
            }
          }
          payload.append("data_nascimento", dataNascFormatada);

          // Busca Curso/Turma de forma segura (ignora letras maiúsculas/minúsculas)
          let cursoObj = cursos.find(c => safeCompare(c.nome || c.name || c.curso || String(c), cursoStr));
          let turmaObj = turmas.find(t => safeCompare(t.nome || t.name || t.descricao || t.serie || String(t), turmaStr));

          // Se o Curso não existe, tenta criar automaticamente no banco
          if (cursoStr && !cursoObj) {
            try {
              // Envia várias chaves comuns, contornando a exigência de nomeclatura do backend
              const res = await api.post("/api/cursos/", { nome: cursoStr, curso: cursoStr, descricao: cursoStr });
              cursoObj = res.data;
              cursos.push(cursoObj); // Adiciona na memória para os próximos alunos da planilha
            } catch (err: any) {
              let detail = "";
              if (err.response?.data) {
                if (typeof err.response.data === 'string' && err.response.data.toLowerCase().includes('<!doctype html>')) {
                  detail = "A rota /api/cursos/ não existe no backend (Erro 404).";
                } else {
                  detail = typeof err.response.data === 'object' ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(' | ') : String(err.response.data);
                }
              }
              throw new Error(`Criar curso '${cursoStr}' falhou. Backend devolveu: ${detail || err.message}`);
            }
          }

          // Se a Turma não existe, tenta criar automaticamente no banco
          if (turmaStr && !turmaObj) {
            try {
              // Envia várias chaves comuns, contornando a exigência de nomeclatura do backend
              const res = await api.post("/api/turmas/", { nome: turmaStr, serie: turmaStr, descricao: turmaStr });
              turmaObj = res.data;
              turmas.push(turmaObj); // Adiciona na memória para os próximos alunos da planilha
            } catch (err: any) {
              let detail = "";
              if (err.response?.data) {
                if (typeof err.response.data === 'string' && err.response.data.toLowerCase().includes('<!doctype html>')) {
                  detail = "A rota /api/turmas/ não existe no backend (Erro 404).";
                } else {
                  detail = typeof err.response.data === 'object' ? Object.entries(err.response.data).map(([k, v]) => `${k}: ${v}`).join(' | ') : String(err.response.data);
                }
              }
              throw new Error(`Criar turma '${turmaStr}' falhou. Backend devolveu: ${detail || err.message}`);
            }
          }

          if (cursoObj?.id) payload.append("curso", cursoObj.id);
          if (turmaObj?.id) payload.append("turma", turmaObj.id);
          payload.append("ativo", "true");

          await api.post("/api/estudantes/", payload, { headers: { "Content-Type": "multipart/form-data" } });
          successCount++;
        } catch (error: any) {
          console.error(`Erro ao salvar estudante (linha ${i}):`, error);
          errorCount++;

          // Tenta extrair a mensagem de erro que o Django devolveu
          let msg = error.message || "Erro desconhecido ou falha de conexão";
          if (error.response?.data) {
            if (typeof error.response.data === 'string' && error.response.data.toLowerCase().includes('<!doctype html>')) {
               msg = "A rota não foi encontrada no backend (Erro 404)";
            } else if (typeof error.response.data === 'object') {
              msg = Object.entries(error.response.data)
                .map(([key, val]) => `${key}: ${val}`)
                .join(" | ");
            } else {
              msg = String(error.response.data);
            }
          }
          if (errorDetails.length < 5) {
            errorDetails.push(`Linha ${i + 1} (${nome || '?'}) -> ${msg}`);
          }
        }
      }

      let finalMsg = `Importação concluída!\n\n${successCount} alunos importados com sucesso.\n`;
      if (errorCount > 0) {
        finalMsg += `${errorCount} falhas.\n\nDetalhes dos erros encontrados (limitado a 5):\n${errorDetails.join('\n')}\n\nDica: Verifique se as turmas/cursos existem com esse exato nome no sistema.`;
      }
      alert(finalMsg);
      
      // Atualiza a lista buscando do banco novamente
      fetchStudents();
      carregarTurmas();
      carregarCursos();
      
      // Limpa o input para permitir enviar o mesmo arquivo de novo se precisar
      e.target.value = ''; 
    };

    // Lê o arquivo como buffer de bytes para tratar a codificação (UTF-8 ou Windows-1252)
    reader.readAsArrayBuffer(file);
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
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Importar CSV
          </button>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold transition-colors cursor-pointer"
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
            {turmas.map((g) => (
              <option key={g.id || g.nome || g} value={g.id || g.nome || g}>
                {g.nome || g.serie || g.name || g.descricao || (typeof g === 'string' ? g : "Turma Sem Nome")}
              </option>
            ))}
          </select>
        </div>
        <div className="text-sm text-gray-500 ml-auto">
          {isLoading ? "Carregando..." : `${filtered.length} resultado${filtered.length !== 1 ? "s" : ""}`}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Aluno</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Curso / Turma</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Refeição Hoje</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Carregando alunos...
                  </td>
                </tr>
              )}
              {!isLoading && apiError && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-red-500 font-medium">
                    <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
                    {apiError}
                    {(apiError.includes("401") || apiError.includes("CORS")) && (
                      <button 
                        onClick={() => { localStorage.removeItem("sysmerenda_access"); window.location.href = '/login'; }}
                        className="mt-4 px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors block mx-auto text-sm cursor-pointer"
                      >
                        Ir para a tela de Login
                      </button>
                    )}
                  </td>
                </tr>
              )}
              {!isLoading && !apiError && paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                    Nenhum aluno encontrado no banco de dados.
                  </td>
                </tr>
              )}
              {paginated.map((student) => (
                <tr key={student.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                  
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                        <ImageWithFallback
                          src={student.foto_url || student.foto} 
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
                      <span className="text-sm text-gray-700 font-medium">
                        {(() => {
                          const c = cursos.find(c => String(c.id) === String(student.curso));
                          if (!c) return student.curso || '-';
                          return c.nome || c.name || student.curso;
                        })()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {student.turma_nome || (() => {
                          const t = turmas.find(t => String(t.id) === String(student.turma));
                          if (!t) return student.turma || 'Sem turma';
                          return t.nome || t.serie || t.name || t.descricao || student.turma;
                        })()}
                      </span>
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
                      className="p-1.5 text-gray-400 hover:text-slate-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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
          <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {/* Photo Upload */}
              <div className="flex items-center gap-4">
                <label className="w-20 h-20 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-gray-50 flex-shrink-0 relative overflow-hidden">
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  {formData.photoPreview ? (
                    <img src={formData.photoPreview} alt="Preview da Foto" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Camera className="w-6 h-6 text-gray-400" />
                      <span className="text-xs text-gray-400">Foto</span>
                    </>
                  )}
                </label>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">Foto do Aluno</p>
                  <p className="text-xs text-gray-400 mt-0.5">JPG, PNG até 5MB. A foto é exibida na validação biométrica.</p>
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
                    Curso <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.curso}
                    onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-white"
                  >
                    <option value="">Selecione o curso...</option>
                    {cursos.map((c) => (
                      <option
                        key={c.id ?? c.nome ?? c.curso ?? c}
                        value={c.id ?? c.nome ?? c.curso ?? c}
                      >
                        {c.nome ?? c.curso ?? c.name ?? (typeof c === 'string' ? c : "Curso Sem Nome")}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Turma <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all bg-white"
                      value={formData.turma}
                      onChange={(e) => setFormData({ ...formData, turma: e.target.value })}
                    >
                      <option value="">Selecione a turma...</option>
                      {turmas.map((t) => (
                        <option
                          key={t.id ?? t.nome ?? t.turma_nome ?? t}
                          value={t.id ?? t.nome ?? t.turma_nome ?? t}
                        >
                          {t.nome ?? t.turma_nome ?? t.serie ?? t.name ?? t.descricao ?? (typeof t === 'string' ? t : "Turma Sem Nome")}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setIsTurmaModalOpen(true)}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center justify-center cursor-pointer"
                      title="Nova Turma"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                  <select
                    value={formData.ativo ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, ativo: e.target.value === "true" })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all">
                    <option value="true">Ativo</option>
                    <option value="false">Inativo</option>
                  </select>
                </div>
              </div>

              {/* Campos de biometria removidos - backend não expõe esses campos no model Student */}
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.nome || !formData.matricula || !formData.curso || !formData.turma}
            className="flex-1 px-4 py-2.5 bg-slate-900 hover:bg-slate-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg text-sm font-semibold cursor-pointer"
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
          <button onClick={() => setShowImportModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              
              {/* ÁREA DE UPLOAD CLICÁVEL */}
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 cursor-pointer transition-colors relative">
                {/* Input invisível que aciona a função que criamos */}
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={handleCsvImport} 
                />
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-700 text-sm font-medium">Clique para selecionar o arquivo CSV</p>
                <p className="text-gray-400 text-xs mt-1">O upload iniciará automaticamente</p>
              </label>

              {/* FORMATO ATUALIZADO PARA O BACKEND */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-2">Formato esperado do CSV:</p>
                <pre className="text-xs text-gray-500 font-mono bg-white border border-gray-200 rounded-lg p-3 overflow-x-auto">
                  nome,matricula,data_nascimento,curso,turma{"\n"}
                  Mariana,2026001,2010-05-14,Fundamental,Turma A
                </pre>
              </div>
              
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700">
                  A importação não inclui biometria. Os dados biométricos devem ser cadastrados individualmente após a importação.
                </p>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button onClick={() => setShowImportModal(false)} className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 cursor-pointer">
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Nova Turma */}
      {isTurmaModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800">Nova Turma</h3>
              <button onClick={() => setIsTurmaModalOpen(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                placeholder="Nome da turma (ex: 3º Ano A)"
                value={novaTurmaNome}
                onChange={(e) => setNovaTurmaNome(e.target.value)}
                autoFocus
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button onClick={() => setIsTurmaModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 cursor-pointer">
                Cancelar
              </button>
              <button onClick={handleSaveTurma} className="px-4 py-2 bg-slate-900 hover:bg-slate-700 text-white rounded-lg text-sm font-semibold cursor-pointer">
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}