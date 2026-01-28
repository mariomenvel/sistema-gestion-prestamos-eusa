import { Component, OnInit } from '@angular/core';
import { 
  SolicitudesService, 
  ItemAdicional, 
  MaterialEscaneado,
  ItemDisponibilidad
} from '../../../core/services/solicitudes.service';import { Solicitud } from '../../../core/models/solicitud.model';

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

 // ===== BÚSQUEDA DE MATERIALES ADICIONALES (POR CÓDIGO DE BARRAS) =====

mostrarBuscadorMateriales: boolean = false;
codigoBarrasBusqueda: string = '';
buscandoMaterial: boolean = false;
materialEncontrado: MaterialEscaneado | null = null;
errorBusqueda: string = '';

// Items adicionales seleccionados
itemsAdicionales: ItemAdicional[] = [];

// ===== GESTIÓN DE ITEMS DE LA SOLICITUD =====
itemsSolicitudConDisponibilidad: ItemDisponibilidad[] = [];
cargandoDisponibilidad: boolean = false;

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
  this.limpiarBusquedaMaterial();
  this.itemsSolicitudConDisponibilidad = [];
  this.mostrarModalAprobar = true;
  
  // Cargar disponibilidad de los items
  this.cargarDisponibilidadItems(solicitud.id);
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

  // Preparar items originales incluidos (con ejemplar_id o unidad_id específicos)
  const itemsOriginales: { ejemplar_id?: number; unidad_id?: number }[] = [];
  
  this.itemsSolicitudConDisponibilidad
    .filter(item => item.incluido)
    .forEach(item => {
      if (item.tipo === 'libro' && item.ejemplar_seleccionado_id) {
        itemsOriginales.push({ ejemplar_id: item.ejemplar_seleccionado_id });
      } else if (item.tipo === 'equipo' && item.unidad_seleccionada_id) {
        itemsOriginales.push({ unidad_id: item.unidad_seleccionada_id });
      }
    });

  // Preparar items adicionales
  const itemsAdicionalesBackend: { ejemplar_id?: number; unidad_id?: number }[] = [];
  
  this.itemsAdicionales.forEach(item => {
    if (item.tipo === 'ejemplar' && item.ejemplar_id) {
      itemsAdicionalesBackend.push({ ejemplar_id: item.ejemplar_id });
    } else if (item.tipo === 'unidad' && item.unidad_id) {
      itemsAdicionalesBackend.push({ unidad_id: item.unidad_id });
    }
  });

  // Combinar todos los items
  const todosLosItems = [...itemsOriginales, ...itemsAdicionalesBackend];

  if (todosLosItems.length === 0) {
    this.mostrarNotificacion(
      'error',
      'Sin materiales',
      'Debes incluir al menos un material para aprobar la solicitud'
    );
    return;
  }

  const datosAprobacion = {
    solicitud_id: this.solicitudSeleccionada.id,
    fecha_devolucion: this.solicitudSeleccionada.tipo === 'prof_trabajo' ? this.fechaDevolucion : null,
    items_adicionales: todosLosItems
  };

  console.log('📤 Enviando aprobación:', datosAprobacion);

  this.solicitudesService.aprobarSolicitud(datosAprobacion).subscribe({
    next: () => {
      console.log('✅ Solicitud aprobada');
      this.mostrarNotificacion(
        'exito',
        'Solicitud aprobada',
        `El préstamo ha sido creado con ${todosLosItems.length} material(es).`
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
  this.limpiarBusquedaMaterial();
}

  // ===== BÚSQUEDA DE MATERIALES ADICIONALES =====

  toggleBuscadorMateriales(): void {
  this.mostrarBuscadorMateriales = !this.mostrarBuscadorMateriales;
  if (this.mostrarBuscadorMateriales) {
    this.limpiarBusquedaMaterial();
  }
}

  limpiarBusquedaMaterial(): void {
  this.codigoBarrasBusqueda = '';
  this.materialEncontrado = null;
  this.errorBusqueda = '';
}

buscarPorCodigoBarras(): void {
  if (!this.codigoBarrasBusqueda.trim()) {
    this.errorBusqueda = 'Introduce un código de barras';
    return;
  }

  this.buscandoMaterial = true;
  this.materialEncontrado = null;
  this.errorBusqueda = '';

  const codigo = this.codigoBarrasBusqueda.trim();

  // Primero intentar buscar como ejemplar (libro)
  this.solicitudesService.buscarEjemplarPorCodigo(codigo).subscribe({
    next: (resultado) => {
      console.log('📚 Ejemplar encontrado:', resultado);
      this.materialEncontrado = resultado;
      this.buscandoMaterial = false;
    },
    error: () => {
      // Si no es ejemplar, buscar como unidad (equipo)
      this.solicitudesService.buscarUnidadPorCodigo(codigo).subscribe({
        next: (resultado) => {
          console.log('📷 Unidad encontrada:', resultado);
          this.materialEncontrado = resultado;
          this.buscandoMaterial = false;
        },
        error: () => {
          this.errorBusqueda = 'No se encontró ningún material con ese código';
          this.buscandoMaterial = false;
        }
      });
    }
  });
}

agregarMaterialEncontrado(): void {
  if (!this.materialEncontrado) return;

  // Verificar disponibilidad
  if (!this.materialEncontrado.disponible) {
    this.mostrarNotificacion('error', 'No disponible', 'Este material no está disponible para préstamo');
    return;
  }

  // Verificar si ya está añadido
  const yaExiste = this.itemsAdicionales.some(item => {
    if (this.materialEncontrado!.tipo === 'ejemplar') {
      return item.tipo === 'ejemplar' && item.ejemplar_id === this.materialEncontrado!.id;
    } else {
      return item.tipo === 'unidad' && item.unidad_id === this.materialEncontrado!.id;
    }
  });

  if (yaExiste) {
    this.mostrarNotificacion('info', 'Ya añadido', 'Este material ya está en la lista');
    return;
  }

  // Construir nombre para mostrar
  let nombre = '';
  if (this.materialEncontrado.tipo === 'ejemplar' && this.materialEncontrado.libro) {
    nombre = this.materialEncontrado.libro.titulo;
  } else if (this.materialEncontrado.tipo === 'unidad' && this.materialEncontrado.equipo) {
    nombre = this.materialEncontrado.equipo.nombre;
  }

  // Añadir a la lista
  const nuevoItem: ItemAdicional = {
    tipo: this.materialEncontrado.tipo,
    codigo_barra: this.materialEncontrado.codigo_barra,
    nombre: nombre
  };

  if (this.materialEncontrado.tipo === 'ejemplar') {
    nuevoItem.ejemplar_id = this.materialEncontrado.id;
  } else {
    nuevoItem.unidad_id = this.materialEncontrado.id;
  }

  this.itemsAdicionales.push(nuevoItem);
  console.log('➕ Material añadido:', nuevoItem);

  // Limpiar búsqueda para escanear otro
  this.limpiarBusquedaMaterial();
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
  cargarDisponibilidadItems(solicitudId: number): void {
  this.cargandoDisponibilidad = true;
  
  this.solicitudesService.verificarDisponibilidad(solicitudId).subscribe({
    next: (response) => {
      console.log('📦 Disponibilidad cargada:', response);
      // Inicializar cada item con su estado
      this.itemsSolicitudConDisponibilidad = response.items.map(item => {
        // Por defecto, incluir si está disponible
        const itemConEstado = { ...item, incluido: item.disponible };
        
        // Si tiene ejemplares disponibles, seleccionar el primero por defecto
        if (item.ejemplares_disponibles.length > 0) {
          itemConEstado.ejemplar_seleccionado_id = item.ejemplares_disponibles[0].id;
          itemConEstado.codigo_barra_seleccionado = item.ejemplares_disponibles[0].codigo_barra;
        }
        
        // Si tiene unidades disponibles, seleccionar la primera por defecto
        if (item.unidades_disponibles.length > 0) {
          itemConEstado.unidad_seleccionada_id = item.unidades_disponibles[0].id;
          itemConEstado.codigo_barra_seleccionado = item.unidades_disponibles[0].codigo_barra;
        }
        
        return itemConEstado;
      });
      this.cargandoDisponibilidad = false;
    },
    error: (err) => {
      console.error('❌ Error cargando disponibilidad:', err);
      this.cargandoDisponibilidad = false;
    }
  });
}

toggleItemIncluido(item: ItemDisponibilidad): void {
  if (item.disponible) {
    item.incluido = !item.incluido;
  }
}

seleccionarEjemplar(item: ItemDisponibilidad, ejemplarId: number, codigoBarra: string): void {
  item.ejemplar_seleccionado_id = ejemplarId;
  item.codigo_barra_seleccionado = codigoBarra;
}

seleccionarUnidad(item: ItemDisponibilidad, unidadId: number, codigoBarra: string): void {
  item.unidad_seleccionada_id = unidadId;
  item.codigo_barra_seleccionado = codigoBarra;
}
}
