import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges, inject } from '@angular/core';
import { SolicitudesService } from '../../../../core/services/solicitudes.service';
import { AuthService } from '../../../../core/services/auth.service';

/**
 * Interface para el material seleccionado
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
 * Interface para item en el carrito
 */
interface ItemCarrito {
  id: number;
  tipo: 'libro' | 'equipo';
  titulo: string;
  categoria: string;
  marcaModelo: string;
}

/**
 * Modal de Solicitar Préstamo
 * 
 * Permite al alumno solicitar un préstamo de un material (libro o equipo)
 * con opciones para Tipo A (trabajo académico) o Tipo B (uso personal)
 * Ahora soporta múltiples items
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
   * Material seleccionado para solicitar
   */
  @Input() material: MaterialVista | null = null;

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

  // ===== CARRITO =====
  carrito: ItemCarrito[] = [];

  // ===== BÚSQUEDA DE MATERIALES ADICIONALES =====
  busquedaTexto: string = '';
  resultadosBusqueda: MaterialVista[] = [];
  filtroTipoBusqueda: 'todos' | 'libro' | 'equipo' = 'todos';
  mostrarBuscador: boolean = false;

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
  mostrarModalExito: boolean = false;
  mostrarModalError: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  // ===== CICLO DE VIDA =====

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  /**
   * Detecta cambios en los @Input
   * Se ejecuta cuando material cambia
   */
  ngOnChanges(changes: SimpleChanges): void {
    // Si cambia material y el modal está abierto
    if (changes['material'] && changes['material'].currentValue && this.isOpen) {
      this.carrito = [];
      this.agregarMaterialInicial();
    }

    // Si cambia isOpen y se abre el modal
    if (changes['isOpen'] && changes['isOpen'].currentValue && !changes['isOpen'].previousValue) {
      this.carrito = [];
      this.agregarMaterialInicial();
    }
  }

  // ===== MÉTODOS PÚBLICOS - CARRITO =====

  /**
   * Agrega el material inicial al carrito
   */
  agregarMaterialInicial(): void {
    if (!this.material) return;

    // Verificar que no esté ya en el carrito
    if (this.yaEstaEnCarrito(this.material)) {
      return;
    }

    this.carrito.push({
      id: this.material.id,
      tipo: this.material.tipo,
      titulo: this.material.titulo,
      categoria: this.material.categoria,
      marcaModelo: this.material.marcaModelo
    });
  }

  /**
   * Verifica si un material ya está en el carrito
   */
  yaEstaEnCarrito(material: MaterialVista): boolean {
    return this.carrito.some(item => item.id === material.id && item.tipo === material.tipo);
  }

/**
 * Busca materiales localmente con normalización de tildes
 */
