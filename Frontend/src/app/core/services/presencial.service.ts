import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UsuarioPresencial {
  usuario: {
    id: number;
    nombre: string;
    apellidos: string;
    email: string;
    rol: string;
    grado: string;
    curso: number;
  };
  bloqueado: boolean;
  sanciones: any[];
  historial_reciente: any[];
}

export interface ItemPresencial {
  tipo: 'unidad' | 'ejemplar';
  id: number;
  codigo: string;
  titulo: string;
  estado: string;
  disponible: boolean;
}

export interface CheckoutPresencial {
  codigo_tarjeta: string;
  entregas: {
    unidades: number[];
    ejemplares: number[];
  };
  forzar_prestamo?: boolean;
  profesor_id?: number;
  fecha_limite?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PresencialService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Busca un usuario por código de tarjeta
   */
  buscarUsuarioPorTarjeta(codigo: string): Observable<UsuarioPresencial> {
    return this.http.get<UsuarioPresencial>(`${this.apiUrl}/presencial/usuario/${codigo}`);
  }

  /**
   * Busca un item (unidad o ejemplar) por código de barras
   */
  buscarItemPorCodigo(codigo: string): Observable<ItemPresencial> {
    return this.http.get<ItemPresencial>(`${this.apiUrl}/presencial/item/${codigo}`);
  }

  /**
   * Crea un préstamo presencial
   */
  crearPrestamoPresencial(datos: CheckoutPresencial): Observable<any> {
    return this.http.post(`${this.apiUrl}/presencial/checkout`, datos);
  }
}