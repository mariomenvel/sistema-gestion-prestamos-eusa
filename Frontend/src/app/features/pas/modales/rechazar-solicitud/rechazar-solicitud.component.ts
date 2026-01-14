import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SolicitudesService } from '../../../../core/services/solicitudes.service';

@Component({
  selector: 'app-rechazar-solicitud',
  templateUrl: './rechazar-solicitud.component.html',
  styleUrls: ['./rechazar-solicitud.component.scss']
})
export class RechazarSolicitudComponent {

  @Input() solicitudSeleccionada: any = null;
  @Input() mostrarModalAprobar: boolean = false;
  
  @Output() cerrar = new EventEmitter<void>();
  @Output() solicitudActualizada = new EventEmitter<number>();

  motivoRechazo: string = '';
  isLoading: boolean = false;

  constructor(private solicitudesService: SolicitudesService) {}

  cerrarModal(): void {
    this.motivoRechazo = ''; 
    this.cerrar.emit();
  }

  confirmarRechazo(): void {
    if (!this.motivoRechazo.trim()) {
      alert('Por favor, ingresa un motivo de rechazo');
      return;
    }

    if (!this.solicitudSeleccionada) return;

    this.isLoading = true;
    this.solicitudesService.rechazarSolicitud(this.solicitudSeleccionada.id, this.motivoRechazo).subscribe({
      next: () => {
        this.isLoading = false;
        console.log('Solicitud rechazada');
        this.solicitudActualizada.emit(this.solicitudSeleccionada.id);
        this.cerrarModal();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al rechazar', err);
      }
    });
  }
}