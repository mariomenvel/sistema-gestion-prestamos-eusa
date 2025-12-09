import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional que protege rutas verificando si el usuario está autenticado.
 * 
 * FLUJO:
 * 1. Usuario intenta acceder a una ruta protegida
 * 2. Este guard verifica si tiene token válido (isAuthenticated)
 * 3. Si SÍ está autenticado → return true (permite acceso)
 * 4. Si NO está autenticado → redirige a /auth/login
 * 
 * USO EN ROUTING:
 * {
 *   path: 'alumno',
 *   canActivate: [authGuard], // ← minúscula porque es función
 *   children: [...]
 * }
 * 
 * @param route Snapshot de la ruta actual (no lo usamos aquí, pero Angular lo pasa)
 * @param state Estado actual del router (no lo usamos aquí, pero Angular lo pasa)
 * @returns true si puede acceder, UrlTree para redirigir
 */
export const authGuard: CanActivateFn = (route, state) => {
  // inject() es la forma moderna de obtener servicios (reemplaza al constructor)
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Verificar si el usuario está autenticado usando el signal computed
  if (authService.isAuthenticated()) {
    return true; // Usuario tiene token, puede acceder
  }
  
  // Usuario no tiene token, redirigir al login
  console.warn('AuthGuard: Usuario no autenticado, redirigiendo al login');
  return router.createUrlTree(['/auth/login']);
};