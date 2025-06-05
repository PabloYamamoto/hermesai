import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';

const NotFound: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="mb-6">
                <Icon icon="lucide:file-question" width={80} height={80} className="text-default-400" />
            </div>
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-4">Página no encontrada</h2>
            <p className="text-default-500 mb-8 max-w-md">
                Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
            <div className="flex gap-4">
                <Button
                    variant="flat"
                    onPress={() => navigate(-1)}
                    startContent={<Icon icon="lucide:arrow-left" width={16} />}
                >
                    Volver
                </Button>
                <Button
                    color="primary"
                    onPress={() => navigate('/')}
                    startContent={<Icon icon="lucide:home" width={16} />}
                >
                    Ir al Dashboard
                </Button>
            </div>
        </div>
    );
};

export default NotFound;