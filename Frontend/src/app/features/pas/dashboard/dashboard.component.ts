import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SolicitudesService } from '../../../core/services/solicitudes.service';
import { Solicitud } from '../../../core/models/solicitud.model';

/**
 * Componente Dashboard PAS
 * 
 * Muestra un resumen del estado del sistema:
 * - Solicitudes pendientes
 * - Préstamos activos
 * - Devoluciones hoy
 * - Materiales en uso
 * - Últimas solicitudes pendientes
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // ===== MÉTRICAS =====
  
  solicitudesPendientes: number = 0;
  prestamosActivos: number = 0;
  devolucionesHoy: number = 0;
  materialesEnUso: number = 0;

  // ===== DATOS =====
  
  ultimasSolicitudes: Solicitud[] = [];

  // ===== ESTADO =====
  
  isLoading: boolean = false;
  errorMessage: string = '';

  // ===== CONSTRUCTOR =====
  
  constructor(
    private solicitudesService: SolicitudesService,
    private router: Router
  ) { }

  // ===== CICLO DE VIDA =====
  
  ngOnInit(): void {
    this.cargarDatos();
  }

  // ===== MÉTODOS PÚBLICOS =====
  
  /**
   * Navega a la página de todas las solicitudes
   */
  verTodasSolicitudes(): void {
    this.router.navigate(['/pas/solicitudes']);
  }

  /**
   * Obtiene el nombre del usuario
   */
  getNombreUsuario(solicitud: Solicitud): string {
    if (solicitud.usuario) {
      return solicitud.usuario.nombre || solicitud.usuario.email;
    }
    return 'Usuario desconocido';
  }

  /**
   * Obtiene el nombre del material
   */
  getNombreMaterial(solicitud: Solicitud): string {
    // Si tiene ejemplar (libro)
    if (solicitud.Ejemplar && solicitud.Ejemplar.libro) {
      return solicitud.Ejemplar.libro.titulo;
    }
    
    // Si tiene unidad (equipo)
    if (solicitud.Unidad && solicitud.Unidad.equipo) {
      const equipo = solicitud.Unidad.equipo;
      return `${equipo.marca} ${equipo.modelo}`;
    }
    
    return 'Material desconocido';
  }

  /**
   * Obtiene el texto del tipo de solicitud
   */
  getTipoTexto(tipo: string): string {
    return tipo === 'prof_trabajo' ? 'Tipo A' : 'Tipo B';
  }

  /**
   * Formatea fecha DD/MM/YYYY
   */
  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  // ===== MÉTODOS PRIVADOS =====
  
  /**
   * Carga los datos del dashboard
   */
  private cargarDatos(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Cargar solicitudes pendientes
    this.solicitudesService.getSolicitudesPendientes().subscribe({
      next: (solicitudes) => {
        console.log('📊 Solicitudes pendientes:', solicitudes);
        
        // Contar solicitudes pendientes
        this.solicitudesPendientes = solicitudes.length;
        
        // Mostrar solo las últimas 2 solicitudes en la tabla
        this.ultimasSolicitudes = solicitudes.slice(0, 2);
        
        // TODO: Calcular métricas reales cuando tengamos los endpoints
        // Por ahora usamos valores de ejemplo del mockup
        this.prestamosActivos = 38;
        this.devolucionesHoy = 7;
        this.materialesEnUso = 156;
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar datos:', err);
        this.errorMessage = 'Error al cargar los datos del dashboard';
        this.isLoading = false;
      }
    });
  }
}