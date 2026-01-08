import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

/**
 * Interfaz para libro más prestado
 */
export interface LibroMasPrestado {
  titulo: string;
  autor: string;
  totalPrestamos: number;
}

/**
 * Interfaz para material más prestado
 */
export interface MaterialMasPrestado {
  nombre: string;
  categoria: string;
  totalPrestamos: number;
}

/**
 * Interfaz para usuario/grado que más solicita
 */
export interface UsuarioMasSolicita {
  nombre: string;
  curso: string;
  totalSolicitudes: number;
}

/**
 * Interfaz para item del Top 5
 */
export interface Top5Item {
  posicion: number;
  nombre: string;
  categoria: string;
  totalPrestamos: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {

  constructor(private apiService: ApiService) { }

  /**
   * Obtiene el libro más prestado
   */
  getLibroMasPrestado(): Observable<LibroMasPrestado> {
    return this.apiService.get<LibroMasPrestado>('/reportes/libro-mas-prestado');
  }

  /**
   * Obtiene el material más prestado
   */
  getMaterialMasPrestado(): Observable<MaterialMasPrestado> {
    return this.apiService.get<MaterialMasPrestado>('/reportes/material-mas-prestado');
  }

  /**
   * Obtiene el usuario que más solicita
   */
  getUsuarioMasSolicita(): Observable<UsuarioMasSolicita> {
    return this.apiService.get<UsuarioMasSolicita>('/reportes/usuario-mas-solicita');
  }

  /**
   * Obtiene el top 5 de materiales más demandados
   */
  getTop5Materiales(): Observable<Top5Item[]> {
    return this.apiService.get<Top5Item[]>('/reportes/top5-materiales');
  }
}