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

  // ===== MODAL MATERIALES =====
  mostrarModalMateriales: boolean = false;
  materialesSeleccionados: any[] = [];
  prestamoSeleccionado: any = null;

  // ===== ESTADO =====

  isLoading: boolean = false;
  errorMessage: string = '';

  // ===== CONSTRUCTOR =====

  constructor(
    private prestamosService: PrestamosService
  ) { }

  // ===== CICLO DE VIDA =====

  ngOnInit(): void {
    this.cargarPrestamos();
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
   * Registra la devolución de un préstamo
   */
  registrarDevolucion(prestamo: Prestamo): void {
    const nombreUsuario = this.getNombreUsuario(prestamo);
    const nombreMaterial = this.getNombreMaterial(prestamo);

    if (!confirm(`¿Registrar devolución del material "${nombreMaterial}" de ${nombreUsuario}?`)) {
      return;
    }

    this.prestamosService.registrarDevolucion(prestamo.id).subscribe({
      next: () => {
        console.log('✅ Devolución registrada');
        alert('Devolución registrada correctamente');
        this.cargarPrestamos(); // Recargar lista
      },
      error: (err) => {
        console.error('❌ Error al registrar devolución:', err);
        alert('Error al registrar la devolución');
      }
    });
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