import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

// Importamos las interfaces que definimos en core/models
import { Libro, Equipo } from '../models'; 

@Injectable({
  providedIn: 'root'
})
export class MaterialesService {

  constructor(private apiService: ApiService) { }

  // ===== LIBROS =====

  /**
   * Obtener todos los libros (GET /libros) con sus categorías y ejemplares
   */
  getLibros(): Observable<Libro[]> {
    return this.apiService.get<Libro[]>('/libros');
  }

  /**
   * Obtener un libro por ID 
   */
  getLibroById(id: number): Observable<Libro> {
    return this.apiService.get<Libro>(`/libros/${id}`);
  }

  /**
   * Eliminar un libro por ID
   */
  eliminarLibro(id: number): Observable<any> {
    return this.apiService.delete(`/libros/${id}`);
  }

  // ===== EQUIPOS =====

  /**
   * Obtener todos los equipos (GET /equipos) con sus categorías y unidades incluidas
   */
  getEquipos(): Observable<Equipo[]> {
    return this.apiService.get<Equipo[]>('/equipos');
  }

  /**
   * Obtener un equipo por ID
   */
  getEquipoById(id: number): Observable<Equipo> {
    return this.apiService.get<Equipo>(`/equipos/${id}`);
  }

  /**
   * Eliminar un equipo por ID
   */
  eliminarEquipo(id: number): Observable<any> {
    return this.apiService.delete(`/equipos/${id}`);
  }
}