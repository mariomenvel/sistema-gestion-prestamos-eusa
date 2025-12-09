//Este es el ViewModel. Recibe los datos del usuario (email/pass) del HTML y pasárselos al AuthService.
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router'; // Para navegar a otra página
import { AuthService } from '../../../core/services/auth.service';
@Component({
  selector: 'app-login', // Nombre de la etiqueta <app-login>
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // Variables para guardar lo que escribe el usuario 
  email: string = '';
  password: string = '';

  // Variables para controlar la vista (mostrar error o cargando)
  errorMessage: string = '';
  isLoading: boolean = false;

  // Inyectamos el AuthService y el Router
  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    // Si el usuario ya tiene token, lo mandamos directo adentro
    if (this.authService.getToken()) {
      this.redirigirSegunRol();
    }
  }

  // Función que se ejecuta al pulsar el botón "Ingresar"
  onSubmit(): void {
    // 1. Limpiamos errores previos
    this.errorMessage = '';
    this.isLoading = true;

    // 2. Llamamos al servicio (Model)
    this.authService.login({ email: this.email, password: this.password })
      .subscribe({
        next: (exito) => {
          this.isLoading = false;
          if (exito) {
            this.redirigirSegunRol();
          } else {
            this.errorMessage = 'Credenciales incorrectas.';
          }
        },
        error: (err) => {
          this.isLoading = false;
          // Mostramos el mensaje que venga del backend o uno genérico
          this.errorMessage = err.message || 'Error de conexión con el servidor.';
        }
      });
  }

  // Lógica privada para decidir a dónde va el usuario
  private redirigirSegunRol() {
    // Leemos el rol actual desde la Signal del servicio
    const rol = this.authService.currentRole();

    console.log('Redirigiendo usuario con rol:', rol);

    if (rol === 'pas') {
      // Si es PAS-> Dashboard del PAS
      this.router.navigate(['/pas/dashboard']);
    } else if (rol === 'alumno' || rol === 'profesor') {
      // Si es Alumno o Profesor -> Dashboard de Usuario
      this.router.navigate(['/alumno/dashboard']);
    } else {
      // Si el rol no se reconoce, lo mandamos al home o login
      console.error('Rol desconocido, redirigiendo a login');
      this.router.navigate(['/auth/login']);
    }
  }
}