import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Configuración de axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para manejar errores
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Aquí podríamos manejar errores comunes como 401, 403, etc.
        return Promise.reject(error);
    }
);

// Project functions (Vector Store API)
export async function getProjects() {
    const response = await api.get('/vector-stores/');
    return response.data;
}

export async function createProject(name: string, metadata = {}) {
    const response = await api.post('/vector-stores/', { name, metadata });
    return response.data;
}

export async function getProject(id: string) {
    const response = await api.get(`/vector-stores/${id}/`);
    return response.data;
}

export async function deleteProject(id: string) {
    const response = await api.delete(`/vector-stores/${id}/`);
    return response.data;
}

export async function searchInProject(projectId: string, query: string, maxResults = 10) {
    const response = await api.post(`/vector-stores/${projectId}/search/`, {
        query,
        max_results: maxResults
    });
    return response.data;
}

export async function getProjectStatus(id: string) {
    const response = await api.get(`/vector-stores/${id}/status/`);
    return response.data;
}

// Legacy function names for backward compatibility
export const getVectorStores = getProjects;
export const createVectorStore = createProject;
export const getVectorStore = getProject;
export const deleteVectorStore = deleteProject;
export const searchVectorStore = searchInProject;
export const getVectorStoreStatus = getProjectStatus;

// Document functions
export async function getDocuments(vectorStoreId?: string) {
    const params = vectorStoreId ? { vector_store: vectorStoreId } : {};
    const response = await api.get('/documents/', { params });
    return response.data;
}

export async function getDocument(id: string) {
    const response = await api.get(`/documents/${id}/`);
    return response.data;
}

export async function uploadDocument(formData: FormData) {
    const response = await api.post('/documents/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export async function editDocument(id: string, data: any) {
    const response = await api.put(`/documents/${id}/`, data);
    return response.data;
}

export async function deleteDocument(id: string) {
    const response = await api.delete(`/documents/${id}/`);
    return response.data;
}

export async function getDocumentStatus(id: string) {
    const response = await api.get(`/documents/${id}/status/`);
    return response.data;
}

// Query functions
export async function getQueries(vectorStoreId?: string) {
    const params = vectorStoreId ? { vector_store: vectorStoreId } : {};
    const response = await api.get('/queries/', { params });
    return response.data;
}

export async function getQuery(id: string) {
    const response = await api.get(`/queries/${id}/`);
    return response.data;
}

// Legacy functions for backward compatibility
export async function getQuestionEmbedding(question: string) {
    // This function may need to be updated to use vector store search
    throw new Error('This function needs to be updated to use vector store search');
}

export async function getChatResponse(prompt: string, fragments: any[]) {
    // This would need to be implemented as a separate chat endpoint if needed
    throw new Error('Chat functionality needs to be implemented separately');
}

// Settings functions
export async function saveSettings(settings: any) {
    localStorage.setItem('hermesai_settings', JSON.stringify(settings));
    return settings;
}

export async function getSettings() {
    const settings = localStorage.getItem('hermesai_settings');
    return settings ? JSON.parse(settings) : {
        fragmentCount: 5,
        model: 'gpt-3.5-turbo',
        temperature: 0.7
    };
}

export default api;
