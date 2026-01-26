//Gestiona la creación de solicitudes (cuando un alumno pide un libro) y su gestión por parte del PAS (aprobar/rechazar).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApiService } from './api.service';
import { Solicitud } from '../models/solicitud.model';

// Interfaces para materiales disponibles
export interface LibroDisponible {
  id: number;
  titulo: string;
  autor: string;
  disponibles: number;
}

export interface EquipoDisponible {
  id: number;
  marca: string;
  modelo: string;
  nombre: string;
  disponibles: number;
}

// Interface para items adicionales
export interface ItemAdicional {
  libro_id?: number;
  equipo_id?: number;
  nombre: string; // Para mostrar en el modal
  tipo: 'libro' | 'equipo';
}

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
   * Aprueba una solicitud con items adicionales opcionales.
   * Endpoint: PUT /solicitudes/:id/aprobar
   */
  aprobarSolicitud(datos: { 
    solicitud_id: number; 
    fecha_devolucion: string | null;
    items_adicionales?: { libro_id?: number; equipo_id?: number }[];
  }): Observable<any> {
    return this.apiService.put(`/solicitudes/${datos.solicitud_id}/aprobar`, {
      fecha_devolucion: datos.fecha_devolucion,
      items_adicionales: datos.items_adicionales || []
    });
  }

  /**
   * Rechaza una solicitud.
   * Endpoint: PUT /solicitudes/:id/rechazar
   */
  rechazarSolicitud(id: number, razon_rechazo: string): Observable<any> {
    return this.apiService.put(`/solicitudes/${id}/rechazar`, { razon_rechazo });
  }

  // --- Búsqueda de materiales disponibles ---

  /**
   * Busca libros con ejemplares disponibles
   * Endpoint: GET /libros/disponibles?q=texto
   */
  buscarLibrosDisponibles(query: string = ''): Observable<LibroDisponible[]> {
    return this.apiService.get<LibroDisponible[]>(`/libros/disponibles?q=${encodeURIComponent(query)}`);
  }

  /**
   * Busca equipos con unidades disponibles
   * Endpoint: GET /equipos/disponibles?q=texto
   */
  buscarEquiposDisponibles(query: string = ''): Observable<EquipoDisponible[]> {
    return this.apiService.get<EquipoDisponible[]>(`/equipos/disponibles?q=${encodeURIComponent(query)}`);
  }
}