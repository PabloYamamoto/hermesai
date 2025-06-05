// Tipos para documentos
export interface Document {
    id: string;
    name: string;
    hash: string;
    uploadDate: string;
    status: 'vectorized' | 'pending';
    size?: number;
    type?: string;
    metadata?: Record<string, any>;
}

// Tipos para consultas
export interface QueryResult {
    id: string;
    question: string;
    answer: string;
    fragments: Fragment[];
    timestamp: string;
}

export interface Fragment {
    id: string;
    documentId: string;
    documentName: string;
    content: string;
    score: number;
}

// Tipos para configuración
export interface Settings {
    openaiApiKey?: string;
    fragmentCount: number;
    model: string;
    temperature: number;
}

// Tipos para estadísticas
export interface Stats {
    totalDocuments: number;
    pendingDocuments: number;
    totalQueries: number;
    recentQueries: QueryResult[];
}
  