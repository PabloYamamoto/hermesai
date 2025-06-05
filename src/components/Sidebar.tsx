import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@heroui/react';
import { Icon } from '@iconify/react';

interface SidebarProps {
    collapsed: boolean;
}

interface NavItem {
    path: string;
    label: string;
    icon: string;
}

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
    const location = useLocation();

    const navItems: NavItem[] = [
        { path: '/', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
        { path: '/documents', label: 'Documentos', icon: 'lucide:file-text' },
        { path: '/query', label: 'Consulta', icon: 'lucide:search' },
        { path: '/query/history', label: 'Historial', icon: 'lucide:history' },
        { path: '/settings', label: 'Ajustes', icon: 'lucide:settings' },
    ];

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <div className="h-full flex flex-col bg-content1 border-r border-divider">
            {/* Logo */}
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-start px-6'} h-16 border-b border-divider`}>
                {collapsed ? (
                    <Icon icon="lucide:file-search" className="text-primary" width={24} height={24} />
                ) : (
                    <div className="flex items-center gap-2">
                        <Icon icon="lucide:file-search" className="text-primary" width={24} height={24} />
                        <span className="font-semibold text-lg">RAG Docs</span>
                    </div>
                )}
            </div>

            {/* Navegación */}
            <nav className="flex-1 py-6">
                <ul className="space-y-1">
                    {navItems.map((item) => (
                        <li key={item.path} className={`${collapsed ? 'px-2' : 'px-3'}`}>
                            <Button
                                as={Link}
                                to={item.path}
                                variant="flat"
                                color={isActive(item.path) ? "primary" : "default"}
                                className={`w-full justify-${collapsed ? 'center' : 'start'} h-11`}
                                startContent={!collapsed && <Icon icon={item.icon} width={20} height={20} />}
                            >
                                {collapsed ? (
                                    <Icon icon={item.icon} width={20} height={20} />
                                ) : (
                                    item.label
                                )}
                            </Button>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className={`p-4 border-t border-divider ${collapsed ? 'text-center' : ''}`}>
                <div className="flex items-center gap-2 text-default-500 text-xs">
                    <Icon icon="lucide:info" width={16} height={16} />
                    {!collapsed && <span>RAG Document App v1.0</span>}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;