buscarMateriales(): void {
  if (this.busquedaTexto.trim().length === 0) {
    this.resultadosBusqueda = [];
    return;
  }

  // Normalizar búsqueda: quitar tildes y convertir a minúsculas
  const termino = this.normalizarTexto(this.busquedaTexto);

  let resultados = this.todosLosMateriales.filter(material => {
    // Normalizar campos (algunos pueden ser undefined)
    const titulo = material.titulo ? this.normalizarTexto(material.titulo) : '';
    const marcaModelo = material.marcaModelo ? this.normalizarTexto(material.marcaModelo) : '';
    const categoria = material.categoria ? this.normalizarTexto(material.categoria) : '';
    const descripcion = material.descripcion ? this.normalizarTexto(material.descripcion) : '';

    const coincide = 
      titulo.includes(termino) ||
      marcaModelo.includes(termino) ||
      categoria.includes(termino) ||
      descripcion.includes(termino);

    return coincide;
    // ← Eliminamos "&& material.disponible" - permitimos buscar TODO
  });

  // Aplicar filtro de tipo
  if (this.filtroTipoBusqueda !== 'todos') {
    resultados = resultados.filter(m => m.tipo === this.filtroTipoBusqueda);
  }

  this.resultadosBusqueda = resultados;
}

  /**
   * Normaliza texto: minúsculas y sin tildes
   */
  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
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
   * Agrega material al carrito desde búsqueda
   */
  agregarAlCarrito(material: MaterialVista): void {
    this.carrito.push({
      id: material.id,
      tipo: material.tipo,
      titulo: material.titulo,
      categoria: material.categoria,
      marcaModelo: material.marcaModelo
    });

    this.errorSolicitud = '';
    this.busquedaTexto = '';
    this.resultadosBusqueda = [];
  }

  /**
   * Elimina material del carrito
   */
  eliminarDelCarrito(index: number): void {
    this.carrito.splice(index, 1);
    this.resultadosBusqueda = [];
    this.busquedaTexto = '';
  }

  /**
   * Cambia filtro de búsqueda
   */
  cambiarFiltroTipo(tipo: 'todos' | 'libro' | 'equipo'): void {
    this.filtroTipoBusqueda = tipo;
    if (this.busquedaTexto.trim().length > 0) {
      this.buscarMateriales();
    }
  }

  // ===== MÉTODOS PÚBLICOS - FORMULARIO =====

  /**
   * Inicializa el formulario con valores por defecto
   */
  inicializarFormulario(): void {
    this.tipoSolicitud = 'prof_trabajo';
    this.nombreProfesor = '';
    this.asignatura = '';
    this.normasAceptadas = false;
    this.normasLeidas = false;
    this.errorSolicitud = '';
    this.carrito = [];
    this.busquedaTexto = '';
    this.filtroTipoBusqueda = 'todos';
    this.resultadosBusqueda = [];
    this.mostrarBuscador = false;
    this.mostrarModalExito = false;
    this.mostrarModalError = false;
    this.mensajeExito = '';
    this.mensajeError = '';

    // Agregar material inicial al carrito
    if (this.material) {
      this.agregarMaterialInicial();
    }

    // Fecha actual en formato DD/MM/YYYY
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

    // Limpiar campos si cambia a Tipo B
    if (tipo === 'uso_propio') {
      this.nombreProfesor = '';
      this.asignatura = '';
    }
  }

  /**
   * Verifica si el formulario es válido
   */
  get formularioValido(): boolean {
    // Debe haber al menos 1 item en carrito
    if (this.carrito.length === 0) {
      return false;
    }

    // Normas deben estar aceptadas
    if (!this.normasAceptadas) {
      return false;
    }

    // Si es Tipo A, validar campos adicionales
    if (this.tipoSolicitud === 'prof_trabajo') {
      return this.nombreProfesor.trim() !== '' && this.asignatura.trim() !== '';
    }

    return true;
  }

  /**
   * Envía la solicitud con múltiples items
   */
  enviarSolicitud(): void {
    if (!this.formularioValido || this.carrito.length === 0) {
      this.mostrarModalError = true;
      this.mensajeError = 'Debe haber al menos un material en el carrito';
      return;
    }

    this.enviandoSolicitud = true;
    this.errorSolicitud = '';
  
    // Preparar array de items - SIN el campo "tipo"
    const items = this.carrito.map(item => 
      item.tipo === 'libro' 
        ? { libro_id: item.id }
        : { equipo_id: item.id }
    );

    // Obtener grado del usuario logueado
    const usuarioActual = this.authService.currentUser();
    const gradoId = usuarioActual?.grado_id;

    // Preparar datos principales
    const datos: any = {
      tipo: this.tipoSolicitud,
      normas_aceptadas: this.normasAceptadas,
      items: items,
      grado_id: gradoId // Agregar grado_id del alumno
    };

    // Si es Tipo A, añadir profesor y asignatura
    if (this.tipoSolicitud === 'prof_trabajo') {
      datos.observaciones = `Profesor: ${this.nombreProfesor} | Asignatura: ${this.asignatura}`;
      // Nota: profesor_asociado_id no se envía porque en el modal solo escribimos el NOMBRE
      // El backend debería usar el nombre del profesor, no un ID
    }

    console.log('📤 Enviando solicitud múltiple:', datos);

    // Enviar al backend
    this.solicitudesService.crearSolicitud(datos).subscribe({
      next: (response) => {
        console.log('✅ Solicitud creada:', response);
        this.mostrarModalExito = true;
        this.mensajeExito = `Solicitud registrada correctamente con ${this.carrito.length} material(es). Recibirás actualizaciones sobre el estado de tu solicitud por correo.`;
        this.solicitudCreada.emit();
        
        // Cerrar modal después de 3 segundos
        setTimeout(() => {
          this.cerrarModal();
        }, 3000);
      },
      error: (err) => {
        console.error('❌ Error al crear solicitud:', err);
        this.mostrarModalError = true;
        this.mensajeError = err.error?.mensaje || 'Error al enviar la solicitud. Por favor, inténtalo de nuevo.';
        this.enviandoSolicitud = false;
      },
      complete: () => {
        this.enviandoSolicitud = false;
      }
    });
  }

  /**
   * Cierra el modal de éxito
   */
  cerrarModalExito(): void {
    this.mostrarModalExito = false;
    this.cerrarModal();
  }

  /**
   * Cierra el modal de error
   */
  cerrarModalError(): void {
    this.mostrarModalError = false;
  }

  /**
   * Cierra el modal
   */
  cerrarModal(): void {
    this.inicializarFormulario();
    this.close.emit();
  }

  /**
   * Abre el modal de normas completas
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
   * Se ejecuta cuando el usuario acepta las normas
   */
  onNormasAceptadas(): void {
    this.normasAceptadas = true;
    this.cerrarModalNormas();
  }
}