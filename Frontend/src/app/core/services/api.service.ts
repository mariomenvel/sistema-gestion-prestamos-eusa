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
    console.error('Error en la API:', error);
    
    let errorMessage = 'Error desconocido';
    
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      switch (error.status) {
        case 400:
          errorMessage = 'Solicitud incorrecta.';
          break;
        case 401:
          errorMessage = 'No autorizado. Por favor, inicia sesión.';
          break;
        case 404:
          errorMessage = 'Recurso no encontrado.';
          break;
        case 500:
          errorMessage = 'Error al obtener ' + error.url?.split('/').pop();
          break;
        default:
          errorMessage = `Error del servidor: ${error.status}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}