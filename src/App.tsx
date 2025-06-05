import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { ToastProvider } from '@heroui/react';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;