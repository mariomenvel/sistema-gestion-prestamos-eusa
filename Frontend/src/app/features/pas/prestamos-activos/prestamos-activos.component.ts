import { Component, OnInit } from '@angular/core';
import { PrestamosService } from '../../../core/services/prestamos.service';
import { Prestamo } from '../../../core/models/prestamo.model';

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

  // ===== MÉTODOS DE FILTRO Y ORDENACIÓN =====

  aplicarFiltros(): void {
    let resultado = [...this.prestamos];

    // 1. Filtro por texto (Nombre Alumno, Email o Código Tarjeta)
    if (this.textoBusqueda.trim()) {
      const texto = this.normalizarTexto(this.textoBusqueda);
      resultado = resultado.filter((p: any) => {
        const nombre = this.normalizarTexto(this.getNombreUsuario(p));
        const email = p.Usuario ? this.normalizarTexto(p.Usuario.email) : '';
        const codigo = p.Usuario?.codigo_tarjeta ? this.normalizarTexto(p.Usuario.codigo_tarjeta) : '';
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

  private normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
 * Abre el modal de confirmación de devolución
 */
  abrirModalDevolucion(prestamo: any): void {
    console.log('🔵 Abriendo modal devolución:', prestamo);
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
        console.log('✅ Devolución registrada');
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
        console.error('❌ Error al registrar devolución:', err);
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
    console.log('👤 Abriendo perfil del alumno:', usuario);
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

    if (item.Ejemplar && item.Ejemplar.libro) {
      return item.Ejemplar.libro.titulo;
    }

    if (item.Unidad && item.Unidad.equipo) {
      const equipo = item.Unidad.equipo;
      return `${equipo.marca} ${equipo.modelo}`;
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
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
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
    if (item.Ejemplar && item.Ejemplar.libro) {
      return item.Ejemplar.libro.titulo;
    }
    if (item.Unidad && item.Unidad.equipo) {
      const equipo = item.Unidad.equipo;
      return `${equipo.marca} ${equipo.modelo}`;
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
        console.log('📚 Préstamos activos recibidos:', prestamos);
        this.prestamos = prestamos;
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar préstamos:', err);
        this.errorMessage = 'Error al cargar los préstamos activos';
        this.isLoading = false;
      }
    });
  }
}