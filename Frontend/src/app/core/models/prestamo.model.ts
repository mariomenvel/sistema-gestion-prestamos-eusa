import { Usuario } from './usuario.model';
import { Ejemplar } from './ejemplar.model';
import { Unidad } from './unidad.model';
import { Solicitud } from './solicitud.model';

export interface Prestamo {
  id: number;
  usuario_id: number;
  tipo: 'a' | 'b'; // 'a' (profesor/trabajo) o 'b' (uso propio)
  estado: 'activo' | 'vencido' | 'cerrado';
  fecha_inicio: string; // Las fechas en JSON viajan como string
  fecha_devolucion_prevista: string;
  fecha_devolucion_real?: string;
  
  // Relaciones condicionales (un préstamo es de libro O equipo)
  ejemplar_id?: number;
  unidad_id?: number;
  solicitud_id?: number;

  // Datos anidados (Include)
  usuario?: Usuario;
  ejemplar?: Ejemplar;
  unidad?: Unidad;
  solicitud?: Solicitud;
}