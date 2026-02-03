import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { SolicitudesService } from '../../../../core/services/solicitudes.service';
import { AuthService } from '../../../../core/services/auth.service';

/**
 * Interface para el material
 */
interface MaterialVista {
  id: number;
  tipo: 'libro' | 'equipo';
  titulo: string;
  categoria: string;
  marcaModelo: string;
  descripcion: string;
  disponible: boolean;
  imagenUrl?: string;
}

/**
 * Interface para material con cantidad
 */
interface MaterialConCantidad extends MaterialVista {
  cantidad: number;
}

/**
 * Modal de Solicitar Préstamo
 * 
 * Permite al alumno solicitar un préstamo de uno o varios materiales
 * con opciones para Tipo A (trabajo académico) o Tipo B (uso personal)
 */
@Component({
  selector: 'app-solicitar-prestamo',
  templateUrl: './solicitar-prestamo.component.html',
  styleUrls: ['./solicitar-prestamo.component.scss']
})
export class SolicitarPrestamoComponent implements OnInit, OnChanges {

  /**
   * Controla si el modal está abierto
   */
  @Input() isOpen: boolean = false;

  /**
   * Material seleccionado inicialmente (individual)
   */
  @Input() material: MaterialVista | null = null;

  /**
   * Lista de materiales preseleccionados (desde catálogo)
   */
  @Input() materialesPreseleccionados: MaterialVista[] = [];

  /**
   * Todos los materiales disponibles (para búsqueda)
   */
  @Input() todosLosMateriales: MaterialVista[] = [];

  /**
   * Evento cuando se cierra el modal
   */
  @Output() close = new EventEmitter<void>();

  /**
   * Evento cuando se crea la solicitud exitosamente
   */
  @Output() solicitudCreada = new EventEmitter<void>();

  // ===== INYECCIÓN DE SERVICIOS =====
  private solicitudesService = inject(SolicitudesService);
  private authService = inject(AuthService);

  // ===== MATERIALES SELECCIONADOS =====
  materialesSeleccionados: MaterialConCantidad[] = [];

  // ===== BUSCADOR =====
  mostrarBuscador: boolean = false;
  busquedaTexto: string = '';
  resultadosBusqueda: MaterialVista[] = [];
  filtroTipoBusqueda: 'todos' | 'libro' | 'equipo' = 'todos';

  // ===== FORMULARIO =====
  tipoSolicitud: 'prof_trabajo' | 'uso_propio' = 'prof_trabajo';
  nombreProfesor: string = '';
  asignatura: string = '';
  normasAceptadas: boolean = false;
  fechaSolicitud: string = '';

  // ===== ESTADO =====
  enviandoSolicitud: boolean = false;
  errorSolicitud: string = '';
  mostrarModalNormas: boolean = false;
  normasLeidas: boolean = false;

  // ===== MODAL DE NOTIFICACIONES =====
  mostrarModalNotificacion: boolean = false;
  tipoModalNotificacion: 'exito' | 'error' | 'info' = 'info';
  tituloModalNotificacion: string = '';
  mensajeModalNotificacion: string = '';

  // ===== CICLO DE VIDA =====

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  /**
   * Detecta cambios en los @Input
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && changes['isOpen'].currentValue) {
      this.inicializarFormulario();
      
      // Agregar materiales preseleccionados (desde catálogo)
      if (this.materialesPreseleccionados && this.materialesPreseleccionados.length > 0) {
        this.materialesSeleccionados = this.materialesPreseleccionados.map(m => ({
          ...m,
          cantidad: 1
        }));
      }
      // Agregar material individual si existe
      else if (this.material && !this.yaEstaSeleccionado(this.material)) {
        this.materialesSeleccionados.push({ ...this.material, cantidad: 1 });
      }
    }
  }

  // ===== MÉTODOS - MATERIALES =====

  /**
   * Verifica si un material ya está seleccionado
   */
  yaEstaSeleccionado(material: MaterialVista): boolean {
    return this.materialesSeleccionados.some(m => m.id === material.id && m.tipo === material.tipo);
  }

