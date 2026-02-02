import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './perfil.component.html',
    styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
    usuario: any = null;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.cargarDatosUsuario();
    }

    /**
     * Carga los datos del usuario actual desde el servicio de autenticación
     */
    cargarDatosUsuario(): void {
        this.usuario = this.authService.currentUser();
    }

    /**
     * Genera las iniciales del nombre del usuario para el avatar
     */
    get iniciales(): string {
        if (!this.usuario?.nombre) return 'PA';

        const partes = this.usuario.nombre.trim().split(' ');

        if (partes.length >= 2) {
            // Si tiene nombre y apellido, tomar primera letra de cada uno
            return (partes[0][0] + partes[1][0]).toUpperCase();
        }

        // Si solo tiene un nombre, tomar las dos primeras letras
        return partes[0].substring(0, 2).toUpperCase();
    }
}
