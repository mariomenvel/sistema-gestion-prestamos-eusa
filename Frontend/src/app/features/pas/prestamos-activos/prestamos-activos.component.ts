import { Component, OnInit, HostListener } from '@angular/core';
import { PrestamosService } from '../../../core/services/prestamos.service';
import { Prestamo } from '../../../core/models/prestamo.model';
import { normalizarTexto } from '../../../core/utils/text.utils';

/**
 * Componente Préstamos Activos (PAS)
 * 
 * Permite al personal administrativo:
 * - Ver todos los préstamos activos del sistema
 * - Ver tipo de préstamo (A, B, C)
 * - Registrar devoluciones
 * - Marcar préstamos como finalizados
 */
@Component({
  selector: 'app-prestamos-activos',
  templateUrl: './prestamos-activos.component.html',
  styleUrls: ['./prestamos-activos.component.scss']
})
export class PrestamosActivosComponent implements OnInit {

  // ===== DATOS =====

  prestamos: Prestamo[] = [];
  prestamosFiltrados: Prestamo[] = [];

  // ===== FILTROS Y BÚSQUEDA =====
  textoBusqueda: string = '';

  // ===== ORDENACIÓN =====
  sortColumn: string = 'fechaDevolucion'; // 'alumno' o 'fechaDevolucion'
  sortDirection: 'asc' | 'desc' = 'asc';

  // ===== MODAL MATERIALES =====
  mostrarModalMateriales: boolean = false;
  materialesSeleccionados: any[] = [];
  prestamoSeleccionado: any = null;

  // ===== MODAL DEVOLUCIÓN =====
  mostrarModalDevolucion: boolean = false;
  prestamoDevolucion: any = null;
  procesandoDevolucion: boolean = false;

  // ===== MODAL NOTIFICACIÓN =====
  mostrarModalNotificacion: boolean = false;
  tipoModalNotificacion: 'exito' | 'error' | 'info' = 'info';
  tituloModalNotificacion: string = '';
  mensajeModalNotificacion: string = '';

  // ===== ESTADO =====

  isLoading: boolean = false;
  errorMessage: string = '';

  //MODAL PERFIL ALUMNO
  mostrarModalPerfil: boolean = false;
  usuarioPerfilSeleccionado: any = null;

  // ===== CONSTRUCTOR =====

  constructor(
    private prestamosService: PrestamosService
  ) { }

  // ===== CICLO DE VIDA =====

  ngOnInit(): void {
    this.cargarPrestamos();
  }

  // ===== HOST LISTENER =====

