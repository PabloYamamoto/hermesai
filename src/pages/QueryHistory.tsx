import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    Button,
    Input,
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Card,
    CardBody,
    Spinner
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { QueryResult } from '../types';

const QueryHistory: React.FC = () => {
    const navigate = useNavigate();
    const [history, setHistory] = React.useState<QueryResult[]>([]);
    const [search, setSearch] = React.useState<string>('');
    const [isLoading, setIsLoading] = React.useState<boolean>(true);

    React.useEffect(() => {
        try {
            const stored = localStorage.getItem('ragQueryHistory');
            const data: QueryResult[] = stored ? JSON.parse(stored) : [];
            setHistory(data);
        } catch (e) {
            console.warn('No se pudo cargar el historial de consultas:', e);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const filtered = history.filter(q =>
        q.question.toLowerCase().includes(search.toLowerCase()) ||
        q.answer.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <Card>
                <CardBody className="flex flex-col items-center justify-center py-8">
                    <Icon icon="lucide:history" className="text-default-500 mb-4" width={48} height={48} />
                    <p className="text-default-500 text-center mb-4">Aún no hay consultas almacenadas</p>
                    <Button color="primary" onPress={() => navigate('/query')}>
                        Realizar consulta
                    </Button>
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Historial de Consultas</h1>
                <Button color="primary" onPress={() => navigate('/query')} startContent={<Icon icon="lucide:search" width={18} />}>Nueva Consulta</Button>
            </div>
            <Input
                className="mb-4"
                placeholder="Buscar consultas..."
                value={search}
                onValueChange={setSearch}
                startContent={<Icon icon="lucide:search" width={16} />}
            />
            <Table aria-label="Historial de consultas" removeWrapper classNames={{ base: 'min-h-[400px]' }}>
                <TableHeader>
                    <TableColumn>PREGUNTA</TableColumn>
                    <TableColumn>FECHA</TableColumn>
                    <TableColumn>ACCIONES</TableColumn>
                </TableHeader>
                <TableBody>
                    {filtered.map((q) => (
                        <TableRow key={q.id}>
                            <TableCell className="max-w-xs truncate whitespace-pre-wrap">{q.question}</TableCell>
                            <TableCell>{formatDate(q.timestamp)}</TableCell>
                            <TableCell>
                                <Button
                                    as={Link}
                                    to={`/query/results?id=${q.id}&q=${encodeURIComponent(q.question)}`}
                                    size="sm"
                                    variant="light"
                                    color="primary"
                                    startContent={<Icon icon="lucide:eye" width={16} />}
                                >
                                    Ver
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

export default QueryHistory;
