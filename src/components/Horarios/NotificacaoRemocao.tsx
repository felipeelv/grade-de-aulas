import React, { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface NotificacaoRemocaoProps {
  nomeHorario: string;
  onFechar: () => void;
  duracao?: number;
}

export function NotificacaoRemocao({ nomeHorario, onFechar, duracao = 3000 }: NotificacaoRemocaoProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFechar();
    }, duracao);

    return () => clearTimeout(timer);
  }, [onFechar, duracao]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 min-w-80">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-gray-900">
              Horário removido com sucesso!
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              <strong>{nomeHorario}</strong> foi removido da grade.
            </p>
          </div>
          <button
            onClick={onFechar}
            className="flex-shrink-0 p-1 hover:bg-gray-100 rounded transition-colors"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        
        {/* Barra de progresso */}
        <div className="mt-3 bg-gray-200 rounded-full h-1 overflow-hidden">
          <div className="bg-green-500 h-full rounded-full transition-all ease-linear w-full" />
        </div>
      </div>
    </div>
  );
}