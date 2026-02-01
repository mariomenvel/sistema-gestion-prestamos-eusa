import { Component, OnInit, HostListener } from '@angular/core';
import {
  SolicitudesService,
  ItemAdicional,
  MaterialEscaneado,
  ItemDisponibilidad
} from '../../../core/services/solicitudes.service'; import { Solicitud } from '../../../core/models/solicitud.model';
import { normalizarTexto } from '../../../core/utils/text.utils';

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

  // ===== ORDENACIÓN =====

  sortColumn: string = 'fecha'; // 'fecha' o 'alumno'
  sortDirection: 'asc' | 'desc' = 'desc';

  // ===== ESTADO =====

  isLoading: boolean = false;
  errorMessage: string = '';

  // ===== MODALES =====

  mostrarModalAprobar: boolean = false;
  mostrarModalRechazar: boolean = false;
  solicitudSeleccionada: Solicitud | null = null;

  // Datos del modal aprobar
  aprobandoSolicitud: boolean = false;
  fechaDevolucion: string = '';
  fechaMinDevolucion: string = this.calcularFechaMin();
  idiomaEmailAprobacion: string = 'es'; // 'es' o 'en'


  // Datos del modal rechazar
  rechazandoSolicitud: boolean = false;
  motivoRechazo: string = '';
  idiomaEmailRechazo: string = 'es';
  motivosRechazo: any[] = [];
  motivoSeleccionado: any = null;
  cargandoMotivos: boolean = false;

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

  // ===== MODAL DETALLES MATERIALES ===== 
  mostrarModalDetallesMateriales: boolean = false;
  materialesDetalles: any[] = [];
  solicitudDetallesMateriales: Solicitud | null = null;

  // ===== MODAL PERFIL USUARIO =====
  mostrarModalPerfil: boolean = false;
  usuarioPerfilSeleccionado: any = null;

  // ===== CONSTRUCTOR =====

  constructor(
    private solicitudesService: SolicitudesService
  ) { }

  // ===== CICLO DE VIDA =====

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  // ===== HOST LISTENER =====

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.mostrarModalAprobar) { this.cerrarModalAprobar(); }
      else if (this.mostrarModalRechazar) { this.cerrarModalRechazar(); }
      else if (this.mostrarModalDetallesMateriales) { this.cerrarModalDetallesMateriales(); }
      else if (this.mostrarModalPerfil) { this.cerrarModalPerfil(); }
    }
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


  /**
   * Abre el modal con los detalles de los materiales de una solicitud
   */
  verMaterialesSolicitud(solicitud: Solicitud, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const items = this.getItemsSolicitud(solicitud);

    if (!items || items.length === 0) {
      return;
    }

    this.solicitudDetallesMateriales = solicitud;
    this.materialesDetalles = items;
    this.mostrarModalDetallesMateriales = true;
  }

  /**
   * Cierra el modal de detalles de materiales
   */
  cerrarModalDetallesMateriales(): void {
    this.mostrarModalDetallesMateriales = false;
    this.materialesDetalles = [];
    this.solicitudDetallesMateriales = null;
  }

  /**
   * Obtiene el código de barras de un item
   */
  getCodigoItem(item: any): string {
    // Para solicitudes, la estructura puede ser diferente
    // Intentar varias posibilidades:

    // Opción 1: item.Ejemplar.codigo_barra
    if (item.Ejemplar && item.Ejemplar.codigo_barra) {
      return item.Ejemplar.codigo_barra;
    }

    // Opción 2: item.Unidad.codigo_barra
    if (item.Unidad && item.Unidad.codigo_barra) {
      return item.Unidad.codigo_barra;
    }

    // Opción 3: item.codigo_barra directamente
    if (item.codigo_barra) {
      return item.codigo_barra;
    }

    // Opción 4: Si es libro, buscar en item.ejemplar_id (minúscula)
    if (item.Libro && item.ejemplar_id) {
      return `EJ-${item.ejemplar_id}`;
    }

    // Opción 5: Si es equipo, buscar en item.unidad_id (minúscula)
    if (item.Equipo && item.unidad_id) {
      return `UN-${item.unidad_id}`;
    }

    return '-';
  }

  /**
   * Abre el modal de perfil del usuario
   */
  abrirPerfilAlumno(solicitud: Solicitud, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const usuario = (solicitud as any).Usuario || solicitud.usuario;

    if (!usuario || !usuario.id) {
      return;
    }

    this.usuarioPerfilSeleccionado = usuario;
    this.mostrarModalPerfil = true;
  }

  /**
   * Cierra el modal de perfil
   */
  cerrarModalPerfil(): void {
    this.mostrarModalPerfil = false;
    this.usuarioPerfilSeleccionado = null;
  }

  /**
   * Cambia la columna de ordenación o la dirección
   */
  ordenar(columna: string): void {
    if (this.sortColumn === columna) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columna;
      this.sortDirection = columna === 'fecha' ? 'desc' : 'asc';
    }
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
    this.idiomaEmailAprobacion = 'es';
    this.aprobandoSolicitud = false;
    this.mostrarModalAprobar = true;

    // Cargar disponibilidad de los items
    this.cargarDisponibilidadItems(solicitud.id);
  }

  confirmarAprobacion(): void {
    //  PROTECCIÓN CONTRA DOBLE CLIC
    if (this.aprobandoSolicitud) {
      return;
    }

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
      items_adicionales: todosLosItems,
      idioma: this.idiomaEmailAprobacion
    };

    // ACTIVAR PROTECCIÓN
    this.aprobandoSolicitud = true;

    this.solicitudesService.aprobarSolicitud(datosAprobacion).subscribe({
      next: () => {
        this.aprobandoSolicitud = false; // 🔓 DESACTIVAR PROTECCIÓN
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
        this.aprobandoSolicitud = false;

        // Intentar obtener el mensaje de error más específico
        let mensajeError = 'Error al aprobar la solicitud';

        if (err.message) {
          // Si el error tiene message directamente
          mensajeError = err.message;
        } else if (err.error && err.error.mensaje) {
          // Si viene en err.error.mensaje
          mensajeError = err.error.mensaje;
        } else if (err.error && typeof err.error === 'string') {
          // Por si el error es un string directamente
          mensajeError = err.error;
        }

        this.mostrarNotificacion('error', 'Error en la aprobación', mensajeError);
      }
    });
  }

  cerrarModalAprobar(): void {
    this.mostrarModalAprobar = false;
    this.aprobandoSolicitud = false;
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
        this.materialEncontrado = resultado;
        this.buscandoMaterial = false;
      },
      error: () => {
        // Si no es ejemplar, buscar como unidad (equipo)
        this.solicitudesService.buscarUnidadPorCodigo(codigo).subscribe({
          next: (resultado) => {
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

    // Limpiar búsqueda para escanear otro
    this.limpiarBusquedaMaterial();
  }


  eliminarItemAdicional(index: number): void {
    this.itemsAdicionales.splice(index, 1);
  }

  // ===== MODAL RECHAZAR =====

  abrirModalRechazar(solicitud: Solicitud): void {
    this.solicitudSeleccionada = solicitud;
    this.rechazandoSolicitud = false;
    this.idiomaEmailRechazo = 'es';
    this.motivoSeleccionado = null;
    this.mostrarModalRechazar = true;

    // Cargar plantillas de rechazo
    this.cargarMotivosRechazo();
  }

  confirmarRechazo(): void {
    // PROTECCIÓN CONTRA DOBLE CLIC
    if (this.rechazandoSolicitud) {
      return;
    }

    if (!this.solicitudSeleccionada) return;

    if (!this.motivoSeleccionado) {
      this.mostrarNotificacion('error', 'Error', 'Debes seleccionar un motivo de rechazo');
      return;
    }

    const datosRechazo = {
      motivo_id: this.motivoSeleccionado.id,
      idioma: this.idiomaEmailRechazo
    };

    // ACTIVAR PROTECCIÓN
    this.rechazandoSolicitud = true;

    this.solicitudesService.rechazarSolicitud(this.solicitudSeleccionada.id, datosRechazo).subscribe({
      next: () => {
        this.rechazandoSolicitud = false; // 🔓 DESACTIVAR PROTECCIÓN
        this.mostrarNotificacion('exito', 'Solicitud rechazada', 'Se ha enviado el email al alumno');
        this.mostrarModalRechazar = false;
        this.cargarSolicitudes();
      },
      error: (err) => {
        this.rechazandoSolicitud = false; // 🔓 DESACTIVAR PROTECCIÓN
        this.mostrarNotificacion('error', 'Error', err.message || 'No se pudo rechazar la solicitud');
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

  /**
  * Obtiene el nombre de un item (maneja estructuras de solicitudes y préstamos)
  */
  getNombreItem(item: any): string {
    // Estructura de SOLICITUDES: item.Libro o item.Equipo
    if (item.Libro) {
      return item.Libro.titulo || 'Libro sin título';
    }
    if (item.Equipo) {
      return `${item.Equipo.marca || ''} ${item.Equipo.modelo || ''}`.trim() || 'Equipo sin datos';
    }

    // Estructura de PRÉSTAMOS: item.Ejemplar.Libro o item.Unidad.equipo
    if (item.Ejemplar && item.Ejemplar.Libro) {
      return item.Ejemplar.Libro.titulo || 'Libro sin título';
    }
    if (item.Unidad && item.Unidad.equipo) {
      const marca = item.Unidad.equipo.marca || '';
      const modelo = item.Unidad.equipo.modelo || '';
      return `${marca} ${modelo}`.trim() || 'Equipo sin datos';
    }

    return 'Material desconocido';
  }

  /**
   * Obtiene el nombre del primer material de una solicitud
   */
  getNombreMaterial(solicitud: Solicitud): string {
    const items = (solicitud as any).items;
    if (!items || items.length === 0) {
      return 'Material desconocido';
    }

    // Reutilizar getNombreItem
    return this.getNombreItem(items[0]);
  }

  getItemsSolicitud(solicitud: Solicitud): any[] {
    return (solicitud as any).items || [];
  }


  getTipoItem(item: any): string {
    if (item.Libro) return 'Libro';
    if (item.Equipo) return 'Equipo';
    return 'Desconocido';
  }

  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    const partes = fecha.split('T')[0].split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'badge-pendiente';
      case 'aprobada': return 'badge-aprobada';
      case 'rechazada': return 'badge-rechazada';
      default: return '';
    }
  }

  getEstadoTexto(estado: string): string {
    switch (estado) {
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
    const plural = cantidad === 1 ? 'material' : 'materiales';
    return `${cantidad} ${plural}`;
  }

  getTipoTexto(tipo: string): string {
    return tipo === 'prof_trabajo' ? 'Tipo A' : 'Tipo B';
  }
  // ===== GESTIÓN DE MOTIVOS DE RECHAZO =====

  cargarMotivosRechazo(): void {
    this.cargandoMotivos = true;

    this.solicitudesService.obtenerMotivosRechazo().subscribe({
      next: (motivos) => {
        this.motivosRechazo = motivos;
        this.cargandoMotivos = false;
      },
      error: (err) => {
        this.cargandoMotivos = false;
        this.mostrarNotificacion('error', 'Error', 'No se pudieron cargar las plantillas');
      }
    });
  }

  obtenerPreviewEmailRechazo(): string {
    if (!this.motivoSeleccionado) {
      return '';
    }

    const texto = this.idiomaEmailRechazo === 'en'
      ? this.motivoSeleccionado.cuerpo_en
      : this.motivoSeleccionado.cuerpo_es;

    return texto || '';
  }

  obtenerTituloEmailRechazo(): string {
    if (!this.motivoSeleccionado) {
      return '';
    }

    const titulo = this.idiomaEmailRechazo === 'en'
      ? this.motivoSeleccionado.titulo_en
      : this.motivoSeleccionado.titulo_es;

    return titulo || '';
  }


  // ===== MÉTODOS PRIVADOS =====

  private cargarSolicitudes(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.solicitudesService.getAllSolicitudes().subscribe({
      next: (solicitudes) => {
        this.solicitudes = solicitudes;
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar las solicitudes';
        this.isLoading = false;
      }
    });
  }

  aplicarFiltros(): void {
    let resultado = [...this.solicitudes];

    if (this.filtroEstadoActivo !== 'todas') {
      resultado = resultado.filter(s => s.estado === this.filtroEstadoActivo);
    }

    if (this.filtroTipo) {
      resultado = resultado.filter(s => s.tipo === this.filtroTipo);
    }

    if (this.textoBusqueda.trim()) {
      const textoNormalizado = normalizarTexto(this.textoBusqueda);
      resultado = resultado.filter(s => {
        const nombreUsuario = normalizarTexto(this.getNombreUsuario(s));
        const nombreMaterial = normalizarTexto(this.getNombreMaterial(s));

        const items = this.getItemsSolicitud(s);
        const coincideMaterial = items.some(item => {
          const nombreItem = normalizarTexto(this.getNombreItem(item));
          return nombreItem.includes(textoNormalizado);
        });

        return nombreUsuario.includes(textoNormalizado) ||
          nombreMaterial.includes(textoNormalizado) ||
          coincideMaterial;
      });
    }

    if (this.filtroFecha) {
      const fechaLimite = new Date();
      fechaLimite.setHours(0, 0, 0, 0);

      switch (this.filtroFecha) {
        case 'hoy':
          break;
        case 'semana':
          fechaLimite.setDate(fechaLimite.getDate() - 7);
          break;
        case 'mes':
          fechaLimite.setMonth(fechaLimite.getMonth() - 1);
          break;
      }
      resultado = resultado.filter(s => {
        const fechaSolicitud = new Date(s.creada_en);
        return fechaSolicitud >= fechaLimite;
      });
    }

    // 4. Aplicar ordenación
    this.aplicarOrdenacion(resultado);
  }
  /**
   * Lógica interna de ordenación
   */
  private aplicarOrdenacion(datos: Solicitud[]): void {
    datos.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (this.sortColumn) {
        case 'fecha':
          valorA = new Date(a.creada_en).getTime();
          valorB = new Date(b.creada_en).getTime();
          break;
        case 'alumno':
          valorA = this.getNombreUsuario(a).toLowerCase();
          valorB = this.getNombreUsuario(b).toLowerCase();
          break;
        default:
          return 0;
      }

      if (valorA < valorB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valorA > valorB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.solicitudesFiltradas = datos;
  }

  /**
   * Delegation method for template usage
   */
  normalizarTexto(texto: string): string {
    return normalizarTexto(texto);
  }

  cargarDisponibilidadItems(solicitudId: number): void {
    this.cargandoDisponibilidad = true;

    this.solicitudesService.verificarDisponibilidad(solicitudId).subscribe({
      next: (response) => {
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
        this.cargandoDisponibilidad = false;
      }
    });
  }

  toggleItemIncluido(item: ItemDisponibilidad): void {
    if (item.disponible) {
      item.incluido = !item.incluido;
    }
  }

  seleccionarEjemplar(item: ItemDisponibilidad, ejemplarId: string, codigoBarra: string): void {
    item.ejemplar_seleccionado_id = Number(ejemplarId);
    item.codigo_barra_seleccionado = codigoBarra;
  }

  seleccionarUnidad(item: ItemDisponibilidad, unidadId: string, codigoBarra: string): void {
    item.unidad_seleccionada_id = Number(unidadId);
    item.codigo_barra_seleccionado = codigoBarra;
  }

  private calcularFechaMin(): string {
    const manana = new Date();
    manana.setDate(manana.getDate() + 1);
    return manana.toISOString().split('T')[0];
  }
}
