//Gestiona la creación de solicitudes (cuando un alumno pide un libro) y su gestión por parte del PAS (aprobar/rechazar).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApiService } from './api.service';
import { Solicitud } from '../models/solicitud.model';

@Injectable({
  providedIn: 'root'
})


export class SolicitudesService {

  // Subject para notificar cuando se crea una solicitud
  public solicitudCreada$ = new Subject<void>();

  constructor(private apiService: ApiService) { }

  /**
   * Crea una nueva solicitud de préstamo.
   * Endpoint: POST /solicitudes
   */
  // ✅ CORRECTO
crearSolicitud(datos: {
  tipo: 'prof_trabajo' | 'uso_propio',
  ejemplar_id?: number,
  unidad_id?: number,
  normas_aceptadas: boolean,
  observaciones?: string
}): Observable<Solicitud> {
  return this.apiService.post<Solicitud>('/solicitudes', datos).pipe(
    tap(() => this.solicitudCreada$.next())
  );
}

  /**
   * Obtiene las solicitudes del usuario logueado.
   * Endpoint: GET /solicitudes/mis
   */
  getMisSolicitudes(): Observable<Solicitud[]> {
    return this.apiService.get<Solicitud[]>('/solicitudes/mias');
  }

  // --- Funciones exclusivas para PAS ---
  /**
   * Obtiene todas las solicitudes pendientes.
   * Endpoint: GET /solicitudes/pendientes
   */
  getSolicitudesPendientes(): Observable<Solicitud[]> {
    return this.apiService.get<Solicitud[]>('/solicitudes/pendientes');
  }

  /**
   * Obtiene TODAS las solicitudes (pendientes, aprobadas, rechazadas).
   * Endpoint: GET /solicitudes
   */
  getAllSolicitudes(): Observable<Solicitud[]> {
    return this.apiService.get<Solicitud[]>('/solicitudes');
  }

  /**
   * Aprueba una solicitud.
   * Endpoint: POST /solicitudes/:id/aprobar
   */
 aprobarSolicitud(datos: { solicitud_id: number; fecha_devolucion: string | null }): Observable<any> {
  return this.apiService.put(`/solicitudes/${datos.solicitud_id}/aprobar`, {
    fecha_devolucion: datos.fecha_devolucion
  });
}

  /**
   * Rechaza una solicitud.
   * Endpoint: POST /solicitudes/:id/rechazar
   */
  rechazarSolicitud(id: number, razon_rechazo: string): Observable<any> {
    return this.apiService.put(`/solicitudes/${id}/rechazar`, { razon_rechazo });
  }
}