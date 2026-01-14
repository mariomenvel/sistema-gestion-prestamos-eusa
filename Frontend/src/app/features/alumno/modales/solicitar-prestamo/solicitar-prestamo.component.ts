import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { SolicitudesService } from '../../../../core/services/solicitudes.service';

/**
 * Interface para el material seleccionado
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
 * Modal de Solicitar Préstamo
 * 
 * Permite al alumno solicitar un préstamo de un material (libro o equipo)
 * con opciones para Tipo A (trabajo académico) o Tipo B (uso personal)
 */
@Component({
  selector: 'app-solicitar-prestamo',
  templateUrl: './solicitar-prestamo.component.html',
  styleUrls: ['./solicitar-prestamo.component.scss']
})
export class SolicitarPrestamoComponent implements OnInit {

  /**
   * Controla si el modal está abierto
   */
  @Input() isOpen: boolean = false;

  /**
   * Material seleccionado para solicitar
   */
  @Input() material: MaterialVista | null = null;

  /**
   * Evento cuando se cierra el modal
   */
  @Output() close = new EventEmitter<void>();

  /**
   * Evento cuando se crea la solicitud exitosamente
   */
  @Output() solicitudCreada = new EventEmitter<void>();

  // ===== FORMULARIO =====

  tipoSolicitud: 'prof_trabajo' | 'uso_propio' = 'prof_trabajo';
  nombreProfesor: string = '';
  asignatura: string = '';
  normasAceptadas: boolean = false;
  fechaSolicitud: string = '';

// ===== ESTADO =====

enviandoSolicitud: boolean = false;
errorSolicitud: string = '';
mostrarModalNormas: boolean = false;
normasLeidas: boolean = false;
  

  // ===== CONSTRUCTOR =====

  constructor(
    private solicitudesService: SolicitudesService
  ) { }

  // ===== CICLO DE VIDA =====

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
   * Inicializa el formulario con valores por defecto
   */
  inicializarFormulario(): void {
    this.tipoSolicitud = 'prof_trabajo';
    this.nombreProfesor = '';
    this.asignatura = '';
    this.normasAceptadas = false;
    this.normasLeidas = false;
    this.errorSolicitud = '';

    // Fecha actual en formato DD/MM/YYYY
    const hoy = new Date();
    const dia = String(hoy.getDate()).padStart(2, '0');
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const anio = hoy.getFullYear();
    this.fechaSolicitud = `${dia}/${mes}/${anio}`;
  }

  /**
   * Cambia el tipo de solicitud
   */
  cambiarTipo(tipo: 'prof_trabajo' | 'uso_propio'): void {
    this.tipoSolicitud = tipo;

    // Limpiar campos si cambia a Tipo B
    if (tipo === 'uso_propio') {
      this.nombreProfesor = '';
      this.asignatura = '';
    }
  }

  /**
   * Verifica si el formulario es válido
   */
  get formularioValido(): boolean {
    // Normas deben estar aceptadas
    if (!this.normasAceptadas) {
      return false;
    }

    // Si es Tipo A, validar campos adicionales
    if (this.tipoSolicitud === 'prof_trabajo') {
      return this.nombreProfesor.trim() !== '' && this.asignatura.trim() !== '';
    }

    return true;
  }

  /**
   * Envía la solicitud al backend
   */
  enviarSolicitud(): void {
    if (!this.formularioValido || !this.material) {
      return;
    }

    this.enviandoSolicitud = true;
    this.errorSolicitud = '';
  
    // Preparar datos
    const datos: any = {
      tipo: this.tipoSolicitud,
      normas_aceptadas: this.normasAceptadas
    };

    // Añadir ID según tipo de material
    if (this.material.tipo === 'libro') {
      datos.ejemplar_id = this.material.id;
    } else {
      datos.unidad_id = this.material.id;
    }

    // Si es Tipo A, añadir observaciones
    if (this.tipoSolicitud === 'prof_trabajo') {
      datos.observaciones = `Profesor: ${this.nombreProfesor} | Asignatura: ${this.asignatura}`;
    }

    console.log('📤 Enviando solicitud:', datos);

    // Enviar al backend
    this.solicitudesService.crearSolicitud(datos).subscribe({
      next: (solicitud) => {
        console.log('✅ Solicitud creada:', solicitud);
        alert('Solicitud enviada correctamente. Recibirás una notificación cuando sea aprobada.');
        this.solicitudCreada.emit();
        this.cerrarModal();
      },
      error: (err) => {
        console.error('❌ Error al crear solicitud:', err);
        this.errorSolicitud = 'Error al enviar la solicitud. Por favor, inténtalo de nuevo.';
        this.enviandoSolicitud = false;
      },
      complete: () => {
        this.enviandoSolicitud = false;
      }
    });
  }

  /**
   * Cierra el modal
   */
  cerrarModal(): void {
    this.inicializarFormulario();
    this.close.emit();
  }

  /**
 * Abre el modal de normas completas
 */
verNormasCompletas(): void {
  this.mostrarModalNormas = true;
}

/**
 * Cierra el modal de normas
 */
cerrarModalNormas(): void {
  this.mostrarModalNormas = false;
  this.normasLeidas = true;
}

/**
 * Se ejecuta cuando el usuario acepta las normas
 */
onNormasAceptadas(): void {
  this.normasAceptadas = true;
  this.cerrarModalNormas();
}
}