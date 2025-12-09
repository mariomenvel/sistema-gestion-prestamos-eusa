import { Prestamo } from './prestamo.model';
import { Solicitud } from './solicitud.model';

export interface Notificacion {
id: number;
  usuario_id: number;
  tipo: 'preaviso_devolucion' | 'estado_solicitud' | 'inicio_sancion' | 'fin_sancion';
   
  //Opcional
  prestamo_id?: number;
  solicitud_id?: number;

  canal: 'email'; //Por defecto siempre es 'email'
  enviada_en: string; //Tipo fecha
  payload?: string;   // El cuerpo de la notificación (puede ser JSON)
// Objetos relacionados (si el backend los incluye)
  prestamo?: Prestamo;
  solicitud?: Solicitud;
}
