import { Component, OnInit } from '@angular/core';
import { SolicitudesService } from '../../../core/services/solicitudes.service';
import { Solicitud } from '../../../core/models/solicitud.model';

/**
 * Componente Gestión de Solicitudes (PAS)
 * 
 * Permite al personal administrativo:
 * - Ver todas las solicitudes (pendientes, aprobadas, rechazadas)
 * - Filtrar por estado, tipo, fecha
 * - Aprobar solicitudes (crea préstamo automáticamente)
 * - Rechazar solicitudes
 */
@Component({
  selector: 'app-solicitudes',
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.scss']
})
export class SolicitudesComponent implements OnInit {

  // ===== DATOS =====
  
  solicitudes: Solicitud[] = [];
  solicitudesFiltradas: Solicitud[] = [];

  // ===== FILTROS =====
  
  filtroEstadoActivo: 'todas' | 'pendiente' | 'aprobada' | 'rechazada' = 'todas';
  filtroTipo: string = '';
  filtroFecha: string = '';
  textoBusqueda: string = '';

 // ===== ESTADO =====

isLoading: boolean = false;
errorMessage: string = '';

// ===== MODALES =====

mostrarModalAprobar: boolean = false;
mostrarModalRechazar: boolean = false;
solicitudSeleccionada: Solicitud | null = null;

// Datos del modal aprobar
fechaDevolucion: string = '';

// Datos del modal rechazar
motivoRechazo: string = '';
  
  // ===== CONSTRUCTOR =====
  
  constructor(
    private solicitudesService: SolicitudesService
  ) { }

  // ===== CICLO DE VIDA =====
  
  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  // ===== MÉTODOS PÚBLICOS =====
  
  /**
   * Cambia el filtro de estado (tabs)
   */
  cambiarFiltroEstado(estado: 'todas' | 'pendiente' | 'aprobada' | 'rechazada'): void {
    this.filtroEstadoActivo = estado;
    this.aplicarFiltros();
  }

  /**
   * Buscar por texto
   */
  buscar(): void {
    this.aplicarFiltros();
  }

  /**
   * Limpiar todos los filtros
   */
  limpiarFiltros(): void {
    this.filtroEstadoActivo = 'todas';
    this.filtroTipo = '';
    this.filtroFecha = '';
    this.textoBusqueda = '';
    this.aplicarFiltros();
  }

