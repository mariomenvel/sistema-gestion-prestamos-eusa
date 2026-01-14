import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Componente Modal de Normas
 * 
 * Muestra las normas completas de préstamo de material
 */
@Component({
  selector: 'app-normas',
  templateUrl: './normas.component.html',
  styleUrls: ['./normas.component.scss']
})
export class NormasComponent {

  /**
   * Controla si el modal está abierto
   */
  @Input() isOpen: boolean = false;

  /**
   * Evento cuando se cierra el modal
   */
  @Output() close = new EventEmitter<void>();

  /**
   * Evento cuando se aceptan las normas
   */
  @Output() normasAceptadas = new EventEmitter<void>();

  /**
   * Cierra el modal sin aceptar
   */
  cerrarModal(): void {
    this.close.emit();
  }

  /**
   * Acepta las normas y cierra el modal
   */
  aceptarNormas(): void {
    this.normasAceptadas.emit();
    this.close.emit();
  }
}