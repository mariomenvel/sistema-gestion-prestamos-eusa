import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SolicitudesService } from '../../../../core/services/solicitudes.service';

@Component({
  selector: 'app-aprobar-solicitud',
  templateUrl: './aprobar-solicitud.component.html',
  styleUrls: ['./aprobar-solicitud.component.scss']
})
export class AprobarSolicitudComponent {
  @Input() solicitudSeleccionada: any = null;
  @Input() mostrarModalAprobar: boolean = false;
  
  @Output() cerrar = new EventEmitter<void>();
  @Output() solicitudAprobada = new EventEmitter<number>();

  fechaDevolucion: string = '';
  isLoading: boolean = false;

  constructor(private solicitudesService: SolicitudesService) {}

  cerrarModal(): void {
    this.fechaDevolucion = '';
    this.cerrar.emit();
  }

  confirmarAprobacion(): void {
    if (!this.fechaDevolucion) {
      alert('Por favor, selecciona una fecha de devolución');
      return;
    }

    this.isLoading = true;
    
    this.solicitudesService.aprobarSolicitud(this.solicitudSeleccionada.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.solicitudAprobada.emit(this.solicitudSeleccionada.id);
        this.cerrarModal();
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error al aprobar', err);
      }
    });
  }
}