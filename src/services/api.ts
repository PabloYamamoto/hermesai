import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

// Funciones para gestionar documentos
export async function getDocuments(filters = {}) {
    const response = await api.get('/documents', { params: filters });
    return response.data;
}

export async function getDocument(id: string) {
    const response = await api.get(`/documents/${id}`);
    return response.data;
}

export async function uploadDocument(formData: FormData) {
    const response = await api.post('/documents', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export async function editDocument(id: string, formData: FormData) {
    const response = await api.put(`/documents/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
}

export async function deleteDocument(id: string) {
    const response = await api.delete(`/documents/${id}`);
    return response.data;
}

// Funciones para consultas RAG
export async function getQuestionEmbedding(question: string) {
    const response = await api.post('/embeddings', { text: question });
    return response.data;
}

export async function searchVectorStore(k: number, vector: number[]) {
    const response = await api.post('/search', { k, vector });
    return response.data;
}

export async function getChatResponse(prompt: string, fragments: any[]) {
    const response = await api.post('/chat', { prompt, fragments });
    return response.data;
}

// Funciones para configuración
export async function saveSettings(settings: any) {
    const response = await api.post('/settings', settings);
    return response.data;
}

export async function getSettings() {
    const response = await api.get('/settings');
    return response.data;
}

export default api;
