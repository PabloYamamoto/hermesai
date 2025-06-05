import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Button,
    Input,
    Select,
    SelectItem,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    useDisclosure,
    addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import DocumentTable from '../components/DocumentTable';
import { Document } from '../types';
import { getDocuments, deleteDocument } from '../services/api';

const DocumentsList: React.FC = () => {
    const navigate = useNavigate();
    const [documents, setDocuments] = React.useState<Document[]>([]);
    const [filteredDocuments, setFilteredDocuments] = React.useState<Document[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [searchQuery, setSearchQuery] = React.useState<string>('');
    const [statusFilter, setStatusFilter] = React.useState<string>('all');
    const [documentToDelete, setDocumentToDelete] = React.useState<string | null>(null);
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Cargar documentos al montar el componente
    React.useEffect(() => {
        fetchDocuments();
    }, []);

    // Filtrar documentos cuando cambian los filtros
    React.useEffect(() => {
        filterDocuments();
    }, [documents, searchQuery, statusFilter]);

    const fetchDocuments = async () => {
        try {
            setIsLoading(true);
            try {
                const data = await getDocuments();
                setDocuments(data);
            } catch (apiError) {
                console.warn('No se pudo conectar con la API, usando datos de ejemplo:', apiError);
                // Proporcionar datos de ejemplo en caso de error de API
                const mockDocuments: Document[] = [
                    {
                        id: '1',
                        name: 'Informe Q3 2023.pdf',
                        hash: 'a1b2c3d4e5f6',
                        uploadDate: new Date().toISOString(),
                        status: "vectorized",
                        size: 2500000,
                        type: 'application/pdf'
                    },
                    {
                        id: '2',
                        name: 'Manual de políticas.docx',
                        hash: 'f6e5d4c3b2a1',
                        uploadDate: new Date(Date.now() - 86400000 * 2).toISOString(),
                        status: "pending",
                        size: 1800000,
                        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                    },
                    {
                        id: '3',
                        name: 'Presentación proyecto.pdf',
                        hash: '1a2b3c4d5e6f',
                        uploadDate: new Date(Date.now() - 86400000 * 5).toISOString(),
                        status: "vectorized",
                        size: 3200000,
                        type: 'application/pdf'
                    }
                ];
                setDocuments(mockDocuments);
                addToast({
                    title: 'Modo demostración',
                    description: 'Mostrando datos de ejemplo porque no se pudo conectar al servidor',
                    color: 'warning'
                });
            }
        } catch (error) {
            console.error('Error al cargar documentos:', error);
            // Fallback final en caso de error general
            const fallbackDocuments: Document[] = [
                {
                    id: '1',
                    name: 'Documento ejemplo 1.pdf',
                    hash: 'hash123456',
                    uploadDate: new Date().toISOString(),
                    status: 'vectorized'
                },
                {
                    id: '2',
                    name: 'Documento ejemplo 2.docx',
                    hash: 'hash654321',
                    uploadDate: new Date(Date.now() - 86400000).toISOString(),
                    status: 'pending'
                }
            ];
            setDocuments(fallbackDocuments);
            addToast({
                title: 'Error',
                description: 'No se pudieron cargar los documentos. Mostrando datos de ejemplo.',
                color: 'danger'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const filterDocuments = () => {
        let filtered = [...documents];

        // Filtrar por búsqueda
        if (searchQuery) {
            filtered = filtered.filter(doc =>
                doc.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Filtrar por estado
        if (statusFilter !== 'all') {
            filtered = filtered.filter(doc => doc.status === statusFilter);
        }

        setFilteredDocuments(filtered);
    };

    const handleDeleteClick = (id: string) => {
        setDocumentToDelete(id);
        onOpen();
    };

    const confirmDelete = async () => {
        if (!documentToDelete) return;

        try {
            await deleteDocument(documentToDelete);
            setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== documentToDelete));
            addToast({
                title: 'Documento eliminado',
                description: 'El documento ha sido eliminado correctamente',
                color: 'success'
            });
        } catch (error) {
            console.error('Error al eliminar documento:', error);
            addToast({
                title: 'Error',
                description: 'No se pudo eliminar el documento',
                color: 'danger'
            });
        } finally {
            onClose();
            setDocumentToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Documentos</h1>
                <Button
                    color="primary"
                    startContent={<Icon icon="lucide:upload" width={18} />}
                    onPress={() => navigate('/documents/upload')}
                >
                    Subir Documento
                </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
                <Input
                    placeholder="Buscar por nombre..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                    startContent={<Icon icon="lucide:search" width={18} />}
                    className="w-full sm:w-64"
                />

                <Select
                    label="Estado"
                    selectedKeys={[statusFilter]}
                    className="w-full sm:w-48"
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <SelectItem key="all">Todos</SelectItem>
                    <SelectItem key="vectorized">Vectorizados</SelectItem>
                    <SelectItem key="pending">Pendientes</SelectItem>
                </Select>
            </div>

            {/* Tabla de documentos */}
            <div className="mt-6">
                <DocumentTable
                    documents={filteredDocuments}
                    isLoading={isLoading}
                    onDelete={handleDeleteClick}
                />
            </div>

            {/* Modal de confirmación de eliminación */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">Confirmar eliminación</ModalHeader>
                    <ModalBody>
                        <p>
                            ¿Estás seguro de que deseas eliminar este documento? Esta acción no se puede deshacer.
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={onClose}>
                            Cancelar
                        </Button>
                        <Button color="danger" onPress={confirmDelete}>
                            Eliminar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default DocumentsList;