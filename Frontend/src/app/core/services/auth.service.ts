//Este archivo gestiona la sesión
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http'; //Para hablar con el backend 
import { Router } from '@angular/router'; //Para cambiar de página
import { Observable, tap, map, catchError, of } from 'rxjs';//libreria para manejar la comunicación asíncrona con el servidor. 

// Importamos la interfaz de Usuario que definimos antes
import { Usuario } from '../models/usuario.model';

// Definimos la estructura exacta de lo que devuelve tu backend (auth.controller.js)
interface LoginResponse {
  mensaje: string;
  token: string;
  usuario: Usuario;
}
//Esto le dice a Angular que esta clase es un Servicio.
@Injectable({
  providedIn: 'root' //significa que Angular crea una única instancia de esta clase para toda la aplicación (es un singleton).
})
export class AuthService {
  // 1. Inyectamos dependencias (HTTP para hablar con el back, Router para navegar)
  private http = inject(HttpClient);
  private router = inject(Router);

  // Definimos la URL base de nuestro servidor para no tener que repetirla en cada llamada.
  private readonly API_URL = 'http://localhost:3000'; 


  // Usamos signals para que la vista reaccione automáticamente a los cambios. Si el valor de Signals cambia, cambia en cualquier parte de la interfaz que la use.

  // Signal privada para el Token (leemos de localStorage al inicio por si recarga la página)
  private _token = signal<string | null>(localStorage.getItem('token'));

  // Signal privada para el Usuario
  private _currentUser = signal<Usuario | null>(this.getUserFromStorage());

  //PÚBLICOS 
  // Exponemos información derivada para que los componentes la consuman
  
  // Para saber si el usuario está logueado (True/False)
  isAuthenticated = computed(() => !!this._token());

  // Para saber el rol del usuario ('admin', 'pas', 'alumno')
  currentRole = computed(() => this._currentUser()?.rol);

  // Para acceder a los datos del usuario (Nombre, email...)
  currentUser = this._currentUser.asReadonly();// asReadonly para que solo el AuthService pueda cambiar su valor internamente.


  /**
   * Función para iniciar sesión.
   * Conecta con auth.controller.js del backend.
   */
 login(credentials: { email: string; password: string }): Observable<boolean> {
  return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
    .pipe(
      tap((response) => {
        // Si el backend responde con éxito, guardamos los datos  
        if (response.token && response.usuario) {
          this.setSession(response.token, response.usuario);
        }
      }),
      map(() => true), // Convertimos la respuesta en un booleano "True" (Éxito)
      catchError((error) => {
        console.error('Error en login:', error);
        // Lanzamos el error para que el componente lo capture
        throw error;
      })
    );
}

  /**
   * Cierra la sesión y borra los datos.
   */
  logout() {
    // 1. Limpiamos las Signals (Memoria)
    this._token.set(null);
    this._currentUser.set(null);

    // 2. Limpiamos el LocalStorage 
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 3. Redirigimos al Login
    this.router.navigate(['/auth/login']);
  }

  /**
   * Método público para que el Interceptor pueda leer el token
   */
  getToken(): string | null {
    return this._token();
  }

  // MÉTODOS PRIVADOS 
  //Actualiza la memoria (Signals _token y _currentUser). Guarda el token y el objeto de usuario (serializado con JSON.stringify) en el localStorage.
  private setSession(token: string, user: Usuario) {
    this._token.set(token);
    this._currentUser.set(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }

  private getUserFromStorage(): Usuario | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}