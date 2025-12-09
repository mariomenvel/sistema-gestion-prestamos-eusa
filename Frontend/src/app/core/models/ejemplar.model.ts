import { Libro } from './libro.model';

export interface Ejemplar {
  id: number;
  libro_id: number;
  codigo_barra: string;
  
  // Ubicación física
  c122003?: string;
  estanteria?: string;
  balda?: string;
  
  estado: 'disponible' | 'no_disponible' | 'bloqueado' | 'en_reparacion';
  
  // Relaciones
  libro?: Libro;
}