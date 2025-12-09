export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellidos: string;
  rol: 'alumno' | 'profesor' | 'pas'; // Coincide con tu enum de BD
  estado_perfil: 'activo' | 'bloqueado' | 'inactivo';

  // Opcionales (solo para alumnos)
  tipo_estudios?: 'grado_uni' | 'grado_sup' | 'master';
  fecha_inicio_est?: string;  // DATEONLY viene como string en JSON
  fecha_fin_prev?: string;    // DATEONLY viene como string en JSON
  
  // Propiedades generadas por Sequelize
  createdAt?: string;
  updatedAt?: string;
}

// Interface para la respuesta del Login (basada en auth.controller.js)
export interface LoginResponse {
  mensaje: string;
  token: string;
  usuario: Usuario;
}