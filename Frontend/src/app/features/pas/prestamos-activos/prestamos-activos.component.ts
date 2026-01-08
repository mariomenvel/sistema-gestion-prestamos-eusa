import { Component, OnInit } from '@angular/core';
import { PrestamosService } from '../../../core/services/prestamos.service';
import { Prestamo } from '../../../core/models/prestamo.model';

/**
 * Componente Préstamos Activos (PAS)
 * 
 * Permite al personal administrativo:
 * - Ver todos los préstamos activos del sistema
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
  getNombreUsuario(prestamo: Prestamo): string {
    if (prestamo.usuario) {
      return prestamo.usuario.nombre || prestamo.usuario.email;
    }
    return 'Usuario desconocido';
  }

  /**
   * Obtiene el nombre del material
   */
  getNombreMaterial(prestamo: Prestamo): string {
    // Si tiene ejemplar (libro)
    if (prestamo.Ejemplar && prestamo.Ejemplar.libro) {
      return prestamo.Ejemplar.libro.titulo;
    }
    
    // Si tiene unidad (equipo)
    if (prestamo.Unidad && prestamo.Unidad.equipo) {
      const equipo = prestamo.Unidad.equipo;
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
   * Verifica si un préstamo está vencido
   */
  esVencido(prestamo: Prestamo): boolean {
    if (!prestamo.fecha_devolucion_prevista) return false;
    const hoy = new Date();
    const fechaPrevista = new Date(prestamo.fecha_devolucion_prevista);
    return hoy > fechaPrevista;
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