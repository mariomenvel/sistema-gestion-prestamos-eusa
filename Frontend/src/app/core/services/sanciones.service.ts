import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Sancion } from '../models/sancion.model';

@Injectable({
  providedIn: 'root'
})
export class SancionesService {

  constructor(private apiService: ApiService) { }

  /**
   * Obtiene las sanciones del usuario logueado.
   * Endpoint: GET /sanciones/mias
   * Auth: Requerido
   */
  getMisSanciones(): Observable<Sancion[]> {
    return this.apiService.get<Sancion[]>('/sanciones/mias');
  }

  //FUNCIONES EXCLUSIVAS PARA EL PAS
  /**
   * Obtiene todas las sanciones activas del curso actual.
   * Endpoint: GET /sanciones/activas
   * Auth: Requerido + soloPAS
   */
  getSancionesActivas(): Observable<Sancion[]> {
    return this.apiService.get<Sancion[]>('/sanciones/activas');
  }

  /**
   * Finaliza una sanción manualmente antes de su fecha de fin.
   * Endpoint: PUT /sanciones/:id/finalizar
   * Auth: Requerido + soloPAS
   */
  finalizarSancion(id: number): Observable<any> {
    return this.apiService.put(`/sanciones/${id}/finalizar`);
  }

  /**
   * Elimina una sanción definitivamente de la base de datos.
   * CUIDADO: Esta acción es permanente.
   * Endpoint: DELETE /sanciones/:id
   * Auth: Requerido + soloPAS
   */
  eliminarSancion(id: number): Observable<any> {
    return this.apiService.delete(`/sanciones/${id}`);
  }

  /**
   * Resetea todas las sanciones de un usuario (inicio de nuevo curso).
   * Endpoint: PUT /sanciones/reset-usuario/:usuarioId
   * Auth: Requerido + soloPAS
   */
  resetearSancionesUsuario(usuarioId: number): Observable<any> {
    return this.apiService.put(`/sanciones/reset-usuario/${usuarioId}`);
  }
}
