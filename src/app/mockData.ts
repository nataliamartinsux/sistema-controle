export type StudentStatus = "Ativo" | "Inativo";
export type BiometricState = "idle" | "success" | "blocked";
export type BlockReason = "Refeição já consumida hoje" | "Aluno Inativo" | "Biometria não cadastrada" | "Fora do horário permitido";

export interface Student {
  id: string;
  nome: string;
  matricula: string;
  data_nascimento: string;
  serie: string;
  curso?: string;
  turma?: string;
  ativo: boolean;
  foto: string;
  biometricCodes: string[];
  hasConsumedToday: boolean;
}

export interface MealRecord {
  id: string;
  alunoId: string;
  nome: string;
  serie: string;
  date: string;
  time: string;
  type: "biometric" | "manual";
  manualReason?: string;
  value: number;
}

export interface Occurrence {
  id: string;
  date: string;
  time: string;
  type: string;
  description: string;
  operator: string;
  nome?: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  role: "Operador" | "Empresa" | "Fiscal" | "Gestão" | "Admin";
  status: "Ativo" | "Inativo";
  lastAccess: string;
}

export const STUDENTS: Student[] = [
  {
    id: "001",
    nome: "Lucas Mendes Silva",
    matricula: "2024001",
    data_nascimento: "16/02/2006",
    serie: "9º Ano A",
    ativo: true,
    foto: "https://images.unsplash.com/photo-1681070909604-f555aa006564?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    biometricCodes: ["A3F8C2D1", "B7E4A9F2", "C1D6B3E8"],
    hasConsumedToday: true,
  },
  {
    id: "002",
    nome: "Ana Carolina Oliveira",
    matricula: "2024002",
    data_nascimento: "05/07/2005",
    serie: "8º Ano B",
    ativo: true,
    foto: "https://images.unsplash.com/photo-1648743856421-5bc9a742ddc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    biometricCodes: ["D5A2F7C3", "E8B1D4A6", "F2C9E7B1"],
    hasConsumedToday: false,
  },
  {
    id: "003",
    nome: "Pedro Henrique Costa",
    matricula: "2024003",
    data_nascimento: "22/11/2004",
    serie: "7º Ano C",
    ativo: true,
    foto: "https://images.unsplash.com/photo-1758582388197-cd8449914603?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    biometricCodes: ["G4F1B8D2", "H7A5C3E9", "I2D8F6A4"],
    hasConsumedToday: false,
  },
  {
    id: "004",
    nome: "Mariana Santos Ferreira",
    matricula: "2024004",
    data_nascimento: "10/09/2003",
    serie: "9º Ano B",
    ativo: true,
    foto: "https://images.unsplash.com/photo-1631284443067-d875ada6ff9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    biometricCodes: ["J6E3A9C5", "K1B7D4F8", "L5C2E6A3"],
    hasConsumedToday: false,
  },
  {
    id: "005",
    nome: "Rafael Alves Nascimento",
    matricula: "2024005",
    data_nascimento: "30/04/2002",
    serie: "6º Ano A",
    ativo: true,
    foto: "https://images.unsplash.com/photo-1714124346041-116ee758803f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    biometricCodes: ["M9D6B2E7", "N4A1F8C3", "O7B5D9A2"],
    hasConsumedToday: false,
  },
  {
    id: "006",
    nome: "Juliana Pereira Lima",
    matricula: "2024006",
    data_nascimento: "18/12/2001",
    serie: "8º Ano A",
    ativo: false,
    foto: "https://images.unsplash.com/photo-1648743856421-5bc9a742ddc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    biometricCodes: ["P2C8E4B6", "Q5F3A7D1", "R8D1C5F4"],
    hasConsumedToday: false,
  },
  {
    id: "007",
    nome: "Thiago Rodrigues Moura",
    matricula: "2024007",
    data_nascimento: "03/06/2000",
    serie: "7º Ano A",
    ativo: true,
    foto: "https://images.unsplash.com/photo-1681070909604-f555aa006564?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    biometricCodes: ["S3E7A2D9", "T6B4F1C8", "U1A9E3B5"],
    hasConsumedToday: false,
  },
  {
    id: "008",
    nome: "Isabela Carvalho Rocha",
    matricula: "2024008",
    data_nascimento: "28/01/1999",
    serie: "6º Ano B",
    ativo: true,
    foto: "https://images.unsplash.com/photo-1631284443067-d875ada6ff9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400",
    biometricCodes: ["V4F8B2A7", "W9C5D3E1", "X2E1B6D4"],
    hasConsumedToday: false,
  },
];

