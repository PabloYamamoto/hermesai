import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Card,
    CardBody,
    Button,
    Spinner,
    Divider,
    addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import QueryResultCard from '../components/QueryResultCard';
import { QueryResult, Fragment, Query, SearchResult } from '../types';
import { getQuery } from '../services/api';

const QueryResults: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const queryId = queryParams.get('queryId');
    const questionText = queryParams.get('q') || '';

    const [result, setResult] = React.useState<QueryResult | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    // Cargar resultados al montar el componente
    React.useEffect(() => {
        if (!queryId) {
            navigate('/query');
            return;
        }

        const fetchResults = async () => {
            try {
                setIsLoading(true);

                // Fetch real query results from backend
                const queryData: Query = await getQuery(queryId);
                console.log('Query data received:', queryData);
                console.log('Full response structure:', JSON.stringify(queryData.response, null, 2));

                // Transform OpenAI search results to frontend format
                // Handle both possible response structures
                let searchResults;
                if (queryData.response.results) {
                    searchResults = queryData.response.results;
                } else {
                    // Direct response from OpenAI
                    searchResults = queryData.response;
                }
                
                console.log('Search results:', searchResults);
                
                let fragments: Fragment[] = [];
                
                if (searchResults && searchResults.data && Array.isArray(searchResults.data)) {
                    console.log('Processing search results data:', searchResults.data);
                    fragments = searchResults.data.map((result: SearchResult, index: number) => {
                        console.log('Processing result:', result);
                        return {
                            id: `${result.file_id}_${index}`,
                            documentId: result.file_id,
                            documentName: result.filename || 'Documento sin nombre',
                            content: result.content ? result.content.map(block => block.text).join(' ') : 'Contenido no disponible',
                            score: result.score || 0
                        };
                    });
                    console.log('Generated fragments:', fragments);
                } else {
                    console.warn('No search results data found. Structure:', searchResults);
                }

                // Create a comprehensive answer
                let answer = '';
                if (fragments.length > 0) {
                    // Combine the most relevant content
                    const topFragments = fragments.slice(0, 3);
                    const combinedContent = topFragments.map(f => f.content).join('\n\n');
                    
                    answer = `Basado en los documentos encontrados:\n\n${combinedContent}`;
                    
                    if (fragments.length > 3) {
                        answer += `\n\n*Se encontraron ${fragments.length} resultados en total. Los ${topFragments.length} más relevantes se muestran arriba.*`;
                    }
                } else {
                    answer = `No se encontraron resultados específicos para la consulta "${queryData.query_text}" en los documentos del proyecto. 

Esto puede deberse a:
• Los documentos aún están siendo procesados
• La consulta no coincide con el contenido disponible
• Se necesita reformular la pregunta con términos diferentes

Intenta con palabras clave más específicas o verifica que los documentos hayan terminado de procesarse.`;
                }

                const queryResult: QueryResult = {
                    id: queryId,
                    question: queryData.query_text,
                    answer: answer,
                    fragments: fragments,
                    timestamp: queryData.created_at
                };

                setResult(queryResult);

                // Save to localStorage for history
                try {
                    const stored = localStorage.getItem('ragQueryHistory');
                    const history: QueryResult[] = stored ? JSON.parse(stored) : [];
                    history.unshift(queryResult);
                    // Keep only last 50 records
                    localStorage.setItem('ragQueryHistory', JSON.stringify(history.slice(0, 50)));
                } catch (e) {
                    console.warn('Could not save query history:', e);
                }
            } catch (error) {
                console.error('Error loading results:', error);
                addToast({
                    title: 'Error',
                    description: 'No se pudieron cargar los resultados de la consulta',
                    color: 'danger'
                });
                navigate('/query');
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [queryId, navigate, questionText]);

    // Renderizado condicional para estado de carga
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64">
                <Spinner size="lg" color="primary" className="mb-4" />
                <p className="text-default-500">Procesando tu consulta...</p>
            </div>
        );
    }

    // Si no hay resultados
    if (!result) {
        return (
            <Card>
                <CardBody className="flex flex-col items-center justify-center py-8">
                    <Icon icon="lucide:search-x" className="text-danger mb-4" width={48} height={48} />
                    <p className="text-danger text-center mb-4">No se encontraron resultados para esta consulta</p>
                    <Button color="primary" onPress={() => navigate('/query')}>
                        Realizar otra consulta
                    </Button>
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Button
                    variant="flat"
                    color="default"
                    startContent={<Icon icon="lucide:arrow-left" width={16} />}
                    onPress={() => navigate('/query')}
                >
                    Nueva Consulta
                </Button>
            </div>

            <Card className="mb-6">
                <CardBody>
                    <h2 className="text-xl font-semibold mb-2">Pregunta</h2>
                    <p className="text-lg">{result.question}</p>
                </CardBody>
            </Card>

            {/* Response Section - Always show */}
            <Card className="mb-8">
                <CardBody>
                    <div className="flex items-center gap-2 mb-4">
                        <Icon icon="lucide:message-square" className="text-primary" width={20} />
                        <h2 className="text-xl font-semibold">Respuesta</h2>
                    </div>
                    <div className="prose prose-default max-w-none">
                        <p className="whitespace-pre-line text-default-700">
                            {result.answer}
                        </p>
                    </div>
                </CardBody>
            </Card>

            {/* Search Results Section */}
            {result.fragments && result.fragments.length > 0 ? (
                <>
                    <Card className="mb-6">
                        <CardBody>
                            <div className="flex items-center gap-2 mb-4">
                                <Icon icon="lucide:search" className="text-primary" width={20} />
                                <h2 className="text-xl font-semibold">Fragmentos Encontrados</h2>
                                <span className="text-sm text-default-500">({result.fragments.length} resultados)</span>
                            </div>
                            <p className="text-default-600">
                                Fragmentos de documentos utilizados para generar la respuesta:
                            </p>
                        </CardBody>
                    </Card>

                    <div className="mb-6">
                        <div className="space-y-4">
                            {result.fragments.map((fragment, index) => (
                                <QueryResultCard
                                    key={fragment.id}
                                    fragment={fragment}
                                    index={index}
                                />
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <Card className="mb-6">
                    <CardBody>
                        <div className="flex items-center gap-2 mb-4">
                            <Icon icon="lucide:info" className="text-warning" width={20} />
                            <h3 className="text-lg font-semibold">Información adicional</h3>
                        </div>
                        <p className="text-default-600">
                            No se encontraron fragmentos específicos, pero se ha generado una respuesta basada en el conocimiento disponible.
                        </p>
                    </CardBody>
                </Card>
            )}

            <div className="flex justify-center mt-8">
                <Button
                    color="primary"
                    size="lg"
                    startContent={<Icon icon="lucide:search" width={18} />}
                    onPress={() => navigate('/query')}
                >
                    Realizar otra consulta
                </Button>
            </div>
        </div>
    );
};

export default QueryResults;