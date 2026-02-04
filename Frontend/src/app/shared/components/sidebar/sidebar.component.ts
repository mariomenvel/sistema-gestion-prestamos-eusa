import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { SidebarService } from '../../../core/services/sidebar.service';

/**
 * Interface para los items del menú del sidebar.
 */
interface MenuItem {
  label: string;      // Texto a mostrar (ej: "Dashboard")
  route: string;      // Ruta de navegación (ej: "/alumno/dashboard")
  icon?: string;      // Icono opcional
}

/**
 * Componente Sidebar - Menú lateral de navegación.
 * 
 * FUNCIONALIDADES:
 * - Muestra opciones de navegación según el rol del usuario
 * - Resalta la opción activa (página actual)
 * - Permite navegar entre secciones
 * 
 * ROLES:
 * - Alumno/Profesor: Dashboard, Catálogo, Mis Préstamos, Mi Perfil
 * - PAS: Dashboard, Solicitudes, Préstamos Activos, Materiales, Reportes, Usuarios
 */
@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

  // ===== PROPIEDADES =====

  /**
   * Items del menú que se mostrarán en el sidebar.
   * Se cargan según el rol del usuario.
   */
  menuItems: MenuItem[] = [];

  /**
   * Rol del usuario actual.
   */
  currentRole: string | undefined;

  /**
   * Estado de si el sidebar está abierto (para móvil).
   */
  isSidebarOpen: boolean = false;

  /**
   * Suscripción al servicio del sidebar.
   */
  private sidebarSub?: Subscription;

  // ===== CONSTRUCTOR =====

  constructor(
    private authService: AuthService,
    public router: Router,
    private sidebarService: SidebarService
  ) { }

  // ===== CICLO DE VIDA =====

  ngOnInit(): void {
    // Obtener el rol del usuario actual
    this.currentRole = this.authService.currentRole();

    // Cargar el menú según el rol
    this.loadMenu();

    // Suscribirse al estado del sidebar
    this.sidebarSub = this.sidebarService.isOpen$.subscribe(open => {
      this.isSidebarOpen = open;
    });
  }

  ngOnDestroy(): void {
    this.sidebarSub?.unsubscribe();
  }

  // ===== MÉTODOS PRIVADOS =====

  /**
   * Carga los items del menú según el rol del usuario.
   */
  private loadMenu(): void {
    if (this.currentRole === 'alumno' || this.currentRole === 'profesor') {
      // Menú para Alumno/Profesor
      this.menuItems = [
        { label: 'Dashboard', route: '/alumno/dashboard', icon: 'fas fa-chart-line' },
        { label: 'Catálogo', route: '/alumno/catalogo', icon: 'fas fa-book' },
        { label: 'Mis Préstamos', route: '/alumno/mis-prestamos', icon: 'fas fa-hand-holding' },
        { label: 'Mi Perfil', route: '/alumno/mi-perfil', icon: 'fas fa-user' }
      ];
    } else if (this.currentRole === 'pas') {
      // Menú para PAS
      this.menuItems = [
        { label: 'Dashboard', route: '/pas/dashboard', icon: 'fas fa-chart-line' },
        { label: 'Solicitudes', route: '/pas/solicitudes', icon: 'fas fa-file-invoice' },
        { label: 'Préstamos Activos', route: '/pas/prestamos-activos', icon: 'fas fa-hand-holding-hand' },
        { label: 'Materiales', route: '/pas/materiales', icon: 'fas fa-box' },
        { label: 'Reportes', route: '/pas/reportes', icon: 'fas fa-clipboard-list' },
        { label: 'Usuarios', route: '/pas/usuarios', icon: 'fas fa-users-cog' }
      ];
    }
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
   * Verifica si una ruta está activa (es la página actual).
   * @param route Ruta a verificar (ej: "/alumno/dashboard")
   * @returns true si la ruta está activa, false si no
   */
  isActive(route: string): boolean {
    // router.isActive(ruta, opciones)
    // false = no requiere que la URL sea exacta (permite subrutas)
    return this.router.isActive(route, false);
  }

  /**
   * Navega a una ruta específica.
   * @param route Ruta de destino (ej: "/alumno/catalogo")
   */
  navigateTo(route: string): void {
    this.router.navigate([route]);
    // Cerrar sidebar en móvil al navegar
    this.sidebarService.close();
  }
}