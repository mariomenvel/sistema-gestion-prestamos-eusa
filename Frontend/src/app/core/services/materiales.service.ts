import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Categoria } from '../models/categoria.model';

// Importamos las interfaces que definimos en core/models
import { Libro, Equipo, Ejemplar, Unidad } from '../models';

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
  /**
 * Actualizar un libro (título, autor, editorial, categoría)
 */
  actualizarLibro(id: number, datos: Partial<Libro>): Observable<Libro> {
    return this.apiService.put<Libro>(`/libros/${id}`, datos);
  }
  aniadirLibro(libro: Libro): Observable<Libro> {
    return this.apiService.post<Libro>('/libros', libro);
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

  /**
   * Actualizar un equipo (marca, modelo, descripción, categoría)
   */
  actualizarEquipo(id: number, datos: Partial<Equipo>): Observable<Equipo> {
    return this.apiService.put<Equipo>(`/equipos/${id}`, datos);
  }

  /**
 * Subir imagen de un equipo
 */
subirImagenEquipo(id: number, archivo: File): Observable<Equipo> {
  const formData = new FormData();
  formData.append('foto', archivo);
  
  // Obtener token del localStorage
  const token = localStorage.getItem('token');
  
  // Crear headers con el token
  const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
  
  return this.apiService.post<Equipo>(`/equipos/${id}/imagen`, formData, headers);
}
  aniadirEquipo(equipo: Equipo): Observable<Equipo> {
    return this.apiService.post<Equipo>('/equipos', equipo);
  }

  // ===== EJEMPLARES =====

  /**
   * Actualizar estado de un ejemplar
   */
  actualizarEjemplar(id: number, datos: Partial<Ejemplar>): Observable<Ejemplar> {
    return this.apiService.put<Ejemplar>(`/ejemplares/${id}`, datos);
  }

  // ===== UNIDADES =====

  /**
   * Actualizar estado de una unidad
   */
  actualizarUnidad(id: number, datos: Partial<Unidad>): Observable<Unidad> {
    return this.apiService.put<Unidad>(`/unidades/${id}`, datos);
  }

  /**
 * Crear un nuevo equipo con sus unidades
 */
  crearEquipo(datos: any): Observable<Equipo> {
    return this.apiService.post<Equipo>('/equipos', datos);
  }

  /**
   * Crear un nuevo libro con sus ejemplares
   */
  crearLibro(datos: any): Observable<Libro> {
    return this.apiService.post<Libro>('/libros', datos);
  }

  /**
   * Crear una nueva categoría
   */
  crearCategoria(datos: any): Observable<any> {
    return this.apiService.post<any>('/categorias', datos);
  }

  /**
   * Obtener todas las categorías
   */
  getCategorias(): Observable<any[]> {
    return this.apiService.get<any[]>('/categorias');
  }
  /**
 * Eliminar un ejemplar específico
 */
  eliminarEjemplar(id: number): Observable<any> {
    return this.apiService.delete(`/ejemplares/${id}`);
  }

  /**
   * Eliminar una unidad específica
   */
  eliminarUnidad(id: number): Observable<any> {
    return this.apiService.delete(`/unidades/${id}`);
  }

}