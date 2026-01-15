import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

/**
 * Interface para las métricas del dashboard PAS.
 * Representa los indicadores clave que se muestran en el dashboard administrativo.
 */
export interface DashboardPASData {
  solicitudes_pendientes: number;
  prestamos_activos: number;
  devoluciones_hoy: number;  
  materiales_en_uso: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private apiService: ApiService) { }

  /**
   * Obtiene las métricas para el dashboard del PAS.
   * Muestra: solicitudes pendientes, préstamos activos, sanciones del curso.
   * Endpoint: GET /dashboard/pas
   * Auth: Requerido + soloPAS
   */
  getDashboardPAS(): Observable<DashboardPASData> {
    return this.apiService.get<DashboardPASData>('/dashboard/pas');
  }
}
