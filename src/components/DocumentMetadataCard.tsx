import React from 'react';
import { Card, CardBody, CardHeader, Divider, Chip, Spinner } from '@heroui/react';
import { Document } from '../types';
import { Icon } from '@iconify/react';

interface DocumentMetadataCardProps {
    document: Document;
}

const DocumentMetadataCard: React.FC<DocumentMetadataCardProps> = ({ document }) => {
    // Función para formatear la fecha
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    // Función para formatear el tamaño del archivo
    const formatFileSize = (bytes?: number) => {
        if (!bytes) return 'Desconocido';

        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(1)} ${units[unitIndex]}`;
    };

    // Función para determinar el icono según el tipo de archivo
    const getFileIcon = (type?: string) => {
        if (!type) return 'lucide:file';

        if (type.includes('pdf')) return 'lucide:file-type-pdf';
        if (type.includes('word') || type.includes('docx')) return 'lucide:file-type-word';
        if (type.includes('text')) return 'lucide:file-text';

        return 'lucide:file';
    };

    return (
        <Card>
            <CardHeader className="flex gap-3">
                <div className="p-2 rounded-lg bg-primary-100">
                    <Icon
                        icon={getFileIcon(document.type)}
                        className="text-primary"
                        width={24}
                        height={24}
                    />
                </div>
                <div className="flex flex-col">
                    <p className="text-md font-semibold">{document.name}</p>
                    <div className="flex items-center">
                        <Chip
                            color={document.status === 'vectorized' ? 'success' : 'warning'}
                            variant="flat"
                            size="sm"
                            startContent={
                                document.status === 'vectorized'
                                    ? <Icon icon="lucide:check" width={14} />
                                    : <Spinner size="sm" color="warning" />
                            }
                        >
                            {document.status === 'vectorized' ? 'Vectorizado' : 'Pendiente'}
                        </Chip>
                    </div>
                </div>
            </CardHeader>
            <Divider />
            <CardBody>
                <div className="space-y-3">
                    <div>
                        <p className="text-small text-default-500">ID del documento</p>
                        <p className="font-medium">{document.id}</p>
                    </div>

                    <div>
                        <p className="text-small text-default-500">Hash</p>
                        <p className="font-mono text-sm break-all">{document.hash}</p>
                    </div>

                    <div>
                        <p className="text-small text-default-500">Fecha de subida</p>
                        <p>{formatDate(document.uploadDate)}</p>
                    </div>

                    <div className="flex gap-6">
                        <div>
                            <p className="text-small text-default-500">Tamaño</p>
                            <p>{formatFileSize(document.size)}</p>
                        </div>

                        <div>
                            <p className="text-small text-default-500">Tipo</p>
                            <p>{document.type || 'Desconocido'}</p>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

export default DocumentMetadataCard;