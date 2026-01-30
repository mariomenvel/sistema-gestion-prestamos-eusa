import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { MaterialesService } from '../../../../core/services/materiales.service';

/**
 * Modal para añadir o editar material (Libro o Equipo)
 */
@Component({
  selector: 'app-aniadir-material',
  templateUrl: './aniadir-material.component.html',
  styleUrls: ['./aniadir-material.component.scss']
})
export class AniadirMaterialComponent implements OnInit, OnChanges {

  @Input() isOpen: boolean = false;
  @Input() mode: 'add' | 'edit' = 'add';
  @Input() editData: any = null;

  @Output() close = new EventEmitter<void>();
  @Output() materialCreado = new EventEmitter<void>();

  // ===== TIPO DE MATERIAL =====

  tipoMaterial: 'libro' | 'equipo' = 'equipo';

  // ===== FORMULARIO EQUIPO =====

  // Datos del equipo
  equipoMarca: string = '';
  equipoModelo: string = '';
  equipoCategoria: string = '';
  equipoNombreId: number | '' = '';
  equipoDescripcion: string = '';

  // Archivo de imagen
  archivoImagen: File | null = null;
  imagenPreview: string | null = null;

  // Unidades del equipo
  unidades: Array<{
    numero_serie: string;
    codigo_barra: string;
    estado_fisico: string;
    esta_prestado: boolean;
  }> = [];

  // ===== FORMULARIO LIBRO =====

  // Datos del libro
  libroTitulo: string = '';
  libroAutor: string = '';
  libroEditorial: string = '';
  libroNumero: string = '';
  libroCategoria: string = '';

  // Ejemplares del libro
  ejemplares: Array<{
    codigo_barra: string;
    estanteria: string;
    balda: string;
    estado: string;
  }> = [];

  // ===== CATEGORÍAS Y ESTADOS =====

  categoriasLibros: Array<{ id: number; nombre: string }> = [];
  categoriasEquipos: Array<{ id: number; nombre: string }> = [];
  nombresEquipos: Array<{ id: number; nombre: string }> = [];

  estadosDisponibles = [
    { valor: 'disponible', texto: 'Disponible' },
    { valor: 'no_disponible', texto: 'No disponible' },
    { valor: 'bloqueado', texto: 'Bloqueado' },
    { valor: 'en_reparacion', texto: 'En reparación' }
  ];

  estadosFisicosEquipos = [
    { valor: 'funciona', texto: 'Funcional' },
    { valor: 'en_reparacion', texto: 'En reparación' },
    { valor: 'no_funciona', texto: 'No funciona' },
    { valor: 'falla', texto: 'Con fallos' },
    { valor: 'perdido_sustraido', texto: 'Perdido' },
    { valor: 'obsoleto', texto: 'Obsoleto' }
  ];

  // ===== NUEVA CATEGORÍA =====

  mostrarFormularioCategoria: boolean = false;
  nuevaCategoriaCodigo: string = '';
  nuevaCategoriaNombre: string = '';

  // ===== NUEVO NOMBRE =====

  mostrarFormularioNombre: boolean = false;
  nuevoNombreTexto: string = '';

  // ===== ESTADO =====

  enviando: boolean = false;
  error: string = '';

  // ===== CONSTRUCTOR =====

  constructor(private materialesService: MaterialesService) { }

  // ===== CICLO DE VIDA =====

