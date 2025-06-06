import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardBody,
    Input,
    Button,
    Spinner,
    Select,
    SelectItem,
    addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { uploadDocument, getProjects, createProject } from '../services/api';
import { Project } from '../types';

const UploadDocument: React.FC = () => {
    const navigate = useNavigate();
    const [file, setFile] = React.useState<File | null>(null);
    const [title, setTitle] = React.useState<string>('');
    const [selectedProject, setSelectedProject] = React.useState<string>('');
    const [newProjectName, setNewProjectName] = React.useState<string>('');
    const [showNewProject, setShowNewProject] = React.useState<boolean>(false);
    const [projects, setProjects] = React.useState<Project[]>([]);
    const [isUploading, setIsUploading] = React.useState<boolean>(false);
    const [isLoadingProjects, setIsLoadingProjects] = React.useState<boolean>(true);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Load projects on component mount
    React.useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setIsLoadingProjects(true);
            const projectsList = await getProjects();
            setProjects(projectsList);
            
            // Auto-select first project if available
            if (projectsList.length > 0) {
                setSelectedProject(projectsList[0].id);
            }
        } catch (error) {
            console.error('Error loading projects:', error);
            addToast({
                title: 'Error',
                description: 'No se pudieron cargar los proyectos',
                color: 'danger'
            });
        } finally {
            setIsLoadingProjects(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            
            // Auto-generate title from filename if not set
            if (!title) {
                const nameWithoutExtension = selectedFile.name.replace(/\.[^/.]+$/, '');
                setTitle(nameWithoutExtension);
            }
        }
    };

    const handleCreateProject = async () => {
        if (!newProjectName.trim()) {
            addToast({
                title: 'Error',
                description: 'Por favor ingresa un nombre para el proyecto',
                color: 'danger'
            });
            return;
        }

        try {
            const newProject = await createProject(newProjectName.trim());
            setProjects(prev => [...prev, newProject]);
            setSelectedProject(newProject.id);
            setNewProjectName('');
            setShowNewProject(false);
            
            addToast({
                title: 'Proyecto creado',
                description: 'El proyecto se ha creado correctamente',
                color: 'success'
            });
        } catch (error) {
            console.error('Error creating project:', error);
            addToast({
                title: 'Error',
                description: 'No se pudo crear el proyecto',
                color: 'danger'
            });
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

        if (!title.trim()) {
            addToast({
                title: 'Error',
                description: 'Por favor ingresa un título para el documento',
                color: 'danger'
            });
            return;
        }

        if (!selectedProject) {
            addToast({
                title: 'Error',
                description: 'Por favor selecciona un proyecto',
                color: 'danger'
            });
            return;
        }

        // Validar tipo de archivo - expandir tipos válidos
        const validTypes = [
            'application/pdf', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/msword',
            'text/plain',
            'text/markdown'
        ];
        if (!validTypes.includes(file.type)) {
            addToast({
                title: 'Formato no válido',
                description: 'Solo se permiten archivos PDF, DOCX, DOC, TXT o MD',
                color: 'danger'
            });
            return;
        }

        // Validar tamaño (máximo 25MB)
        const maxSize = 25 * 1024 * 1024; // 25MB en bytes
        if (file.size > maxSize) {
            addToast({
                title: 'Archivo demasiado grande',
                description: 'El tamaño máximo permitido es 25MB',
                color: 'danger'
            });
            return;
        }

        try {
            setIsUploading(true);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title.trim());
            formData.append('vector_store_id', selectedProject);

            const response = await uploadDocument(formData);

            addToast({
                title: 'Documento subido',
                description: 'El documento se ha subido y está siendo procesado',
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
                    {/* Project Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-medium">Proyecto</h3>
                            <Button
                                size="sm"
                                variant="flat"
                                color="primary"
                                onPress={() => setShowNewProject(true)}
                                startContent={<Icon icon="lucide:plus" width={16} />}
                            >
                                Crear Nuevo
                            </Button>
                        </div>

                        {showNewProject ? (
                            <div className="flex gap-2 mb-4">
                                <Input
                                    placeholder="Nombre del proyecto"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
                                />
                                <Button
                                    color="primary"
                                    onPress={handleCreateProject}
                                    isDisabled={!newProjectName.trim()}
                                >
                                    Crear
                                </Button>
                                <Button
                                    variant="flat"
                                    onPress={() => {
                                        setShowNewProject(false);
                                        setNewProjectName('');
                                    }}
                                >
                                    Cancelar
                                </Button>
                            </div>
                        ) : null}

                        <Select
                            placeholder="Selecciona un proyecto"
                            selectedKeys={selectedProject ? [selectedProject] : []}
                            onSelectionChange={(keys) => {
                                const selected = Array.from(keys)[0] as string;
                                setSelectedProject(selected);
                            }}
                            isLoading={isLoadingProjects}
                        >
                            {projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                    {project.name} ({project.document_count} documentos)
                                </SelectItem>
                            ))}
                        </Select>
                    </div>

                    {/* Document Title */}
                    <div>
                        <Input
                            label="Título del documento"
                            placeholder="Ingresa un título para el documento"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
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
                            accept=".pdf,.docx,.doc,.txt,.md"
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
                                    PDF, DOCX, DOC, TXT o MD (máximo 25MB)
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
                            <li>Se permiten archivos PDF, DOCX, DOC, TXT y MD.</li>
                            <li>El tamaño máximo permitido es de 25MB.</li>
                            <li>El archivo será procesado por OpenAI y añadido al proyecto seleccionado.</li>
                            <li>El proceso puede tardar unos minutos dependiendo del tamaño del documento.</li>
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
                            isDisabled={!file || !title.trim() || !selectedProject || isUploading}
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