
export type ProcessStatus = 'pendente' | 'findo';

export interface Procurador {
  id: string;
  nome: string;
  telefone: string;
}

export interface ReferenceItem {
  id: string;
  valor: string;
  telefone?: string;
}

export interface Arguido {
  id: string;
  nome: string;
  nif?: string;
}

export interface DocumentoDecisao {
  id: string;
  processoId: string;
  nomeArquivo: string;
  conteudoExtraido: string;
  dataUpload: number;
  tamanho: number;
  tipo: string;
}

export interface Processo {
  id: string;
  numeroProcesso: string;
  crime: string[]; // Alterado para array
  medidasAplicadas: string[];
  prazoRevisao: string; 
  prazoMaximo: string; 
  arguidos: string[]; 
  comentarios: string;
  diap: string[]; // Alterado para array
  nomeProcurador: string[]; // Alterado para array
  telefoneProcurador: string; // Mantido para compatibilidade ou guardado como string composta
  documentosRelacionados: string[];
  status: ProcessStatus;
  createdAt: number;
}

export interface AppFilters {
  numeroProcesso: string;
  crime: string;
  arguido: string;
  diap: string;
  procurador: string;
  medida: string;
}

export const INITIAL_FILTERS: AppFilters = {
  numeroProcesso: '',
  crime: '',
  arguido: '',
  diap: '',
  procurador: '',
  medida: '',
};
