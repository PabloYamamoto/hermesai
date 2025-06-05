import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';

const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar para desktop */}
      <div className={`hidden md:block ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out`}>
        <Sidebar collapsed={!isSidebarOpen} />
      </div>

      {/* Contenido principal */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header para móvil */}
        <header className="bg-content1 border-b border-divider p-4 md:hidden">
                    <div className="flex items-center justify-between">
                        <Button
                            isIconOnly
                            variant="light"
                            aria-label="Menu"
                            onPress={toggleSidebar}
                        >
                            <Icon icon="lucide:menu" width={24} />
                        </Button>
                        <h1 className="text-lg font-semibold">RAG Document App</h1>
                        <div className="w-10"></div> {/* Espacio para equilibrar el diseño */}
                    </div>
                </header>

                {/* Sidebar móvil */}
                <div
                    className={`fixed inset-0 bg-overlay/50 z-40 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        }`}
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <div
                        className={`absolute top-0 left-0 w-64 h-full bg-content1 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                            }`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Sidebar collapsed={false} />
                    </div>
                </div>

                {/* Botón para colapsar/expandir sidebar en desktop */}
                <div className="hidden md:block absolute top-4 left-64 z-10 transform -translate-x-1/2">
                    <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="primary"
                        aria-label="Toggle sidebar"
                        onPress={toggleSidebar}
                        className="rounded-full shadow-md"
                    >
                        <Icon
                            icon={isSidebarOpen ? "lucide:chevron-left" : "lucide:chevron-right"}
                            width={18}
                        />
                    </Button>
                </div>

                {/* Contenido principal */}
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      