  /**
   * Agrega un material a la lista
   */
  agregarMaterial(material: MaterialVista): void {
    if (!this.yaEstaSeleccionado(material)) {
      this.materialesSeleccionados.push({ ...material, cantidad: 1 });
      this.busquedaTexto = '';
      this.resultadosBusqueda = [];
    }
  }

  /**
   * Elimina un material de la lista
   */
  eliminarMaterial(index: number): void {
    this.materialesSeleccionados.splice(index, 1);
  }

  /**
   * Aumenta la cantidad de un material
   */
  aumentarCantidad(index: number): void {
    if (this.materialesSeleccionados[index].cantidad < 10) {
      this.materialesSeleccionados[index].cantidad++;
    }
  }

  /**
   * Disminuye la cantidad de un material
   */
  disminuirCantidad(index: number): void {
    if (this.materialesSeleccionados[index].cantidad > 1) {
      this.materialesSeleccionados[index].cantidad--;
    }
  }

  /**
   * Obtiene el total de items
   */
  get totalItems(): number {
    return this.materialesSeleccionados.reduce((sum, m) => sum + m.cantidad, 0);
  }

  // ===== MÉTODOS - BUSCADOR =====

  /**
   * Abre el buscador
   */
  abrirBuscador(): void {
    this.mostrarBuscador = true;
    this.busquedaTexto = '';
    this.resultadosBusqueda = [];
  }

  /**
   * Cierra el buscador
   */
  cerrarBuscador(): void {
    this.mostrarBuscador = false;
    this.busquedaTexto = '';
    this.resultadosBusqueda = [];
  }

  /**
   * Busca materiales
   */
  buscarMateriales(): void {
    if (this.busquedaTexto.trim().length === 0) {
      this.resultadosBusqueda = [];
      return;
    }

    const termino = this.normalizarTexto(this.busquedaTexto);

    let resultados = this.todosLosMateriales.filter(material => {
      const titulo = this.normalizarTexto(material.titulo || '');
      const marcaModelo = this.normalizarTexto(material.marcaModelo || '');
      const categoria = this.normalizarTexto(material.categoria || '');
      const descripcion = this.normalizarTexto(material.descripcion || '');

      return titulo.includes(termino) ||
        marcaModelo.includes(termino) ||
        categoria.includes(termino) ||
        descripcion.includes(termino);
    });

    // Filtrar por tipo
    if (this.filtroTipoBusqueda !== 'todos') {
      resultados = resultados.filter(m => m.tipo === this.filtroTipoBusqueda);
    }

    this.resultadosBusqueda = resultados.slice(0, 10); // Limitar a 10 resultados
  }

  /**
   * Normaliza texto para búsqueda
   */
  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Cambia el filtro de tipo en el buscador
   */
  cambiarFiltroTipo(tipo: 'todos' | 'libro' | 'equipo'): void {
    this.filtroTipoBusqueda = tipo;
    if (this.busquedaTexto.trim().length > 0) {
      this.buscarMateriales();
    }
  }

  // ===== MÉTODOS - FORMULARIO =====

  /**
   * Inicializa el formulario
   */
  inicializarFormulario(): void {
    this.materialesSeleccionados = [];
    this.mostrarBuscador = false;
    this.busquedaTexto = '';
    this.resultadosBusqueda = [];
    this.filtroTipoBusqueda = 'todos';
    this.tipoSolicitud = 'prof_trabajo';
    this.nombreProfesor = '';
    this.asignatura = '';
    this.normasAceptadas = false;
    this.normasLeidas = false;
    this.errorSolicitud = '';
    this.enviandoSolicitud = false;

    // Fecha actual
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    this.fechaSolicitud = `${dia}/${mes}/${anio}`;
  }