 /**
 * Abre modal de aprobar solicitud
 */
abrirModalAprobar(solicitud: Solicitud): void {
  this.solicitudSeleccionada = solicitud;
  this.fechaDevolucion = '';
  this.mostrarModalAprobar = true;
}

/**
 * Confirma la aprobación de solicitud
 */
confirmarAprobacion(): void {
  if (!this.solicitudSeleccionada) {
    return;
  }

  // Solo validar fecha si es Tipo A (prof_trabajo)
  if (this.solicitudSeleccionada.tipo === 'prof_trabajo' && !this.fechaDevolucion) {
    alert('Debes seleccionar una fecha de devolución para préstamos Tipo A');
    return;
  }

  this.solicitudesService.aprobarSolicitud(this.solicitudSeleccionada.id).subscribe({
    next: () => {
      console.log('✅ Solicitud aprobada');
      alert('Solicitud aprobada correctamente. El préstamo ha sido creado.');
      this.cerrarModalAprobar();
      this.cargarSolicitudes();
    },
    error: (err: any) => {
      console.error('❌ Error al aprobar solicitud:', err);
      alert('Error al aprobar la solicitud');
    }
  });
}

/**
 * Cierra modal de aprobar
 */
cerrarModalAprobar(): void {
  this.mostrarModalAprobar = false;
  this.solicitudSeleccionada = null;
  this.fechaDevolucion = '';
}

/**
 * Abre modal de rechazar solicitud
 */
abrirModalRechazar(solicitud: Solicitud): void {
  this.solicitudSeleccionada = solicitud;
  this.motivoRechazo = '';
  this.mostrarModalRechazar = true;
}

/**
 * Confirma el rechazo de solicitud
 */
confirmarRechazo(): void {
  if (!this.solicitudSeleccionada) {
    return;
  }

  if (!this.motivoRechazo || this.motivoRechazo.trim() === '') {
    alert('Debes indicar un motivo de rechazo');
    return;
  }

  this.solicitudesService.rechazarSolicitud(this.solicitudSeleccionada.id, this.motivoRechazo).subscribe({
    next: () => {
      console.log('✅ Solicitud rechazada');
      alert('Solicitud rechazada correctamente');
      this.cerrarModalRechazar();
      this.cargarSolicitudes();
    },
    error: (err: any) => {
      console.error('❌ Error al rechazar solicitud:', err);
      alert('Error al rechazar la solicitud');
    }
  });
}

/**
 * Cierra modal de rechazar
 */
cerrarModalRechazar(): void {
  this.mostrarModalRechazar = false;
  this.solicitudSeleccionada = null;
  this.motivoRechazo = '';
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
  // Si tiene ejemplar (libro) - Sequelize devuelve con mayúscula
  if (solicitud.Ejemplar && solicitud.Ejemplar.libro) {
    return solicitud.Ejemplar.libro.titulo;
  }
  
  // Si tiene unidad (equipo) - Sequelize devuelve con mayúscula
  if (solicitud.Unidad && solicitud.Unidad.equipo) {
    const equipo = solicitud.Unidad.equipo;
    return `${equipo.marca} ${equipo.modelo}`;
  }
  
  return 'Material desconocido';
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

  /**
   * Obtiene la clase CSS para el badge de estado
   */
  getEstadoClass(estado: string): string {
    switch(estado) {
      case 'pendiente': return 'badge-pendiente';
      case 'aprobada': return 'badge-aprobada';
      case 'rechazada': return 'badge-rechazada';
      default: return '';
    }
  }

  /**
   * Obtiene el texto del estado
   */
  getEstadoTexto(estado: string): string {
    switch(estado) {
      case 'pendiente': return 'Pendiente';
      case 'aprobada': return 'Aprobada';
      case 'rechazada': return 'Rechazada';
      default: return estado;
    }
  }

  /**
   * Obtiene el texto del tipo de solicitud
   */
  getTipoTexto(tipo: string): string {
    return tipo === 'prof_trabajo' ? 'Tipo A' : 'Tipo B';
  }

  // ===== MÉTODOS PRIVADOS =====
  
  /**
   * Carga todas las solicitudes pendientes
   */
  private cargarSolicitudes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.solicitudesService.getSolicitudesPendientes().subscribe({
      next: (solicitudes) => {
        console.log('📋 Solicitudes recibidas:', solicitudes);
        this.solicitudes = solicitudes;
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar solicitudes:', err);
        this.errorMessage = 'Error al cargar las solicitudes';
        this.isLoading = false;
      }
    });
  }

  /**
   * Aplica todos los filtros activos
   */
  private aplicarFiltros(): void {
    let resultado = [...this.solicitudes];

    // Filtro por estado (tabs)
    if (this.filtroEstadoActivo !== 'todas') {
      resultado = resultado.filter(s => s.estado === this.filtroEstadoActivo);
    }

    // Filtro por tipo
    if (this.filtroTipo) {
      resultado = resultado.filter(s => s.tipo === this.filtroTipo);
    }

    // Filtro por texto de búsqueda
    if (this.textoBusqueda.trim()) {
      const texto = this.textoBusqueda.toLowerCase();
      resultado = resultado.filter(s => 
        this.getNombreUsuario(s).toLowerCase().includes(texto) ||
        this.getNombreMaterial(s).toLowerCase().includes(texto)
      );
    }

    this.solicitudesFiltradas = resultado;
    console.log('🔍 Solicitudes filtradas:', this.solicitudesFiltradas.length);
  }
}