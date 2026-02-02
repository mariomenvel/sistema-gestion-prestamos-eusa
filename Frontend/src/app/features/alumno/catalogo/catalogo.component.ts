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
  genero_id?: number;
  categoria_id?: number;
  nombre_id?: number;

  // Detalle de Libros
  autor?: string;
  editorial?: string;
  libro_numero?: string;

  // Detalle de Equipos
  marca?: string;
  modelo?: string;
  nombre_equipo?: string;

  // Gestión de Carrito
  cantidad?: number;

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
  generos: any[] = [];
  categoriasEquipos: any[] = [];
  nombresEquipo: any[] = [];
  materiales: MaterialVista[] = [];
  materialesFiltrados: MaterialVista[] = [];

  filtroTipoActivo: 'todos' | 'libros' | 'equipos' = 'todos';
  generosSeleccionados: number[] = [];
  categoriasEquiposSeleccionadas: number[] = [];
  nombresSeleccionados: number[] = [];
  textoBusqueda: string = '';

  // ===== CARRITO DE PRÉSTAMOS =====
  carrito: MaterialVista[] = [];
  mostrarNotificacionCarrito: boolean = false;
  ultimoMaterialAgregado: MaterialVista | null = null;

  // ===== ESTADO =====

  isLoading: boolean = false;
  errorMessage: string = '';

  // ===== MODALES ===== 
  mostrarModalDetalle: boolean = false;
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
    // Si el tipo ya está activo y pulsamos de nuevo (toggle), volvemos a 'todos'
    if (this.filtroTipoActivo === tipo && tipo !== 'todos') {
      this.filtroTipoActivo = 'todos';
    } else {
      this.filtroTipoActivo = tipo;
    }

    // Limpiamos filtros específicos según el nuevo estado
    if (this.filtroTipoActivo === 'libros') {
      this.categoriasEquiposSeleccionadas = [];
      this.nombresSeleccionados = [];
    } else if (this.filtroTipoActivo === 'equipos') {
      this.generosSeleccionados = [];
    } else {
      // Si es 'todos', limpiamos todo para mostrar el catálogo general
      this.generosSeleccionados = [];
      this.categoriasEquiposSeleccionadas = [];
      this.nombresSeleccionados = [];
    }

    this.aplicarFiltros();
  }

  /**
   * Toggle de género en el panel de filtros
   */
  toggleGenero(generoId: number): void {
    const index = this.generosSeleccionados.indexOf(generoId);
    if (index === -1) {
      this.generosSeleccionados.push(generoId);
    } else {
      this.generosSeleccionados.splice(index, 1);
    }
    this.aplicarFiltros();
  }

  /**
   * Verifica si un género está seleccionado
   */
  isGeneroSeleccionado(generoId: number): boolean {
    return this.generosSeleccionados.includes(generoId);
  }

  /**
   * Toggle de categoría de equipo
   */
  toggleCategoriaEquipo(categoriaId: number): void {
    const index = this.categoriasEquiposSeleccionadas.indexOf(categoriaId);
    if (index === -1) {
      this.categoriasEquiposSeleccionadas.push(categoriaId);
    } else {
      this.categoriasEquiposSeleccionadas.splice(index, 1);
    }
    this.aplicarFiltros();
  }

  /**
   * Verifica si una categoría de equipo está seleccionada
   */
  isCategoriaEquipoSeleccionada(categoriaId: number): boolean {
    return this.categoriasEquiposSeleccionadas.includes(categoriaId);
  }

  /**
   * Toggle de nombre de equipo
   */
  toggleNombreEquipo(nombreId: number): void {
    const index = this.nombresSeleccionados.indexOf(nombreId);
    if (index === -1) {
      this.nombresSeleccionados.push(nombreId);
    } else {
      this.nombresSeleccionados.splice(index, 1);
    }
    this.aplicarFiltros();
  }

  /**
   * Verifica si un nombre de equipo está seleccionado
   */
  isNombreSeleccionado(nombreId: number): boolean {
    return this.nombresSeleccionados.includes(nombreId);
  }

  /**
   * Buscar por texto
   */
  buscar(): void {
    this.aplicarFiltros();
  }

  /**
   * Abre el modal de detalle
   */
  verDetalle(material: MaterialVista): void {
    this.materialSeleccionado = material;
    this.mostrarModalDetalle = true;
  }

  /**
   * Cierra el modal de detalle
   */
  cerrarModalDetalle(): void {
    this.mostrarModalDetalle = false;
  }

  /**
   * Cierra el modal de solicitud (checkout)
   */
  cerrarModalSolicitud(): void {
    this.mostrarModalSolicitud = false;
  }

  /**
   * Agrega un material al carrito
   */
  agregarAlCarrito(material: MaterialVista): void {
    const itemExistente = this.carrito.find(m => m.id === material.id && m.tipo === material.tipo);

    if (itemExistente) {
      // Si ya está, incrementamos cantidad si es posible (ej: libros)
      // Aunque por ahora el sistema de préstamos suele ser de items únicos, 
      // permitimos incrementar para que el usuario gestione sus cantidades.
      itemExistente.cantidad = (itemExistente.cantidad || 1) + 1;
    } else {
      // Si no está, lo añadimos con cantidad 1
      this.carrito.push({
        ...material,
        cantidad: 1
      });
    }

    this.ultimoMaterialAgregado = material;

    // Mostrar notificación temporal
    this.mostrarNotificacionCarrito = true;
    setTimeout(() => {
      this.mostrarNotificacionCarrito = false;
    }, 3000);
  }

  /**
   * Actualiza la cantidad de un item
   */
  actualizarCantidad(materialId: number, tipo: 'libro' | 'equipo', delta: number): void {
    const item = this.carrito.find(m => m.id === materialId && m.tipo === tipo);
    if (item) {
      const nuevaCantidad = (item.cantidad || 1) + delta;
      if (nuevaCantidad > 0) {
        item.cantidad = nuevaCantidad;
      } else {
        this.quitarDelCarrito(materialId, tipo);
      }
    }
  }

  /**
   * Vacía el carrito por completo
   */
  vaciarCarrito(): void {
    this.carrito = [];
    this.cerrarModalSolicitud();
  }

  /**
   * Quita un material del carrito
   */
  quitarDelCarrito(materialId: number, tipo: 'libro' | 'equipo'): void {
    this.carrito = this.carrito.filter(m => !(m.id === materialId && m.tipo === tipo));
    if (this.carrito.length === 0) {
      this.cerrarModalSolicitud();
    }
  }

  /**
   * Verifica si un material ya está en el carrito
   */
  estaEnCarrito(material: MaterialVista | null): boolean {
    if (!material) return false;
    return this.carrito.some(m => m.id === material.id && m.tipo === material.tipo);
  }

  /**
   * Abre el modal del carrito / formalización
   */
  abrirCarrito(): void {
    if (this.carrito.length === 0) return;
    this.materialSeleccionado = this.carrito[0]; // El modal pide uno inicial
    this.mostrarModalSolicitud = true;
  }

  /**
   * Limpia el carrito después de una solicitud exitosa
   */
  onSolicitudCreada(): void {
    this.carrito = [];
    this.cerrarModalSolicitud();
    console.log('✅ Carrito vaciado tras solicitud exitosa');
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
        this.libros = libros;
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
        this.equipos = equipos;
        this.procesarMateriales();
      },
      error: (err) => {
        console.error('❌ Error al cargar equipos:', err);
        this.errorMessage = 'Error al cargar el catálogo';
        this.isLoading = false;
      }
    });

    // Cargar géneros para el filtro de libros
    this.materialesService.getGeneros().subscribe({
      next: (generos) => {
        this.generos = generos;
      },
      error: (err) => console.error('❌ Error al cargar géneros:', err)
    });

    // Cargar categorías para equipos
    this.materialesService.getCategorias().subscribe({
      next: (categorias) => {
        this.categoriasEquipos = categorias;
      },
      error: (err) => console.error('❌ Error al cargar categorías de equipo:', err)
    });

    // Cargar nombres para equipos
    this.materialesService.getNombres().subscribe({
      next: (nombres) => {
        this.nombresEquipo = nombres;
      },
      error: (err) => console.error('❌ Error al cargar nombres de equipo:', err)
    });
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
        genero_id: libro.genero_id,
        autor: libro.autor,
        editorial: libro.editorial,
        libro_numero: libro.libro_numero,
        marcaModelo: `${libro.autor || 'Autor desconocido'} - ${libro.editorial || 'Editorial desconocida'}`,
        descripcion: `Libro con número de registro: ${libro.libro_numero}. Disponible para préstamo.`,
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
        categoria_id: equipo.categoria_id,
        nombre_id: equipo.nombre_id,
        nombre_equipo: (equipo as any).Nombre?.nombre || (equipo as any).nombre?.nombre || 'Equipo',
        marca: equipo.marca,
        modelo: equipo.modelo,
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

    // Filtro por géneros (solo aplica a libros)
    if (this.generosSeleccionados.length > 0) {
      resultado = resultado.filter(m => {
        if (m.tipo !== 'libro') return true; // No filtrar equipos por género
        return m.genero_id && this.generosSeleccionados.includes(m.genero_id);
      });
    }

    // Filtro por categorías de equipos
    if (this.categoriasEquiposSeleccionadas.length > 0) {
      resultado = resultado.filter(m => {
        if (m.tipo !== 'equipo') return true; // No filtrar libros por categoría de equipo
        return m.categoria_id && this.categoriasEquiposSeleccionadas.includes(m.categoria_id);
      });
    }

    // Filtro por nombres de equipos
    if (this.nombresSeleccionados.length > 0) {
      resultado = resultado.filter(m => {
        if (m.tipo !== 'equipo') return true; // No filtrar libros por nombre de equipo
        return m.nombre_id && this.nombresSeleccionados.includes(m.nombre_id);
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