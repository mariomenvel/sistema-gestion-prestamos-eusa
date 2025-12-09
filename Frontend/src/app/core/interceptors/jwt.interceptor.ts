// Este archivo centraliza la lógica para añadir el JWT a todas las peticiones HTTP salientes que lo requieran.
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; 

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

  // Inyectamos el servicio de autenticación en el constructor
  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // 1. Obtener el token del servicio de autenticación
    const token = this.authService.getToken();

    // 2. Si hay token, clonar la petición y añadir el encabezado
    if (token) {
      // Clonamos la petición para añadir el nuevo encabezado
      request = request.clone({
        setHeaders: {
          // El formato estándar es "Bearer " seguido del token
          Authorization: `Bearer ${token}`
        }
      });
    }

    // 3. Dejar que la petición continúe (modificada o no)
    return next.handle(request);
  }
}