  /**
   * Cambia el tipo de solicitud
   */
  cambiarTipo(tipo: 'prof_trabajo' | 'uso_propio'): void {
    this.tipoSolicitud = tipo;
    if (tipo === 'uso_propio') {
      this.nombreProfesor = '';
      this.asignatura = '';
    }
  }

  /**
   * Verifica si el formulario es válido
   */
  get formularioValido(): boolean {
    if (this.materialesSeleccionados.length === 0) {
      return false;
    }

    if (!this.normasAceptadas) {
      return false;
    }

    if (this.tipoSolicitud === 'prof_trabajo') {
      return this.nombreProfesor.trim() !== '' && this.asignatura.trim() !== '';
    }

    return true;
  }

  /**
   * Envía la solicitud
   */
  enviarSolicitud(): void {
    if (!this.formularioValido) {
      this.errorSolicitud = 'Por favor, completa todos los campos requeridos';
      return;
    }

    this.enviandoSolicitud = true;
    this.errorSolicitud = '';

    const usuarioActual = this.authService.currentUser();
    const gradoId = usuarioActual?.grado_id;

    // Preparar items con cantidad
    const items: any[] = [];
    this.materialesSeleccionados.forEach(mat => {
      // Crear un item por cada unidad de cantidad
      for (let i = 0; i < mat.cantidad; i++) {
        items.push(mat.tipo === 'libro' ? { libro_id: mat.id } : { equipo_id: mat.id });
      }
    });

    const datos: any = {
      tipo: this.tipoSolicitud,
      normas_aceptadas: this.normasAceptadas,
      items: items,
      grado_id: gradoId
    };

    if (this.tipoSolicitud === 'prof_trabajo') {
      datos.observaciones = `Profesor: ${this.nombreProfesor} | Asignatura: ${this.asignatura}`;
    }

    console.log('📤 Enviando solicitud:', datos);

    this.solicitudesService.crearSolicitud(datos).subscribe({
      next: (response) => {
        console.log('✅ Solicitud creada:', response);
        this.tipoModalNotificacion = 'exito';
        this.tituloModalNotificacion = 'Solicitud Registrada';
        this.mensajeModalNotificacion = `Tu solicitud de ${this.totalItems} item(s) ha sido registrada correctamente.`;
        this.mostrarModalNotificacion = true;
        this.enviandoSolicitud = false;
        this.solicitudCreada.emit();
      },
      error: (err) => {
        console.error('❌ Error al crear solicitud:', err);

        let mensajeError = 'Error al enviar la solicitud. Por favor, inténtalo de nuevo.';

        if (err.error && err.error.mensaje) {
          mensajeError = err.error.mensaje;
        } else if (err.message) {
          mensajeError = err.message;
        }

        this.tipoModalNotificacion = 'error';
        this.tituloModalNotificacion = 'Error en la Solicitud';
        this.mensajeModalNotificacion = mensajeError;
        this.mostrarModalNotificacion = true;
        this.enviandoSolicitud = false;
      }
    });
  }

  /**
   * Cierra el modal de notificación
   */
  cerrarModalNotificacion(): void {
    this.mostrarModalNotificacion = false;
    if (this.tipoModalNotificacion === 'exito') {
      this.cerrarModal();
    }
  }

  /**
   * Cierra el modal
   */
  cerrarModal(): void {
    this.inicializarFormulario();
    this.close.emit();
  }

  /**
   * Abre el modal de normas
   */
  verNormasCompletas(): void {
    this.mostrarModalNormas = true;
  }

  /**
   * Cierra el modal de normas
   */
  cerrarModalNormas(): void {
    this.mostrarModalNormas = false;
    this.normasLeidas = true;
  }

  /**
   * Cuando se aceptan las normas
   */
  onNormasAceptadas(): void {
    this.normasAceptadas = true;
    this.cerrarModalNormas();
  }
}