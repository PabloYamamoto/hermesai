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
import { QueryResult, Fragment } from '../types';

const QueryResults: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const queryId = queryParams.get('id');
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

                // Simular carga de datos
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Datos de ejemplo
                const mockFragments: Fragment[] = [
                    {
                        id: '1',
                        documentId: 'doc1',
                        documentName: 'Informe Q3 2023.pdf',
                        content: 'Los principales hallazgos del informe Q3 incluyen un aumento del 15% en ingresos respecto al trimestre anterior. La expansión a mercados europeos ha sido exitosa, con un crecimiento del 22% en Francia y Alemania. Los nuevos productos lanzados en julio han superado las expectativas de ventas en un 30%.',
                        score: 0.92
                    },
                    {
                        id: '2',
                        documentId: 'doc1',
                        documentName: 'Informe Q3 2023.pdf',
                        content: 'El departamento de marketing ha reportado un ROI del 3.5x en las campañas digitales del Q3, superando el objetivo de 2.8x establecido a principios de año. La estrategia de contenidos ha generado un 40% más de leads cualificados.',
                        score: 0.85
                    },
                    {
                        id: '3',
                        documentId: 'doc2',
                        documentName: 'Proyecciones 2024.docx',
                        content: 'Basándonos en los resultados del Q3 2023, proyectamos un crecimiento sostenido para el primer semestre de 2024. Los mercados europeos deberían representar aproximadamente el 35% de los ingresos totales para finales de año.',
                        score: 0.78
                    }
                ];

                const mockResult: QueryResult = {
                    id: queryId,
                    question: questionText,
                    answer: 'Los principales hallazgos del informe Q3 2023 incluyen un aumento del 15% en ingresos respecto al trimestre anterior, una expansión exitosa a mercados europeos con un crecimiento del 22% en Francia y Alemania, y un rendimiento superior a las expectativas de los nuevos productos lanzados en julio (30% por encima de lo previsto). Adicionalmente, el departamento de marketing reportó un ROI de 3.5x en campañas digitales, superando el objetivo de 2.8x, y la estrategia de contenidos generó un 40% más de leads cualificados. Estos resultados positivos han llevado a proyecciones de crecimiento sostenido para el primer semestre de 2024, con la expectativa de que los mercados europeos representen aproximadamente el 35% de los ingresos totales para finales de año.',
                    fragments: mockFragments,
                    timestamp: new Date().toISOString()
                };

                setResult(mockResult);

                // Guardar en historial (localStorage)
                try {
                    const stored = localStorage.getItem('ragQueryHistory');
                    const history: QueryResult[] = stored ? JSON.parse(stored) : [];
                    history.unshift(mockResult);
                    // Limitar a los últimos 50 registros
                    localStorage.setItem('ragQueryHistory', JSON.stringify(history.slice(0, 50)));
                } catch (e) {
                    console.warn('No se pudo guardar el historial de consultas:', e);
                }
            } catch (error) {
                console.error('Error al cargar resultados:', error);
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

            {/* Respuesta generada */}
            <Card className="mb-8">
                <CardBody>
                    <div className="flex items-center gap-2 mb-4">
                        <Icon icon="lucide:message-square" className="text-primary" width={20} />
                        <h2 className="text-xl font-semibold">Respuesta</h2>
                    </div>
                    <p className="whitespace-pre-line">{result.answer}</p>
                </CardBody>
            </Card>

            {/* Fragmentos recuperados */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Icon icon="lucide:layers" className="text-primary" width={20} />
                    <h2 className="text-xl font-semibold">Fragmentos utilizados</h2>
                </div>
                <p className="text-default-500 mb-6">
                    Estos son los fragmentos de documentos que se utilizaron para generar la respuesta:
                </p>

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