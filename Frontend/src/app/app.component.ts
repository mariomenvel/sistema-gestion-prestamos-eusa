import { Component } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

/**
 * Componente raíz de la aplicación.
 * 
 * RESPONSABILIDADES:
 * - Detectar en qué ruta está el usuario
 * - Mostrar/ocultar Header y Sidebar según la ruta
 * - Organizar el layout general de la aplicación
 */
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  /**
   * Título de la aplicación.
   */
  title = 'Sistema Biblioteca EUSA';

  /**
   * Indica si se debe mostrar el layout (Header + Sidebar).
   * Se oculta en rutas de autenticación (/auth/login).
   */
  showLayout: boolean = true;

  // ===== CONSTRUCTOR =====
  constructor(private router: Router) {
    // Suscribirse a los eventos de navegación
    this.router.events
      .pipe(
        // Filtrar solo los eventos de tipo NavigationEnd (cuando termina la navegación)
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: any) => {
        // Rutas públicas donde NO se muestra el layout
        const rutasPublicas = ['/login', '/registro'];

        // Ocultar layout si la URL es login o registro
        this.showLayout = !rutasPublicas.includes(event.url);
      });
  }
}