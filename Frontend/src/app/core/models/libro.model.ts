import { Categoria } from './categoria.model';
import { Ejemplar } from './ejemplar.model';

export interface Libro {
  id: number;
  titulo: string;
  autor?: string;
  editorial?: string;
  libro_numero: string;
  categoria_codigo: string;
  
  // Relaciones (pueden venir o no dependiendo del endpoint)
  categoria?: Categoria;
  ejemplares?: Ejemplar[];
} 