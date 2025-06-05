import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Input,
    Button,
    Spinner,
    addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { uploadDocument } from '../services/api';

const UploadDocument: React.FC = () => {
    const navigate = useNavigate();
    const [file, setFile] = React.useState<File | null>(null);
    const [isUploading, setIsUploading] = React.useState<boolean>(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
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
            setIsUploading(true);

            const formData = new FormData();
            formData.append('file', file);

            const response = await uploadDocument(formData);

            addToast({
                title: 'Documento subido',
                description: 'El documento se ha subido correctamente',
                color: 'success'
            });

            // Redirigir a la página de detalles del documento
            navigate(`/documents/${response.id}`);

        } catch (error) {
            console.error('Error al subir documento:', error);
            addToast({
                title: 'Error',
                description: 'No se pudo subir el documento. Inténtalo de nuevo.',
                color: 'danger'
            });
        } finally {
            setIsUploading(false);
        }
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
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

            <h1 className="text-2xl font-bold mb-6">Subir Documento</h1>

            <Card>
                <CardBody className="space-y-6">
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
                                    Arrastra y suelta tu archivo aquí o haz clic para seleccionar
                                </p>
                                <p className="text-default-500 mt-2">
                                    PDF o DOCX (máximo 10MB)
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Información sobre formatos */}
                    <div className="bg-default-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                            <Icon icon="lucide:info" width={18} />
                            Información importante
                        </h3>
                        <ul className="list-disc list-inside space-y-1 text-default-600 text-sm">
                            <li>Solo se permiten archivos en formato PDF o DOCX.</li>
                            <li>El tamaño máximo permitido es de 10MB.</li>
                            <li>El proceso de vectorización puede tardar unos minutos dependiendo del tamaño del documento.</li>
                            <li>Una vez subido, podrás ver el estado de procesamiento en la lista de documentos.</li>
                        </ul>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-3">
                        <Button
                            variant="flat"
                            onPress={() => navigate('/documents')}
                        >
                            Cancelar
                        </Button>
                        <Button
                            color="primary"
                            onPress={handleUpload}
                            isDisabled={!file || isUploading}
                            startContent={isUploading ? <Spinner size="sm" /> : <Icon icon="lucide:upload" width={18} />}
                        >
                            {isUploading ? 'Subiendo...' : 'Subir Documento'}
                        </Button>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default UploadDocument;