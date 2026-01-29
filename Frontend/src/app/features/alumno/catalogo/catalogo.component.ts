import { Component, OnInit } from '@angular/core';
import { MaterialesService } from '../../../core/services/materiales.service';
import { Libro, Equipo, Categoria } from '../../../core/models';
import { environment } from '../../../../environments/environment';

/**
 * Interface unificada para mostrar materiales (libros o equipos)
 * en un formato común para la vista.
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
 * Componente Catálogo - Vista de libros y equipos disponibles.
 */
@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss']
})
export class CatalogoComponent implements OnInit {

  // ===== DATOS =====

  libros: Libro[] = [];
  equipos: Equipo[] = [];
  categorias: Categoria[] = [];
  materiales: MaterialVista[] = [];
  materialesFiltrados: MaterialVista[] = [];

  // ===== FILTROS =====

  filtroTipoActivo: 'todos' | 'libros' | 'equipos' = 'todos';
  categoriasSeleccionadas: string[] = [];
  textoBusqueda: string = '';

  // ===== ESTADO =====

  isLoading: boolean = false;
  errorMessage: string = '';

  // ===== MODAL DE SOLICITUD ===== 

  mostrarModalSolicitud: boolean = false;
  materialSeleccionado: MaterialVista | null = null;
  // ===== CONSTRUCTOR =====

  constructor(
    private materialesService: MaterialesService
  ) { }

  // ===== CICLO DE VIDA =====

