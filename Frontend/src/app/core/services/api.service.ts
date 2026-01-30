import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  /**
   * GET request
   */
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}${endpoint}`)
      .pipe(
        catchError(this.formatErrors)
      );
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, body: any, customHeaders?: any): Observable<T> {
    const headers = customHeaders || {};
    
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, body, { headers })
      .pipe(
        catchError(this.formatErrors)
      );
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, body?: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, body)
      .pipe(
        catchError(this.formatErrors)
      );
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`)
      .pipe(
        catchError(this.formatErrors)
      );
  }

  /**
   * Formatea errores HTTP
   */
private formatErrors(error: HttpErrorResponse): Observable<never> {
  console.error('❌ Error en la API:', error);
  
  let errorMessage = 'Ha ocurrido un error';
  
  // Prioridad 1: Mensaje del backend
  if (error.error && error.error.mensaje) {
    errorMessage = error.error.mensaje;
  }
  // Prioridad 2: Mensaje de error HTTP estándar
  else if (error.message) {
    errorMessage = error.message;
  }
  // Prioridad 3: Mensaje genérico según el código
  else {
    switch (error.status) {
      case 400:
        errorMessage = 'Solicitud incorrecta';
        break;
      case 401:
        errorMessage = 'No autorizado';
        break;
      case 403:
        errorMessage = 'Acceso denegado';
        break;
      case 404:
        errorMessage = 'No encontrado';
        break;
      case 500:
        errorMessage = 'Error del servidor';
        break;
      default:
        errorMessage = `Error ${error.status}`;
    }
  }
  
  return throwError(() => ({ message: errorMessage, status: error.status }));
} 
}