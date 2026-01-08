import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

// Importar servicios
import { PrestamosService } from '../../../core/services/prestamos.service';
import { SolicitudesService } from '../../../core/services/solicitudes.service';
import { SancionesService } from '../../../core/services/sanciones.service';

// Importar modelos
import { Prestamo } from '../../../core/models/prestamo.model';
import { Solicitud } from '../../../core/models/solicitud.model';
import { Sancion } from '../../../core/models/sancion.model';

/**
 * Interface para el formato de préstamos en la tabla.
 * Adaptamos los datos del backend a un formato más simple para la vista.
 */
interface PrestamoVista {
  id: number;
  material: string;
  tipo: 'Tipo A' | 'Tipo B';
  fechaPrestamo: string;
  fechaDevolucion: string;
  estado: 'activo' | 'vencido' | 'devuelto';
}

/**
 * Componente Dashboard Alumno - Vista principal después del login.
 * 
 * FUNCIONALIDADES:
 * - Muestra métricas (préstamos activos, solicitudes pendientes, sanciones)
 * - Lista los préstamos activos en una tabla
 * - Permite navegar al catálogo para solicitar préstamos
 * 
 * CONEXIÓN BACKEND:
 * - GET /prestamos/mios → Mis préstamos
 * - GET /solicitudes/mias → Mis solicitudes
 * - GET /sanciones/mias → Mis sanciones
 */
@Component({
  selector: 'app-alumno-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // ===== MÉTRICAS (para las cards) =====
  
  prestamosActivos: number = 0;
  solicitudesPendientes: number = 0;
  sancionesActivas: number = 0;

  // ===== PRÉSTAMOS =====
  
  /**
   * Lista de préstamos para mostrar en la tabla.
   * Adaptados del formato del backend al formato de la vista.
   */
  prestamos: PrestamoVista[] = [];

  // ===== ESTADO DEL COMPONENTE =====
  
  isLoading: boolean = false;
  errorMessage: string = '';

  // ===== CONSTRUCTOR =====
  
  constructor(
    private router: Router,
    private prestamosService: PrestamosService,
    private solicitudesService: SolicitudesService,
    private sancionesService: SancionesService
  ) { }

  // ===== CICLO DE VIDA =====
  
  ngOnInit(): void {
    this.loadDashboardData();
  }

  // ===== MÉTODOS PÚBLICOS =====
  
  /**
   * Navega a la página de catálogo para solicitar un préstamo.
   */
  solicitarPrestamo(): void {
    this.router.navigate(['/alumno/catalogo']);
  }

  /**
   * Obtiene la clase CSS según el estado del préstamo.
   */
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'activo':
        return 'badge-activo';
      case 'vencido':
        return 'badge-vencido';
      case 'devuelto':
        return 'badge-devuelto';
      default:
        return '';
    }
  }

  /**
   * Obtiene el texto del badge según el estado.
   */
  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'activo':
        return 'Activo';
      case 'vencido':
        return 'Vencido';
      case 'devuelto':
        return 'Devuelto';
      default:
        return estado;
    }
  }

  // ===== MÉTODOS PRIVADOS =====
  
  /**
   * Carga todos los datos del dashboard desde el backend.
   * Usa forkJoin para hacer las 3 peticiones en paralelo.
   */
  private loadDashboardData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Hacer las 3 peticiones en paralelo
    forkJoin({
      prestamos: this.prestamosService.getMisPrestamos(),
      solicitudes: this.solicitudesService.getMisSolicitudes(),
      sanciones: this.sancionesService.getMisSanciones()
    }).subscribe({
      next: (data) => {
        console.log('📊 Datos recibidos del backend:', data);

        // Procesar préstamos
        this.procesarPrestamos(data.prestamos);

        // Procesar solicitudes
        this.procesarSolicitudes(data.solicitudes);

        // Procesar sanciones
        this.procesarSanciones(data.sanciones);

        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error al cargar datos del dashboard:', error);
        this.errorMessage = 'Error al cargar los datos. Por favor, intenta de nuevo.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Procesa los préstamos del backend y los adapta para la vista.
   */
  private procesarPrestamos(prestamos: Prestamo[]): void {
    console.log('📦 Préstamos recibidos:', prestamos);

    // Filtrar solo los préstamos activos
    const prestamosActivos = prestamos.filter(p => p.estado === 'activo');
    
    // Actualizar la métrica
    this.prestamosActivos = prestamosActivos.length;

    // Adaptar los datos para la tabla
    this.prestamos = prestamosActivos.map(p => this.adaptarPrestamo(p));

    console.log('✅ Préstamos procesados:', this.prestamos);
  }

/**
 * Adapta un préstamo del backend al formato de la vista.
 */
private adaptarPrestamo(prestamo: Prestamo): PrestamoVista {
  // Obtener el nombre del material (libro o equipo)
  let material = 'Material desconocido';
  
  // IMPORTANTE: Sequelize devuelve los includes con mayúscula inicial
  // Si tiene Ejemplar (mayúscula), es un libro
  if (prestamo.Ejemplar) {
    material = prestamo.Ejemplar.libro?.titulo || 'Libro sin título';
  }
  // Si tiene Unidad (mayúscula), es un equipo
  else if (prestamo.Unidad) {
    // Equipo tiene marca y modelo, no nombre
    const marca = prestamo.Unidad.equipo?.marca || '';
    const modelo = prestamo.Unidad.equipo?.modelo || '';
    material = `${marca} ${modelo}`.trim() || 'Equipo sin identificar';
  }

  // El tipo viene directamente del préstamo ('a' o 'b')
  const tipo = prestamo.tipo === 'a' ? 'Tipo A' : 'Tipo B';

  // Formatear fechas (nombre correcto: fecha_inicio)
  const fechaPrestamo = this.formatearFecha(prestamo.fecha_inicio);
  const fechaDevolucion = this.formatearFecha(prestamo.fecha_devolucion_prevista);

  return {
    id: prestamo.id,
    material: material,
    tipo: tipo,
    fechaPrestamo: fechaPrestamo,
    fechaDevolucion: fechaDevolucion,
    estado: prestamo.estado as 'activo' | 'vencido' | 'devuelto'
  };
}

  /**
   * Procesa las solicitudes del backend.
   */
  private procesarSolicitudes(solicitudes: Solicitud[]): void {
    console.log('📝 Solicitudes recibidas:', solicitudes);

    // Contar las que están pendientes de aprobación
    this.solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente').length;

    console.log('✅ Solicitudes pendientes:', this.solicitudesPendientes);
  }

  /**
   * Procesa las sanciones del backend.
   */
  private procesarSanciones(sanciones: Sancion[]): void {
    console.log('⚠️ Sanciones recibidas:', sanciones);

    // Contar las que están activas
    this.sancionesActivas = sanciones.filter(s => s.estado === 'activa').length;

    console.log('✅ Sanciones activas:', this.sancionesActivas);
  }

  /**
   * Formatea una fecha de YYYY-MM-DD a DD/MM/YYYY.
   */
  private formatearFecha(fecha: string): string {
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
}