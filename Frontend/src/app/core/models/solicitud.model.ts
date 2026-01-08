import { Usuario } from './usuario.model';
import { Ejemplar } from './ejemplar.model';
import { Unidad } from './unidad.model';

export interface Solicitud {
  id: number;
  usuario_id: number;
  
  // Puede ser de uno u otro
  ejemplar_id?: number;
  unidad_id?: number;
  
  tipo: 'prof_trabajo' | 'uso_propio';
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';
  
  normas_aceptadas: boolean;
  observaciones?: string;
  
  gestionado_por_id?: number; // ID del PAS que la gestionó
  
  creada_en: string;
  resuelta_en?: string;

  // Relaciones (minúscula - según el modelo)
  usuario?: Usuario;
  ejemplar?: Ejemplar;
  unidad?: Unidad;

  // Relaciones (mayúscula - lo que devuelve Sequelize)
  Ejemplar?: Ejemplar;
  Unidad?: Unidad;
}