  @HostListener('document:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.mostrarModalMateriales) { this.cerrarModalMateriales(); }
      else if (this.mostrarModalDevolucion) { this.cerrarModalDevolucion(); }
      else if (this.mostrarModalPerfil) { this.cerrarModalPerfil(); }
    }
  }

  // ===== MÉTODOS DE FILTRO Y ORDENACIÓN =====

  aplicarFiltros(): void {
    let resultado = [...this.prestamos];

    // 1. Filtro por texto (Nombre Alumno, Email o Código Tarjeta)
    if (this.textoBusqueda.trim()) {
      const texto = normalizarTexto(this.textoBusqueda);
      resultado = resultado.filter((p: any) => {
        const nombre = normalizarTexto(this.getNombreUsuario(p));
        const email = p.Usuario ? normalizarTexto(p.Usuario.email) : '';
        const codigo = p.Usuario?.codigo_tarjeta ? normalizarTexto(p.Usuario.codigo_tarjeta) : '';
        return nombre.includes(texto) || email.includes(texto) || codigo.includes(texto);
      });
    }

    // 2. Aplicar ordenación
    this.aplicarOrdenacion(resultado);
  }

  ordenar(columna: string): void {
    if (this.sortColumn === columna) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columna;
      this.sortDirection = 'asc';
    }
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.aplicarFiltros();
  }

  private aplicarOrdenacion(datos: Prestamo[]): void {
    datos.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (this.sortColumn) {
        case 'alumno':
          valorA = this.getNombreUsuario(a).toLowerCase();
          valorB = this.getNombreUsuario(b).toLowerCase();
          break;
        case 'fechaDevolucion':
          valorA = a.fecha_devolucion_prevista ? new Date(a.fecha_devolucion_prevista).getTime() : 0;
          valorB = b.fecha_devolucion_prevista ? new Date(b.fecha_devolucion_prevista).getTime() : 0;
          break;
        default:
          return 0;
      }

      if (valorA < valorB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valorA > valorB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.prestamosFiltrados = datos;
  }

  /**
   * Delegation method for template usage
   */
  normalizarTexto(texto: string): string {
    return normalizarTexto(texto);
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
 * Abre el modal de confirmación de devolución
 */
  abrirModalDevolucion(prestamo: any): void {
    this.prestamoDevolucion = prestamo;
    this.mostrarModalDevolucion = true;
  }

  /**
   * Cierra el modal de devolución
   */
  cerrarModalDevolucion(): void {
    this.mostrarModalDevolucion = false;
    this.prestamoDevolucion = null;
  }

  /**
   * Confirma y registra la devolución
   */
  confirmarDevolucion(): void {
    if (!this.prestamoDevolucion) return;

    this.procesandoDevolucion = true;

    this.prestamosService.registrarDevolucion(this.prestamoDevolucion.id).subscribe({
      next: () => {
        this.procesandoDevolucion = false;
        this.cerrarModalDevolucion();

        // Mostrar notificación de éxito
        this.tipoModalNotificacion = 'exito';
        this.tituloModalNotificacion = 'Devolución Registrada';
        this.mensajeModalNotificacion = 'La devolución se ha registrado correctamente. Los materiales vuelven a estar disponibles.';
        this.mostrarModalNotificacion = true;

        // Recargar lista
        this.cargarPrestamos();
      },

      error: (err) => {
        this.procesandoDevolucion = false;
        this.cerrarModalDevolucion();

        // Mostrar notificación de error
        this.tipoModalNotificacion = 'error';
        this.tituloModalNotificacion = 'Error en la Devolución';
        this.mensajeModalNotificacion = err.error?.mensaje || 'No se pudo registrar la devolución. Inténtalo de nuevo.';
        this.mostrarModalNotificacion = true;
      }
    });
  }
  abrirPerfilAlumno(prestamo: Prestamo, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const usuario = (prestamo as any).Usuario;
    if (usuario) {
      this.usuarioPerfilSeleccionado = usuario;
      this.mostrarModalPerfil = true;
    }
  }

  // Método para cerrar modal de perfil
  cerrarModalPerfil(): void {
    this.mostrarModalPerfil = false;
    this.usuarioPerfilSeleccionado = null;
  }

  /**
   * Cierra el modal de notificación
   */
  cerrarModalNotificacion(): void {
    this.mostrarModalNotificacion = false;
  }

  /**
   * Obtiene la lista de materiales para mostrar en el modal
   */
  getMaterialesDevolucion(): any[] {
    if (!this.prestamoDevolucion || !this.prestamoDevolucion.items) {
      return [];
    }
    return this.prestamoDevolucion.items;
  }

  /**
   * Obtiene el nombre del usuario
   */
  getNombreUsuario(prestamo: any): string {
    if (prestamo.Usuario) {
      const u = prestamo.Usuario;
      return u.nombre ? `${u.nombre} ${u.apellidos || ''}`.trim() : u.email;
    }
    return 'Usuario desconocido';
  }

  /**
   * Obtiene el nombre del material
   */
  getNombreMaterial(prestamo: any): string {
    if (!prestamo.items || prestamo.items.length === 0) {
      return 'Sin materiales';
    }

    // Si hay múltiples items, mostrar cantidad como enlace
    if (prestamo.items.length > 1) {
      return `${prestamo.items.length} materiales`;
    }

    // Si hay un solo item, mostrar su nombre
    const item = prestamo.items[0];

    // Verificar ambas posibles estructuras (Libro o libro)
    if (item.Ejemplar) {
      const libro = item.Ejemplar.Libro || item.Ejemplar.libro;
      if (libro && libro.titulo) {
        return libro.titulo;
      }
    }

    if (item.Unidad) {
      const equipo = item.Unidad.Equipo || item.Unidad.equipo;
      if (equipo) {
        return `${equipo.marca || ''} ${equipo.modelo || ''}`.trim();
      }
    }

    return 'Material desconocido';
  }

  /**
   * Verifica si el préstamo tiene múltiples materiales
   */
  tieneMultiplesMateriales(prestamo: any): boolean {
    return prestamo.items && prestamo.items.length > 1;
  }

  /**
   * Formatea fecha DD/MM/YYYY
   */
  formatearFecha(fecha: string): string {
    if (!fecha) return '—';
    const partes = fecha.split('T')[0].split('-');
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  /**
   * Verifica si un préstamo está vencido
   */
  esVencido(prestamo: Prestamo): boolean {
    if (!prestamo.fecha_devolucion_prevista) return false;
    const hoy = new Date();
    const fechaPrevista = new Date(prestamo.fecha_devolucion_prevista);
    return hoy > fechaPrevista;
  }

  // ===== NUEVOS MÉTODOS - PARA TIPO =====

  /**
   * CAMBIO: Obtiene el texto del tipo de préstamo
   * Tipo 'a' = Tipo A (Académico)
   * Tipo 'b' = Tipo B (Personal)
   * Tipo 'c' = Tipo C (Presencial)
   */
  getTipoTexto(tipo: string): string {
    switch (tipo) {
      case 'a':
        return 'Tipo A';
      case 'b':
        return 'Tipo B';
      case 'c':
        return 'Presencial';
      default:
        return tipo;
    }
  }

  /**
 * Abre el modal con los detalles de los materiales
 */
  verDetallesMateriales(prestamo: any, event: Event): void {
    event.stopPropagation(); // Evitar que se propague el click

    if (!prestamo.items || prestamo.items.length === 0) {
      return;
    }

    this.prestamoSeleccionado = prestamo;
    this.materialesSeleccionados = prestamo.items;
    this.mostrarModalMateriales = true;
  }

  /**
   * Cierra el modal de materiales
   */
  cerrarModalMateriales(): void {
    this.mostrarModalMateriales = false;
    this.materialesSeleccionados = [];
    this.prestamoSeleccionado = null;
  }

  /**
   * Obtiene el nombre de un item individual
   */
  getNombreItem(item: any): string {
    // Verificar ambas posibles estructuras (Libro o libro)
    if (item.Ejemplar) {
      const libro = item.Ejemplar.Libro || item.Ejemplar.libro;
      if (libro && libro.titulo) {
        return libro.titulo;
      }
    }
    if (item.Unidad) {
      const equipo = item.Unidad.Equipo || item.Unidad.equipo;
      if (equipo) {
        return `${equipo.marca || ''} ${equipo.modelo || ''}`.trim();
      }
    }
    return 'Material desconocido';
  }

  /**
   * Obtiene el tipo de item (libro o equipo)
   */
  getTipoItem(item: any): string {
    if (item.Ejemplar) {
      return 'Libro';
    }
    if (item.Unidad) {
      return 'Equipo';
    }
    return 'Desconocido';
  }

  /**
   * Obtiene el código de barras del item
   */
  getCodigoItem(item: any): string {
    if (item.Ejemplar) {
      return item.Ejemplar.codigo_barra || '-';
    }
    if (item.Unidad) {
      return item.Unidad.codigo_barra || '-';
    }
    return '-';
  }

  // ===== MÉTODOS PRIVADOS =====

  /**
   * Carga todos los préstamos activos
   */
  private cargarPrestamos(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.prestamosService.getPrestamosActivos().subscribe({
      next: (prestamos) => {
        this.prestamos = prestamos;
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error al cargar los préstamos activos';
        this.isLoading = false;
      }
    });
  }
}