import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() mostrar: boolean = false;
  @Input() tipo: 'exito' | 'error' | 'info' = 'info'; // exito, error, info
  @Input() titulo: string = '';
  @Input() mensaje: string = '';
  @Input() textoBtnPrincipal: string = 'Aceptar';

  @Output() cerrar = new EventEmitter<void>();

  /**
   * Obtiene el ícono según el tipo de modal
   */
  getIcono(): string {
    switch (this.tipo) {
      case 'exito':
        return '✓';
      case 'error':
        return '✕';
      case 'info':
        return 'ℹ';
      default:
        return '';
    }
  }

  /**
   * Cierra el modal emitiendo evento
   */
  cerrarModal(): void {
    this.cerrar.emit();
  }
}