import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableColumn, 
  TableBody, 
  TableRow, 
  TableCell,
  Chip,
  Tooltip,
  Button,
  Spinner
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';
import { Document } from '../types';

interface DocumentTableProps {
  documents: Document[];
  isLoading: boolean;
  onDelete: (id: string) => void;
}

const DocumentTable: React.FC<DocumentTableProps> = ({ documents, isLoading, onDelete }) => {
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

  // Función para truncar el hash
  const truncateHash = (hash: string) => {
    if (hash.length <= 10) return hash;
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  // Renderizado condicional para estado de carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  // Renderizado cuando no hay documentos
  if (documents.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64 text-center">
        <Icon icon="lucide:file-x" width={48} height={48} className="text-default-400 mb-4" />
        <h3 className="text-xl font-medium text-default-600">No hay documentos</h3>
        <p className="text-default-500 mt-2 mb-4">Comienza subiendo tu primer documento</p>
        <Button 
          as={Link} 
          to="/documents/upload" 
          color="primary"
          startContent={<Icon icon="lucide:upload" width={18} />}
        >
          Subir Documento
        </Button>
      </div>
    );
  }

  return (
    <Table 
      aria-label="Tabla de documentos"
      removeWrapper
      classNames={{
        base: "min-h-[400px]",
      }}
    >
      <TableHeader>
        <TableColumn>NOMBRE</TableColumn>
        <TableColumn>FECHA</TableColumn>
        <TableColumn>HASH</TableColumn>
        <TableColumn>ESTADO</TableColumn>
        <TableColumn>ACCIONES</TableColumn>
      </TableHeader>
      <TableBody>
        {documents.map((doc) => (
          <TableRow key={doc.id}>
            <TableCell>
              <Link to={`/documents/${doc.id}`} className="text-primary hover:underline">
                {doc.name}
              </Link>
            </TableCell>
            <TableCell>{formatDate(doc.uploadDate)}</TableCell>
            <TableCell>
              <Tooltip content={doc.hash}>
                <span className="cursor-help">{truncateHash(doc.hash)}</span>
              </Tooltip>
            </TableCell>
            <TableCell>
              <Chip
                color={doc.status === 'vectorized' ? 'success' : 'warning'}
                variant="flat"
                startContent={
                  doc.status === 'vectorized' 
                    ? <Icon icon="lucide:check" width={16} /> 
                    : <Spinner size="sm" color="warning" />
                }
              >
                {doc.status === 'vectorized' ? 'Vectorizado' : 'Pendiente'}
              </Chip>
            </TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Tooltip content="Ver detalles">
                  <Button
                    as={Link}
                    to={`/documents/${doc.id}`}
                    isIconOnly
                    size="sm"
                    variant="light"
                    aria-label="Ver detalles"
                  >
                    <Icon icon="lucide:eye" width={18} />
                  </Button>
                </Tooltip>
                <Tooltip content="Editar documento">
                  <Button
                    as={Link}
                    to={`/documents/${doc.id}/edit`}
                    isIconOnly
                    size="sm"
                    variant="light"
                    aria-label="Editar documento"
                  >
                    <Icon icon="lucide:edit" width={18} />
                  </Button>
                </Tooltip>
                <Tooltip color="danger" content="Eliminar documento">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    color="danger"
                    aria-label="Eliminar documento"
                    onPress={() => onDelete(doc.id)}
                  >
                    <Icon icon="lucide:trash-2" width={18} />
                  </Button>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DocumentTable;