import { Categoria } from './categoria.model';
import { Unidad } from './unidad.model';

export interface Equipo {
  id: number;
  marca: string;
  modelo: string;
  descripcion?: string;
  foto_url?: string;
  categoria_codigo: string;

  // Relaciones
  categoria?: Categoria;
  unidades?: Unidad[];
}