export const MEAL_RECORDS_TODAY: MealRecord[] = [
  { id: "r001", alunoId: "001", nome: "Lucas Mendes Silva", serie: "9º Ano A", date: "2026-03-31", time: "11:02", type: "biometric", value: 4.5 },
  { id: "r002", alunoId: "002", nome: "Ana Carolina Oliveira", serie: "8º Ano B", date: "2026-03-31", time: "11:15", type: "biometric", value: 4.5 },
  { id: "r003", alunoId: "007", nome: "Thiago Rodrigues Moura", serie: "7º Ano A", date: "2026-03-31", time: "11:28", type: "manual", manualReason: "Leitor biométrico com falha técnica", value: 4.5 },
  { id: "r004", alunoId: "008", nome: "Isabela Carvalho Rocha", serie: "6º Ano B", date: "2026-03-31", time: "11:41", type: "biometric", value: 4.5 },
];

export const HOURLY_DATA = [
  { hour: "07:00", consumo: 0 },
  { hour: "08:00", consumo: 12 },
  { hour: "09:00", consumo: 8 },
  { hour: "10:00", consumo: 45 },
  { hour: "11:00", consumo: 120 },
  { hour: "12:00", consumo: 187 },
  { hour: "13:00", consumo: 95 },
  { hour: "14:00", consumo: 23 },
  { hour: "15:00", consumo: 5 },
];

export const WEEKLY_DATA = [
  { dia: "Seg 23/03", consumo: 468, previsto: 520 },
  { dia: "Ter 24/03", consumo: 491, previsto: 520 },
  { dia: "Qua 25/03", consumo: 445, previsto: 520 },
  { dia: "Qui 26/03", consumo: 503, previsto: 520 },
  { dia: "Sex 27/03", consumo: 412, previsto: 520 },
  { dia: "Seg 30/03", consumo: 478, previsto: 520 },
  { dia: "Ter 31/03", consumo: 495, previsto: 520 },
];

export const CLASS_DATA = [
  { serie: "6º Ano A", value: 42 },
  { serie: "6º Ano B", value: 38 },
  { serie: "7º Ano A", value: 45 },
  { serie: "7º Ano C", value: 40 },
  { serie: "8º Ano A", value: 35 },
  { serie: "8º Ano B", value: 48 },
  { serie: "9º Ano A", value: 50 },
  { serie: "9º Ano B", value: 43 },
];

export const OCCURRENCES: Occurrence[] = [
  { id: "oc001", date: "31/03/2026", time: "11:35", type: "Falha Biométrica", description: "Leitor biométrico com instabilidade intermitente no módulo 2", operator: "Maria Souza", nome: "Thiago Rodrigues Moura" },
  { id: "oc002", date: "31/03/2026", time: "10:50", type: "Comportamento", description: "Aluno tentou acessar pela segunda vez no mesmo dia", operator: "Maria Souza", nome: "Lucas Mendes Silva" },
  { id: "oc003", date: "30/03/2026", time: "12:15", type: "Falha Biométrica", description: "Digital não reconhecida após 3 tentativas, liberação manual autorizada", operator: "João Lima", nome: "Rafael Alves Nascimento" },
  { id: "oc004", date: "28/03/2026", time: "11:05", type: "Equipamento", description: "Queda de energia por 5 minutos. Registros mantidos via sistema de backup", operator: "João Lima" },
];

export const USERS: User[] = [
  { id: "u001", nome: "Maria Souza", email: "maria.souza@escola.edu.br", role: "Operador", status: "Ativo", lastAccess: "31/03/2026 11:45" },
  { id: "u002", nome: "João Lima", email: "joao.lima@escola.edu.br", role: "Operador", status: "Ativo", lastAccess: "30/03/2026 13:20" },
  { id: "u003", nome: "Carlos Empresa", email: "carlos@alimentacaosas.com.br", role: "Empresa", status: "Ativo", lastAccess: "31/03/2026 08:30" },
  { id: "u004", nome: "Dra. Ana Fiscal", email: "ana.fiscal@prefeitura.gov.br", role: "Fiscal", status: "Ativo", lastAccess: "28/03/2026 16:00" },
  { id: "u005", nome: "Prof. Diretor Alves", email: "direcao@escola.edu.br", role: "Gestão", status: "Ativo", lastAccess: "31/03/2026 09:15" },
  { id: "u006", nome: "Admin Sistema", email: "admin@sysmerenda.gov.br", role: "Admin", status: "Ativo", lastAccess: "31/03/2026 07:00" },
];

export const MANUAL_REASONS = [
  "Leitor biométrico com falha técnica",
  "Digital não reconhecida após 3 tentativas",
  "Aluno sem digital cadastrada - regularização pendente",
  "Autorização da direção escolar",
  "Problema de integridade no cadastro biométrico",
];

export const REPORT_DATA = [
  { periodo: "01/03/2026 - 07/03/2026", normais: 2310, manuais: 45, total: 2355, valor: 10597.50, status: "Validado" },
  { periodo: "08/03/2026 - 14/03/2026", normais: 2280, manuais: 52, total: 2332, valor: 10494.00, status: "Validado" },
  { periodo: "15/03/2026 - 21/03/2026", normais: 2190, manuais: 38, total: 2228, valor: 10026.00, status: "Pendente" },
  { periodo: "22/03/2026 - 28/03/2026", normais: 2340, manuais: 41, total: 2381, valor: 10714.50, status: "Pendente" },
];
