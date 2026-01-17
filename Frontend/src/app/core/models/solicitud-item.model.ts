export interface SolicitudItem {
  id: number;
  solicitud_id: number;
  libro_id?: number;
  equipo_id?: number;
  cantidad: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  motivo_rechazo_id?: number;
}
