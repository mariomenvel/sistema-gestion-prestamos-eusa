import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Usuario } from '../models/usuario.model';
import { Prestamo } from '../models/prestamo.model';
import { Solicitud } from '../models/solicitud.model';
import { Sancion } from '../models/sancion.model';

/**
 * Interface para la respuesta del detalle de usuario.
 * El backend devuelve el usuario con sus préstamos, solicitudes y sanciones.
 */
export interface DetalleUsuarioResponse {
  usuario: Usuario;
  prestamos: Prestamo[];
  solicitudes: Solicitud[];
  sanciones: Sancion[];
}

@Injectable({
  providedIn: 'root'
})
export class UsuariosService {

  constructor(private apiService: ApiService) { }

  /**
   * Obtiene el perfil del usuario actual (quien está logueado).
   * Endpoint: GET /usuarios/me
   * Auth: Requerido
   */
  getMiPerfil(): Observable<Usuario> {
    return this.apiService.get<Usuario>('/usuarios/me');
  }

  // FUNCIONES EXCLUSIVAS PARA PAS 

  /**
   * Lista todos los usuarios del sistema.
   * Endpoint: GET /usuarios
   * Auth: Requerido + soloPAS
   */
  getUsuarios(): Observable<Usuario[]> {
    return this.apiService.get<Usuario[]>('/usuarios');
  }

  /**
   * Obtiene el detalle completo de un usuario específico.
   * Incluye: préstamos históricos, solicitudes, y sanciones.
   * Endpoint: GET /usuarios/:id/detalle
   * Auth: Requerido + soloPAS
   */
  getDetalleUsuario(id: number): Observable<DetalleUsuarioResponse> {
    return this.apiService.get<DetalleUsuarioResponse>(`/usuarios/${id}/detalle`);
  }

  /**
 * Actualiza los datos de un usuario.
 * Endpoint: PUT /usuarios/:id
 * Auth: Requerido + soloPAS
 */
  actualizarUsuario(id: number, datos: Partial<Usuario>): Observable<any> {
    return this.apiService.put(`/usuarios/${id}`, datos);
  }

  /**
   * Obtiene el contador de préstamos tipo B para un usuario específico.
   * Endpoint: GET /usuarios/:id/contador-tipo-b
   * Auth: Requerido + soloPAS
   */
  obtenerContadorTipoB(usuarioId: number): Observable<any> {
    return this.apiService.get(`/usuarios/${usuarioId}/contador-tipo-b`);
  }
}