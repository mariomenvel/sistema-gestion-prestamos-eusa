import { Component, OnInit } from '@angular/core';
import { SolicitudesService, LibroDisponible, EquipoDisponible, ItemAdicional } from '../../../core/services/solicitudes.service';
import { Solicitud } from '../../../core/models/solicitud.model';

/**
 * Componente Gestión de Solicitudes (PAS)
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

  // ===== MODAL DE NOTIFICACIONES =====

  mostrarModalNotificacion: boolean = false;
  tipoModalNotificacion: 'exito' | 'error' | 'info' = 'info';
  tituloModalNotificacion: string = '';
  mensajeModalNotificacion: string = '';

  // ===== BÚSQUEDA DE MATERIALES ADICIONALES =====

  mostrarBuscadorMateriales: boolean = false;
  tipoBusqueda: 'libro' | 'equipo' = 'libro';
  textoBusquedaMaterial: string = '';
  
  // Resultados de búsqueda
  librosDisponibles: LibroDisponible[] = [];
  equiposDisponibles: EquipoDisponible[] = [];
  buscandoMateriales: boolean = false;

  // Items adicionales seleccionados
  itemsAdicionales: ItemAdicional[] = [];

  // ===== CONSTRUCTOR =====
  
  constructor(
    private solicitudesService: SolicitudesService
  ) { }

  // ===== CICLO DE VIDA =====
  
  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  // ===== MÉTODOS DE NOTIFICACIÓN =====

  mostrarNotificacion(tipo: 'exito' | 'error' | 'info', titulo: string, mensaje: string): void {
    this.tipoModalNotificacion = tipo;
    this.tituloModalNotificacion = titulo;
    this.mensajeModalNotificacion = mensaje;
    this.mostrarModalNotificacion = true;
  }

  cerrarModalNotificacion(): void {
    this.mostrarModalNotificacion = false;
  }

  // ===== MÉTODOS DE FILTROS =====
  
  cambiarFiltroEstado(estado: 'todas' | 'pendiente' | 'aprobada' | 'rechazada'): void {
    this.filtroEstadoActivo = estado;
    this.aplicarFiltros();
  }

  buscar(): void {
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroEstadoActivo = 'todas';
    this.filtroTipo = '';
    this.filtroFecha = '';
    this.textoBusqueda = '';
    this.aplicarFiltros();
  }

  // ===== MODAL APROBAR =====

  abrirModalAprobar(solicitud: Solicitud): void {
    this.solicitudSeleccionada = solicitud;
    this.fechaDevolucion = '';
    this.itemsAdicionales = [];
    this.mostrarBuscadorMateriales = false;
    this.limpiarBusquedaMateriales();
    this.mostrarModalAprobar = true;
  }

  confirmarAprobacion(): void {
    if (!this.solicitudSeleccionada) {
      return;
    }

    if (this.solicitudSeleccionada.tipo === 'prof_trabajo' && !this.fechaDevolucion) {
      this.mostrarNotificacion(
        'error',
        'Fecha requerida',
        'Debes seleccionar una fecha de devolución para préstamos Tipo A'
      );
      return;
    }

    // Preparar items adicionales para el backend
    const itemsParaBackend = this.itemsAdicionales.map(item => {
      if (item.tipo === 'libro') {
        return { libro_id: item.libro_id };
      } else {
        return { equipo_id: item.equipo_id };
      }
    });

    const datosAprobacion = {
      solicitud_id: this.solicitudSeleccionada.id,
      fecha_devolucion: this.solicitudSeleccionada.tipo === 'prof_trabajo' ? this.fechaDevolucion : null,
      items_adicionales: itemsParaBackend
    };

    console.log('📤 Enviando aprobación:', datosAprobacion);

    this.solicitudesService.aprobarSolicitud(datosAprobacion).subscribe({
      next: () => {
        console.log('✅ Solicitud aprobada');
        const mensajeExtra = this.itemsAdicionales.length > 0 
          ? ` Se añadieron ${this.itemsAdicionales.length} material(es) adicional(es).`
          : '';
        this.mostrarNotificacion(
          'exito',
          'Solicitud aprobada',
          'El préstamo ha sido creado correctamente.' + mensajeExtra
        );
        this.cerrarModalAprobar();
        setTimeout(() => {
          this.cargarSolicitudes();
        }, 500);
      },
      error: (err: any) => {
        console.error('❌ Error al aprobar solicitud:', err);
        let mensajeError = 'Error al aprobar la solicitud';
        if (err.error && err.error.mensaje) {
          mensajeError = err.error.mensaje;
        }
        this.mostrarNotificacion('error', 'Error en la aprobación', mensajeError);
      }
    });
  }

  cerrarModalAprobar(): void {
    this.mostrarModalAprobar = false;
    this.solicitudSeleccionada = null;
    this.fechaDevolucion = '';
    this.itemsAdicionales = [];
    this.mostrarBuscadorMateriales = false;
    this.limpiarBusquedaMateriales();
  }

  // ===== BÚSQUEDA DE MATERIALES ADICIONALES =====

  toggleBuscadorMateriales(): void {
    this.mostrarBuscadorMateriales = !this.mostrarBuscadorMateriales;
    if (this.mostrarBuscadorMateriales) {
      this.limpiarBusquedaMateriales();
    }
  }

  cambiarTipoBusqueda(tipo: 'libro' | 'equipo'): void {
    this.tipoBusqueda = tipo;
    this.limpiarBusquedaMateriales();
  }

  buscarMateriales(): void {
    if (this.buscandoMateriales) return;

    this.buscandoMateriales = true;

    if (this.tipoBusqueda === 'libro') {
      this.solicitudesService.buscarLibrosDisponibles(this.textoBusquedaMaterial).subscribe({
        next: (libros) => {
          console.log('📚 Libros encontrados:', libros);
          this.librosDisponibles = libros;
          this.buscandoMateriales = false;
        },
        error: (err) => {
          console.error('❌ Error buscando libros:', err);
          this.buscandoMateriales = false;
        }
      });
    } else {
      this.solicitudesService.buscarEquiposDisponibles(this.textoBusquedaMaterial).subscribe({
        next: (equipos) => {
          console.log('📷 Equipos encontrados:', equipos);
          this.equiposDisponibles = equipos;
          this.buscandoMateriales = false;
        },
        error: (err) => {
          console.error('❌ Error buscando equipos:', err);
          this.buscandoMateriales = false;
        }
      });
    }
  }

  limpiarBusquedaMateriales(): void {
    this.textoBusquedaMaterial = '';
    this.librosDisponibles = [];
    this.equiposDisponibles = [];
  }

  agregarLibro(libro: LibroDisponible): void {
    // Verificar si ya está añadido
    const yaExiste = this.itemsAdicionales.some(
      item => item.tipo === 'libro' && item.libro_id === libro.id
    );

    if (yaExiste) {
      this.mostrarNotificacion('info', 'Ya añadido', 'Este libro ya está en la lista de materiales adicionales');
      return;
    }

    this.itemsAdicionales.push({
      libro_id: libro.id,
      nombre: libro.titulo,
      tipo: 'libro'
    });

    console.log('➕ Libro añadido:', libro.titulo);
  }

  agregarEquipo(equipo: EquipoDisponible): void {
    const yaExiste = this.itemsAdicionales.some(
      item => item.tipo === 'equipo' && item.equipo_id === equipo.id
    );

    if (yaExiste) {
      this.mostrarNotificacion('info', 'Ya añadido', 'Este equipo ya está en la lista de materiales adicionales');
      return;
    }

    this.itemsAdicionales.push({
      equipo_id: equipo.id,
      nombre: equipo.nombre,
      tipo: 'equipo'
    });

    console.log('➕ Equipo añadido:', equipo.nombre);
  }

  eliminarItemAdicional(index: number): void {
    this.itemsAdicionales.splice(index, 1);
  }

  // ===== MODAL RECHAZAR =====

  abrirModalRechazar(solicitud: Solicitud): void {
    this.solicitudSeleccionada = solicitud;
    this.motivoRechazo = '';
    this.mostrarModalRechazar = true;
  }

  confirmarRechazo(): void {
    if (!this.solicitudSeleccionada) {
      return;
    }

    if (!this.motivoRechazo || this.motivoRechazo.trim() === '') {
      this.mostrarNotificacion('error', 'Motivo requerido', 'Debes indicar un motivo de rechazo');
      return;
    }

    this.solicitudesService.rechazarSolicitud(this.solicitudSeleccionada.id, this.motivoRechazo).subscribe({
      next: () => {
        console.log('✅ Solicitud rechazada');
        this.mostrarNotificacion('exito', 'Solicitud rechazada', 'La solicitud ha sido rechazada correctamente.');
        this.cerrarModalRechazar();
        setTimeout(() => {
          this.cargarSolicitudes();
        }, 500);
      },
      error: (err: any) => {
        console.error('❌ Error al rechazar solicitud:', err);
        let mensajeError = 'Error al rechazar la solicitud';
        if (err.error && err.error.mensaje) {
          mensajeError = err.error.mensaje;
        }
        this.mostrarNotificacion('error', 'Error en el rechazo', mensajeError);
      }
    });
  }

  cerrarModalRechazar(): void {
    this.mostrarModalRechazar = false;
    this.solicitudSeleccionada = null;
    this.motivoRechazo = '';
  }

  // ===== MÉTODOS DE UTILIDAD =====

  getNombreUsuario(solicitud: Solicitud): string {
    const usuario = (solicitud as any).Usuario || solicitud.usuario;
    if (usuario) {
      const nombreCompleto = usuario.apellidos 
        ? `${usuario.nombre} ${usuario.apellidos}` 
        : usuario.nombre;
      return nombreCompleto || usuario.email;
    }
    return 'Usuario desconocido';
  }

  getNombreMaterial(solicitud: Solicitud): string {
    const items = (solicitud as any).items;
    if (!items || items.length === 0) {
      return 'Material desconocido';
    }

    const primerItem = items[0];

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

  getItemsSolicitud(solicitud: Solicitud): any[] {
    return (solicitud as any).items || [];
  }

  getNombreItem(item: any): string {
    if (item.Libro) {
      return item.Libro.titulo || 'Libro sin título';
    }
    if (item.Equipo) {
      return `${item.Equipo.marca || ''} ${item.Equipo.modelo || ''}`.trim() || 'Equipo sin datos';
    }
    return 'Material desconocido';
  }

  getTipoItem(item: any): string {
    if (item.Libro) return 'Libro';
    if (item.Equipo) return 'Equipo';
    return 'Desconocido';
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  getEstadoClass(estado: string): string {
    switch(estado) {
      case 'pendiente': return 'badge-pendiente';
      case 'aprobada': return 'badge-aprobada';
      case 'rechazada': return 'badge-rechazada';
      default: return '';
    }
  }

  getEstadoTexto(estado: string): string {
    switch(estado) {
      case 'pendiente': return 'Pendiente';
      case 'aprobada': return 'Aprobada';
      case 'rechazada': return 'Rechazada';
      default: return estado;
    }
  }

  getContadorMateriales(solicitud: Solicitud): string {
    const items = (solicitud as any).items;
    if (!items || items.length === 0) {
      return '0 items';
    }
    const cantidad = items.length;
    const plural = cantidad === 1 ? 'item' : 'items';
    return `${cantidad} ${plural}`;
  }

  getTipoTexto(tipo: string): string {
    return tipo === 'prof_trabajo' ? 'Tipo A' : 'Tipo B';
  }

  // ===== MÉTODOS PRIVADOS =====
  
  private cargarSolicitudes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.solicitudesService.getAllSolicitudes().subscribe({
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

  private aplicarFiltros(): void {
    let resultado = [...this.solicitudes];

    if (this.filtroEstadoActivo !== 'todas') {
      resultado = resultado.filter(s => s.estado === this.filtroEstadoActivo);
    }

    if (this.filtroTipo) {
      resultado = resultado.filter(s => s.tipo === this.filtroTipo);
    }

    if (this.textoBusqueda.trim()) {
      const textoNormalizado = this.normalizarTexto(this.textoBusqueda);
      resultado = resultado.filter(s => {
        const nombreUsuario = this.normalizarTexto(this.getNombreUsuario(s));
        const nombreMaterial = this.normalizarTexto(this.getNombreMaterial(s));
        return nombreUsuario.includes(textoNormalizado) || 
               nombreMaterial.includes(textoNormalizado);
      });
    }

    if (this.filtroFecha) {
      const fechaLimite = new Date();
      fechaLimite.setHours(0,0,0,0);

      switch(this.filtroFecha){
        case 'hoy':
          break;
        case 'semana':
          fechaLimite.setDate(fechaLimite.getDate()-7);
          break;
        case 'mes':
          fechaLimite.setMonth(fechaLimite.getMonth()-1);
          break;
      }
      resultado = resultado.filter(s => {
        const fechaSolicitud = new Date(s.creada_en);
        return fechaSolicitud >= fechaLimite;
      });
    }
    
    this.solicitudesFiltradas = resultado;
  }

  private normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }
}