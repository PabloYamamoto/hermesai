import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Dashboard from '../pages/Dashboard';
import DocumentsList from '../pages/DocumentsList';
import UploadDocument from '../pages/UploadDocument';
import EditDocument from '../pages/EditDocument';
import DocumentDetails from '../pages/DocumentDetails';
import QueryPage from '../pages/QueryPage';
import QueryResults from '../pages/QueryResults';
import QueryHistory from '../pages/QueryHistory';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';

const AppRouter: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="documents" element={<DocumentsList />} />
                <Route path="documents/upload" element={<UploadDocument />} />
                <Route path="documents/:id/edit" element={<EditDocument />} />
                <Route path="documents/:id" element={<DocumentDetails />} />
                <Route path="query" element={<QueryPage />} />
                <Route path="query/results" element={<QueryResults />} />
                <Route path="query/history" element={<QueryHistory />} />
                <Route path="settings" element={<Settings />} />
                <Route path="404" element={<NotFound />} />
                <Route path="*" element={<Navigate to="/404" replace />} />
            </Route>
        </Routes>
    );
};

export default AppRouter;