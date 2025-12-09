import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Aquí se define la URL base de nuestro servidor (backend NodeJS/Express)
const API_URL = 'http://localhost:3000';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) { }

  /**
   * Manejador centralizado de errores HTTP.
   * @param error El objeto de error HTTP.
   * @returns Un Observable con un error a lanzar.
   */
  private formatErrors(error: HttpErrorResponse): Observable<never> {
    console.error('Error en la API:', error);

    let errorMessage = 'Ha ocurrido un error inesperado.';

    // Error de la API con cuerpo JSON
    if (error.error instanceof Object && error.error.mensaje) {
        errorMessage = error.error.mensaje;
    } else if (error.status === 401) {
        errorMessage = 'No autorizado. Por favor, inicie sesión.';
    } else if (error.status === 404) {
        errorMessage = 'Recurso no encontrado.';
    }
    
    // Devolvemos un error que se puede capturar en la lógica del componente
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Realiza una petición GET.
   * @param path Ruta de la API (ej: '/libros').
   * @param params Parámetros de consulta opcionales.
   * @returns Un Observable con la respuesta del servidor.
   */
  get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
    return this.http.get<T>(`${API_URL}${path}`, { params })
      .pipe(catchError(this.formatErrors));
  }

  /**
   * Realiza una petición POST.
   * @param path Ruta de la API (ej: '/usuarios/login').
   * @param body Cuerpo de la petición.
   * @returns Un Observable con la respuesta del servidor.
   */
  post<T>(path: string, body: Object = {}): Observable<T> {
    return this.http.post<T>(`${API_URL}${path}`, body)
      .pipe(catchError(this.formatErrors));
  }

  /**
   * Realiza una petición PUT (actualización completa).
   * @param path Ruta de la API (ej: '/libros/1').
   * @param body Cuerpo de la petición.
   * @returns Un Observable con la respuesta del servidor.
   */
  put<T>(path: string, body: Object = {}): Observable<T> {
    return this.http.put<T>(`${API_URL}${path}`, body)
      .pipe(catchError(this.formatErrors));
  }

  /**
   * Realiza una petición DELETE.
   * @param path Ruta de la API (ej: '/libros/1').
   * @returns Un Observable con la respuesta del servidor.
   */
  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${API_URL}${path}`)
      .pipe(catchError(this.formatErrors));
  }
}