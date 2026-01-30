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
 * - Tabla de solicitudes pendientes
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // ===== MÉTRICAS (para las cards) =====
  
  solicitudesPendientes: number = 0;
  prestamosActivos: number = 0;
  devolucionesHoy: number = 0;
  materialesEnUso: number = 0;

  // ===== DATOS - SOLICITUDES PENDIENTES =====
  
  solicitudesPendientesData: Solicitud[] = [];

  // ===== ESTADO =====
  
  isLoadingSolicitudes: boolean = false;
  errorMessageSolicitudes: string = '';

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
   * Navega a la página de préstamo presencial
   */
  realizarPrestamoPresencial(): void {
    this.router.navigate(['/pas/prestamo-presencial']);
  }

  /**
   * Abre la página de solicitudes con la solicitud específica
   */
  gestionarSolicitud(solicitud: Solicitud): void {
    this.router.navigate(['/pas/solicitudes'], { 
      queryParams: { solicitudId: solicitud.id }
    });
  }

  /**
   * Obtiene el nombre completo del alumno
   */
  getNombreAlumno(solicitud: Solicitud): string {
    const usuario = (solicitud as any).Usuario || solicitud.usuario;
    if (usuario && usuario.nombre) {
      const apellidos = usuario.apellidos ? ` ${usuario.apellidos}` : '';
      return `${usuario.nombre}${apellidos}`;
    }
    return 'Alumno desconocido';
  }

  /**
   * Obtiene el nombre del material
   */
  getNombreMaterial(solicitud: Solicitud): string {
    const items = (solicitud as any).items;
    
    if (!items || items.length === 0) {
      return 'Sin materiales';
    }

    const primerItem = items[0];

    // Para solicitudes: item.Libro o item.Equipo
    if (primerItem.Libro) {
      return primerItem.Libro.titulo || 'Libro sin título';
    }

    if (primerItem.Equipo) {
      const marca = primerItem.Equipo.marca || '';
      const modelo = primerItem.Equipo.modelo || '';
      return `${marca} ${modelo}`.trim() || 'Equipo sin datos';
    }

    return 'Material desconocido';
  }

  /**
   * Obtiene el contador de materiales
   */
  getContadorMateriales(solicitud: Solicitud): string {
    const items = (solicitud as any).items;
    if (!items || items.length === 0) {
      return '0 materiales';
    }
    const cantidad = items.length;
    return cantidad === 1 ? '1 material' : `${cantidad} materiales`;
  }

  /**
   * Obtiene el texto del tipo de solicitud
   */
  getTipoTexto(tipo: string): string {
    return tipo === 'prof_trabajo' ? 'Tipo A' : 'Tipo B';
  }

  /**
   * Formatea fecha de YYYY-MM-DD a DD/MM/YYYY
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return '-';

    try {
      const date = new Date(fecha);
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const anio = date.getFullYear();
      return `${dia}/${mes}/${anio}`;
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return fecha;
    }
  }

  /**
   * Obtiene la clase CSS para el badge del estado
   */
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'badge-pendiente';
      case 'aprobada':
        return 'badge-aprobada';
      case 'rechazada':
        return 'badge-rechazada';
      default:
        return '';
    }
  }

  /**
   * Obtiene el texto del estado
   */
  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'pendiente':
        return 'Pendiente';
      case 'aprobada':
        return 'Aprobada';
      case 'rechazada':
        return 'Rechazada';
      default:
        return estado;
    }
  }

  // ===== MÉTODOS PRIVADOS =====
  
  /**
   * Carga todos los datos del dashboard
   */
  private cargarDatos(): void {
    this.cargarSolicitudesPendientesTabla();
    this.cargarMetricas();
  }

  /**
   * Carga las solicitudes pendientes para la tabla
   */
  private cargarSolicitudesPendientesTabla(): void {
    this.isLoadingSolicitudes = true;
    this.errorMessageSolicitudes = '';

    this.solicitudesService.getAllSolicitudes().subscribe({
      next: (solicitudes: Solicitud[]) => {
        console.log('📋 Solicitudes recibidas:', solicitudes);
        // Filtrar solo las pendientes
        this.solicitudesPendientesData = solicitudes.filter(s => s.estado === 'pendiente');
        this.isLoadingSolicitudes = false;
      },
      error: (err: any) => {
        console.error('❌ Error al cargar solicitudes:', err);
        this.errorMessageSolicitudes = 'Error al cargar solicitudes pendientes';
        this.isLoadingSolicitudes = false;
      }
    });
  }

  /**
   * Carga las métricas del dashboard (cards)
   */
  private cargarMetricas(): void {
    this.dashboardService.getDashboardPAS().subscribe({
      next: (data: any) => {
        console.log('📊 Datos Dashboard PAS:', data);
        this.solicitudesPendientes = data.solicitudes_pendientes || 0;
        this.prestamosActivos = data.prestamos_activos || 0;
        this.devolucionesHoy = data.devoluciones_hoy || 0;
        this.materialesEnUso = data.materiales_en_uso || 0;
      },
      error: (err: any) => {
        console.error('❌ Error al cargar métricas:', err);
      }
    });
  }
}