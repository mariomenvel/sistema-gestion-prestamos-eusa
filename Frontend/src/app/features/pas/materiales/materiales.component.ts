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
 * - Añadir nuevos materiales o modificarlos
 * - Eliminar materiales
 */
@Component({
  selector: 'app-materiales',
  templateUrl: './materiales.component.html',
  styleUrls: ['./materiales.component.scss']
})
export class MaterialesComponent implements OnInit {

  // ===== EDICIÓN =====

  equipoEnEdicion: Equipo | null = null;
  archivoImagenTemporal: File | null = null;
  libroEnEdicion: Libro | null = null;

  // ===== CONTROL DE DESPLEGABLES =====

  filasExpandidas: Set<number> = new Set();

  // Estados posibles para los selects
  estadosDisponibles = [
    { valor: 'disponible', texto: 'Disponible' },
    { valor: 'no_disponible', texto: 'No disponible' },
    { valor: 'bloqueado', texto: 'Bloqueado' },
    { valor: 'en_reparacion', texto: 'En reparación' }
  ];

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

  // ===== MODAL AÑADIR MATERIAL =====

  modalAnadirAbierto: boolean = false;

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
    this.modalAnadirAbierto = true;
  }

  /**
   * Cierra modal de añadir material
   */
  cerrarModalAnadir(): void {
    this.modalAnadirAbierto = false;
  }

  /**
   * Callback cuando se crea un material
   */
  onMaterialCreado(): void {
    this.cargarMateriales();
    this.cerrarModalAnadir();
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
    if (material.categoria) {
      return material.categoria.nombre;
    }
    return 'Sin categoría';
  }

  /**
   * Obtiene el número de unidades disponibles de un equipo
   */
  getUnidadesDisponiblesCount(equipo: Equipo): number {
    if (!equipo.unidades) return 0;
    return equipo.unidades.filter(u => u.esta_prestado === false && u.estado_fisico === 'funciona').length;
  }

  /**
   * Obtiene el número de ejemplares disponibles de un libro
   */
  getEjemplaresDisponiblesCount(libro: Libro): number {
    if (!libro.ejemplares) return 0;
    return libro.ejemplares.filter(e => e.estado === 'disponible').length;
  }

  /**
   * Verifica si hay ejemplares/unidades disponibles
   */
  tieneDisponibles(material: Libro | Equipo): boolean {
    if ('ejemplares' in material && material.ejemplares) {
      return this.getEjemplaresDisponiblesCount(material as Libro) > 0;
    }
    if ('unidades' in material && material.unidades) {
      return this.getUnidadesDisponiblesCount(material as Equipo) > 0;
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

    return codigo;
  }

  /**
   * Alterna el estado expandido/colapsado de una fila
   */
  toggleFila(id: number): void {
    if (this.filasExpandidas.has(id)) {
      this.filasExpandidas.delete(id);
    } else {
      this.filasExpandidas.add(id);
    }
  }

  /**
   * Verifica si una fila está expandida
   */
  isFilaExpandida(id: number): boolean {
    return this.filasExpandidas.has(id);
  }

  /**
   * Actualiza el estado de un ejemplar
   */
  actualizarEstadoEjemplar(ejemplar: any, nuevoEstado: string): void {
    this.materialesService.actualizarEjemplar(ejemplar.id, { estado: nuevoEstado as any }).subscribe({
      next: (ejemplarActualizado) => {
        console.log('✅ Ejemplar actualizado:', ejemplarActualizado);
        ejemplar.estado = nuevoEstado;
        alert('Estado actualizado correctamente');
      },
      error: (err) => {
        console.error('❌ Error al actualizar ejemplar:', err);
        alert('Error al actualizar el estado');
      }
    });
  }

  /**
   * Actualiza el estado de una unidad
   */
  actualizarEstadoUnidad(unidad: any, nuevoEstado: string): void {
    // Si el estado es 'disponible', asumimos que no está prestado y funciona
    const payload: any = {
      esta_prestado: nuevoEstado === 'disponible' ? false : (unidad as any).esta_prestado,
      estado_fisico: nuevoEstado === 'en_reparacion' ? 'en_reparacion' : 'funciona'
    };

    this.materialesService.actualizarUnidad(unidad.id, payload).subscribe({
      next: (unidadActualizada) => {
        console.log('✅ Unidad actualizada:', unidadActualizada);
        unidad.estado_fisico = payload.estado_fisico;
        unidad.esta_prestado = payload.esta_prestado;
        alert('Estado actualizado correctamente');
      },
      error: (err) => {
        console.error('❌ Error al actualizar unidad:', err);
        alert('Error al actualizar el estado');
      }
    });
  }

  /**
   * Obtiene el texto del badge según el estado
   */
  getTextoEstado(estado: string): string {
    const estadoEncontrado = this.estadosDisponibles.find(e => e.valor === estado);
    return estadoEncontrado ? estadoEncontrado.texto : estado;
  }

  // ===== HELPERS DE STATUS (NUEVOS) =====

  getPrestadoTexto(estaPrestado: boolean): string {
    return estaPrestado ? 'Prestado' : 'No prestado';
  }

  getPrestadoBadgeClass(estaPrestado: boolean): string {
    return estaPrestado ? 'badge-prestado' : 'badge-en-almacen';
  }

  getFisicoTexto(estado: string): string {
    switch (estado) {
      case 'funciona': return 'Funcional';
      case 'no_funciona': return 'No funciona';
      case 'en_reparacion': return 'En reparación';
      case 'obsoleto': return 'Obsoleto';
      case 'falla': return 'Con fallos';
      case 'perdido_sustraido': return 'Perdido';
      default: return estado || 'Desconocido';
    }
  }

  getFisicoBadgeClass(estado: string): string {
    switch (estado) {
      case 'funciona': return 'badge-funcional';
      case 'en_reparacion': return 'badge-reparacion';
      case 'no_funciona':
      case 'falla':
      case 'perdido_sustraido': return 'badge-no-disponible';
      default: return 'badge-bloqueado';
    }
  }

  /**
   * Obtiene la clase CSS del badge según el estado
   */
  getClaseBadge(estado: string): string {
    switch (estado) {
      case 'disponible': return 'badge-disponible';
      case 'no_disponible': return 'badge-no-disponible';
      case 'bloqueado': return 'badge-bloqueado';
      case 'en_reparacion': return 'badge-reparacion';
      default: return '';
    }
  }

  /**
   * Activar modo edición de equipo
   */
  editarEquipo(equipo: Equipo): void {
    // Si ya hay un equipo en edición, preguntar si desea guardar
    if (this.equipoEnEdicion && this.equipoEnEdicion.id !== equipo.id) {
      if (!confirm('Tienes cambios sin guardar. ¿Deseas continuar?')) {
        return;
      }
    }

    // Activar edición y expandir fila
    this.equipoEnEdicion = { ...equipo }; // Copia del equipo
    this.filasExpandidas.add(equipo.id);
    this.archivoImagenTemporal = null;
  }

  /**
   * Verifica si un equipo está en modo edición
   */
  isEquipoEnEdicion(equipo: Equipo): boolean {
    return this.equipoEnEdicion?.id === equipo.id;
  }

  /**
   * Cancela la edición de un equipo
   */
  cancelarEdicion(): void {
    this.equipoEnEdicion = null;
    this.archivoImagenTemporal = null;
  }


  guardarEquipo(): void {
    if (!this.equipoEnEdicion) return;

    const datosActualizados: Partial<Equipo> = {
      marca: this.equipoEnEdicion.marca,
      modelo: this.equipoEnEdicion.modelo,
      descripcion: this.equipoEnEdicion.descripcion,
      categoria_codigo: this.equipoEnEdicion.categoria_codigo
    };

    console.log('💾 Guardando equipo:', datosActualizados);

    this.materialesService.actualizarEquipo(this.equipoEnEdicion.id, datosActualizados).subscribe({
      next: (equipoActualizado: any) => {
        console.log('✅ Equipo actualizado:', equipoActualizado);

        // Si hay una imagen nueva, subirla
        if (this.archivoImagenTemporal) {
          this.subirImagenEquipo(equipoActualizado.id, this.archivoImagenTemporal); // ⭐ PASAR EL ARCHIVO
        } else {
          // Actualizar en la lista local
          this.actualizarEquipoEnLista(equipoActualizado);
          alert('Equipo actualizado correctamente');
          this.cancelarEdicion();
        }
      },
      error: (err: any) => {
        console.error('❌ Error al actualizar equipo:', err);
        alert('Error al actualizar el equipo');
      }
    });
  }

  /**
  Subir imagen del equipo
   */
  private subirImagenEquipo(equipoId: number, archivo: File): void {
    if (!archivo) return;

    this.materialesService.subirImagenEquipo(equipoId, archivo).subscribe({
      next: (equipoActualizado: any) => {
        console.log('✅ Imagen subida:', equipoActualizado);
        this.actualizarEquipoEnLista(equipoActualizado);
        alert('Equipo e imagen actualizados correctamente');
        this.cancelarEdicion();
      },
      error: (err: any) => {
        console.error('❌ Error al subir imagen:', err);
        alert('Equipo actualizado, pero hubo un error al subir la imagen');
        this.cancelarEdicion();
      }
    });
  }

  /**
   * Actualizar equipo en la lista local
   */
  private actualizarEquipoEnLista(equipoActualizado: Equipo): void {
    const index = this.equipos.findIndex(e => e.id === equipoActualizado.id);
    if (index !== -1) {
      this.equipos[index] = equipoActualizado;
      this.aplicarFiltros();
    }
  }

  /**
   * Manejar selección de archivo de imagen
   */
  onArchivoImagenSeleccionado(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const archivo = input.files[0];

      // Validar que sea una imagen
      if (!archivo.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5MB');
        return;
      }

      this.archivoImagenTemporal = archivo;

      // Previsualizar imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.equipoEnEdicion) {
          this.equipoEnEdicion.foto_url = e.target.result;
        }
      };
      reader.readAsDataURL(archivo);
    }
  }

  /**
   * Guardar cambios de una unidad
   */
  guardarCambiosUnidad(unidad: any): void {
    console.log('💾 Guardando cambios de unidad:', unidad);

    this.materialesService.actualizarUnidad(unidad.id, {
      numero_serie: unidad.numero_serie,
      codigo_barra: unidad.codigo_barra,
      estado_fisico: unidad.estado_fisico as any
    }).subscribe({
      next: (unidadActualizada) => {
        console.log('✅ Unidad guardada:', unidadActualizada);
        // No mostramos alert para no ser intrusivos
      },
      error: (err) => {
        console.error('❌ Error al guardar unidad:', err);
        alert('Error al guardar los cambios');
      }
    });
  }

  /**
   * Eliminar una unidad específica
   */
  eliminarUnidad(unidad: any): void {
    if (!confirm(`¿Eliminar la unidad con código de barras "${unidad.codigo_barra}"?`)) {
      return;
    }

    this.materialesService.eliminarUnidad(unidad.id).subscribe({
      next: () => {
        console.log('✅ Unidad eliminada');
        alert('Unidad eliminada correctamente');
        this.cargarMateriales();
      },
      error: (err) => {
        console.error('❌ Error al eliminar unidad:', err);
        alert('Error al eliminar la unidad');
      }
    });
  }

  // ===== MÉTODOS DE LIBROS =====

  /**
   * Activar modo edición de libro
   */
  editarLibro(libro: Libro): void {
    // Si ya hay un libro en edición, preguntar si desea guardar
    if (this.libroEnEdicion && this.libroEnEdicion.id !== libro.id) {
      if (!confirm('Tienes cambios sin guardar. ¿Deseas continuar?')) {
        return;
      }
    }

    // Activar edición y expandir fila
    this.libroEnEdicion = { ...libro }; // Copia del libro
    this.filasExpandidas.add(libro.id);
  }

  /**
   * Verifica si un libro está en modo edición
   */
  isLibroEnEdicion(libro: Libro): boolean {
    return this.libroEnEdicion?.id === libro.id;
  }

  /**
   * Cancela la edición de un libro
   */
  cancelarEdicionLibro(): void {
    this.libroEnEdicion = null;
  }

  /**
   * Guardar cambios del libro
   */
  guardarLibro(): void {
    if (!this.libroEnEdicion) return;

    const datosActualizados: Partial<Libro> = {
      titulo: this.libroEnEdicion.titulo,
      autor: this.libroEnEdicion.autor,
      editorial: this.libroEnEdicion.editorial,
      categoria_codigo: this.libroEnEdicion.categoria_codigo
    };

    console.log('💾 Guardando libro:', datosActualizados);

    this.materialesService.actualizarLibro(this.libroEnEdicion.id, datosActualizados).subscribe({
      next: (libroActualizado: any) => {
        console.log('✅ Libro actualizado:', libroActualizado);
        this.actualizarLibroEnLista(libroActualizado);
        alert('Libro actualizado correctamente');
        this.cancelarEdicionLibro();
      },
      error: (err: any) => {
        console.error('❌ Error al actualizar libro:', err);
        alert('Error al actualizar el libro');
      }
    });
  }

  /**
   * Actualizar libro en la lista local
   */
  private actualizarLibroEnLista(libroActualizado: Libro): void {
    const index = this.libros.findIndex(l => l.id === libroActualizado.id);
    if (index !== -1) {
      this.libros[index] = libroActualizado;
      this.aplicarFiltros();
    }
  }

  /**
   * Guardar cambios de un ejemplar
   */
  guardarCambiosEjemplar(ejemplar: any): void {
    console.log('💾 Guardando cambios de ejemplar:', ejemplar);

    this.materialesService.actualizarEjemplar(ejemplar.id, {
      codigo_barra: ejemplar.codigo_barra,
      estanteria: ejemplar.estanteria,
      balda: ejemplar.balda,
      estado: ejemplar.estado
    }).subscribe({
      next: (ejemplarActualizado) => {
        console.log('✅ Ejemplar guardado:', ejemplarActualizado);
        // No mostramos alert para no ser intrusivos
      },
      error: (err) => {
        console.error('❌ Error al guardar ejemplar:', err);
        alert('Error al guardar los cambios');
      }
    });
  }

  /**
   * Eliminar un ejemplar específico
   */
  eliminarEjemplar(ejemplar: any): void {
    if (!confirm(`¿Eliminar el ejemplar con código de barras "${ejemplar.codigo_barra}"?`)) {
      return;
    }

    this.materialesService.eliminarEjemplar(ejemplar.id).subscribe({
      next: () => {
        console.log('✅ Ejemplar eliminado');
        alert('Ejemplar eliminado correctamente');
        this.cargarMateriales();
      },
      error: (err) => {
        console.error('❌ Error al eliminar ejemplar:', err);
        alert('Error al eliminar el ejemplar');
      }
    });
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