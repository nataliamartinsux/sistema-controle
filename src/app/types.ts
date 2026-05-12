export type StudentStatus = "Ativo" | "Inativo";

export type BiometricState = "idle" | "success" | "blocked";

export type BlockReason = 
  | "Refeição já consumida hoje" 
  | "Aluno Inativo" 
  | "Biometria não cadastrada" 
  | "Fora do horário permitido";

export interface Student {
  id: number; // O Django retorna number para IDs (no mock era string)
  nome: string;
  matricula: string;
  data_nascimento: string;
  serie: string;
  curso?: string;
  turma?: number | string; // Agora que o backend tem CRUD de turma, ele pode retornar o ID (number)
  ativo: boolean;
  
  // Imagens
  foto_url?: string | null; // O seu Django envia a URL pronta por esse campo
  foto?: string | null;     // Mantido para compatibilidade com partes antigas do front

  // Propriedades auxiliares (usadas no front-end para lógica visual)
  biometricCodes?: string[]; 
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