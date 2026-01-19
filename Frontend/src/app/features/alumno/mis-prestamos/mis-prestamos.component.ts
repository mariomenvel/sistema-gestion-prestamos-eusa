import { Component, OnInit } from '@angular/core';
import { PrestamosService } from '../../../core/services/prestamos.service';
import { SolicitudesService } from '../../../core/services/solicitudes.service';
import { Prestamo } from '../../../core/models/prestamo.model';

/**
 * Componente Mis Préstamos (Alumno)
 * 
 * Muestra todos los préstamos del alumno logueado
 */
@Component({
  selector: 'app-mis-prestamos',
  templateUrl: './mis-prestamos.component.html',
  styleUrls: ['./mis-prestamos.component.scss']
})
export class MisPrestamosComponent implements OnInit {

  // ===== DATOS =====
  prestamos: Prestamo[] = [];
  prestamosFiltrados: Prestamo[] = [];

  // ===== BÚSQUEDA =====
  textoBusqueda: string = '';

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
    this.cargarPrestamos();
    
    // Suscribirse a cambios de solicitudes (cuando se crea una nueva)
    // Así se actualiza la tabla cuando se crea un préstamo
    this.solicitudesService.solicitudCreada$.subscribe(() => {
      this.cargarPrestamos();
    });
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
   * Busca préstamos por material
   */
  buscar(): void {
    if (!this.textoBusqueda.trim()) {
      this.prestamosFiltrados = [...this.prestamos];
      return;
    }

    const textoNormalizado = this.normalizarTexto(this.textoBusqueda);

    this.prestamosFiltrados = this.prestamos.filter(prestamo => {
      const nombreMaterial = this.normalizarTexto(this.getNombreMaterial(prestamo));
      return nombreMaterial.includes(textoNormalizado);
    });
  }

  /**
   * Obtiene el nombre del material de un préstamo
   * Los datos vienen dentro de items[0]
   */
  getNombreMaterial(prestamo: Prestamo): string {
    // El préstamo tiene items (array de PrestamoItem)
    const items = (prestamo as any).items;
    
    if (!items || items.length === 0) {
      return 'Material desconocido';
    }

    // Tomar el primer item
    const primerItem = items[0];

    // Si es un ejemplar (libro)
    if (primerItem.Ejemplar && primerItem.Ejemplar.libro) {
      return primerItem.Ejemplar.libro.titulo;
    }

    // Si es una unidad (equipo)
    if (primerItem.Unidad && primerItem.Unidad.equipo) {
      const equipo = primerItem.Unidad.equipo;
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
   * Obtiene el texto del tipo de préstamo
   */
  getTipoTexto(tipo: string): string {
    return tipo === 'a' ? 'Tipo A' : 'Tipo B';
  }
  
  /**
   * Obtiene la clase CSS para el estado
   */
  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'activo': return 'badge-activo';
      case 'vencido': return 'badge-vencido';
      case 'cerrado': return 'badge-completado';
      default: return '';
    }
  }

  /**
   * Obtiene el texto del estado
   */
  getEstadoTexto(estado: string): string {
    switch (estado) {
      case 'activo': return 'Activo';
      case 'vencido': return 'Vencido';
      case 'cerrado': return 'Completado';
      default: return estado;
    }
  }

  // ===== MÉTODOS PRIVADOS =====

  /**
   * Carga todos los préstamos del alumno
   */
  private cargarPrestamos(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.prestamosService.getMisPrestamos().subscribe({
      next: (prestamos) => {
        console.log('📋 Préstamos recibidos:', prestamos);
        this.prestamos = prestamos;
        this.prestamosFiltrados = [...prestamos];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar préstamos:', err);
        this.errorMessage = 'Error al cargar tus préstamos';
        this.isLoading = false;
      }
    });
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