import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Button, Spinner } from '@heroui/react';
import { Icon } from '@iconify/react';
import StatCard from '../components/StatCard';
import RecentQueriesCard from '../components/RecentQueriesCard';
import { Stats } from '../types';
import { getDocuments } from '../services/api';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  // Cargar datos al montar el componente
  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        // En un caso real, habría un endpoint específico para estadísticas
        // Aquí simulamos con datos de ejemplo
        let documents = [];
        
        try {
          documents = await getDocuments();
        } catch (apiError) {
          console.warn('No se pudo conectar con la API, usando datos de ejemplo:', apiError);
          // Proporcionar datos de ejemplo en caso de error de API
          documents = [
            { id: '1', name: 'Documento 1.pdf', status: 'vectorized' },
            { id: '2', name: 'Documento 2.docx', status: 'pending' },
            { id: '3', name: 'Documento 3.pdf', status: 'vectorized' }
          ];
        }
        
        // Simulamos datos de estadísticas
        const mockStats: Stats = {
          totalDocuments: documents.length,
          pendingDocuments: documents.filter(doc => doc.status === 'pending').length,
          totalQueries: 24,
          recentQueries: [
            {
              id: '1',
              question: '¿Cuáles son los principales hallazgos del informe Q3?',
              answer: 'Los principales hallazgos del informe Q3 incluyen un aumento del 15% en ingresos, expansión a 3 nuevos mercados y lanzamiento de 2 nuevos productos.',
              fragments: [],
              timestamp: new Date().toISOString()
            },
            {
              id: '2',
              question: '¿Qué dice la política de vacaciones sobre días personales?',
              answer: 'La política de vacaciones establece que cada empleado tiene derecho a 5 días personales por año, que no se acumulan y deben ser aprobados con al menos 48 horas de antelación.',
              fragments: [],
              timestamp: new Date(Date.now() - 86400000).toISOString() // 1 día atrás
            }
          ]
        };
        
        setStats(mockStats);
        setError(null);
      } catch (err) {
        console.error('Error al cargar estadísticas:', err);
        // Proporcionar datos de ejemplo incluso en caso de error general
        const fallbackStats: Stats = {
          totalDocuments: 3,
          pendingDocuments: 1,
          totalQueries: 24,
          recentQueries: [
            {
              id: '1',
              question: '¿Cuáles son los principales hallazgos del informe Q3?',
              answer: 'Los principales hallazgos del informe Q3 incluyen un aumento del 15% en ingresos, expansión a 3 nuevos mercados y lanzamiento de 2 nuevos productos.',
              fragments: [],
              timestamp: new Date().toISOString()
            },
            {
              id: '2',
              question: '¿Qué dice la política de vacaciones sobre días personales?',
              answer: 'La política de vacaciones establece que cada empleado tiene derecho a 5 días personales por año, que no se acumulan y deben ser aprobados con al menos 48 horas de antelación.',
              fragments: [],
              timestamp: new Date(Date.now() - 86400000).toISOString() // 1 día atrás
            }
          ]
        };
        
        setStats(fallbackStats);
        setError('No se pudieron cargar las estadísticas desde el servidor. Mostrando datos de ejemplo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Renderizado condicional para estado de carga
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  // Renderizado para estado de error
  if (error) {
    return (
      <Card>
        <CardBody className="flex flex-col items-center justify-center py-8">
          <Icon icon="lucide:alert-circle" className="text-danger mb-4" width={48} height={48} />
          <p className="text-danger text-center mb-4">{error}</p>
          <Button color="primary" onPress={() => window.location.reload()}>
            Reintentar
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button 
            color="primary" 
            variant="flat"
            startContent={<Icon icon="lucide:upload" width={18} />}
            onPress={() => navigate('/documents/upload')}
          >
            Subir Documento
          </Button>
          <Button 
            color="primary"
            startContent={<Icon icon="lucide:search" width={18} />}
            onPress={() => navigate('/query')}
          >
            Nueva Consulta
          </Button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Total de Documentos" 
          value={stats?.totalDocuments || 0} 
          icon="lucide:files" 
          color="primary"
          change={{ value: 12, isPositive: true }}
        />
        <StatCard 
          title="Documentos Pendientes" 
          value={stats?.pendingDocuments || 0} 
          icon="lucide:loader" 
          color={stats?.pendingDocuments ? "warning" : "success"}
        />
        <StatCard 
          title="Consultas Realizadas" 
          value={stats?.totalQueries || 0} 
          icon="lucide:search" 
          color="primary"
          change={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Consultas recientes */}
      <div className="mt-8">
        <RecentQueriesCard queries={stats?.recentQueries || []} />
      </div>
    </div>
  );
};

export default Dashboard;