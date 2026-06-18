interface CsvParseOptions {
  cursos: any[];
  turmas: any[];
}

interface ParsedStudent {
  nome: string;
  matricula: string;
  data_nascimento: string;
  cursoStr: string;
  turmaStr: string;
  originalRowIndex: number;
}

const safeCompare = (a: string, b: string) => {
  const norm = (str: string) => (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
  return norm(a) === norm(b);
};

export async function parseStudentCsv(file: File, options: CsvParseOptions): Promise<ParsedStudent[]> {
  const buffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(buffer);

  let text = "";
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(uint8Array);
  } catch (err) {
    text = new TextDecoder("windows-1252").decode(uint8Array);
  }

  const rows = text.split('\n').filter(row => row.trim() !== '');
  if (rows.length < 1) {
    throw new Error("O arquivo CSV está vazio ou inválido.");
  }

  const separator = rows[0].includes(';') ? ';' : ',';
  const headers = rows[0].toLowerCase().split(separator).map(h => h.trim().replace(/['"]/g, ''));
  const hasHeaderKeywords = headers.some(h => h.includes("nome") || h.includes("matr"));
  const startIndex = hasHeaderKeywords ? 1 : 0;

  if (rows.length <= startIndex) {
    throw new Error("O arquivo CSV não contém dados.");
  }

  // Mapeamento inteligente de colunas (simplificado para o exemplo)
  let idxNome = headers.findIndex(h => h.includes("nome") || h.includes("aluno"));
  let idxMat = headers.findIndex(h => h.includes("matr"));
  let idxData = headers.findIndex(h => h.includes("data") || h.includes("nasc"));
  let idxCurso = headers.findIndex(h => h.includes("curso"));
  let idxTurma = headers.findIndex(h => h.includes("turma") || h.includes("serie"));

  // ... (a lógica de detecção inteligente completa seria movida para cá)

  const previewData: ParsedStudent[] = [];
  for (let i = startIndex; i < rows.length; i++) {
    const cols = rows[i].split(separator).map(c => c.trim().replace(/^["']|["']$/g, ''));
    if (cols.length < 2) continue; // Pula linhas malformadas

    const nome = idxNome >= 0 ? cols[idxNome] : "";
    const matricula = idxMat >= 0 ? cols[idxMat] : "";
    const data_nascimento = idxData >= 0 ? cols[idxData] : "";
    const cursoStr = idxCurso >= 0 ? cols[idxCurso] : "";
    const turmaStr = idxTurma >= 0 ? cols[idxTurma] : "";

    let dataNascFormatada = "2010-01-01";
    if (data_nascimento?.includes('/')) {
      const parts = data_nascimento.split('/');
      if (parts.length === 3) {
        dataNascFormatada = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
      }
    } else if (data_nascimento) {
      dataNascFormatada = data_nascimento;
    }

    previewData.push({
      nome: nome || "Sem Nome",
      matricula: matricula || `MAT-${Date.now()}-${i}`,
      data_nascimento: dataNascFormatada,
      cursoStr,
      turmaStr,
      originalRowIndex: i
    });
  }

  return previewData;
}