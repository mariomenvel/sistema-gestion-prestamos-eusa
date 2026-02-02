import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Guards funcionales (minúscula porque son funciones, no clases)
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

// ===== COMPONENTES DE AUTH =====
import { LoginComponent } from './features/auth/login/login.component';
import { RegistroComponent } from './features/auth/registro/registro.component';

// ===== COMPONENTES DE ALUMNO =====
import { DashboardComponent as AlumnoDashboardComponent } from './features/alumno/dashboard/dashboard.component';
import { CatalogoComponent } from './features/alumno/catalogo/catalogo.component';
import { MisPrestamosComponent } from './features/alumno/mis-prestamos/mis-prestamos.component';
import { MiPerfilComponent } from './features/alumno/mi-perfil/mi-perfil.component';

// ===== COMPONENTES DE PAS =====
import { DashboardComponent as PASDashboardComponent } from './features/pas/dashboard/dashboard.component';
import { SolicitudesComponent } from './features/pas/solicitudes/solicitudes.component';
import { PrestamosActivosComponent } from './features/pas/prestamos-activos/prestamos-activos.component';
import { MaterialesComponent } from './features/pas/materiales/materiales.component';
import { ReportesComponent } from './features/pas/reportes/reportes.component';
import { UsuariosComponent } from './features/pas/usuarios/usuarios.component';
import { PrestamoPresencialComponent } from './features/pas/prestamo-presencial/prestamo-presencial.component';
import { PerfilComponent } from './features/pas/perfil/perfil.component';

/**
 * Configuración de rutas de la aplicación.
 * 
 * ORDEN DE VERIFICACIÓN:
 * 1. Angular busca la primera ruta que coincida con la URL
 * 2. Si tiene guards, los ejecuta en orden (authGuard primero, roleGuard después)
 * 3. Si todos los guards devuelven true, muestra el componente
 * 4. Si algún guard devuelve UrlTree, redirige a esa ruta
 */
const routes: Routes = [

  // RUTA POR DEFECTO (/)
  {
    path: '',
    redirectTo: '/auth/login',
    pathMatch: 'full'
  },

  {
    path: 'registro',
    component: RegistroComponent
  },

  // RUTAS DE AUTENTICACIÓN (sin guards)
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        component: LoginComponent
      }
    ]
  },


  // RUTAS DE ALUMNO/PROFESOR
  // Guards aplicados a TODAS las rutas hijas
  {
    path: 'alumno',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['alumno', 'profesor'] }, // ← Ambos roles pueden acceder
    children: [
      // Ruta por defecto de alumno
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      // Dashboard del alumno
      {
        path: 'dashboard',
        component: AlumnoDashboardComponent
      },
      // Catálogo de libros y equipos
      {
        path: 'catalogo',
        component: CatalogoComponent
      },
      // Mis préstamos (activos e histórico)
      {
        path: 'mis-prestamos',
        component: MisPrestamosComponent
      },
      // Mi perfil (editar datos personales)
      {
        path: 'mi-perfil',
        component: MiPerfilComponent
      }
    ]
  },

  // RUTAS DE PAS 
  // Guards aplicados a TODAS las rutas hijas
  {
    path: 'pas',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['pas'] }, // ← Solo PAS puede acceder
    children: [
      // Ruta por defecto de PAS
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      // Dashboard con métricas
      {
        path: 'dashboard',
        component: PASDashboardComponent
      },
      // Gestión de solicitudes pendientes
      {
        path: 'solicitudes',
        component: SolicitudesComponent
      },
      // Gestión de préstamos activos
      {
        path: 'prestamos-activos',
        component: PrestamosActivosComponent
      },
      // Gestión de materiales (libros y equipos)
      {
        path: 'materiales',
        component: MaterialesComponent
      },
      // Reportes con filtros
      {
        path: 'reportes',
        component: ReportesComponent
      },
      // Gestión de usuarios
      {
        path: 'usuarios',
        component: UsuariosComponent
      },
      {
        path: 'prestamo-presencial',
        component: PrestamoPresencialComponent
      },
      // Perfil del usuario PAS
      {
        path: 'perfil',
        component: PerfilComponent
      }
    ]
  },


  // RUTA 404 (cualquier otra URL no válida)
  {
    path: '**',
    redirectTo: '/auth/login'
  }
];

/**
 * Módulo de routing de la aplicación.
 * Se importa en AppModule para activar el sistema de rutas.
 */
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }