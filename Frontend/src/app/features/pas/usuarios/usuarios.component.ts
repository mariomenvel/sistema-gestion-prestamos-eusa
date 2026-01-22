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

  // ===== MODAL =====

  mostrarModal: boolean = false;
  usuarioSeleccionado: Usuario | null = null;
  formularioUsuario!: FormGroup;
  codigoBarrasUsuario: string = '';

  // ===== ESTADO =====

  isLoading: boolean = false;
  errorMessage: string = '';
  guardando: boolean = false;

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
  * Busca usuarios por texto
  */
  buscar(): void {
    console.log('🔍 Buscando:', this.textoBusqueda);

    if (!this.textoBusqueda.trim()) {
      this.usuariosFiltrados = [...this.usuarios];
      return;
    }

    const textoNormalizado = this.normalizarTexto(this.textoBusqueda);

    this.usuariosFiltrados = this.usuarios.filter(usuario => {
      const nombre = this.normalizarTexto(usuario.nombre);
      const apellidos = usuario.apellidos ? this.normalizarTexto(usuario.apellidos) : '';
      const email = this.normalizarTexto(usuario.email);

      return nombre.includes(textoNormalizado) ||
        apellidos.includes(textoNormalizado) ||
        email.includes(textoNormalizado);
    });

    console.log('✅ Usuarios filtrados:', this.usuariosFiltrados.length);
  }

  /**
 * Genera el barcode cuando se abre el modal
 */
generarBarcode(): void {
  if (this.usuarioSeleccionado) {
    setTimeout(() => {
      const barcodeSvg = document.getElementById('barcodeModal');
      if (barcodeSvg) {
        try {
          // Usar codigo_tarjeta si existe, si no usar ID
          const codigoParaBarcode = this.usuarioSeleccionado!.codigo_tarjeta || 
                                     this.usuarioSeleccionado!.id.toString();
          
          JsBarcode(barcodeSvg, codigoParaBarcode, {
            format: 'CODE128',
            width: 2,
            height: 80,
            displayValue: true
          });
          console.log('✅ Barcode generado:', codigoParaBarcode);
        } catch (err) {
          console.error('❌ Error generando barcode:', err);
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
  this.codigoBarrasUsuario = usuario.id.toString(); // ⬅️ CAMBIO: Usar ID para barcode

  // Cargar datos en el formulario
  this.formularioUsuario.patchValue({
    nombre: usuario.nombre,
    apellidos: usuario.apellidos || '',
    email: usuario.email,
    tipo_estudios: usuario.tipo_estudios || '',
    fecha_inicio_est: usuario.fecha_inicio_est || '',
    fecha_fin_prev: usuario.fecha_fin_prev || '',
    estado_perfil: usuario.estado_perfil || 'activo'
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
      alert('Por favor, completa todos los campos requeridos');
      return;
    }

    this.guardando = true;
    const datos = this.formularioUsuario.value;

    this.usuariosService.actualizarUsuario(this.usuarioSeleccionado.id, datos).subscribe({
      next: (response: any) => {
        console.log('✅ Usuario actualizado:', response);
        alert('Usuario actualizado correctamente');
        this.cerrarModal();
        this.cargarUsuarios(); // Recargar lista
      },
      error: (err: any) => {
        console.error('❌ Error al actualizar usuario:', err);
        alert('Error al actualizar el usuario');
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
      tipo_estudios: [''],
      fecha_inicio_est: [''],
      fecha_fin_prev: [''],
      estado_perfil: ['activo', Validators.required]
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
        this.usuariosFiltrados = [...usuarios];
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
}