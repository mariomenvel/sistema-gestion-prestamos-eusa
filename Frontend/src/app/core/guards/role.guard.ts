import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard funcional que protege rutas verificando si el usuario tiene el rol adecuado.
 * 
 * FLUJO:
 * 1. AuthGuard ya verificó que está logueado (este guard se ejecuta DESPUÉS)
 * 2. Lee los roles permitidos desde la configuración de la ruta: data: { roles: ['pas'] }
 * 3. Obtiene el rol actual del usuario desde AuthService
 * 4. Compara si el rol actual está en la lista de roles permitidos
 * 5. Si coincide → return true (permite acceso)
 * 6. Si NO coincide → redirige al dashboard correspondiente a su rol
 * 
 * USO EN ROUTING:
 * {
 *   path: 'pas',
 *   canActivate: [authGuard, roleGuard], // ← roleGuard se ejecuta después de authGuard
 *   data: { roles: ['pas'] },            // ← aquí se especifican los roles permitidos
 *   children: [...]
 * }
 * 
 * @param route Snapshot de la ruta (contiene data: { roles: [...] })
 * @param state Estado del router
 * @returns true si tiene rol adecuado, UrlTree para redirigir
 */
export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // 1. Obtener roles permitidos desde la configuración de la ruta
  const rolesPermitidos = route.data['roles'] as Array<string>;
  
  // 2. Obtener el rol actual del usuario logueado
  const rolActual = authService.currentRole();
  
  // 3. Verificar si el usuario tiene uno de los roles permitidos
  if (rolActual && rolesPermitidos.includes(rolActual)) {
    return true; // Usuario tiene el rol correcto, puede acceder
  }
  
  // 4. Usuario NO tiene el rol adecuado
  console.warn(
    `RoleGuard: Usuario con rol '${rolActual}' intentó acceder a ruta que requiere: ${rolesPermitidos.join(' o ')}`
  );
  
  // Redirigir al dashboard correspondiente a su rol real
  if (rolActual === 'alumno' || rolActual === 'profesor') {
    return router.createUrlTree(['/alumno/dashboard']);
  } else if (rolActual === 'pas') {
    return router.createUrlTree(['/pas/dashboard']);
  } else {
    // Caso raro: usuario sin rol válido, enviar al login
    return router.createUrlTree(['/auth/login']);
  }
};