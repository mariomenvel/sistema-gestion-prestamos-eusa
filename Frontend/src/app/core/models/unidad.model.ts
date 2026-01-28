import { Equipo } from './equipo.model';

export interface Unidad {
  id: number;
  equipo_id: number;
  codigo_barra: string;
  numero_serie?: string;
  ubicacion?: string;

  estado_fisico: 'funciona' | 'no_funciona' | 'en_reparacion' | 'obsoleto' | 'falla' | 'perdido_sustraido';
  esta_prestado: boolean;

  // Opcional para la interfaz antigua
  estado?: 'disponible' | 'no_disponible' | 'bloqueado' | 'en_reparacion';

  // Relaciones
  equipo?: Equipo;
}