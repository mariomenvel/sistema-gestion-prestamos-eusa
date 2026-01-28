import { Component, OnInit } from '@angular/core';
import { PrestamosService } from '../../../core/services/prestamos.service';
import { SolicitudesService } from '../../../core/services/solicitudes.service';
import { Prestamo } from '../../../core/models/prestamo.model';

/**
 * Interface para elementos de la tabla (solicitudes + préstamos)
 */
interface FilaTabla {
  id: number;
  tipo: string; // 'prof_trabajo' | 'uso_propio' | 'a' | 'b'
  material: string;
  tipoSolicitud: string; // 'Tipo A' | 'Tipo B'
  fecha: string; // fecha_inicio o creada_en
  fechaFin?: string | null; // fecha_devolucion_prevista o null
  estado: string; // 'pendiente' | 'activo' | 'vencido' | 'cerrado'
  esSolicitud: boolean; // true si es solicitud, false si es préstamo
}

/**
 * Componente Mis Préstamos (Alumno)
 * 
 * Muestra en una sola tabla:
 * 1. Solicitudes pendientes de aprobación
 * 2. Préstamos activos, vencidos y completados
 * 
 * Con filtros por:
 * - Búsqueda de material
 * - Tipo (Tipo A / Tipo B)
 * - Rango de fechas
 */
@Component({
  selector: 'app-mis-prestamos',
  templateUrl: './mis-prestamos.component.html',
  styleUrls: ['./mis-prestamos.component.scss']
})
export class MisPrestamosComponent implements OnInit {

  // ===== DATOS =====
  filas: FilaTabla[] = [];
  filasFiltradas: FilaTabla[] = [];

  // ===== BÚSQUEDA =====
  textoBusqueda: string = '';

  // ===== FILTROS =====
  filtroTipo: string = 'todos'; // 'todos' | 'tipoA' | 'tipoB'
  filtroEstado: string = 'todos'; // 'todos' | 'pendiente' | 'activo' | 'vencido' | 'cerrado'
  filtroFechaDesde: string = '';
  filtroFechaHasta: string = '';

  // ===== ORDENACIÓN =====
  sortColumn: string = 'fecha'; // 'fecha' o 'material'
  sortDirection: 'asc' | 'desc' = 'desc';

  // ===== ESTADO =====
  isLoading: boolean = false;
  errorMessage: string = '';

  // ===== CONSTRUCTOR =====
  constructor(
    private prestamosService: PrestamosService,
    private solicitudesService: SolicitudesService
  ) { }

  // ===== CICLO DE VIDA =====
  ngOnInit(): void {
    this.cargarDatos();

    // Suscribirse a cambios de solicitudes
    this.solicitudesService.solicitudCreada$.subscribe(() => {
      this.cargarDatos();
    });
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
   * Aplica todos los filtros
   */
  aplicarFiltros(): void {
    let resultado = this.filas.filter(fila => {
      // Filtro por búsqueda de material
      if (this.textoBusqueda.trim()) {
        const textoNormalizado = this.normalizarTexto(this.textoBusqueda);
        const nombreMaterial = this.normalizarTexto(fila.material);
        if (!nombreMaterial.includes(textoNormalizado)) {
          return false;
        }
      }

      // Filtro por tipo
      if (this.filtroTipo !== 'todos') {
        const tipoFila = fila.tipo === 'prof_trabajo' || fila.tipo === 'a' ? 'tipoA' : 'tipoB';
        if (tipoFila !== this.filtroTipo) {
          return false;
        }
      }

      // 🔴 Filtro por estado 🟢
      if (this.filtroEstado !== 'todos') {
        if (fila.estado !== this.filtroEstado) {
          return false;
        }
      }

      // Filtro por rango de fechas
      if (this.filtroFechaDesde || this.filtroFechaHasta) {
        const fechaFila = new Date(fila.fecha).getTime();

        if (this.filtroFechaDesde) {
          const fechaDesde = new Date(this.filtroFechaDesde).getTime();
          if (fechaFila < fechaDesde) {
            return false;
          }
        }

        if (this.filtroFechaHasta) {
          const fechaHasta = new Date(this.filtroFechaHasta);
          fechaHasta.setDate(fechaHasta.getDate() + 1);
          if (fechaFila > fechaHasta.getTime()) {
            return false;
          }
        }
      }

      return true;
    });

    // 4. Aplicar ordenación
    this.aplicarOrdenacion(resultado);
  }

  ordenar(columna: string): void {
    if (this.sortColumn === columna) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columna;
      this.sortDirection = columna === 'fecha' ? 'desc' : 'asc';
    }
    this.aplicarFiltros();
  }

