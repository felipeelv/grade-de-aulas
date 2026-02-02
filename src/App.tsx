import React from 'react';
import { SistemaProvider } from './context/SistemaContext';
import { NotificacaoProvider } from './components/Notificacoes/NotificacaoProvider';
import { LayoutMelhorado } from './components/Layout/LayoutMelhorado';

function App() {
  return (
    <NotificacaoProvider>
      <SistemaProvider>
        <LayoutMelhorado />
      </SistemaProvider>
    </NotificacaoProvider>
  );
}

export default App;
