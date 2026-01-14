import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { MaterialesService } from '../../../../core/services/materiales.service';

/**
 * Modal para añadir nuevo material (Libro o Equipo)
 */
@Component({
  selector: 'app-aniadir-material',
  templateUrl: './aniadir-material.component.html',
  styleUrls: ['./aniadir-material.component.scss']
})
export class AniadirMaterialComponent implements OnInit {

  @Input() isOpen: boolean = false;
  @Output() close = new EventEmitter<void>();
  @Output() materialCreado = new EventEmitter<void>();

  // ===== TIPO DE MATERIAL =====
  
  tipoMaterial: 'libro' | 'equipo' = 'equipo';

  // ===== FORMULARIO EQUIPO =====

  // Datos del equipo
  equipoMarca: string = '';
  equipoModelo: string = '';
  equipoCategoria: string = '';
  equipoDescripcion: string = '';
  
  // Archivo de imagen
  archivoImagen: File | null = null;
  imagenPreview: string | null = null;

  // Unidades del equipo
  unidades: Array<{
    numero_serie: string;
    codigo_barra: string;
    estado: string;
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

  categoriasLibros: Array<{ codigo: string; nombre: string }> = [];
  categoriasEquipos: Array<{ codigo: string; nombre: string }> = [];

  estadosDisponibles = [
    { valor: 'disponible', texto: 'Disponible' },
    { valor: 'no_disponible', texto: 'No disponible' },
    { valor: 'bloqueado', texto: 'Bloqueado' },
    { valor: 'en_reparacion', texto: 'En reparación' }
  ];

  // ===== NUEVA CATEGORÍA =====

  mostrarFormularioCategoria: boolean = false;
  nuevaCategoriaCodigo: string = '';
  nuevaCategoriaNombre: string = '';

  // ===== ESTADO =====

  enviando: boolean = false;
  error: string = '';

  // ===== CONSTRUCTOR =====

  constructor(private materialesService: MaterialesService) { }

  // ===== CICLO DE VIDA =====

  ngOnInit(): void {
    this.cargarCategorias();
    this.agregarUnidadInicial();
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
   * Cargar categorías desde el backend
   */
  cargarCategorias(): void {
    this.materialesService.getCategorias().subscribe({
      next: (categorias: any[]) => {
        console.log('📚 Categorías recibidas:', categorias);
        
        // Filtrar por tipo y solo activas
        this.categoriasLibros = categorias
          .filter(c => c.tipo === 'libro' && c.activa)
          .map(c => ({ codigo: c.codigo, nombre: c.nombre }));
        
        this.categoriasEquipos = categorias
          .filter(c => c.tipo === 'equipo' && c.activa)
          .map(c => ({ codigo: c.codigo, nombre: c.nombre }));
      },
      error: (err: any) => {
        console.error('❌ Error al cargar categorías:', err);
        // Fallback a datos hardcodeados
        this.categoriasLibros = [
          { codigo: '038', nombre: 'Marketing' },
          { codigo: 'INF', nombre: 'Informática' }
        ];
        this.categoriasEquipos = [
          { codigo: 'CAM', nombre: 'Cámaras' },
          { codigo: 'AUD', nombre: 'Audio' }
        ];
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
      estado: 'disponible'
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
      return !!(
        this.equipoMarca.trim() &&
        this.equipoModelo.trim() &&
        this.equipoCategoria &&
        this.unidades.length > 0 &&
        this.unidades.every(u => u.codigo_barra.trim())
      );
    } else {
      return !!(
        this.libroTitulo.trim() &&
        this.libroNumero.trim() &&
        this.libroCategoria &&
        this.ejemplares.length > 0 &&
        this.ejemplares.every(e => e.codigo_barra.trim())
      );
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

    if (this.tipoMaterial === 'equipo') {
      this.guardarEquipo();
    } else {
      this.guardarLibro();
    }
  }

  /**
   * Guardar equipo con unidades
   */
  private guardarEquipo(): void {
    const datosEquipo = {
      marca: this.equipoMarca,
      modelo: this.equipoModelo,
      categoria_codigo: this.equipoCategoria,
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
      categoria_codigo: this.libroCategoria,
      ejemplares: this.ejemplares
    };

    console.log('📤 Guardando libro:', datosLibro);

    this.materialesService.crearLibro(datosLibro).subscribe({
      next: () => {
        console.log('✅ Libro creado');
        this.finalizar();
      },
      error: (err: any) => {
        console.error('❌ Error al crear libro:', err);
        this.error = 'Error al crear el libro';
        this.enviando = false;
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
    if (!this.nuevaCategoriaCodigo.trim() || !this.nuevaCategoriaNombre.trim()) {
      alert('Por favor completa el código y nombre de la categoría');
      return;
    }

    const tipoCategoria = this.tipoMaterial === 'libro' ? 'libro' : 'equipo';

    const nuevaCategoria = {
      codigo: this.nuevaCategoriaCodigo.toUpperCase(),
      nombre: this.nuevaCategoriaNombre,
      tipo: tipoCategoria,
      activa: true
    };

    console.log('📤 Creando categoría:', nuevaCategoria);

    this.materialesService.crearCategoria(nuevaCategoria).subscribe({
      next: (categoria: any) => {
        console.log('✅ Categoría creada:', categoria);
        
        // Añadir a la lista correspondiente
        if (tipoCategoria === 'libro') {
          this.categoriasLibros.push({ codigo: categoria.codigo, nombre: categoria.nombre });
          this.libroCategoria = categoria.codigo;
        } else {
          this.categoriasEquipos.push({ codigo: categoria.codigo, nombre: categoria.nombre });
          this.equipoCategoria = categoria.codigo;
        }
        
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
   * Limpiar formulario de categoría
   */
  private limpiarFormularioCategoria(): void {
    this.nuevaCategoriaCodigo = '';
    this.nuevaCategoriaNombre = '';
  }
}