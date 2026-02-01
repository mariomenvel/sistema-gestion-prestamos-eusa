import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/usuario.model';

/**
 * Componente Header - Barra superior de navegación.
 * 
 * ELEMENTOS:
 * - Logo de EUSA
 * - Buscador (visual, sin funcionalidad por ahora)
 * - Icono de notificaciones (visual)
 * - Icono de configuración (visual)
 * - Icono de perfil (con dropdown de logout)
 * 
 * FUNCIONALIDADES:
 * - Mostrar información del usuario actual
 * - Permitir cerrar sesión
 */
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  // ===== PROPIEDADES =====

  /**
   * Usuario actual obtenido del AuthService.
   * Se usa para mostrar información en el header.
   */
  currentUser: Usuario | null = null;

  /**
   * Controla si el menú de perfil está abierto o cerrado.
   */
  isProfileMenuOpen: boolean = false;

  // ===== CONSTRUCTOR =====

  constructor(
    private authService: AuthService,
    private router: Router,
    private elementRef: ElementRef
  ) { }

  // ===== CICLO DE VIDA =====

  ngOnInit(): void {
    // Suscribirse al usuario actual desde AuthService
    // Como usamos signals, podemos acceder directamente
    this.currentUser = this.authService.currentUser();
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
   * Alterna la visibilidad del menú de perfil.
   */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.isProfileMenuOpen = false;
    }
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  /**
   * Cierra la sesión del usuario actual.
   * Llama al método logout del AuthService que:
   * 1. Limpia el token y usuario del localStorage
   * 2. Redirige al login
   */
  onLogout(): void {
    this.authService.logout();
  }

  /**
   * Navega a la página de perfil del usuario.
   */
  goToProfile(): void {
    this.isProfileMenuOpen = false;
    const role = this.authService.currentRole();

    if (role === 'alumno' || role === 'profesor') {
      this.router.navigate(['/alumno/mi-perfil']);
    } else if (role === 'pas') {
      // Por ahora, el PAS no tiene perfil propio
      console.log('Perfil PAS no implementado aún');
    }
  }

  /**
   * Getter para mostrar el nombre completo del usuario.
   */
  get fullName(): string {
    if (this.currentUser) {
      return `${this.currentUser.nombre} ${this.currentUser.apellidos}`;
    }
    return 'Usuario';
  }

  /**
   * Getter para mostrar las iniciales del usuario.
   * Ejemplo: "Juan Pérez" → "JP"
   */
  get userInitials(): string {
    if (this.currentUser) {
      const nombre = this.currentUser.nombre.charAt(0).toUpperCase();
      const apellido = this.currentUser.apellidos.charAt(0).toUpperCase();
      return `${nombre}${apellido}`;
    }
    return 'U';
  }
}