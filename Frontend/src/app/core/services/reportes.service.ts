import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ApiService } from './api.service';
import { Prestamo } from '../models/prestamo.model';
import { Solicitud } from '../models/solicitud.model';
import { Sancion } from '../models/sancion.model';

/**
 * Interface para los filtros comunes de reportes.
 * Todos los campos son opcionales para permitir filtrado flexible.
 */
export interface FiltrosReporte {
  desde?: string;      // Fecha de inicio (formato: YYYY-MM-DD)
  hasta?: string;      // Fecha de fin (formato: YYYY-MM-DD)
  usuario_id?: number; // ID del usuario a filtrar
  estado?: string;     // Estado del registro (ej: 'activo', 'pendiente')
  tipo?: string;       // Tipo del registro (ej: 'a', 'b', 'uso_propio')
  severidad?: string;  // Solo para sanciones (ej: 's1_1sem')
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  constructor(private apiService: ApiService) { }

  /**
   * Genera un reporte de préstamos con filtros opcionales.
   * Endpoint: GET /reportes/prestamos
   * Auth: Requerido + soloPAS
   * 
   * @param filtros Objeto con filtros opcionales (desde, hasta, usuario_id, estado, tipo)
   * @returns Observable con array de préstamos que cumplen los filtros
   * 
   * @example
   * // Préstamos del mes de noviembre
   * getReportePrestamos({ desde: '2024-11-01', hasta: '2024-11-30' })
   * 
   * @example
   * // Préstamos activos de un usuario específico
   * getReportePrestamos({ usuario_id: 5, estado: 'activo' })
   */
  getReportePrestamos(filtros?: FiltrosReporte): Observable<Prestamo[]> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.desde) params = params.set('desde', filtros.desde);
      if (filtros.hasta) params = params.set('hasta', filtros.hasta);
      if (filtros.usuario_id) params = params.set('usuario_id', filtros.usuario_id.toString());
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    }
    
    return this.apiService.get<Prestamo[]>('/reportes/prestamos', params);
  }

  /**
   * Genera un reporte de solicitudes con filtros opcionales.
   * Endpoint: GET /reportes/solicitudes
   * Auth: Requerido + soloPAS
   * 
   * @param filtros Objeto con filtros opcionales (desde, hasta, usuario_id, estado, tipo)
   * @returns Observable con array de solicitudes que cumplen los filtros
   */
  getReporteSolicitudes(filtros?: FiltrosReporte): Observable<Solicitud[]> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.desde) params = params.set('desde', filtros.desde);
      if (filtros.hasta) params = params.set('hasta', filtros.hasta);
      if (filtros.usuario_id) params = params.set('usuario_id', filtros.usuario_id.toString());
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.tipo) params = params.set('tipo', filtros.tipo);
    }
    
    return this.apiService.get<Solicitud[]>('/reportes/solicitudes', params);
  }

  /**
   * Genera un reporte de sanciones con filtros opcionales.
   * Endpoint: GET /reportes/sanciones
   * Auth: Requerido + soloPAS
   * 
   * @param filtros Objeto con filtros opcionales (desde, hasta, usuario_id, estado, severidad)
   * @returns Observable con array de sanciones que cumplen los filtros
   */
  getReporteSanciones(filtros?: FiltrosReporte): Observable<Sancion[]> {
    let params = new HttpParams();
    
    if (filtros) {
      if (filtros.desde) params = params.set('desde', filtros.desde);
      if (filtros.hasta) params = params.set('hasta', filtros.hasta);
      if (filtros.usuario_id) params = params.set('usuario_id', filtros.usuario_id.toString());
      if (filtros.estado) params = params.set('estado', filtros.estado);
      if (filtros.severidad) params = params.set('severidad', filtros.severidad);
    }
    
    return this.apiService.get<Sancion[]>('/reportes/sanciones', params);
  }
}