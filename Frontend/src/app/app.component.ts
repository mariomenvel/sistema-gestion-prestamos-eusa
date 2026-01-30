import { Component, OnInit } from '@angular/core';
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
export class AppComponent implements OnInit {
  
  /**
   * Título de la aplicación.
   */
  title = 'Sistema Biblioteca EUSA';

  /**
   * Indica si se debe mostrar el layout (Header + Sidebar).
   * Se oculta en rutas de autenticación (/login, /registro).
   */
  showLayout: boolean = true;

  // ===== CONSTRUCTOR =====
  
  constructor(private router: Router) { }

  // ===== CICLO DE VIDA =====

  ngOnInit(): void {
    // Verificar la ruta inicial al cargar la aplicación
    this.verificarRuta(this.router.url);
      console.log('🔍 Ruta inicial:', this.router.url);


    // Suscribirse a los eventos de navegación posteriores
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe((event: any) => {
              console.log('🔍 Nueva navegación:', event.url);

        this.verificarRuta(event.url);
      });
  }

  // ===== MÉTODOS PRIVADOS =====

  /**
   * Verifica si la ruta actual debe mostrar el layout o no
   */
private verificarRuta(url: string): void {
  // Obtener la ruta base sin query params
  const rutaBase = url.split('?')[0];
  
  console.log('🔍 Ruta base:', rutaBase);
  
  // Ocultar layout si la ruta empieza con /auth o es /registro
  this.showLayout = !(rutaBase.startsWith('/auth') || rutaBase === '/registro');
  
  console.log('🔍 Mostrar layout:', this.showLayout);
}
}