import React from 'react';
import { Card, CardBody, CardFooter, Divider, Chip } from '@heroui/react';
import { Fragment } from '../types';

interface QueryResultCardProps {
    fragment: Fragment;
    index: number;
}

const QueryResultCard: React.FC<QueryResultCardProps> = ({ fragment, index }) => {
    // Función para formatear el score como porcentaje
    const formatScore = (score: number) => {
        return `${(score * 100).toFixed(1)}%`;
    };

    return (
        <Card className="document-card-transition">
            <CardBody>
                <div className="flex justify-between items-start mb-2">
                    <Chip color="primary" variant="flat" size="sm">
                        Fragmento {index + 1}
                    </Chip>
                    <Chip variant="flat" size="sm">
                        Relevancia: {formatScore(fragment.score)}
                    </Chip>
                </div>

                <p className="text-default-700 whitespace-pre-line">
                    {fragment.content}
                </p>
            </CardBody>
            <Divider />
            <CardFooter className="text-small text-default-500">
                <div className="flex items-center gap-1">
                    <span>Fuente:</span>
                    <span className="font-medium">{fragment.documentName}</span>
                </div>
            </CardFooter>
        </Card>
    );
};

export default QueryResultCard;