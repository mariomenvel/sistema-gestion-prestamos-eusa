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

    let callsCompleted = 0;
    const totalCalls = 4;

    const checkLoading = () => {
      callsCompleted++;
      if (callsCompleted === totalCalls) {
        this.isLoading = false;
      }
    };

    // Cargar libro más prestado
    this.reportesService.getLibroMasPrestado().subscribe({
      next: (data) => {
        this.libroMasPrestado = data;
        checkLoading();
      },
      error: (err: any) => {
        this.libroMasPrestado = { titulo: 'Error', autor: 'No se pudo cargar', totalPrestamos: 0 };
        checkLoading();
      }
    });

    // Cargar material más prestado
    this.reportesService.getMaterialMasPrestado().subscribe({
      next: (data) => {
        this.materialMasPrestado = data;
        checkLoading();
      },
      error: (err: any) => {
        this.materialMasPrestado = { nombre: 'Error', categoria: 'No se pudo cargar', totalPrestamos: 0 };
        checkLoading();
      }
    });

    // Cargar usuario que más solicita
    this.reportesService.getUsuarioMasSolicita().subscribe({
      next: (data) => {
        this.gradoMasSolicita = data;
        checkLoading();
      },
      error: (err: any) => {
        this.gradoMasSolicita = { nombre: 'Error', curso: '-', totalSolicitudes: 0 };
        checkLoading();
      }
    });

    // Cargar top 5 materiales
    this.reportesService.getTop5Materiales().subscribe({
      next: (data) => {
        this.top5Materiales = data;
        checkLoading();
      },
      error: (err: any) => {
        this.errorMessage = 'Algunas estadísticas no pudieron cargarse';
        // Poblar con vacíos si hay error crítico
        if (this.top5Materiales.length === 0) {
          for (let i = 1; i <= 5; i++) {
            this.top5Materiales.push({ posicion: i, nombre: 'Error', categoria: '-', totalPrestamos: 0 });
          }
        }
        checkLoading();
      }
    });
  }
}