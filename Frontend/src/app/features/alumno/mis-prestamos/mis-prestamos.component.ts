import { Component, OnInit } from '@angular/core';
import { PrestamosService } from '../../../core/services/prestamos.service';
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
    private prestamosService: PrestamosService
  ) { }

  // ===== CICLO DE VIDA =====
  ngOnInit(): void {
    this.cargarPrestamos();
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
   * Obtiene el nombre del material
   */
  getNombreMaterial(prestamo: Prestamo): string {
    // Si tiene ejemplar (libro) - Sequelize devuelve con mayúscula
    if ((prestamo as any).Ejemplar && (prestamo as any).Ejemplar.libro) {
      return (prestamo as any).Ejemplar.libro.titulo;
    }

    // Si tiene unidad (equipo) - Sequelize devuelve con mayúscula
    if ((prestamo as any).Unidad && (prestamo as any).Unidad.equipo) {
      const equipo = (prestamo as any).Unidad.equipo;
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
  
getEstadoClass(estado: string): string {
  switch (estado) {
    case 'activo': return 'badge-activo';
    case 'vencido': return 'badge-vencido';
    case 'cerrado': return 'badge-completado';
    default: return '';
  }
}

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