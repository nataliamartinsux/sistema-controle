export type StudentStatus = "Ativo" | "Inativo";

export type BiometricState = "idle" | "success" | "blocked";

export type BlockReason = 
  | "Refeição já consumida hoje" 
  | "Aluno Inativo" 
  | "Biometria não cadastrada" 
  | "Fora do horário permitido";

export interface Student {
  id: string | number;
  nome: string;
  matricula: string;
  data_nascimento: string;
  curso?: string | number;
  turma?: string | number;
  turma_nome?: string | null;
  foto?: string | null;
  foto_url?: string | null;
  ativo: boolean;
  created_at?: string;
  updated_at?: string;

  // Campos auxiliares utilizados pelo frontend
  hasConsumedToday?: boolean;
}

export interface MealRecord {
  id: string | number;
  alunoId: string | number;
  nome: string;
  serie: string;
  date: string;
  time: string;
  type: "biometric" | "manual";
  manualReason?: string;
  value: number;
}

export interface Occurrence {
  id: string | number;
  date: string;
  time: string;
  type: string;
  description: string;
  operator: string;
  nome?: string;
}

export interface User {
  id: string | number;
  nome: string;
  email: string;
  role: "operador" | "empresa" | "fiscal" | "gestor" | "admin" | string; // Adaptado para os papéis reais do banco
  status: "Ativo" | "Inativo";
  lastAccess?: string;
}