  private aplicarOrdenacion(datos: FilaTabla[]): void {
    datos.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (this.sortColumn) {
        case 'fecha':
          valorA = new Date(a.fecha).getTime();
          valorB = new Date(b.fecha).getTime();
          break;
        case 'material':
          valorA = a.material.toLowerCase();
          valorB = b.material.toLowerCase();
          break;
        default:
          return 0;
      }

      if (valorA < valorB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valorA > valorB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.filasFiltradas = datos;
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.filtroTipo = 'todos';
    this.filtroEstado = 'todos';
    this.filtroFechaDesde = '';
    this.filtroFechaHasta = '';
    this.aplicarFiltros();
  }

  /**
   * Formatea fecha DD/MM/YYYY
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  /**
   * Obtiene el texto del tipo (Tipo A o Tipo B)
   */
  getTipoTexto(tipo: string): string {
    return tipo === 'prof_trabajo' || tipo === 'a' ? 'Tipo A' : 'Tipo B';
  }

  /**
   * Obtiene la clase CSS para el estado
   */
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'badge-pendiente';
      case 'activo': return 'badge-activo';
      case 'vencido': return 'badge-vencido';
      case 'cerrado': return 'badge-completado';
      case 'aprobada': return 'badge-aprobada';
      case 'rechazada': return 'badge-rechazada';
      default: return '';
    }
  }

  /**
   * Obtiene el texto del estado
   */
  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'activo': return 'Activo';
      case 'vencido': return 'Vencido';
      case 'cerrado': return 'Completado';
      case 'aprobada': return 'Aprobada';
      case 'rechazada': return 'Rechazada';
      default: return estado;
    }
  }

  // ===== MÉTODOS PRIVADOS =====

  /**
   * Carga solicitudes pendientes + préstamos
   */
  private cargarDatos(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Cargar solicitudes
    this.solicitudesService.getMisSolicitudes().subscribe({
      next: (solicitudes) => {
        // Cargar préstamos
        this.prestamosService.getMisPrestamos().subscribe({
          next: (prestamos) => {
            console.log('📋 Solicitudes recibidas:', solicitudes);
            console.log('📦 Préstamos recibidos:', prestamos);

            this.filas = [];

            // Agregar solicitudes pendientes
            const solicitudesPendientes = solicitudes.filter(s => s.estado === 'pendiente');
            solicitudesPendientes.forEach(solicitud => {
              this.filas.push(this.adaptarSolicitud(solicitud));
            });

            // Agregar todos los préstamos
            prestamos.forEach(prestamo => {
              this.filas.push(this.adaptarPrestamo(prestamo));
            });

            // Ordenar por fecha descendente (más recientes primero)
            this.filas.sort((a, b) => {
              const fechaA = new Date(a.fecha).getTime();
              const fechaB = new Date(b.fecha).getTime();
              return fechaB - fechaA;
            });

            this.filasFiltradas = [...this.filas];
            this.aplicarFiltros(); // Esto ya ordena y filtra
            this.isLoading = false;

            console.log('✅ Filas procesadas:', this.filas);
          },
          error: (err) => {
            console.error('❌ Error al cargar préstamos:', err);
            this.errorMessage = 'Error al cargar tus préstamos';
            this.isLoading = false;
          }
        });
      },
      error: (err) => {
        console.error('❌ Error al cargar solicitudes:', err);
        this.errorMessage = 'Error al cargar tus solicitudes';
        this.isLoading = false;
      }
    });
  }

  /**
   * Adapta una solicitud al formato de la tabla
   */
  private adaptarSolicitud(solicitud: any): FilaTabla {
    let material = 'Material desconocido';

    // Solicitud tiene items directamente
    if (solicitud.items && solicitud.items.length > 0) {
      const nombres: string[] = [];

      solicitud.items.forEach((item: any) => {
        // Si es un libro
        if (item.Libro) {
          nombres.push(item.Libro.titulo);
        }
        // Si es un equipo
        else if (item.Equipo) {
          nombres.push(`${item.Equipo.marca} ${item.Equipo.modelo}`);
        }
      });

      material = nombres.length > 0 ? nombres.join(', ') : 'Material desconocido';
    }

    return {
      id: solicitud.id,
      tipo: solicitud.tipo,
      material: material,
      tipoSolicitud: solicitud.tipo === 'prof_trabajo' ? 'Tipo A' : 'Tipo B',
      fecha: solicitud.creada_en,
      fechaFin: undefined,
      estado: solicitud.estado, // 'pendiente'
      esSolicitud: true
    };
  }

  /**
   * Adapta un préstamo al formato de la tabla
   */
  private adaptarPrestamo(prestamo: any): FilaTabla {
    let material = 'Material desconocido';

    // Préstamo tiene items
    const items = prestamo.items;

    if (items && items.length > 0) {
      const primerItem = items[0];

      // Si es un ejemplar (libro)
      if (primerItem.Ejemplar && primerItem.Ejemplar.libro) {
        material = primerItem.Ejemplar.libro.titulo;
      }
      // Si es una unidad (equipo)
      else if (primerItem.Unidad && primerItem.Unidad.equipo) {
        const equipo = primerItem.Unidad.equipo;
        material = `${equipo.marca} ${equipo.modelo}`;
      }
    }

    return {
      id: prestamo.id,
      tipo: prestamo.tipo,
      material: material,
      tipoSolicitud: prestamo.tipo === 'a' ? 'Tipo A' : 'Tipo B',
      fecha: prestamo.fecha_inicio,
      fechaFin: prestamo.fecha_devolucion_prevista,
      estado: prestamo.estado, // 'activo', 'vencido', 'cerrado'
      esSolicitud: false
    };
  }

  /**
   * Normaliza texto eliminando tildes para búsqueda
   */
  private normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}