  ngOnInit(): void {
    this.cargarDatos();
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
   * Cambia el filtro de tipo (Todos, Libros, Material Audiovisual)
   */
  cambiarFiltroTipo(tipo: 'todos' | 'libros' | 'equipos'): void {
    this.filtroTipoActivo = tipo;
    this.aplicarFiltros();
  }

  /**
   * Toggle de categoría en el panel de filtros
   */
  toggleCategoria(categoriaCodigo: string): void {
    const index = this.categoriasSeleccionadas.indexOf(categoriaCodigo);

    if (index === -1) {
      this.categoriasSeleccionadas.push(categoriaCodigo);
    } else {
      this.categoriasSeleccionadas.splice(index, 1);
    }

    this.aplicarFiltros();
  }

  /**
   * Verifica si una categoría está seleccionada
   */
  isCategoriaSeleccionada(categoriaCodigo: string): boolean {
    return this.categoriasSeleccionadas.includes(categoriaCodigo);
  }

  /**
   * Buscar por texto
   */
  buscar(): void {
    this.aplicarFiltros();
  }

  /**
   * Abre el modal de solicitud
   */
  solicitarPrestamo(material: MaterialVista): void {
    this.materialSeleccionado = material;
    this.mostrarModalSolicitud = true;
  }

  /**
   * Cierra el modal de solicitud
   */
  cerrarModalSolicitud(): void {
    this.mostrarModalSolicitud = false;
    this.materialSeleccionado = null;
  }

  /**
   * Callback cuando se crea la solicitud exitosamente
   */
  onSolicitudCreada(): void {
    this.cerrarModalSolicitud();
    // Opcional: Recargar datos o mostrar mensaje
    console.log('✅ Solicitud creada exitosamente');
  }

  /**
   * Obtiene las categorías según el filtro de tipo
   */
  get categoriasFiltradas(): Categoria[] {
    if (this.filtroTipoActivo === 'todos') {
      return this.categorias;
    } else if (this.filtroTipoActivo === 'libros') {
      return this.categorias.filter(c => c.tipo === 'libro');
    } else {
      return this.categorias.filter(c => c.tipo === 'equipo');
    }
  }

  // ===== MÉTODOS PRIVADOS =====

  /**
   * Carga libros y equipos desde el backend
   */
  private cargarDatos(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Cargar libros
    this.materialesService.getLibros().subscribe({
      next: (libros) => {
        console.log('📚 Libros recibidos:', libros);
        this.libros = libros;
        this.extraerCategorias();
        this.procesarMateriales();
      },
      error: (err) => {
        console.error('❌ Error al cargar libros:', err);
        this.errorMessage = 'Error al cargar el catálogo';
        this.isLoading = false;
      }
    });

    // Cargar equipos
    this.materialesService.getEquipos().subscribe({
      next: (equipos) => {
        console.log('📷 Equipos recibidos:', equipos);
        this.equipos = equipos;
        this.extraerCategorias();
        this.procesarMateriales();
      },
      error: (err) => {
        console.error('❌ Error al cargar equipos:', err);
        this.errorMessage = 'Error al cargar el catálogo';
        this.isLoading = false;
      }
    });
  }

  /**
   * Extrae categorías únicas de libros y equipos
   */
  private extraerCategorias(): void {
    const categoriasMap = new Map<string, Categoria>();

    // Extraer de libros (Géneros)
    this.libros.forEach(libro => {
      const genero = libro.genero;
      if (genero && !categoriasMap.has(genero.nombre)) {
        // Mapeamos el género a una Categoria para que la vista lo trate igual
        categoriasMap.set(genero.nombre, {
          id: genero.id,
          nombre: genero.nombre,
          tipo: 'libro',
          activa: true
        } as Categoria);
      }
    });

    // Extraer de equipos (Categorías)
    this.equipos.forEach(equipo => {
      if (equipo.categoria && !categoriasMap.has(equipo.categoria.nombre)) {
        categoriasMap.set(equipo.categoria.nombre, equipo.categoria);
      }
    });

    this.categorias = Array.from(categoriasMap.values());
    console.log('🏷️ Categorías extraídas:', this.categorias);
  }

  /**
   * Procesa libros y equipos en un array unificado
   */
  private procesarMateriales(): void {
    // Solo procesar cuando tengamos ambos conjuntos de datos
    if (this.libros.length === 0 && this.equipos.length === 0) {
      return;
    }

    this.materiales = [];

    // Procesar libros
    this.libros.forEach(libro => {
      const tieneDisponibles = libro.ejemplares?.some(ej => ej.estado === 'disponible') || false;
      const nombreGenero = libro.genero?.nombre || 'Sin categoría';

      this.materiales.push({
        id: libro.id,
        tipo: 'libro',
        titulo: libro.titulo,
        categoria: nombreGenero,
        marcaModelo: `${libro.autor || 'Autor desconocido'} - ${libro.editorial || 'Editorial desconocida'}`,
        descripcion: `Libro número: ${libro.libro_numero}`,
        disponible: tieneDisponibles,
        imagenUrl: this.getImageUrl(libro.foto_url)
      });
    });

    // Procesar equipos
    this.equipos.forEach(equipo => {
      const tieneDisponibles = equipo.unidades?.some(u => u.esta_prestado === false && u.estado_fisico === 'funciona') || false;

      this.materiales.push({
        id: equipo.id,
        tipo: 'equipo',
        titulo: `${equipo.marca} ${equipo.modelo}`,
        categoria: equipo.categoria?.nombre || 'Sin categoría',
        marcaModelo: `${equipo.marca} - ${equipo.modelo}`,
        descripcion: equipo.descripcion || 'Equipo disponible para préstamo',
        disponible: tieneDisponibles,
        imagenUrl: this.getImageUrl(equipo.foto_url)
      });
    });

    console.log('✅ Materiales procesados:', this.materiales.length);
    this.aplicarFiltros();
    this.isLoading = false;
  }

  /**
   * Aplica todos los filtros activos
   */
  private aplicarFiltros(): void {
    let resultado = [...this.materiales];

    // Filtro por tipo
    if (this.filtroTipoActivo === 'libros') {
      resultado = resultado.filter(m => m.tipo === 'libro');
    } else if (this.filtroTipoActivo === 'equipos') {
      resultado = resultado.filter(m => m.tipo === 'equipo');
    }

    // Filtro por categorías
    if (this.categoriasSeleccionadas.length > 0) {
      resultado = resultado.filter(m => {
        return this.categoriasSeleccionadas.some(catNombre => catNombre === m.categoria);
      });
    }

    // Filtro por búsqueda
    if (this.textoBusqueda.trim()) {
      const texto = this.textoBusqueda.toLowerCase();
      resultado = resultado.filter(m =>
        m.titulo.toLowerCase().includes(texto) ||
        m.categoria.toLowerCase().includes(texto) ||
        m.marcaModelo.toLowerCase().includes(texto) ||
        m.descripcion.toLowerCase().includes(texto)
      );
    }

    this.materialesFiltrados = resultado;
    console.log('🔍 Materiales filtrados:', this.materialesFiltrados.length);
  }

  /**
   * Obtiene la URL completa de la imagen
   */
  getImageUrl(url?: string): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('data:')) return url; // Para previsualizaciones
    return `${environment.apiUrl}${url}`;
  }
}