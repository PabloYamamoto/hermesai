import React from 'react';
import { Card, CardBody, CardHeader, Divider, Link } from '@heroui/react';
import { Icon } from '@iconify/react';
import { QueryResult } from '../types';
import { Link as RouterLink } from 'react-router-dom';

interface RecentQueriesCardProps {
    queries: QueryResult[];
}

const RecentQueriesCard: React.FC<RecentQueriesCardProps> = ({ queries }) => {
    // Función para formatear la fecha
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Función para truncar el texto
    const truncateText = (text: string, maxLength: number = 60) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <Card>
            <CardHeader className="flex justify-between">
                <h3 className="text-lg font-semibold">Consultas Recientes</h3>
                <Link as={RouterLink} to="/query" color="primary" showAnchorIcon>
                    Nueva Consulta
                </Link>
            </CardHeader>
            <Divider />
            <CardBody>
                {queries.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                        <Icon icon="lucide:search" width={32} height={32} className="text-default-400 mb-2" />
                        <p className="text-default-500">No hay consultas recientes</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {queries.map((query) => (
                            <div key={query.id} className="border-b border-divider pb-3 last:border-0 last:pb-0">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="font-medium">{truncateText(query.question)}</p>
                                    <span className="text-tiny text-default-500">{formatDate(query.timestamp)}</span>
                                </div>
                                <p className="text-small text-default-500 mb-2">
                                    {truncateText(query.answer, 100)}
                                </p>
                                <Link
                                    as={RouterLink}
                                    to={`/query/results?id=${query.id}`}
                                    size="sm"
                                    color="primary"
                                >
                                    Ver respuesta completa
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </CardBody>
        </Card>
    );
};

export default RecentQueriesCard;