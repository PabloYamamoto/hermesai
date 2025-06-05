import React from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Divider,
    Input,
    Select,
    SelectItem,
    Slider,
    Button,
    Spinner,
    addToast
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { getSettings, saveSettings } from '../services/api';
import { Settings as SettingsType } from '../types';

const Settings: React.FC = () => {
    const [settings, setSettings] = React.useState<SettingsType>({
        openaiApiKey: '',
        fragmentCount: 5,
        model: 'gpt-4',
        temperature: 0.7
    });
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [isSaving, setIsSaving] = React.useState<boolean>(false);
    const [showApiKey, setShowApiKey] = React.useState<boolean>(false);

    // Cargar configuración al montar el componente
    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                setIsLoading(true);

                // Intentar cargar desde localStorage primero
                const storedSettings = localStorage.getItem('ragAppSettings');
                if (storedSettings) {
                    setSettings(JSON.parse(storedSettings));
                } else {
                    // Si no hay configuración local, intentar cargar desde API
                    const data = await getSettings();
                    setSettings(data);
                }
            } catch (error) {
                console.error('Error al cargar configuración:', error);
                // Usar valores por defecto si hay error
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSave = async () => {
        try {
            setIsSaving(true);

            // Guardar en localStorage
            localStorage.setItem('ragAppSettings', JSON.stringify(settings));

            // Guardar en API (si está disponible)
            try {
                await saveSettings(settings);
            } catch (apiError) {
                console.warn('No se pudo guardar en API, usando solo localStorage:', apiError);
            }

            addToast({
                title: 'Configuración guardada',
                description: 'La configuración se ha guardado correctamente',
                color: 'success'
            });
        } catch (error) {
            console.error('Error al guardar configuración:', error);
            addToast({
                title: 'Error',
                description: 'No se pudo guardar la configuración',
                color: 'danger'
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (key: keyof SettingsType, value: any) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
    };

    // Renderizado condicional para estado de carga
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Configuración</h1>

            <Card className="mb-6">
                <CardHeader>
                    <h2 className="text-lg font-semibold">API de OpenAI</h2>
                </CardHeader>
                <Divider />
                <CardBody className="space-y-6">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-default-700 font-medium">
                                API Key
                            </label>
                            <Button
                                variant="light"
                                size="sm"
                                onPress={() => setShowApiKey(!showApiKey)}
                                startContent={<Icon icon={showApiKey ? "lucide:eye-off" : "lucide:eye"} width={16} />}
                            >
                                {showApiKey ? 'Ocultar' : 'Mostrar'}
                            </Button>
                        </div>
                        <Input
                            type={showApiKey ? "text" : "password"}
                            placeholder="sk-..."
                            value={settings.openaiApiKey}
                            onValueChange={(value) => handleChange('openaiApiKey', value)}
                        />
                        <p className="text-default-500 text-xs mt-1">
                            Tu API key se almacenará de forma segura y se utilizará para las consultas RAG.
                        </p>
                    </div>

                    <div>
                        <label className="block text-default-700 font-medium mb-2">
                            Modelo
                        </label>
                        <Select
                            label="Selecciona un modelo"
                            selectedKeys={[settings.model]}
                            onChange={(e) => handleChange('model', e.target.value)}
                        >
                            <SelectItem key="gpt-4">GPT-4</SelectItem>
                            <SelectItem key="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                            <SelectItem key="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        </Select>
                    </div>
                </CardBody>
            </Card>

            <Card className="mb-6">
                <CardHeader>
                    <h2 className="text-lg font-semibold">Parámetros de Consulta</h2>
                </CardHeader>
                <Divider />
                <CardBody className="space-y-6">
                    <div>
                        <label className="block text-default-700 font-medium mb-2">
                            Número de fragmentos (k): {settings.fragmentCount}
                        </label>
                        <Slider
                            step={1}
                            minValue={1}
                            maxValue={10}
                            value={settings.fragmentCount}
                            onChange={(value) => handleChange('fragmentCount', value)}
                            className="max-w-md"
                        />
                        <p className="text-default-500 text-xs mt-1">
                            Cantidad de fragmentos de texto que se recuperarán para cada consulta.
                        </p>
                    </div>

                    <div>
                        <label className="block text-default-700 font-medium mb-2">
                            Temperatura: {settings.temperature.toFixed(1)}
                        </label>
                        <Slider
                            step={0.1}
                            minValue={0}
                            maxValue={1}
                            value={settings.temperature}
                            onChange={(value) => handleChange('temperature', value)}
                            className="max-w-md"
                        />
                        <p className="text-default-500 text-xs mt-1">
                            Controla la aleatoriedad de las respuestas. Valores más bajos generan respuestas más deterministas.
                        </p>
                    </div>
                </CardBody>
            </Card>

            <div className="flex justify-end mt-6">
                <Button
                    color="primary"
                    onPress={handleSave}
                    isDisabled={isSaving}
                    startContent={isSaving ? <Spinner size="sm" /> : <Icon icon="lucide:save" width={18} />}
                >
                    {isSaving ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
            </div>
        </div>
    );
};

export default Settings;