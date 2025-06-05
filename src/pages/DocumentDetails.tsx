import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Button, 
  Spinner, 
  Modal, 
  ModalContent, 
  ModalHeader, 
  ModalBody, 
  ModalFooter,
  useDisclosure,
  addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import DocumentMetadataCard from '../components/DocumentMetadataCard';
import { Document } from '../types';
import { getDocument, deleteDocument } from '../services/api';

const DocumentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = React.useState<Document | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Cargar documento al montar el componente
  React.useEffect(() => {
    if (!id) return;
    
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const data = await getDocument(id);
        setDocument(data);
      } catch (error) {
        console.error('Error al cargar documento:', error);
        addToast({
          title: 'Error',
          description: 'No se pudo cargar el documento',
          color: 'danger'
        });
        navigate('/documents');
      } finally {
        setIsLoading(false);
      }
    };

      fetchDocument();
  }, [id, navigate]);

    const handleDelete = async () => {
        if (!id) return;

        try {
            await deleteDocument(id);
            addToast({
                title: 'Documento eliminado',
                description: 'El documento ha sido eliminado correctamente',
                color: 'success'
            });
            navigate('/documents');
        } catch (error) {
            console.error('Error al eliminar documento:', error);
            addToast({
                title: 'Error',
                description: 'No se pudo eliminar el documento',
                color: 'danger'
            });
        } finally {
            onClose();
        }
    };

    const handleDownload = () => {
        // En un caso real, aquí se implementaría la descarga del documento
        addToast({
            title: 'Descarga iniciada',
            description: 'El documento comenzará a descargarse en breve',
            color: 'success'
        });
    };

    // Renderizado condicional para estado de carga
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    // Si no se encuentra el documento
    if (!document) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Icon icon="lucide:file-x" className="text-danger mb-4" width={64} height={64} />
                <h2 className="text-xl font-semibold mb-2">Documento no encontrado</h2>
                <p className="text-default-500 mb-6">El documento que buscas no existe o ha sido eliminado</p>
                <Button color="primary" onPress={() => navigate('/documents')}>
                    Volver a Documentos
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Button
                    variant="flat"
                    color="default"
                    startContent={<Icon icon="lucide:arrow-left" width={16} />}
                    onPress={() => navigate('/documents')}
                >
                    Volver a Documentos
                </Button>
            </div>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">{document.name}</h1>

                <div className="flex gap-2">
                    <Button
                        variant="flat"
                        color="primary"
                        startContent={<Icon icon="lucide:download" width={18} />}
                        onPress={handleDownload}
                    >
                        Descargar
                    </Button>
                    <Button
                        variant="flat"
                        color="default"
                        startContent={<Icon icon="lucide:edit" width={18} />}
                        onPress={() => navigate(`/documents/${id}/edit`)}
                    >
                        Editar
                    </Button>
                    <Button
                        color="danger"
                        variant="flat"
                        startContent={<Icon icon="lucide:trash-2" width={18} />}
                        onPress={onOpen}
                    >
                        Eliminar
                    </Button>
                </div>
            </div>

            {/* Mostrar metadata del documento */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <DocumentMetadataCard document={document} />
                </div>

                <div className="lg:col-span-2">
                    {/* Aquí se podría mostrar una previsualización del documento o información adicional */}
                    <div className="bg-content1 rounded-lg border border-divider p-6 h-full flex flex-col">
                        <h2 className="text-lg font-semibold mb-4">Información del Documento</h2>

                        {document.status === 'pending' ? (
                            <div className="flex-1 flex flex-col items-center justify-center py-12">
                                <Spinner size="lg" color="warning" className="mb-4" />
                                <h3 className="text-lg font-medium mb-2">Vectorizando documento</h3>
                                <p className="text-default-500 text-center max-w-md">
                                    Este proceso puede tardar unos minutos dependiendo del tamaño del documento.
                                    No es necesario que permanezca en esta página.
                                </p>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col">
                                <div className="bg-success-100 rounded-lg p-4 mb-6">
                                    <div className="flex items-center gap-2">
                                        <Icon icon="lucide:check-circle" className="text-success" width={20} />
                                        <span className="font-medium text-success-700">Documento vectorizado correctamente</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-sm font-medium text-default-500">Información de vectorización</h3>
                                        <p className="mt-1">El documento ha sido procesado y está listo para ser consultado.</p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-medium text-default-500">Fragmentos generados</h3>
                                        <p className="mt-1">Se han generado 42 fragmentos de texto para consultas.</p>
                                    </div>

                                    <div className="mt-8">
                                        <Button
                                            color="primary"
                                            startContent={<Icon icon="lucide:search" width={18} />}
                                            onPress={() => navigate('/query')}
                                        >
                                            Realizar Consulta
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal de confirmación de eliminación */}
            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalContent>
                    <ModalHeader className="flex flex-col gap-1">Confirmar eliminación</ModalHeader>
                    <ModalBody>
                        <p>
                            ¿Estás seguro de que deseas eliminar el documento <strong>{document.name}</strong>?
                            Esta acción no se puede deshacer.
                        </p>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="flat" onPress={onClose}>
                            Cancelar
                        </Button>
                        <Button color="danger" onPress={handleDelete}>
                            Eliminar
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </div>
    );
};

export default DocumentDetails;