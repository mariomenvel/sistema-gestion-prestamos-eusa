import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { Usuario } from '../../../core/models/usuario.model';
import * as JsBarcode from 'jsbarcode';

/**
 * Componente Gestión de Usuarios (PAS)
 * 
 * Permite al personal administrativo:
 * - Ver todos los usuarios
 * - Buscar usuarios
 * - Editar información de usuarios
 */
@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {

  // ===== DATOS =====

  usuarios: Usuario[] = [];
  usuariosFiltrados: Usuario[] = [];

  // ===== BÚSQUEDA =====

  textoBusqueda: string = '';
  filtroEstado: string = '';

  // ===== ORDENACIÓN =====

  sortColumn: string = 'nombre'; // Columna por defecto
  sortDirection: 'asc' | 'desc' = 'asc';

  // ===== MODAL =====

  mostrarModal: boolean = false;
  usuarioSeleccionado: Usuario | null = null;
  formularioUsuario!: FormGroup;
  codigoBarrasUsuario: string = '';

  // ===== ESTADO =====

  isLoading: boolean = false;
  errorMessage: string = '';
  guardando: boolean = false;

  // ===== MODAL DE NOTIFICACIONES =====

  mostrarModalNotificacion: boolean = false;
  tipoModalNotificacion: 'exito' | 'error' | 'info' = 'info';
  tituloModalNotificacion: string = '';
  mensajeModalNotificacion: string = '';

  // ===== OPCIONES DE DROPDOWNS =====

  opcionesTipoEstudios = [
    { valor: 'grado_uni', etiqueta: 'Grado Universitario' },
    { valor: 'grado_sup', etiqueta: 'Grado Superior' },
    { valor: 'master', etiqueta: 'Máster' }
  ];

  opcionesCurso = [
    { valor: '1º', etiqueta: '1º' },
    { valor: '2º', etiqueta: '2º' },
    { valor: '3º', etiqueta: '3º' },
    { valor: '4º', etiqueta: '4º' }
  ];

  opcionesEstado = [
    { valor: 'activo', etiqueta: 'Activo' },
    { valor: 'bloqueado', etiqueta: 'Bloqueado' },
    { valor: 'inactivo', etiqueta: 'Inactivo' }
  ];

  // Para mapear los contadores de Tipo B (se cargará dinámicamente)
  contadoresTipoB: Map<number, { usados: number; limite: number }> = new Map();

  // ===== CONSTRUCTOR =====

  constructor(
    private usuariosService: UsuariosService,
    private fb: FormBuilder
  ) {
    this.crearFormulario();
  }

  // ===== CICLO DE VIDA =====

  ngOnInit(): void {
    this.cargarUsuarios();
  }


  // ===== MÉTODOS PÚBLICOS =====

  /**
  * Aplica todos los filtros (texto, estado, tipo estudios) y ordenación
  */
  aplicarFiltros(): void {
    console.log('🔍 Aplicando filtros:', {
      texto: this.textoBusqueda,
      estado: this.filtroEstado
    });

    let resultado = [...this.usuarios];

    // 1. Filtro por texto
    if (this.textoBusqueda.trim()) {
      const texto = this.normalizarTexto(this.textoBusqueda);
      resultado = resultado.filter(usuario => {
        const nombre = this.normalizarTexto(usuario.nombre);
        const apellidos = usuario.apellidos ? this.normalizarTexto(usuario.apellidos) : '';
        const email = this.normalizarTexto(usuario.email);
        return nombre.includes(texto) || apellidos.includes(texto) || email.includes(texto);
      });
    }

    // 2. Filtro por estado
    if (this.filtroEstado) {
      resultado = resultado.filter(usuario => usuario.estado_perfil === this.filtroEstado);
    }

    // 4. Aplicar ordenación
    this.aplicarOrdenacion(resultado);
  }

  /**
   * Cambia la columna de ordenación o la dirección
   */
  ordenar(columna: string): void {
    if (this.sortColumn === columna) {
      // Si es la misma columna, alternar dirección
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // Si es una columna nueva, poner asc
      this.sortColumn = columna;
      this.sortDirection = 'asc';
    }
    this.aplicarFiltros();
  }

  /**
   * Lógica interna de ordenación
   */
  private aplicarOrdenacion(datos: Usuario[]): void {
    datos.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (this.sortColumn) {
        case 'nombre':
          valorA = `${a.nombre} ${a.apellidos || ''}`.toLowerCase();
          valorB = `${b.nombre} ${b.apellidos || ''}`.toLowerCase();
          break;
        case 'email':
          valorA = a.email.toLowerCase();
          valorB = b.email.toLowerCase();
          break;
        case 'grado':
          valorA = this.getTipoEstudiosLabel(a.tipo_estudios || '').toLowerCase();
          valorB = this.getTipoEstudiosLabel(b.tipo_estudios || '').toLowerCase();
          break;
        case 'estado':
          valorA = a.estado_perfil.toLowerCase();
          valorB = b.estado_perfil.toLowerCase();
          break;
        case 'tipob':
          const contA = this.contadoresTipoB.get(a.id);
          const contB = this.contadoresTipoB.get(b.id);
          valorA = contA ? contA.usados : 0;
          valorB = contB ? contB.usados : 0;
          break;
        default:
          return 0;
      }

      if (valorA < valorB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valorA > valorB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    this.usuariosFiltrados = datos;
  }

  /**
 * Genera el barcode cuando se abre el modal
 */
  generarBarcode(): void {
    if (this.usuarioSeleccionado) {
      setTimeout(() => {
        const barcodeSvg = document.getElementById('barcodeModal');
        if (barcodeSvg) {
          // Solo usar codigo_tarjeta del backend
          const codigoTarjeta = this.usuarioSeleccionado!.codigo_tarjeta;

          if (codigoTarjeta) {
            try {
              JsBarcode(barcodeSvg, codigoTarjeta, {
                format: 'CODE128',
                width: 2,
                height: 80,
                displayValue: true
              });
              console.log('✅ Barcode generado:', codigoTarjeta);
            } catch (err) {
              console.error('❌ Error generando barcode:', err);
            }
          } else {
            // Si no tiene código, limpiar el SVG y mostrar mensaje
            barcodeSvg.innerHTML = '';
            console.warn('⚠️ Usuario sin código de tarjeta asignado');
          }
        }
      }, 100);
    }
  }

  /**
   * Abre el modal de edición de un usuario
   */
  abrirModalEditar(usuario: Usuario): void {
    console.log('👤 Abriendo modal para:', usuario.nombre);
    this.usuarioSeleccionado = usuario;

    // Cargar datos en el formulario
    this.formularioUsuario.patchValue({
      nombre: usuario.nombre,
      apellidos: usuario.apellidos || '',
      email: usuario.email,
      telefono: usuario.telefono || '',
      tipo_estudios: usuario.tipo_estudios || '',
      fecha_inicio_est: usuario.fecha_inicio_est || '',
      fecha_fin_prev: usuario.fecha_fin_prev || '',
      estado_perfil: usuario.estado_perfil || 'activo',
     grado: usuario.grado || '', 
    curso: usuario.curso || ''   
    });

    this.mostrarModal = true;

    //Generar el el cod de barras cuando se abre el modal
    this.generarBarcode();
  }

  /**
   * Cierra el modal
   */
  cerrarModal(): void {
    this.mostrarModal = false;
    this.usuarioSeleccionado = null;
    this.formularioUsuario.reset();
    this.codigoBarrasUsuario = '';
  }

  /**
   * Guarda los cambios del usuario
   */
  guardarCambios(): void {
    if (!this.usuarioSeleccionado) {
      return;
    }

    if (this.formularioUsuario.invalid) {
      this.tipoModalNotificacion = 'error';
      this.tituloModalNotificacion = 'Formulario Incompleto';
      this.mensajeModalNotificacion = 'Por favor, completa todos los campos requeridos';
      this.mostrarModalNotificacion = true;
      return;
    }

    this.guardando = true;
    const datos = this.formularioUsuario.value;

    this.usuariosService.actualizarUsuario(this.usuarioSeleccionado.id, datos).subscribe({
      next: (response: any) => {
        console.log('✅ Usuario actualizado:', response);
        this.guardando = false;

        // Primero mostrar notificación, luego cerrar modal de edición
        this.tipoModalNotificacion = 'exito';
        this.tituloModalNotificacion = 'Usuario Actualizado';
        this.mensajeModalNotificacion = 'Los datos del usuario se han guardado correctamente';
        this.mostrarModalNotificacion = true;

        // Cerrar modal de edición y recargar datos
        this.mostrarModal = false;
        this.usuarioSeleccionado = null;
        this.formularioUsuario.reset();
        this.cargarUsuarios();
      },
      error: (err: any) => {
        console.error('❌ Error al actualizar usuario:', err);
        this.tipoModalNotificacion = 'error';
        this.tituloModalNotificacion = 'Error al Guardar';
        this.mensajeModalNotificacion = 'No se pudo actualizar el usuario. Inténtalo de nuevo.';
        this.mostrarModalNotificacion = true;
        this.guardando = false;
      }
    });
  }

  /**
   * Obtiene la etiqueta legible del tipo de estudios
   */
  getTipoEstudiosLabel(tipo: string): string {
    const opcion = this.opcionesTipoEstudios.find(o => o.valor === tipo);
    return opcion ? opcion.etiqueta : tipo || '-';
  }

  /**
   * Obtiene la etiqueta legible del estado
   */
  getEstadoLabel(estado: string): string {
    const opcion = this.opcionesEstado.find(o => o.valor === estado);
    return opcion ? opcion.etiqueta : estado || '-';
  }

  // ===== MÉTODOS PRIVADOS =====

  /**
   * Crea el formulario reactivo
   */
  private crearFormulario(): void {
    this.formularioUsuario = this.fb.group({
      nombre: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: [''],
      tipo_estudios: [''],
      fecha_inicio_est: [''],
      fecha_fin_prev: [''],
      estado_perfil: ['activo', Validators.required],
      grado: [''],  
    curso: [''] 
    });
  }

  /**
   * Carga todos los usuarios desde el backend
   */
  private cargarUsuarios(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.usuariosService.getUsuarios().subscribe({
      next: (usuarios: Usuario[]) => {
        console.log('👥 Usuarios recibidos:', usuarios);
        this.usuarios = usuarios;
        this.aplicarFiltros();
        this.isLoading = false;

        // Cargar contadores Tipo B para cada usuario
        this.usuarios.forEach(u => this.obtenerContadorTipoB(u.id));
      },
      error: (err: any) => {
        console.error('❌ Error al cargar usuarios:', err);
        this.errorMessage = 'Error al cargar los usuarios';
        this.isLoading = false;
      }
    });
  }
  /**
 * Normaliza texto eliminando tildes para búsqueda
 */
  private normalizarTexto(texto: string): string {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  /**
   * Obtiene el contador (usados/limite) para mostrar en la tabla.
   */
  getContadorTipoB(usuarioId: number): string {
    // Si no está el dato aún, poner '-' o spinner? De momento '-'
    const contador = this.contadoresTipoB.get(usuarioId);
    return contador ? `${contador.usados}/${contador.limite}` : '-';
  }

  private obtenerContadorTipoB(usuarioId: number): void {
    this.usuariosService.obtenerContadorTipoB(usuarioId).subscribe({
      next: (data) => {
        this.contadoresTipoB.set(usuarioId, { usados: data.usados, limite: data.limite });
      },
      error: (err) => {
        console.error('Error al obtener contador:', err);
        // En caso de error, asumimos 0/5 por defecto para no romper la UI, 
        // o podríamos dejarlo sin setear para mostrar '-'
        this.contadoresTipoB.set(usuarioId, { usados: 0, limite: 5 });
      }
    });
  }
  /**
 * Cierra el modal de notificación
 */
  cerrarModalNotificacion(): void {
    this.mostrarModalNotificacion = false;
  }
}