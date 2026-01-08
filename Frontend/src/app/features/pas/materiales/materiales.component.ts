import { Component, OnInit } from '@angular/core';
import { MaterialesService } from '../../../core/services/materiales.service';
import { Libro } from '../../../core/models/libro.model';
import { Equipo } from '../../../core/models/equipo.model';

/**
 * Componente Gestión de Materiales (PAS)
 * 
 * Permite al personal administrativo:
 * - Ver todos los libros y equipos
 * - Filtrar por categoría y estado
 * - Buscar materiales
 * - Añadir nuevos materiales
 * - Eliminar materiales
 */
@Component({
  selector: 'app-materiales',
  templateUrl: './materiales.component.html',
  styleUrls: ['./materiales.component.scss']
})
export class MaterialesComponent implements OnInit {

  // ===== TABS =====
  
  tipoActivo: 'libros' | 'equipos' = 'equipos';

  // ===== DATOS =====
  
  libros: Libro[] = [];
  equipos: Equipo[] = [];
  
  librosFiltrados: Libro[] = [];
  equiposFiltrados: Equipo[] = [];

  // ===== FILTROS =====
  
  textoBusqueda: string = '';
  filtroCategoria: string = '';
  filtroEstado: string = '';

  // ===== ESTADO =====
  
  isLoading: boolean = false;
  errorMessage: string = '';

  // ===== CONSTRUCTOR =====
  
  constructor(
    private materialesService: MaterialesService
  ) { }

  // ===== CICLO DE VIDA =====
  