  ngOnInit(): void {
    this.cargarCategorias();
    this.cargarNombres();
    this.agregarUnidadInicial();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) {
      if (this.mode === 'edit' && this.editData) {
        this.cargarDatosParaEdicion();
      } else {
        this.limpiarFormulario();
      }
    }
  }

  /**
   * Carga los datos del material a editar en el formulario
   */
  cargarDatosParaEdicion(): void {
    if (!this.editData) return;

    // Detectar si es libro o equipo basándose en las propiedades
    const esLibro = 'titulo' in this.editData;
    this.tipoMaterial = esLibro ? 'libro' : 'equipo';

    if (this.tipoMaterial === 'equipo') {
      this.equipoMarca = this.editData.marca || '';
      this.equipoModelo = this.editData.modelo || '';
      this.equipoCategoria = this.editData.categoria_id || '';
      this.equipoNombreId = this.editData.nombre_id || '';
      this.equipoDescripcion = this.editData.descripcion || '';
      this.imagenPreview = this.editData.foto_url || null;
      // Las unidades no las cargamos en el modal de edición principal porque
      // se gestionan desde la fila expandida de forma más eficiente.
      this.unidades = [];
    } else {
      this.libroTitulo = this.editData.titulo || '';
      this.libroAutor = this.editData.autor || '';
      this.libroEditorial = this.editData.editorial || '';
      this.libroNumero = this.editData.libro_numero || '';
      this.libroCategoria = this.editData.genero_id || '';
      this.imagenPreview = this.editData.foto_url || null;
      // Los ejemplares se gestionan desde la fila expandida.
      this.ejemplares = [];
    }
  }

  // ===== MÉTODOS PÚBLICOS =====

  cargarCategorias(): void {
    // Cargar categorías de equipos
    this.materialesService.getCategorias().subscribe({
      next: (categorias: any[]) => {
        console.log('📦 Categorías recibidas:', categorias);
        this.categoriasEquipos = categorias.map(c => ({ id: c.id, nombre: c.nombre }));
      },
      error: (err: any) => console.error('Error al cargar categorías:', err)
    });

    // Cargar géneros de libros
    this.materialesService.getGeneros().subscribe({
      next: (generos: any[]) => {
        console.log('📚 Géneros recibidos:', generos);
        this.categoriasLibros = generos.map(g => ({ id: g.id, nombre: g.nombre }));
      },
      error: (err: any) => console.error('Error al cargar géneros:', err)
    });
  }

  /**
   * Cargar nombres genéricos desde el backend
   */
  cargarNombres(): void {
    this.materialesService.getNombres().subscribe({
      next: (nombres: any[]) => {
        console.log('📦 Nombres recibidos:', nombres);
        this.nombresEquipos = nombres.map(n => ({ id: n.id, nombre: n.nombre }));
      },
      error: (err: any) => {
        console.error('❌ Error al cargar nombres:', err);
      }
    });
  }

  /**
   * Cambiar tipo de material (libro/equipo)
   */
  cambiarTipo(tipo: 'libro' | 'equipo'): void {
    this.tipoMaterial = tipo;
    this.limpiarFormulario();
  }

  /**
   * Agregar una unidad inicial vacía
   */
  agregarUnidadInicial(): void {
    if (this.unidades.length === 0) {
      this.agregarUnidad();
    }
    if (this.ejemplares.length === 0) {
      this.agregarEjemplar();
    }
  }

  /**
   * Agregar nueva unidad al equipo
   */
  agregarUnidad(): void {
    this.unidades.push({
      numero_serie: '',
      codigo_barra: '',
      estado_fisico: 'funciona',
      esta_prestado: false
    });
  }

  /**
   * Eliminar unidad del equipo
   */
  eliminarUnidad(index: number): void {
    if (this.unidades.length > 1) {
      this.unidades.splice(index, 1);
    }
  }

  /**
   * Agregar nuevo ejemplar al libro
   */
  agregarEjemplar(): void {
    this.ejemplares.push({
      codigo_barra: '',
      estanteria: '',
      balda: '',
      estado: 'disponible'
    });
  }

  /**
   * Eliminar ejemplar del libro
   */
  eliminarEjemplar(index: number): void {
    if (this.ejemplares.length > 1) {
      this.ejemplares.splice(index, 1);
    }
  }

  /**
   * Manejar selección de imagen
   */
  onImagenSeleccionada(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const archivo = input.files[0];

      // Validar tipo
      if (!archivo.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }

      // Validar tamaño (máx 5MB)
      if (archivo.size > 5 * 1024 * 1024) {
        alert('La imagen no puede superar los 5MB');
        return;
      }

      this.archivoImagen = archivo;

      // Preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target.result;
      };
      reader.readAsDataURL(archivo);
    }
  }

  /**
   * Validar formulario según el tipo
   */
  formularioValido(): boolean {
    if (this.tipoMaterial === 'equipo') {
      const infoBasicaOk = !!(
        this.equipoMarca.trim() &&
        this.equipoModelo.trim() &&
        this.equipoCategoria &&
        this.equipoNombreId
      );

      // En modo edición no obligamos a tener unidades en el modal
      if (this.mode === 'edit') return infoBasicaOk;

      return infoBasicaOk &&
        this.unidades.length > 0 &&
        this.unidades.every(u => u.codigo_barra.trim());
    } else {
      const infoBasicaOk = !!(
        this.libroTitulo.trim() &&
        this.libroNumero.trim() &&
        this.libroCategoria
      );

      if (this.mode === 'edit') return infoBasicaOk;

      return infoBasicaOk &&
        this.ejemplares.length > 0 &&
        this.ejemplares.every(e => e.codigo_barra.trim());
    }
  }

  /**
   * Guardar material
   */
  guardarMaterial(): void {
    if (!this.formularioValido()) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    this.enviando = true;
    this.error = '';

    if (this.mode === 'edit') {
      this.actualizarMaterial();
    } else {
      if (this.tipoMaterial === 'equipo') {
        this.guardarEquipo();
      } else {
        this.guardarLibro();
      }
    }
  }

  /**
   * Actualizar material existente
   */
  private actualizarMaterial(): void {
    if (this.tipoMaterial === 'equipo') {
      this.actualizarEquipo();
    } else {
      this.actualizarLibro();
    }
  }

  private actualizarEquipo(): void {
    const datosEquipo = {
      marca: this.equipoMarca,
      modelo: this.equipoModelo,
      categoria_id: Number(this.equipoCategoria),
      nombre_id: Number(this.equipoNombreId),
      descripcion: this.equipoDescripcion
    };

    this.materialesService.actualizarEquipo(this.editData.id, datosEquipo as any).subscribe({
      next: (equipo: any) => {
        if (this.archivoImagen) {
          this.subirImagenEquipo(equipo.id);
        } else {
          this.finalizarEdicion();
        }
      },
      error: (err: any) => {
        this.error = 'Error al actualizar el equipo';
        this.enviando = false;
      }
    });
  }

  private actualizarLibro(): void {
    const datosLibro = {
      titulo: this.libroTitulo,
      autor: this.libroAutor,
      editorial: this.libroEditorial,
      libro_numero: this.libroNumero,
      genero_id: Number(this.libroCategoria)
    };

    this.materialesService.actualizarLibro(this.editData.id, datosLibro as any).subscribe({
      next: (libro: any) => {
        if (this.archivoImagen) {
          this.subirImagenLibro(libro.id);
        } else {
          this.finalizarEdicion();
        }
      },
      error: (err: any) => {
        this.error = 'Error al actualizar el libro';
        this.enviando = false;
      }
    });
  }

  private finalizarEdicion(): void {
    alert('Material actualizado correctamente');
    this.materialCreado.emit();
    this.cerrarModal();
  }

  /**
   * Guardar equipo con unidades
   */
  private guardarEquipo(): void {
    const datosEquipo = {
      marca: this.equipoMarca,
      modelo: this.equipoModelo,
      categoria_id: this.equipoCategoria,
      nombre_id: this.equipoNombreId,
      descripcion: this.equipoDescripcion,
      unidades: this.unidades
    };

    console.log('📤 Guardando equipo:', datosEquipo);

    this.materialesService.crearEquipo(datosEquipo).subscribe({
      next: (equipo: any) => {
        console.log('✅ Equipo creado:', equipo);

        // Si hay imagen, subirla
        if (this.archivoImagen) {
          this.subirImagenEquipo(equipo.id);
        } else {
          this.finalizar();
        }
      },
      error: (err: any) => {
        console.error('❌ Error al crear equipo:', err);
        this.error = 'Error al crear el equipo';
        this.enviando = false;
      }
    });
  }

  /**
   * Subir imagen del equipo
   */
  private subirImagenEquipo(equipoId: number): void {
    if (!this.archivoImagen) {
      this.finalizar();
      return;
    }

    this.materialesService.subirImagenEquipo(equipoId, this.archivoImagen).subscribe({
      next: () => {
        console.log('✅ Imagen subida');
        this.finalizar();
      },
      error: (err: any) => {
        console.error('❌ Error al subir imagen:', err);
        // Aunque falle la imagen, el equipo ya está creado
        alert('Equipo creado correctamente, pero hubo un error al subir la imagen');
        this.finalizar();
      }
    });
  }

  /**
   * Guardar libro con ejemplares
   */
  private guardarLibro(): void {
    const datosLibro = {
      titulo: this.libroTitulo,
      autor: this.libroAutor,
      editorial: this.libroEditorial,
      libro_numero: this.libroNumero,
      genero_id: this.libroCategoria,
      ejemplares: this.ejemplares
    };

    console.log('📤 Guardando libro:', datosLibro);

    this.materialesService.crearLibro(datosLibro).subscribe({
      next: (libro: any) => {
        console.log('✅ Libro creado:', libro);

        // Si hay una imagen, subirla después
        if (this.archivoImagen) {
          this.subirImagenLibro(libro.id);
        } else {
          this.finalizar();
        }
      },
      error: (err: any) => {
        console.error('❌ Error al crear libro:', err);
        this.error = 'Error al crear el libro';
        this.enviando = false;
      }
    });
  }

  /**
   * Sube la imagen del libro recién creado
   */
  private subirImagenLibro(libroId: number): void {
    if (!this.archivoImagen) return;

    this.materialesService.subirImagenLibro(libroId, this.archivoImagen).subscribe({
      next: () => {
        console.log('✅ Portada subida');
        this.finalizar();
      },
      error: (err) => {
        console.error('❌ Error al subir portada:', err);
        // Aun así finalizamos para que el material aparezca
        this.finalizar();
      }
    });
  }

  /**
   * Finalizar creación
   */
  private finalizar(): void {
    alert('Material creado correctamente');
    this.materialCreado.emit();
    this.cerrarModal();
  }

  /**
   * Cerrar modal
   */
  cerrarModal(): void {
    this.limpiarFormulario();
    this.close.emit();
  }

  /**
   * Limpiar formulario
   */
  private limpiarFormulario(): void {
    // Equipo
    this.equipoMarca = '';
    this.equipoModelo = '';
    this.equipoCategoria = '';
    this.equipoNombreId = '';
    this.equipoDescripcion = '';
    this.unidades = [];
    this.archivoImagen = null;
    this.imagenPreview = null;

    // Libro
    this.libroTitulo = '';
    this.libroAutor = '';
    this.libroEditorial = '';
    this.libroNumero = '';
    this.libroCategoria = '';
    this.ejemplares = [];

    this.agregarUnidadInicial();
    this.error = '';
  }

  /**
   * Mostrar formulario para crear categoría
   */
  toggleFormularioCategoria(): void {
    this.mostrarFormularioCategoria = !this.mostrarFormularioCategoria;
    if (!this.mostrarFormularioCategoria) {
      this.limpiarFormularioCategoria();
    }
  }

  /**
   * Crear nueva categoría
   */
  crearCategoria(): void {
    if (!this.nuevaCategoriaNombre.trim()) {
      alert('Por favor introduce el nombre de la categoría');
      return;
    }

    if (this.tipoMaterial === 'libro') {
      this.crearGenero();
      return;
    }

    const nuevaCategoria = {
      nombre: this.nuevaCategoriaNombre,
      activa: true
    };

    this.materialesService.crearCategoria(nuevaCategoria).subscribe({
      next: (categoria: any) => {
        this.categoriasEquipos.push({ id: categoria.id, nombre: categoria.nombre });
        this.equipoCategoria = categoria.id;
        this.limpiarFormularioCategoria();
        this.mostrarFormularioCategoria = false;
        alert('Categoría creada correctamente');
      },
      error: (err: any) => {
        console.error('❌ Error al crear categoría:', err);
        alert('Error al crear la categoría');
      }
    });
  }

  /**
   * Crear nuevo género (para libros)
   */
  crearGenero(): void {
    const nuevoGenero = {
      nombre: this.nuevaCategoriaNombre,
      activo: true
    };

    this.materialesService.crearGenero(nuevoGenero).subscribe({
      next: (genero: any) => {
        this.categoriasLibros.push({ id: genero.id, nombre: genero.nombre });
        this.libroCategoria = genero.id;
        this.limpiarFormularioCategoria();
        this.mostrarFormularioCategoria = false;
        alert('Género creado correctamente');
      },
      error: (err: any) => {
        console.error('❌ Error al crear género:', err);
        alert('Error al crear el género');
      }
    });
  }

  /**
   * Mostrar formulario para crear nombre
   */
  toggleFormularioNombre(): void {
    this.mostrarFormularioNombre = !this.mostrarFormularioNombre;
    if (!this.mostrarFormularioNombre) {
      this.nuevoNombreTexto = '';
    }
  }

  /**
   * Crear nuevo nombre genérico
   */
  crearNombre(): void {
    if (!this.nuevoNombreTexto.trim()) {
      alert('Por favor introduce el nombre');
      return;
    }

    const nuevoNombre = {
      nombre: this.nuevoNombreTexto
    };

    console.log('📤 Creando nombre:', nuevoNombre);

    this.materialesService.crearNombre(nuevoNombre).subscribe({
      next: (nombre: any) => {
        console.log('✅ Nombre creado:', nombre);
        this.nombresEquipos.push({ id: nombre.id, nombre: nombre.nombre });
        this.equipoNombreId = nombre.id;
        this.nuevoNombreTexto = '';
        this.mostrarFormularioNombre = false;
        alert('Nombre genérico creado correctamente');
      },
      error: (err: any) => {
        console.error('❌ Error al crear nombre:', err);
        alert('Error al crear el nombre genérico');
      }
    });
  }

  /**
   * Limpiar formulario de categoría
   */
  private limpiarFormularioCategoria(): void {
    this.nuevaCategoriaCodigo = '';
    this.nuevaCategoriaNombre = '';
  }
}