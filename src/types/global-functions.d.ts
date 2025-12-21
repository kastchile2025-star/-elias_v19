// Declaraciones de tipos para funciones globales de corrección dinámica
declare global {
  interface Window {
    regenerarAsignacionesDinamicas?: () => {
      exito: boolean;
      asignacionesCreadas: number;
      mensaje: string;
    };
  exportarBBDDConAsignaciones?: () => {
      exito: boolean;
      archivo: string;
      estadisticas?: any;
      mensaje: string;
    };
    importarBBDDConAsignaciones?: (contenido: string) => {
      exito: boolean;
      mensaje: string;
      estadisticas?: any;
    };
    validarAsignacionesManualmente?: () => {
      esValido: boolean;
      problemas: Array<{
        tipo: string;
        cantidad: number;
        detalles?: any[];
      }>;
      estadisticas: any;
    };
    obtenerEstadisticasAsignaciones?: () => any;
    exportarDesdeAdmin?: () => void;
    importarDesdeAdmin?: (inputElement: HTMLInputElement) => void;
    validarDesdeAdmin?: () => void;
    aplicarCorreccionAutomatica?: () => void;
    integrarConAdmin?: () => void;
    regenerarSistemaCompleto?: () => void;
    mostrarEstadoSistema?: () => any;
  }
}

export {};
