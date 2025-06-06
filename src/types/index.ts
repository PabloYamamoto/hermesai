// Project types (Vector Store)
export interface VectorStore {
    id: string;
    name: string;
    created_at: string;
    updated_at: string;
    status: string;
    metadata: Record<string, any>;
    document_count: number;
}

// Alias for better readability in the UI
export type Project = VectorStore;

// Document types
export interface Document {
    id: string;
    title: string;
    file: string;
    file_size: number;
    content_type: string;
    status: 'uploading' | 'processing' | 'completed' | 'failed';
    upload_date: string;
    processed_date?: string;
    attributes: Record<string, any>;
    error_message?: string;
    vector_store: string;
}

// Query types
export interface Query {
    id: string;
    vector_store: string;
    query_text: string;
    created_at: string;
    response: SearchResponse;
    max_results: number;
}

export interface SearchResponse {
    query_id: string;
    results: {
        search_query: string;
        data: SearchResult[];
        has_more: boolean;
        next_page?: string;
    };
}

export interface SearchResult {
    file_id: string;
    filename: string;
    score: number;
    attributes: Record<string, any>;
    content: ContentBlock[];
}

export interface ContentBlock {
    type: 'text';
    text: string;
}

// Legacy types for backward compatibility
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

// Stats types
export interface Stats {
    totalDocuments: number;
    pendingDocuments: number;
    totalQueries: number;
    recentQueries: Query[];
    vectorStores: VectorStore[];
}
  