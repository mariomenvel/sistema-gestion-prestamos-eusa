//gestiona todo lo relacionado con los préstamos activos e históricos.
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Prestamo } from '../models/prestamo.model';

@Injectable({
  providedIn: 'root'
})
export class PrestamosService {

  constructor(private apiService: ApiService) { }

  /**
   * Obtiene los préstamos del usuario logueado.
   * Endpoint: GET /prestamos/mios
   */
  getMisPrestamos(): Observable<Prestamo[]> {
    return this.apiService.get<Prestamo[]>('/prestamos/mios');
  }

  
  // --- Funciones exclusivas para PAS ---

  /**
   * Obtiene todos los préstamos activos (solo para PAS).
   * Endpoint: GET /prestamos/activos
   */
  getPrestamosActivos(): Observable<Prestamo[]> {
    return this.apiService.get<Prestamo[]>('/prestamos/activos');
  }

  /**
   * Amplía el plazo de un préstamo.
   * Endpoint: POST /prestamos/:id/ampliar
   */
  ampliarPrestamo(id: number): Observable<any> {
    return this.apiService.put(`/prestamos/${id}/ampliar`);
  }

  /**
   * Registra la devolución de un préstamo (solo para PAS).
   * Endpoint: POST /prestamos/devolver 
   */
  registrarDevolucion(id: number): Observable<any> {
    return this.apiService.put(`/prestamos/${id}/devolver`); // Ajusta la ruta si es distinta en tu back
  }
}