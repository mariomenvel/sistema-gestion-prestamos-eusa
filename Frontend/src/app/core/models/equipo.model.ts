import { Categoria } from './categoria.model';
import { Unidad } from './unidad.model';
import { Nombre } from './nombre.model';

export interface Equipo {
  id: number;
  marca: string;
  modelo: string;
  unidades_totales: number;
  unidades_disponibles: number;
  unidades_prestadas: number;
  unidades_no_disponibles: number;
  descripcion?: string;
  foto_url?: string;
  categoria_codigo: string;
  categoria_id?: number;
  nombre_id?: number;

  // Relaciones
  categoria?: Categoria;
  unidades?: Unidad[];
  Nombre?: Nombre;
}