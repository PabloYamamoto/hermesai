import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Textarea,
    Button,
    Spinner,
    Select,
    SelectItem,
    addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { searchInProject, getProjects } from '../services/api';
import { Project } from '../types';

const QueryPage: React.FC = () => {
    const navigate = useNavigate();
    const [question, setQuestion] = React.useState<string>('');
    const [selectedProject, setSelectedProject] = React.useState<string>('');
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
    const [isLoadingProjects, setIsLoadingProjects] = React.useState<boolean>(true);
    const [recentQueries, setRecentQueries] = React.useState<string[]>([
        '¿Cuáles son los principales hallazgos del informe Q3?',
        '¿Qué dice la política de vacaciones sobre días personales?',
        '¿Cuál es el proceso para solicitar un reembolso?'
    ]);

    // Load projects on component mount
    React.useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setIsLoadingProjects(true);
            const projectsList = await getProjects();
            setProjects(projectsList);
            
            // Auto-select first project if available
            if (projectsList.length > 0) {
                setSelectedProject(projectsList[0].id);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            addToast({
                title: 'Error',
                description: 'No se pudieron cargar los proyectos',
                color: 'danger'
            });
        } finally {
            setIsLoadingProjects(false);
        }
    };

    const handleSubmit = async () => {
        if (!question.trim()) {
            addToast({
                title: 'Error',
                description: 'Por favor ingresa una pregunta',
                color: 'danger'
            });
            return;
        }

        if (!selectedProject) {
            addToast({
                title: 'Error',
                description: 'Por favor selecciona un proyecto',
                color: 'danger'
            });
            return;
        }

        try {
            setIsSubmitting(true);

            // Search in the selected project
            const searchResponse = await searchInProject(selectedProject, question, 10);

            // Redirigir a la página de resultados con el queryId
            navigate(`/query/results?queryId=${searchResponse.query_id}&q=${encodeURIComponent(question)}`);

        } catch (error) {
            console.error('Error al procesar consulta:', error);
            addToast({
                title: 'Error',
                description: 'No se pudo procesar la consulta. Inténtalo de nuevo.',
                color: 'danger'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRecentQueryClick = (query: string) => {
        setQuestion(query);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Consulta RAG</h1>

            <Card>
                <CardBody className="space-y-6">
                    {/* Project Selection */}
                    <div>
                        <label className="block text-default-700 font-medium mb-2">
                            Seleccionar Proyecto
                        </label>
                        <Select
                            placeholder="Selecciona un proyecto para buscar"
                            selectedKeys={selectedProject ? [selectedProject] : []}
                            onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0] as string;
                                setSelectedProject(selected);
                            }}
                            isLoading={isLoadingProjects}
                        >
                            {projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                    {project.name} ({project.document_count} documentos)
                                </SelectItem>
                            ))}
                        </Select>
                    </div>

                    <div>
                        <label className="block text-default-700 font-medium mb-2">
                            Escribe tu pregunta
                        </label>
                        <Textarea
                            placeholder="Ej: ¿Cuáles son los principales hallazgos del informe Q3?"
                            value={question}
                            onValueChange={setQuestion}
                            minRows={5}
                            maxRows={10}
                            className="w-full"
                        />
                    </div>

                    <div className="flex justify-end">
                        <Button
                            color="primary"
                            size="lg"
                            onPress={handleSubmit}
                            isDisabled={!question.trim() || !selectedProject || isSubmitting}
                            startContent={isSubmitting ? <Spinner size="sm" /> : <Icon icon="lucide:search" width={18} />}
                        >
                            {isSubmitting ? 'Procesando...' : 'Buscar en Documentos'}
                        </Button>
                    </div>
                </CardBody>
            </Card>

            {/* Consultas recientes */}
            {recentQueries.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-lg font-semibold mb-4">Consultas recientes</h2>
                    <div className="space-y-2">
                        {recentQueries.map((query, index) => (
                            <Card
                                key={index}
                                isPressable
                                onPress={() => handleRecentQueryClick(query)}
                                className="document-card-transition"
                            >
                                <CardBody className="py-3 px-4">
                                    <div className="flex items-center gap-2">
                                        <Icon icon="lucide:history" className="text-default-500" width={16} />
                                        <span>{query}</span>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Información sobre RAG */}
            <div className="mt-8 bg-default-50 p-6 rounded-lg">
                <h2 className="text-lg font-semibold mb-3">¿Cómo funciona RAG?</h2>
                <div className="space-y-4">
                    <p>
                        RAG (Retrieval-Augmented Generation) es una técnica que combina la recuperación de información
                        relevante con la generación de texto para proporcionar respuestas precisas basadas en tus documentos.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-content1 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-primary-100 p-1 rounded-full">
                                    <Icon icon="lucide:search" className="text-primary" width={16} />
                                </div>
                                <h3 className="font-medium">1. Búsqueda</h3>
                            </div>
                            <p className="text-sm text-default-600">
                                Tu pregunta se convierte en un vector y se buscan fragmentos similares en tus documentos.
                            </p>
                        </div>
                        <div className="bg-content1 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-primary-100 p-1 rounded-full">
                                    <Icon icon="lucide:filter" className="text-primary" width={16} />
                                </div>
                                <h3 className="font-medium">2. Recuperación</h3>
                            </div>
                            <p className="text-sm text-default-600">
                                Se seleccionan los fragmentos más relevantes para contextualizar la respuesta.
                            </p>
                        </div>
                        <div className="bg-content1 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="bg-primary-100 p-1 rounded-full">
                                    <Icon icon="lucide:message-square" className="text-primary" width={16} />
                                </div>
                                <h3 className="font-medium">3. Generación</h3>
                            </div>
                            <p className="text-sm text-default-600">
                                Un modelo de lenguaje genera una respuesta basada en los fragmentos recuperados.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QueryPage;