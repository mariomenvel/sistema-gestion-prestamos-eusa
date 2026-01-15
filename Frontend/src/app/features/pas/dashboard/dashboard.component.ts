import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SolicitudesService } from '../../../core/services/solicitudes.service';
import { DashboardService } from '../../../core/services/dashboard.service'; 
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
    private dashboardService: DashboardService,
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

    // A. CARGAR LA TABLA DE SOLICITUDES
    this.solicitudesService.getSolicitudesPendientes().subscribe({
      next: (solicitudes) => {
        this.ultimasSolicitudes = solicitudes.slice(0, 5); // Mostramos las 5 últimas
      },
      error: (err) => console.error(err)
    });

    // B. CARGAR LOS CONTADORES (CARDS)
    this.dashboardService.getDashboardPAS().subscribe({
      next: (data) => {
        console.log('📊 Datos Dashboard:', data);
        this.solicitudesPendientes = data.solicitudes_pendientes;
        this.prestamosActivos = data.prestamos_activos;
        this.devolucionesHoy = data.devoluciones_hoy;
        this.materialesEnUso = data.materiales_en_uso;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error dashboard:', err);
        this.errorMessage = 'Error al cargar métricas';
        this.isLoading = false;
      }
    });
  }
}