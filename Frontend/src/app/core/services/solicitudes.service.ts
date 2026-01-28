//Gestiona la creación de solicitudes (cuando un alumno pide un libro) y su gestión por parte del PAS (aprobar/rechazar).
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ApiService } from './api.service';
import { Solicitud } from '../models/solicitud.model';

// Interfaces para materiales disponibles (búsqueda por texto)
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

// Interface para resultado de búsqueda por código de barras
export interface MaterialEscaneado {
  tipo: 'ejemplar' | 'unidad';
  id: number;
  codigo_barra: string;
  disponible: boolean;
  estado?: string;
  estado_fisico?: string;
  esta_prestado?: boolean;
  libro?: {
    id: number;
    titulo: string;
    autor: string;
  };
  equipo?: {
    id: number;
    marca: string;
    modelo: string;
    nombre: string;
  };
}

// Interface para items adicionales
export interface ItemAdicional {
  ejemplar_id?: number;
  unidad_id?: number;
  libro_id?: number;
  equipo_id?: number;
  codigo_barra?: string;
  nombre: string;
  tipo: 'libro' | 'equipo' | 'ejemplar' | 'unidad';
}
// Interface para disponibilidad de items
export interface ItemDisponibilidad {
  id: number;
  libro_id: number | null;
  equipo_id: number | null;
  cantidad: number;
  tipo: 'libro' | 'equipo';
  nombre: string;
  disponible: boolean;
  ejemplares_disponibles: { id: number; codigo_barra: string; estado: string }[];
  unidades_disponibles: { id: number; codigo_barra: string; estado_fisico: string }[];
  // Estado en el frontend (para gestión del PAS)
  incluido?: boolean;
  ejemplar_seleccionado_id?: number;
  unidad_seleccionada_id?: number;
  codigo_barra_seleccionado?: string;
}

export interface DisponibilidadResponse {
  solicitud_id: number;
  items: ItemDisponibilidad[];
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
    items_adicionales?: { ejemplar_id?: number; unidad_id?: number; libro_id?: number; equipo_id?: number }[];
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

  // --- Búsqueda de materiales disponibles (por texto) ---

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

  // --- Búsqueda por código de barras ---

  /**
   * Buscar ejemplar por código de barras
   * Endpoint: GET /libros/ejemplar/:codigo
   */
  buscarEjemplarPorCodigo(codigo: string): Observable<MaterialEscaneado> {
    return this.apiService.get<MaterialEscaneado>(`/libros/ejemplar/${encodeURIComponent(codigo)}`);
  }

  /**
   * Buscar unidad por código de barras
   * Endpoint: GET /equipos/unidad/:codigo
   */
  buscarUnidadPorCodigo(codigo: string): Observable<MaterialEscaneado> {
    return this.apiService.get<MaterialEscaneado>(`/equipos/unidad/${encodeURIComponent(codigo)}`);
  }

  /**
 * Verifica la disponibilidad de los items de una solicitud
 * Endpoint: GET /solicitudes/:id/disponibilidad
 */
verificarDisponibilidad(solicitudId: number): Observable<DisponibilidadResponse> {
  return this.apiService.get<DisponibilidadResponse>(`/solicitudes/${solicitudId}/disponibilidad`);
}
}