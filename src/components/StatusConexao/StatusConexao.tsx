import React from 'react';
import { useSistema } from '../../context/SistemaContext';
import { AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

export const StatusConexao: React.FC = () => {
  const { conectado } = useSistema();

  if (conectado) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm font-medium">Status: Colaborativo</span>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <div className="font-medium mb-1">Status: Local</div>
          <div className="text-xs">
            Sistema funcionando com localStorage.
            <br />
            <a 
              href="https://github.com/seu-repo/sistema-grade-horarios/blob/main/CONFIGURAR-SUPABASE.md" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-yellow-700 hover:text-yellow-900 underline mt-1"
            >
              Ver instruções Supabase
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
