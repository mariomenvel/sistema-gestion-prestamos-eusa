import { Component, OnInit, AfterViewInit } from '@angular/core';
import * as JsBarcode from 'jsbarcode';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario } from '../../../core/models/usuario.model';

/**
 * Componente Mi Perfil (Alumno)
 * 
 * Muestra la información personal del alumno logueado
 */
@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.scss']
})
export class MiPerfilComponent implements OnInit, AfterViewInit {

  // ===== DATOS =====
  usuario: Usuario | null = null;

  // ===== CONSTRUCTOR =====
  constructor(
    private authService: AuthService
  ) { }

  // ===== CICLO DE VIDA =====
  ngOnInit(): void {
    this.cargarPerfil();
  }

  ngAfterViewInit(): void {
    if (this.usuario && this.usuario.codigo_tarjeta) {
      var svg = document.getElementById('codigoBarras');
      if (svg) {
        JsBarcode(svg, this.usuario.codigo_tarjeta, {
          format: 'CODE128',
          width: 2,
          height: 80,
          displayValue: false
        });
      }
    }
  }

  // ===== MÉTODOS PÚBLICOS =====

  /**
   * Obtiene el nombre completo del usuario
   */
  getNombreCompleto(): string {
    if (!this.usuario) return '—';
    return `${this.usuario.nombre} ${this.usuario.apellidos}`;
  }

  /**
   * Obtiene el año de matrícula
   */
  getAnioMatricula(): string {
    if (!this.usuario || !this.usuario.fecha_inicio_est) return '—';
    const fecha = new Date(this.usuario.fecha_inicio_est);
    return fecha.getFullYear().toString();
  }

  /**
   * Obtiene el nombre del grado
   */
  getNombreGrado(): string {
    if (!this.usuario || !this.usuario.grado) return '—';
    return this.usuario.grado;
  }

  /**
   * Obtiene el tipo de estudios legible
   */
  getTipoEstudios(): string {
    if (!this.usuario || !this.usuario.tipo_estudios) return '—';

    switch (this.usuario.tipo_estudios) {
      case 'grado_uni': return 'Grado Universitario';
      case 'grado_sup': return 'Grado Superior';
      case 'master': return 'Máster';
      default: return this.usuario.tipo_estudios;
    }
  }

  /**
   * Obtiene el curso con formato "Nº"
   */
  getCurso(): string {
    if (!this.usuario || !this.usuario.curso) return '—';
    return `${this.usuario.curso}º`;
  }

  /**
   * Obtiene la fecha de finalización prevista
   */
  getFechaFinalizacion(): string {
    if (!this.usuario || !this.usuario.fecha_fin_prev) return '—';

    const fecha = new Date(this.usuario.fecha_fin_prev);
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    return `${meses[fecha.getMonth()]} ${fecha.getFullYear()}`;
  }

  /**
   * Obtiene el estado del perfil legible
   */
  getEstadoPerfil(): string {
    if (!this.usuario) return '—';

    switch (this.usuario.estado_perfil) {
      case 'activo': return 'Activo';
      case 'bloqueado': return 'Bloqueado';
      case 'inactivo': return 'Inactivo';
      default: return this.usuario.estado_perfil;
    }
  }

  // ===== MÉTODOS PRIVADOS =====

  /**
   * Carga el perfil del usuario logueado
   */
  private cargarPerfil(): void {
    this.usuario = this.authService.currentUser();
    console.log('👤 Usuario actual:', this.usuario);
  }
}