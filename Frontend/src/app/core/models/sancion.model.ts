import { Usuario } from './usuario.model';

export interface Sancion {
  id: number;
  usuario_id: number;
  
  severidad: 's1_1sem' | 's2_1mes' | 's3_indefinida';
  estado: 'activa' | 'finalizada';
  
  inicio: string;
  fin?: string;
  motivo?: string;
  
  // Relaciones
  usuario?: Usuario;
}