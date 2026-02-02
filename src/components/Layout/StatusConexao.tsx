import React from 'react';
import { useSistema } from '../../context/SistemaContext';
import { Wifi, WifiOff, Cloud, Database, Loader2 } from 'lucide-react';

export function StatusConexao() {
  const { conectado, carregando } = useSistema();

  if (carregando) {
    return (
      <div className="flex items-center space-x-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Carregando...</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-1 rounded-lg text-sm ${
      conectado 
        ? 'bg-green-100 text-green-800' 
        : 'bg-orange-100 text-orange-800'
    }`}>
      {conectado ? (
        <>
          <Cloud className="h-4 w-4" />
          <span>Colaborativo</span>
        </>
      ) : (
        <>
          <Database className="h-4 w-4" />
          <span>Local</span>
        </>
      )}
    </div>
  );
}

export function StatusConexaoDetalhado() {
  const { conectado, carregando } = useSistema();

  if (carregando) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <Loader2 className="h-5 w-5 text-yellow-600 animate-spin" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Inicializando Sistema
            </h3>
            <p className="text-sm text-yellow-700">
              Conectando ao sistema colaborativo...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 ${
      conectado 
        ? 'bg-green-50 border-green-200' 
        : 'bg-orange-50 border-orange-200'
    }`}>
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded-lg ${
          conectado 
            ? 'bg-green-100' 
            : 'bg-orange-100'
        }`}>
          {conectado ? (
            <Cloud className={`h-5 w-5 ${
              conectado ? 'text-green-600' : 'text-orange-600'
            }`} />
          ) : (
            <Database className={`h-5 w-5 ${
              conectado ? 'text-green-600' : 'text-orange-600'
            }`} />
          )}
        </div>
        <div>
          <h3 className={`text-sm font-medium ${
            conectado ? 'text-green-800' : 'text-orange-800'
          }`}>
            {conectado ? 'Modo Colaborativo Ativo' : 'Modo Local'}
          </h3>
          <p className={`text-sm ${
            conectado ? 'text-green-700' : 'text-orange-700'
          }`}>
            {conectado 
              ? 'Dados compartilhados em tempo real com outros usuários'
              : 'Dados armazenados localmente. Funcionalidade colaborativa indisponível'
            }
          </p>
        </div>
      </div>
    </div>
  );
}