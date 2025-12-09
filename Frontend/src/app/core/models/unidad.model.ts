import { Equipo } from './equipo.model';

export interface Unidad {
  id: number;
  equipo_id: number;
  codigo_barra: string;
  numero_serie?: string;
  
  estado: 'disponible' | 'no_disponible' | 'bloqueado' | 'en_reparacion';
  
  // Relaciones
  equipo?: Equipo;
}