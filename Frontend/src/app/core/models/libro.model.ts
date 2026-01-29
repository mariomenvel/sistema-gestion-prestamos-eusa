import { Ejemplar } from './ejemplar.model';

export interface Libro {
  id: number;
  titulo: string;
  autor?: string;
  editorial?: string;
  libro_numero: string;
  genero_id: number;
  isbn?: string;
  foto_url?: string;

  // Relaciones
  genero?: {
    id: number;
    nombre: string;
  };
  ejemplares?: Ejemplar[];
}