import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Input,
    Button,
    Spinner,
    Chip,
    addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { getDocument, editDocument } from '../services/api';
import { Document } from '../types';

const EditDocument: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [document, setDocument] = React.useState<Document | null>(null);
    const [file, setFile] = React.useState<File | null>(null);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
    const [hashWarning, setHashWarning] = React.useState<boolean>(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            // Resetear advertencia de hash
            setHashWarning(false);
        }
    };

    const handleUpdate = async () => {
        if (!file || !id) {
            addToast({
                title: 'Error',
                description: 'Por favor selecciona un archivo',
                color: 'danger'
            });
            return;
        }

        // Validar tipo de archivo
        const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!validTypes.includes(file.type)) {
            addToast({
                title: 'Formato no válido',
                description: 'Solo se permiten archivos PDF o DOCX',
                color: 'danger'
            });
            return;
        }

        // Validar tamaño (máximo 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB en bytes
        if (file.size > maxSize) {
            addToast({
                title: 'Archivo demasiado grande',
                description: 'El tamaño máximo permitido es 10MB',
                color: 'danger'
            });
            return;
        }

        try {
            setIsSubmitting(true);

            const formData = new FormData();
            formData.append('file', file);

            const response = await editDocument(id, formData);

            // Simular advertencia de hash igual (en un caso real, esto vendría del backend)
            if (Math.random() > 0.7) {
                setHashWarning(true);
                setIsSubmitting(false);
                return;
            }

            addToast({
                title: 'Documento actualizado',
                description: 'El documento se ha actualizado correctamente',
                color: 'success'
            });

            // Redirigir a la página de detalles del documento
            navigate(`/documents/${id}`);

        } catch (error) {
            console.error('Error al actualizar documento:', error);
            addToast({
                title: 'Error',
                description: 'No se pudo actualizar el documento. Inténtalo de nuevo.',
                color: 'danger'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
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
            <Card>
                <CardBody className="flex flex-col items-center justify-center py-8">
                    <Icon icon="lucide:file-x" className="text-danger mb-4" width={48} height={48} />
                    <p className="text-danger text-center mb-4">No se encontró el documento</p>
                    <Button color="primary" onPress={() => navigate('/documents')}>
                        Volver a Documentos
                    </Button>
                </CardBody>
            </Card>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6">
                <Button
                    variant="flat"
                    color="default"
                    startContent={<Icon icon="lucide:arrow-left" width={16} />}
                    onPress={() => navigate(`/documents/${id}`)}
                >
                    Volver a Detalles
                </Button>
            </div>

            <h1 className="text-2xl font-bold mb-2">Editar Documento</h1>
            <p className="text-default-500 mb-6">
                Actualiza el archivo para el documento: <span className="font-medium">{document.name}</span>
            </p>

            <Card>
                <CardBody className="space-y-6">
                    {/* Información del documento actual */}
                    <div className="bg-default-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Documento actual</h3>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm">
                                <span className="text-default-500">Nombre:</span> {document.name}
                            </p>
                            <p className="text-sm">
                                <span className="text-default-500">Hash:</span> {document.hash}
                            </p>
                            <p className="text-sm">
                                <span className="text-default-500">Estado:</span>{' '}
                                <Chip
                                    color={document.status === 'vectorized' ? 'success' : 'warning'}
                                    variant="flat"
                                    size="sm"
                                >
                                    {document.status === 'vectorized' ? 'Vectorizado' : 'Pendiente'}
                                </Chip>
                            </p>
                        </div>
                    </div>

                    {/* Área de selección de archivo */}
                    <div
                        className="border-2 border-dashed border-default-300 rounded-lg p-8 text-center cursor-pointer hover:bg-default-100 transition-colors"
                        onClick={triggerFileInput}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf,.docx"
                            className="hidden"
                        />

                        <Icon
                            icon="lucide:upload-cloud"
                            className="text-default-500 mx-auto mb-4"
                            width={48}
                            height={48}
                        />

                        {file ? (
                            <div>
                                <p className="text-lg font-medium text-default-800">{file.name}</p>
                                <p className="text-default-500">
                                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                            </div>
                        ) : (
                            <div>
                                <p className="text-lg font-medium text-default-800">
                                    Selecciona un nuevo archivo para reemplazar el actual
                                </p>
                                <p className="text-default-500 mt-2">
                                    PDF o DOCX (máximo 10MB)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Advertencia de hash */}
                    {hashWarning && (
                        <div className="bg-warning-100 p-4 rounded-lg">
                            <div className="flex items-start gap-2">
                                <Icon icon="lucide:alert-triangle" className="text-warning mt-0.5" width={18} />
                                <div>
                                    <h3 className="font-medium text-warning-700">Advertencia de hash</h3>
                                    <p className="text-warning-700 text-sm">
                                        El archivo que intentas subir parece ser idéntico al actual (mismo hash).
                                        Si deseas continuar, el documento será procesado nuevamente.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="flat"
                            onPress={() => navigate(`/documents/${id}`)}
                        >
                            Cancelar
                        </Button>
                        {hashWarning ? (
                            <>
                                <Button
                                    variant="flat"
                                    color="warning"
                                    onPress={() => setHashWarning(false)}
                                >
                                    Seleccionar otro archivo
                                </Button>
                                <Button
                                    color="primary"
                                    onPress={handleUpdate}
                                >
                                    Continuar de todos modos
                                </Button>
                            </>
                        ) : (
                            <Button
                                color="primary"
                                onPress={handleUpdate}
                                isDisabled={!file || isSubmitting}
                                startContent={isSubmitting ? <Spinner size="sm" /> : <Icon icon="lucide:save" width={18} />}
                            >
                                {isSubmitting ? 'Actualizando...' : 'Actualizar Documento'}
                            </Button>
                        )}
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default EditDocument;