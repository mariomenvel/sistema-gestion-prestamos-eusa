import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() mostrar: boolean = false;
  @Input() tipo: 'exito' | 'error' | 'info' | 'confirmacion' = 'info'; // exito, error, info, confirmacion
  @Input() titulo: string = '';
  @Input() mensaje: string = '';
  @Input() textoBtnPrincipal: string = 'Aceptar';
  @Input() textoBtnSecundario: string = 'Cancelar';
  @Input() esConfirmacion: boolean = false;

  @Output() cerrar = new EventEmitter<void>();
  @Output() confirmar = new EventEmitter<void>();

  /**
   * Obtiene el ícono según el tipo de modal
   */
  getIcono(): string {
    switch (this.tipo) {
      case 'exito':
        return '✓';
      case 'error':
        return '✕';
      case 'confirmacion':
        return '❓';
      case 'info':
      default:
        return 'ℹ';
    }
  }

  /**
   * Cierra el modal emitiendo evento
   */
  cerrarModal(): void {
    this.cerrar.emit();
  }

  /**
   * Confirma la acción
   */
  confirmarAccion(): void {
    this.confirmar.emit();
  }
}