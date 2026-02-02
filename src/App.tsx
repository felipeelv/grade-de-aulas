import React from 'react';
import { SistemaProvider } from './context/SistemaContext';
import { NotificacaoProvider } from './components/Notificacoes/NotificacaoProvider';
import { LayoutMelhorado } from './components/Layout/LayoutMelhorado';
import { StatusLocalStorage } from './components/Debug/StatusLocalStorage';
import { StatusConexao } from './components/StatusConexao/StatusConexao';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <NotificacaoProvider>
        <SistemaProvider>
          <LayoutMelhorado />
          <StatusConexao />
          <StatusLocalStorage />
        </SistemaProvider>
      </NotificacaoProvider>
    </ErrorBoundary>
  );
}

export default App;