  ngOnInit(): void {
    this.cargarMateriales();
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
   * Busca materiales por texto
   */
  buscar(): void {
    console.log('🔍 Buscando:', this.textoBusqueda);
    this.aplicarFiltros();
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.textoBusqueda = '';
    this.filtroCategoria = '';
    this.filtroEstado = '';
    this.aplicarFiltros();
  }

  /**
   * Abre modal para añadir material
   */
  abrirModalAnadirMaterial(): void {
    alert('Funcionalidad de añadir material - Por implementar con modal');
    // TODO: Abrir modal AniadirMaterialComponent
  }

  /**
   * Elimina un material
   */
  eliminarMaterial(material: Libro | Equipo, tipo: 'libro' | 'equipo'): void {
    const nombre = tipo === 'libro' 
      ? (material as Libro).titulo 
      : `${(material as Equipo).marca} ${(material as Equipo).modelo}`;
    
    if (!confirm(`¿Eliminar el material "${nombre}"?`)) {
      return;
    }

    if (tipo === 'libro') {
      this.materialesService.eliminarLibro(material.id).subscribe({
        next: () => {
          console.log('✅ Libro eliminado');
          alert('Libro eliminado correctamente');
          this.cargarMateriales();
        },
        error: (err: any) => {
          console.error('❌ Error al eliminar libro:', err);
          alert('Error al eliminar el libro');
        }
      });
    } else {
      this.materialesService.eliminarEquipo(material.id).subscribe({
        next: () => {
          console.log('✅ Equipo eliminado');
          alert('Equipo eliminado correctamente');
          this.cargarMateriales();
        },
        error: (err: any) => {
          console.error('❌ Error al eliminar equipo:', err);
          alert('Error al eliminar el equipo');
        }
      });
    }
  }

  /**
   * Obtiene el nombre de la categoría
   */
  getNombreCategoria(material: Libro | Equipo): string {
    // Ambos usan "categoria" (sin s)
    if (material.categoria) {
      return material.categoria.nombre;
    }
    return 'Sin categoría';
  }

  /**
   * Verifica si hay ejemplares/unidades disponibles
   */
  tieneDisponibles(material: Libro | Equipo): boolean {
    if ('ejemplares' in material && material.ejemplares) {
      return material.ejemplares.some(e => e.estado === 'disponible');
    }
    if ('unidades' in material && material.unidades) {
      return material.unidades.some(u => u.estado === 'disponible');
    }
    return false;
  }

  /**
   * Obtiene las categorías únicas de los materiales actuales
   */
  getCategoriasDisponibles(): string[] {
    const categorias = new Set<string>();
    
    if (this.tipoActivo === 'libros') {
      this.libros.forEach(libro => {
        if (libro.categoria_codigo) {
          categorias.add(libro.categoria_codigo);
        }
      });
    } else {
      this.equipos.forEach(equipo => {
        if (equipo.categoria_codigo) {
          categorias.add(equipo.categoria_codigo);
        }
      });
    }
    
    return Array.from(categorias).sort();
  }

  /**
   * Obtiene el nombre legible de una categoría por su código
   */
  getNombreCategoriaPorCodigo(codigo: string): string {
    // Buscar en libros primero
    const libro = this.libros.find(l => l.categoria_codigo === codigo);
    if (libro && libro.categoria) {
      return libro.categoria.nombre;
    }
    
    // Buscar en equipos
    const equipo = this.equipos.find(e => e.categoria_codigo === codigo);
    if (equipo && equipo.categoria) {
      return equipo.categoria.nombre;
    }
    
    return codigo; // Devolver el código si no se encuentra el nombre
  }

  // ===== MÉTODOS PRIVADOS =====
  
  /**
   * Carga libros y equipos desde el backend
   */
  private cargarMateriales(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Cargar libros
    this.materialesService.getLibros().subscribe({
      next: (libros: Libro[]) => {
        console.log('📚 Libros recibidos:', libros);
        this.libros = libros;
        this.aplicarFiltros();
      },
      error: (err: any) => {
        console.error('❌ Error al cargar libros:', err);
      }
    });

    // Cargar equipos
    this.materialesService.getEquipos().subscribe({
      next: (equipos: Equipo[]) => {
        console.log('📷 Equipos recibidos:', equipos);
        this.equipos = equipos;
        this.aplicarFiltros();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('❌ Error al cargar equipos:', err);
        this.errorMessage = 'Error al cargar los materiales';
        this.isLoading = false;
      }
    });
  }

  /**
   * Aplica los filtros activos
   */
  aplicarFiltros(): void {
    // Filtrar libros
    let resultadoLibros = [...this.libros];
    
    // Filtro por texto (búsqueda)
    if (this.textoBusqueda.trim()) {
      const texto = this.textoBusqueda.toLowerCase();
      resultadoLibros = resultadoLibros.filter(libro =>
        libro.titulo.toLowerCase().includes(texto) ||
        libro.libro_numero.toLowerCase().includes(texto) ||
        (libro.autor && libro.autor.toLowerCase().includes(texto)) ||
        (libro.editorial && libro.editorial.toLowerCase().includes(texto))
      );
    }

    // Filtro por categoría
    if (this.filtroCategoria) {
      resultadoLibros = resultadoLibros.filter(libro =>
        libro.categoria_codigo === this.filtroCategoria
      );
    }

    // Filtro por estado (disponible/no disponible)
    if (this.filtroEstado) {
      if (this.filtroEstado === 'disponible') {
        resultadoLibros = resultadoLibros.filter(libro => this.tieneDisponibles(libro));
      } else if (this.filtroEstado === 'no_disponible') {
        resultadoLibros = resultadoLibros.filter(libro => !this.tieneDisponibles(libro));
      }
    }

    this.librosFiltrados = resultadoLibros;

    // Filtrar equipos
    let resultadoEquipos = [...this.equipos];
    
    // Filtro por texto (búsqueda) - INCLUYE CÓDIGO COMPLETO
    if (this.textoBusqueda.trim()) {
      const texto = this.textoBusqueda.toLowerCase();
      resultadoEquipos = resultadoEquipos.filter(equipo => {
        // Código completo = categoria_codigo + id (ej: CAM4)
        const codigoCompleto = `${equipo.categoria_codigo}${equipo.id}`.toLowerCase();
        
        return equipo.marca.toLowerCase().includes(texto) ||
          equipo.modelo.toLowerCase().includes(texto) ||
          codigoCompleto.includes(texto) ||
          (equipo.categoria_codigo && equipo.categoria_codigo.toLowerCase().includes(texto)) ||
          (equipo.descripcion && equipo.descripcion.toLowerCase().includes(texto));
      });
    }

    // Filtro por categoría
    if (this.filtroCategoria) {
      resultadoEquipos = resultadoEquipos.filter(equipo =>
        equipo.categoria_codigo === this.filtroCategoria
      );
    }

    // Filtro por estado (disponible/no disponible)
    if (this.filtroEstado) {
      if (this.filtroEstado === 'disponible') {
        resultadoEquipos = resultadoEquipos.filter(equipo => this.tieneDisponibles(equipo));
      } else if (this.filtroEstado === 'no_disponible') {
        resultadoEquipos = resultadoEquipos.filter(equipo => !this.tieneDisponibles(equipo));
      }
    }

    this.equiposFiltrados = resultadoEquipos;

    console.log('🔍 Filtros aplicados:', {
      libros: this.librosFiltrados.length,
      equipos: this.equiposFiltrados.length,
      texto: this.textoBusqueda,
      categoria: this.filtroCategoria,
      estado: this.filtroEstado
    });
  }
}