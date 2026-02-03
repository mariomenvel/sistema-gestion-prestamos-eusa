import { Component, OnInit } from '@angular/core';
import { MaterialesService } from '../../../core/services/materiales.service';
import { Libro } from '../../../core/models/libro.model';
import { Equipo } from '../../../core/models/equipo.model';
import { environment } from '../../../../environments/environment';

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

  tipoSeleccionado: 'libros' | 'equipos' = 'equipos';

  // ===== DATOS =====

  libros: Libro[] = [];
  equipos: any[] = []; // Cambiamos a any temporalmente para evitar errores de tipado con las nuevas relaciones

  librosFiltrados: Libro[] = [];
  materialesOriginales: (Libro | Equipo)[] = []; // New: Combined list for filtering

  // librosFiltrados: Libro[] = []; // Removed, replaced by materialesFiltrados
  // equiposFiltrados: Equipo[] = []; // Removed, replaced by materialesFiltrados

  // ===== FILTROS =====

  busqueda: string = ''; // Renamed from textoBusqueda
  filtroCategoria: string = '';
  filtroNombre: string = ''; // Nuevo filtro por nombre genérico

  // Filtros de rango (Nuevos)
  minDisponibles: number | null = null;
  maxDisponibles: number | null = null;
  minTotales: number | null = null;
  maxTotales: number | null = null;

  // Ordenación (Nuevo)
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  materialesFiltrados: (Libro | Equipo)[] = []; // New: Combined filtered list

  // ===== ESTADO =====

  isLoading: boolean = false;
  errorMessage: string = '';

  // ===== CATEGORÍAS =====
  categorias: any[] = []; // Para equipos
  generos: any[] = [];    // Para libros (En UI se ven como categorías)

  // ===== MODAL AÑADIR/EDITAR MATERIAL =====

  modalAnadirAbierto: boolean = false;
  modalMode: 'add' | 'edit' = 'add';
  materialAEditar: any = null;

  // ===== MODAL DE CONFIRMACIÓN/NOTIFICACIÓN (NUEVO) =====
  modalData = {
    mostrar: false,
    tipo: 'info' as 'exito' | 'error' | 'info' | 'confirmacion',
    titulo: '',
    mensaje: '',
    esConfirmacion: false,
    textoBtnPrincipal: 'Aceptar',
    accion: () => { }
  };

  // ===== CARGANDO UNIDADES/EJEMPLARES =====
  isAniadiendoUnidad: boolean = false;

  // ===== CONSTRUCTOR =====

  constructor(
    private materialesService: MaterialesService
  ) { }

  // ===== CICLO DE VIDA =====

  ngOnInit(): void {
    this.cargarMateriales();
    this.cargarCategorias();
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
   * Busca materiales por texto
   */
  buscar(): void {
    console.log('🔍 Buscando:', this.busqueda); // Changed from textoBusqueda
    this.aplicarFiltros();
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.busqueda = ''; // Changed from textoBusqueda
    this.filtroCategoria = '';
    this.filtroNombre = '';
    this.minDisponibles = null;
    this.maxDisponibles = null;
    this.minTotales = null;
    this.maxTotales = null;
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.aplicarFiltros();
  }

  /**
   * Cambia la columna de ordenación
   */
  toggleSort(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.aplicarFiltros();
  }

  /**
   * Abre modal para añadir material
   */
  abrirModalAnadirMaterial(): void {
    this.modalMode = 'add';
    this.materialAEditar = null;
    this.modalAnadirAbierto = true;
  }

  /**
   * Cierra modal de añadir material
   */
  cerrarModalAnadir(): void {
    this.modalAnadirAbierto = false;
  }

  /**
   * Muestra el modal de confirmación o notificación
   */
  mostrarModal(config: Partial<typeof this.modalData>): void {
    this.modalData = {
      mostrar: true,
      tipo: config.tipo || 'info',
      titulo: config.titulo || '',
      mensaje: config.mensaje || '',
      esConfirmacion: config.tipo === 'confirmacion',
      textoBtnPrincipal: config.textoBtnPrincipal || (config.tipo === 'confirmacion' ? 'Confirmar' : 'Aceptar'),
      accion: config.accion || (() => { })
    };
  }

  /**
   * Cierra el modal de confirmación
   */
  cerrarModalConfirmacion(): void {
    this.modalData.mostrar = false;
  }

  /**
   * Cargar categorías y géneros
   */
  cargarCategorias(): void {
    // Cargar categorías de equipos
    this.materialesService.getCategorias().subscribe({
      next: (categorias) => {
        console.log('📦 Categorías (Equipos):', categorias);
        this.categorias = categorias;
      },
      error: (err) => console.error('Error al cargar categorías:', err)
    });

    // Cargar géneros de libros
    this.materialesService.getGeneros().subscribe({
      next: (generos) => {
        console.log('📚 Géneros (Libros):', generos);
        this.generos = generos;
      },
      error: (err) => console.error('Error al cargar géneros:', err)
    });
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

    this.mostrarModal({
      tipo: 'confirmacion',
      titulo: tipo === 'libro' ? 'Eliminar Libro' : 'Eliminar Equipo',
      mensaje: `¿Estás seguro de que deseas eliminar permanentemente "${nombre}"? Esta acción no se puede deshacer.`,
      accion: () => {
        if (tipo === 'libro') {
          this.materialesService.eliminarLibro(material.id).subscribe({
            next: () => {
              this.mostrarModal({ tipo: 'exito', titulo: 'Eliminado', mensaje: 'Libro eliminado correctamente' });
              this.cargarMateriales();
            },
            error: (err: any) => {
              console.error('❌ Error al eliminar libro:', err);
              this.mostrarModal({ tipo: 'error', titulo: 'Error', mensaje: 'No se pudo eliminar el libro' });
            }
          });
        } else {
          this.materialesService.eliminarEquipo(material.id).subscribe({
            next: () => {
              this.mostrarModal({ tipo: 'exito', titulo: 'Eliminado', mensaje: 'Equipo eliminado correctamente' });
              this.cargarMateriales();
            },
            error: (err: any) => {
              console.error('❌ Error al eliminar equipo:', err);
              this.mostrarModal({ tipo: 'error', titulo: 'Error', mensaje: 'No se pudo eliminar el equipo' });
            }
          });
        }
      }
    });
  }

  /**
   * Obtiene el nombre legible de una categoría
   */
  getNombreCategoria(material: Libro | Equipo): string {
    if ('ejemplares' in material) {
      // Libro
      return (material as Libro).genero?.nombre || 'Sin categoría';
    } else {
      // Equipo
      return (material as Equipo).categoria?.nombre || 'Sin categoría';
    }
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
   * Obtiene todos los nombres genéricos únicos de los materiales cargados
   */
  getNombresDisponibles(): any[] {
    const nombresMap = new Map<number, any>();
    this.equipos.forEach(equipo => {
      if (equipo.Nombre) {
        nombresMap.set(Number(equipo.nombre_id), equipo.Nombre);
      }
    });
    return Array.from(nombresMap.values());
  }

  setTipo(tipo: 'libros' | 'equipos'): void {
    this.tipoSeleccionado = tipo;
    this.aplicarFiltros();
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
   * Activar modo edición de equipo (ahora usa modal)
   */
  editarEquipo(equipo: Equipo): void {
    this.modalMode = 'edit';
    this.materialAEditar = equipo;
    this.modalAnadirAbierto = true;
  }

  /**
   * Activar modo edición de libro (ahora usa modal)
   */
  editarLibro(libro: Libro): void {
    this.modalMode = 'edit';
    this.materialAEditar = libro;
    this.modalAnadirAbierto = true;
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
      categoria_id: this.equipoEnEdicion.categoria_id,
      nombre_id: this.equipoEnEdicion.nombre_id
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
          this.mostrarModal({ tipo: 'exito', titulo: 'Guardado', mensaje: 'Equipo actualizado correctamente' });
          this.cancelarEdicion();
        }
      },
      error: (err: any) => {
        console.error('❌ Error al actualizar equipo:', err);
        this.mostrarModal({ tipo: 'error', titulo: 'Error', mensaje: 'No se pudo actualizar el equipo' });
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
        this.mostrarModal({ tipo: 'exito', titulo: 'Guardado', mensaje: 'Equipo e imagen actualizados correctamente' });
        this.cancelarEdicion();
      },
      error: (err: any) => {
        console.error('❌ Error al subir imagen:', err);
        this.mostrarModal({ tipo: 'error', titulo: 'Error', mensaje: 'Equipo actualizado, pero hubo un error al subir la imagen' });
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
      this.materialesOriginales = [...this.libros, ...this.equipos]; // Re-combine
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
        this.mostrarModal({ tipo: 'error', titulo: 'Archivo no válido', mensaje: 'Por favor selecciona un archivo de imagen válido' });
        return;
      }

      // Validar tamaño (máximo 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        this.mostrarModal({ tipo: 'error', titulo: 'Imagen muy grande', mensaje: 'La imagen no puede superar los 5MB' });
        return;
      }

      this.archivoImagenTemporal = archivo;

      // Previsualizar imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.equipoEnEdicion) {
          this.equipoEnEdicion.foto_url = e.target.result;
        } else if (this.libroEnEdicion) {
          this.libroEnEdicion.foto_url = e.target.result;
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
      },
      error: (err) => {
        console.error('❌ Error al guardar unidad:', err);
        this.mostrarModal({ tipo: 'error', titulo: 'Error', mensaje: 'No se pudo guardar los cambios en la unidad' });
      }
    });
  }


  /**
   * Eliminar una unidad específica
   */
  eliminarUnidad(unidad: any): void {
    this.mostrarModal({
      tipo: 'confirmacion',
      titulo: 'Eliminar Unidad',
      mensaje: `¿Estás seguro de que deseas eliminar permanentemente la unidad con código de barras "${unidad.codigo_barra}"?`,
      accion: () => {
        this.materialesService.eliminarUnidad(unidad.id).subscribe({
          next: () => {
            console.log('✅ Unidad eliminada');
            this.cargarMateriales(); // Recargar para sincronizar conteos
          },
          error: (err) => {
            console.error('❌ Error al eliminar unidad:', err);
            this.mostrarModal({ tipo: 'error', titulo: 'Error', mensaje: 'No se pudo eliminar la unidad' });
          }
        });
      }
    });
  }

  /**
   * Añade una nueva unidad a un equipo
   */
  aniadirUnidad(equipo: Equipo): void {
    this.isAniadiendoUnidad = true;
    this.materialesService.aniadirUnidad(equipo.id).subscribe({
      next: (nuevaUnidad) => {
        console.log('✅ Unidad añadida:', nuevaUnidad);
        if (!equipo.unidades) equipo.unidades = [];
        equipo.unidades.push(nuevaUnidad as any);
        this.isAniadiendoUnidad = false;
        // No alert to be less intrusive, or maybe just a small toast if available
      },
      error: (err) => {
        console.error('❌ Error al añadir unidad:', err);
        this.mostrarModal({ tipo: 'error', titulo: 'Error', mensaje: 'No se pudo añadir la unidad' });
        this.isAniadiendoUnidad = false;
      }
    });
  }

  // ===== MÉTODOS DE LIBROS =====

  // MÉTODOS DE EDICIÓN DE LIBRO ELIMINADOS (Ahora se usa editarLibro con modal)

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

    const datosActualizados: any = {
      titulo: this.libroEnEdicion.titulo,
      autor: this.libroEnEdicion.autor,
      editorial: this.libroEnEdicion.editorial,
      libro_numero: this.libroEnEdicion.libro_numero,
      genero_id: this.libroEnEdicion.genero_id,
      isbn: this.libroEnEdicion.isbn
    };

    console.log('💾 Guardando libro:', datosActualizados);

    this.materialesService.actualizarLibro(this.libroEnEdicion.id, datosActualizados).subscribe({
      next: (libroActualizado: any) => {
        console.log('✅ Libro actualizado:', libroActualizado);

        // Si hay una imagen nueva, subirla
        if (this.archivoImagenTemporal) {
          this.subirImagenLibro(libroActualizado.id, this.archivoImagenTemporal);
        } else {
          this.actualizarLibroEnLista(libroActualizado);
          this.mostrarModal({ tipo: 'exito', titulo: 'Guardado', mensaje: 'Libro actualizado correctamente' });
          this.cancelarEdicionLibro();
        }
      },
      error: (err: any) => {
        console.error('❌ Error al actualizar libro:', err);
        this.mostrarModal({ tipo: 'error', titulo: 'Error', mensaje: 'No se pudo actualizar el libro' });
      }
    });
  }

  /**
   * Subir imagen del libro
   */
  private subirImagenLibro(libroId: number, archivo: File): void {
    if (!archivo) return;

    this.materialesService.subirImagenLibro(libroId, archivo).subscribe({
      next: (libroActualizado: any) => {
        console.log('✅ Portada subida:', libroActualizado);
        this.actualizarLibroEnLista(libroActualizado);
        this.mostrarModal({ tipo: 'exito', titulo: 'Guardado', mensaje: 'Libro y portada actualizados correctamente' });
        this.cancelarEdicionLibro();
      },
      error: (err: any) => {
        console.error('❌ Error al subir portada:', err);
        this.mostrarModal({ tipo: 'error', titulo: 'Error', mensaje: 'Libro actualizado, pero hubo un error al subir la portada' });
        this.cancelarEdicionLibro();
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
      this.materialesOriginales = [...this.libros, ...this.equipos]; // Re-combine
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
      c122003: ejemplar.c122003,
      estanteria: ejemplar.estanteria,
      balda: ejemplar.balda,
      estado: ejemplar.estado as any
    }).subscribe({
      next: (ejemplarActualizado) => {
        console.log('✅ Ejemplar guardado:', ejemplarActualizado);
      },
      error: (err) => {
        console.error('❌ Error al guardar ejemplar:', err);
        this.mostrarModal({ tipo: 'error', titulo: 'Error', mensaje: 'No se pudo guardar los cambios en el ejemplar' });
      }
    });
  }

  /**
   * Eliminar un ejemplar específico
   */
  eliminarEjemplar(ejemplar: any): void {
    this.mostrarModal({
      tipo: 'confirmacion',
      titulo: 'Eliminar Ejemplar',
      mensaje: `¿Estás seguro de que deseas eliminar permanentemente el ejemplar con código de barras "${ejemplar.codigo_barra}"?`,
      accion: () => {
        this.materialesService.eliminarEjemplar(ejemplar.id).subscribe({
          next: () => {
            console.log('✅ Ejemplar eliminado');
            this.cargarMateriales(); // Recargar para sincronizar conteos
          },
          error: (err) => {
            console.error('❌ Error al eliminar ejemplar:', err);
            this.mostrarModal({ tipo: 'error', titulo: 'Error', mensaje: 'No se pudo eliminar el ejemplar' });
          }
        });
      }
    });
  }

  /**
   * Añade un nuevo ejemplar a un libro
   */
  aniadirEjemplar(libro: Libro): void {
    this.isAniadiendoUnidad = true;
    this.materialesService.aniadirEjemplar(libro.id).subscribe({
      next: (nuevoEjemplar) => {
        console.log('✅ Ejemplar añadido:', nuevoEjemplar);
        if (!libro.ejemplares) libro.ejemplares = [];
        libro.ejemplares.push(nuevoEjemplar as any);
        this.isAniadiendoUnidad = false;
      },
      error: (err) => {
        console.error('❌ Error al añadir ejemplar:', err);
        this.mostrarModal({ tipo: 'error', titulo: 'Error', mensaje: 'No se pudo añadir el ejemplar' });
        this.isAniadiendoUnidad = false;
      }
    });
  }

  // ===== MÉTODOS PRIVADOS =====

  /**
   * Carga libros y equipos desde el backend
   */
  cargarMateriales(): void {
    this.isLoading = true;
    this.errorMessage = '';

    let librosCargados = false;
    let equiposCargados = false;

    const checkAndApplyFilters = () => {
      if (librosCargados && equiposCargados) {
        this.materialesOriginales = [...this.libros, ...this.equipos];
        this.aplicarFiltros();
        this.isLoading = false;
      }
    };

    // Cargar libros
    this.materialesService.getLibros().subscribe({
      next: (libros: Libro[]) => {
        console.log('📚 Libros recibidos:', libros);
        this.libros = libros;
        librosCargados = true;
        checkAndApplyFilters();
      },
      error: (err: any) => {
        console.error('❌ Error al cargar libros:', err);
        this.errorMessage = 'Error al cargar los libros';
        librosCargados = true;
        checkAndApplyFilters();
      }
    });

    // Cargar equipos
    this.materialesService.getEquipos().subscribe({
      next: (equipos: Equipo[]) => {
        console.log('📷 Equipos recibidos:', equipos);
        this.equipos = equipos;
        equiposCargados = true;
        checkAndApplyFilters();
      },
      error: (err: any) => {
        console.error('❌ Error al cargar equipos:', err);
        this.errorMessage = 'Error al cargar los equipos';
        equiposCargados = true;
        checkAndApplyFilters();
      }
    });
  }

  /**
   * Aplica los filtros activos
   */
  aplicarFiltros(): void {
    let filtrados = this.materialesOriginales;

    // 1. Filtro por tipo (Libro / Equipo)
    if (this.tipoSeleccionado === 'libros') {
      filtrados = filtrados.filter(m => 'ejemplares' in m);
    } else if (this.tipoSeleccionado === 'equipos') {
      filtrados = filtrados.filter(m => 'unidades' in m);
    }

    // 2. Filtro por búsqueda (Búsqueda textual)
    if (this.busqueda.trim()) {
      const b = this.busqueda.toLowerCase();
      filtrados = filtrados.filter(m => {
        if ('titulo' in m) {
          const libro = m as Libro;
          return libro.titulo.toLowerCase().includes(b) ||
            (libro.autor && libro.autor.toLowerCase().includes(b)) ||
            (libro.isbn && libro.isbn.toLowerCase().includes(b));
        } else {
          const equipo = m as Equipo;
          const nombreGenerico = equipo.Nombre?.nombre?.toLowerCase() || '';
          return equipo.marca.toLowerCase().includes(b) ||
            equipo.modelo.toLowerCase().includes(b) ||
            nombreGenerico.includes(b) ||
            (equipo.descripcion && equipo.descripcion.toLowerCase().includes(b));
        }
      });
    }

    // 3. Filtro por Categoría / Género
    if (this.filtroCategoria && this.filtroCategoria !== '') {
      filtrados = filtrados.filter(m => {
        if ('ejemplares' in m) {
          // Libro -> genero_id
          const genId = (m as Libro).genero_id || (m as any).genero?.id;
          return genId?.toString() === this.filtroCategoria;
        } else {
          // Equipo -> categoria_id
          const catId = (m as Equipo).categoria_id || (m as any).categoria?.id;
          return catId?.toString() === this.filtroCategoria;
        }
      });
    }

    // 3.1 Filtro por Nombre Genérico
    if (this.filtroNombre && this.filtroNombre !== '') {
      filtrados = filtrados.filter(m => (m as Equipo).nombre_id?.toString() === this.filtroNombre);
    }

    // 4. Filtros de Rango de Disponibles
    if (this.minDisponibles !== null) {
      filtrados = filtrados.filter(m => {
        const count = 'unidades' in m ? this.getUnidadesDisponiblesCount(m as Equipo) : this.getEjemplaresDisponiblesCount(m as Libro);
        return count >= (this.minDisponibles ?? 0);
      });
    }
    if (this.maxDisponibles !== null) {
      filtrados = filtrados.filter(m => {
        const count = 'unidades' in m ? this.getUnidadesDisponiblesCount(m as Equipo) : this.getEjemplaresDisponiblesCount(m as Libro);
        return count <= (this.maxDisponibles ?? Infinity);
      });
    }

    // 5. Filtros de Rango de Totales
    if (this.minTotales !== null) {
      filtrados = filtrados.filter(m => {
        const count = 'unidades' in m ? (m as Equipo).unidades?.length || 0 : (m as Libro).ejemplares?.length || 0;
        return count >= (this.minTotales ?? 0);
      });
    }
    if (this.maxTotales !== null) {
      filtrados = filtrados.filter(m => {
        const count = 'unidades' in m ? (m as Equipo).unidades?.length || 0 : (m as Libro).ejemplares?.length || 0;
        return count <= (this.maxTotales ?? Infinity);
      });
    }

    // 6. Ordenación (Nuevo)
    if (this.sortColumn) {
      filtrados.sort((a, b) => {
        let valA: any;
        let valB: any;

        // Mapeo de columnas a propiedades reales
        switch (this.sortColumn) {
          case 'nombre':
            valA = (a as any).Nombre?.nombre || (a as any).titulo || '';
            valB = (b as any).Nombre?.nombre || (b as any).titulo || '';
            break;
          case 'categoria':
            valA = (a as any).categoria?.nombre || '';
            valB = (b as any).categoria?.nombre || '';
            break;
          case 'marca':
            valA = (a as any).marca || '';
            valB = (b as any).marca || '';
            break;
          case 'modelo':
            valA = (a as any).modelo || '';
            valB = (b as any).modelo || '';
            break;
          case 'disp':
            valA = 'unidades' in a ? this.getUnidadesDisponiblesCount(a as Equipo) : this.getEjemplaresDisponiblesCount(a as Libro);
            valB = 'unidades' in b ? this.getUnidadesDisponiblesCount(b as Equipo) : this.getEjemplaresDisponiblesCount(b as Libro);
            break;
          case 'total':
            valA = 'unidades' in a ? (a as Equipo).unidades?.length || 0 : (a as Libro).ejemplares?.length || 0;
            valB = 'unidades' in b ? (b as Equipo).unidades?.length || 0 : (b as Libro).ejemplares?.length || 0;
            break;
          case 'autor':
            valA = (a as any).autor || '';
            valB = (b as any).autor || '';
            break;
          case 'editorial':
            valA = (a as any).editorial || '';
            valB = (b as any).editorial || '';
            break;
          case 'codigo':
            valA = (a as any).libro_numero || '';
            valB = (b as any).libro_numero || '';
            break;
          default:
            return 0;
        }

        // Comparación segura
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();

        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    this.materialesFiltrados = filtrados;
  }

  /**
   * Obtiene la URL completa de la imagen
   */
 getImageUrl(url?: string): string | undefined {
    if (!url) return undefined;
    if (url.startsWith('data:')) return url; // Para previsualizaciones
    if (url.startsWith('assets/')) return url; // Assets locales de Angular
    return `${environment.apiUrl}${url}`;
  }
}