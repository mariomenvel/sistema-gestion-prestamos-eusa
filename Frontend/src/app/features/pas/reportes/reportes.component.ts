import { Component, OnInit } from '@angular/core';
import { ReportesService, LibroMasPrestado, MaterialMasPrestado, UsuarioMasSolicita, Top5Item } from '../../../core/services/reportes.service';

/**
 * Componente Reportes y Estadísticas (PAS)
 * 
 * Muestra estadísticas del sistema:
 * - Libro más prestado
 * - Material audiovisual más prestado
 * - Usuario que más solicita material
 * - Top 5 material más demandado
 */
@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.component.html',
  styleUrls: ['./reportes.component.scss']
})
export class ReportesComponent implements OnInit {

  // ===== DATOS DE ESTADÍSTICAS =====
  
  // Libro más prestado
  libroMasPrestado: LibroMasPrestado = {
    titulo: 'Cargando...',
    autor: '',
    totalPrestamos: 0
  };

  // Material más prestado
  materialMasPrestado: MaterialMasPrestado = {
    nombre: 'Cargando...',
    categoria: '',
    totalPrestamos: 0
  };

  // Usuario que más solicita
  gradoMasSolicita: UsuarioMasSolicita = {
    nombre: 'Cargando...',
    curso: '',
    totalSolicitudes: 0
  };

  // Top 5 material más demandado
  top5Materiales: Top5Item[] = [];

  // ===== ESTADO =====
  
  isLoading: boolean = false;
  errorMessage: string = '';

  // ===== CONSTRUCTOR =====
  
  constructor(
    private reportesService: ReportesService
  ) { }

  // ===== CICLO DE VIDA =====
  
  ngOnInit(): void {
    this.cargarEstadisticas();
  }

  // ===== MÉTODOS PRIVADOS =====
  
  /**
   * Carga todas las estadísticas desde el backend
   */
  private cargarEstadisticas(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Cargar libro más prestado
    this.reportesService.getLibroMasPrestado().subscribe({
      next: (data) => {
        console.log('📚 Libro más prestado:', data);
        this.libroMasPrestado = data;
      },
      error: (err: any) => {
        console.error('❌ Error al cargar libro más prestado:', err);
      }
    });

    // Cargar material más prestado
    this.reportesService.getMaterialMasPrestado().subscribe({
      next: (data) => {
        console.log('📷 Material más prestado:', data);
        this.materialMasPrestado = data;
      },
      error: (err: any) => {
        console.error('❌ Error al cargar material más prestado:', err);
      }
    });

    // Cargar usuario que más solicita
    this.reportesService.getUsuarioMasSolicita().subscribe({
      next: (data) => {
        console.log('👤 Usuario que más solicita:', data);
        this.gradoMasSolicita = data;
      },
      error: (err: any) => {
        console.error('❌ Error al cargar usuario que más solicita:', err);
      }
    });

    // Cargar top 5 materiales
    this.reportesService.getTop5Materiales().subscribe({
      next: (data) => {
        console.log('🏆 Top 5 materiales:', data);
        this.top5Materiales = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('❌ Error al cargar top 5:', err);
        this.errorMessage = 'Error al cargar estadísticas';
        this.isLoading = false;
      }
    });
  }
}