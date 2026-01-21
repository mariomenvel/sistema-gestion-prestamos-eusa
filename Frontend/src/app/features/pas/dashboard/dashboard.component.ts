import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PrestamosService } from '../../../core/services/prestamos.service';
import { DashboardService } from '../../../core/services/dashboard.service'; 
import { Prestamo } from '../../../core/models/prestamo.model';

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
  
  /**
   * Array de solicitudes pendientes para mostrar en la tabla
   */
  prestamosActivosData: Prestamo[] = [];

  // ===== ESTADO =====
  
  isLoadingPrestamos: boolean = false;
  errorMessagePrestamos: string = '';

  // ===== CONSTRUCTOR =====
  
  constructor(
    private prestamosService: PrestamosService,
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
   * Obtiene el nombre completo del alumno desde el objeto Préstamo
   */
  getNombreAlumno(prestamo: Prestamo): string {
    const usuario = (prestamo as any).Usuario;
    if (usuario && usuario.nombre) {
      const apellidos = usuario.apellidos ? ` ${usuario.apellidos}` : '';
      return `${usuario.nombre}${apellidos}`;
    }
    return 'Alumno desconocido';
  }

  /**
   * Obtiene el nombre del material (libro o equipo) desde el Préstamo
   */
  getNombreMaterial(prestamo: Prestamo): string {
    const items = (prestamo as any).items;
    
    if (!items || items.length === 0) {
      return 'Material desconocido';
    }

    const primerItem = items[0];

    // Si es un ejemplar (libro)
    if (primerItem.Ejemplar && primerItem.Ejemplar.libro) {
      return primerItem.Ejemplar.libro.titulo;
    }

    // Si es una unidad (equipo)
    if (primerItem.Unidad && primerItem.Unidad.equipo) {
      const equipo = primerItem.Unidad.equipo;
      return `${equipo.marca} ${equipo.modelo}`;
    }

    return 'Material desconocido';
  }

  /**
   * Obtiene el texto del tipo de solicitud
   */
  getTipoTexto(tipo: string): string {
    return tipo === 'a' ? 'Tipo A' : 'Tipo B';
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
      case 'activo':
        return 'badge-activo';
      case 'vencido':
        return 'badge-vencido';
      case 'cerrado':
        return 'badge-completado';
      default:
        return '';
    }
  }

  /**
   * Obtiene el texto del estado para mostrar
   */
  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'activo':
        return 'Activo';
      case 'vencido':
        return 'Vencido';
      case 'cerrado':
        return 'Completado';
      default:
        return estado;
    }
  }

  // ===== MÉTODOS PRIVADOS =====
  
  /**
   * Carga todos los datos del dashboard
   */
  private cargarDatos(): void {
    // A. CARGAR SOLICITUDES PENDIENTES
    this.cargarSolicitudesPendientes();

    // B. CARGAR LOS CONTADORES (CARDS)
    this.cargarMetricas();
  }

  /**
   * Carga las solicitudes pendientes para la tabla
   */
  private cargarSolicitudesPendientes(): void {
    this.isLoadingPrestamos = true;
    this.errorMessagePrestamos = '';

    // ✅ Llamar al endpoint de solicitudes pendientes
    this.prestamosService.getPrestamosActivos().subscribe({
      next: (solicitudes: Prestamo[]) => {
        console.log('📋 Solicitudes pendientes recibidas:', solicitudes);
        this.prestamosActivosData = solicitudes;
        this.isLoadingPrestamos = false;
      },
      error: (err: any) => {
        console.error('❌ Error al cargar solicitudes pendientes:', err);
        this.errorMessagePrestamos = 'Error al cargar solicitudes pendientes';
        this.isLoadingPrestamos = false;
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
        // Las métricas no son críticas, permitir que siga funcionando
      }
    });
  }
}