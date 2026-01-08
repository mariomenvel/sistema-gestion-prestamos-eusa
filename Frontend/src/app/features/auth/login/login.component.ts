//Este es el ViewModel. Recibe los datos del usuario (email/pass) del HTML y pasárselos al AuthService.
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Componente de Login - Puerta de entrada a la aplicación.
 * 
 * FLUJO:
 * 1. Usuario rellena email y password
 * 2. Validaciones client-side (formato email, longitud password)
 * 3. Submit → authService.login()
 * 4. Backend valida credenciales
 * 5. Si OK → Guarda token + redirige según rol
 * 6. Si ERROR → Muestra mensaje de error
 */

@Component({
  selector: 'app-login', // Nombre de la etiqueta <app-login>
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  // FORMULARIO REACTIVO 
  /**
   * FormGroup que contiene los controles del formulario.
   * Cada FormControl tiene validadores asociados.
   */
  loginForm: FormGroup;

  // ESTADOS DEL COMPONENTE 
  /**
   * Indica si se está procesando el login (para deshabilitar botón).
   */
  isLoading: boolean = false;
  /**
    * Mensaje de error para mostrar al usuario si el login falla.
    */
  errorMessage: string = '';

  /**
   * Indica si se debe mostrar la contraseña (toggle ojo)
   */
  showPassword: boolean = false;

  // CONSTRUCTOR 
  /**
   * Inyectamos las dependencias necesarias:
   * - AuthService: Para realizar el login
   * - Router: Para redirigir después del login exitoso
   */

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Inicializamos el formulario en el constructor
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6)
      ])
    });
  }
  // CICLO DE VIDA 
  /**
   * Se ejecuta al inicializar el componente.
   */
  ngOnInit(): void {
    // Si ya está logueado, redirigir a su dashboard
    if (this.authService.isAuthenticated()) {
      this.redirectByRole();
    }
  }

  //  GETTERS PARA ACCEDER A LOS CONTROLES 
  /**
   * Getter para acceder fácilmente al control 'email' desde el HTML.
   * Uso: {{ email.errors }}
   */
  get email() {
    return this.loginForm.get('email')!;
  }

  /**
   * Getter para acceder fácilmente al control 'password' desde el HTML.
   * Uso: {{ password.errors }}
   */
  get password() {
    return this.loginForm.get('password')!;
  }
  //  MÉTODOS PÚBLICOS 
  /**
   * Se ejecuta cuando el usuario hace submit en el formulario.
   * 
   * FLUJO:
   * 1. Verificar que el formulario sea válido
   * 2. Mostrar loading
   * 3. Llamar a authService.login()
   * 4. Si exitoso → Redirigir según rol
   * 5. Si falla → Mostrar error
   */
  onSubmit(): void {
    // 1. Verificar que el formulario sea válido
    if (this.loginForm.invalid) {
      // Marcar todos los campos como "touched" para mostrar errores
      this.loginForm.markAllAsTouched();
      return;
    }

    // 2. Obtener los valores del formulario
    const credentials = {
      email: this.email.value,
      password: this.password.value
    };

    // 3. Iniciar loading
    this.isLoading = true;
    this.errorMessage = '';

    // 4. Llamar al servicio de autenticación
    this.authService.login(credentials).subscribe({
      next: (success) => {
        this.isLoading = false;

        if (success) {
          // Login exitoso, redirigir según rol
          console.log('Login exitoso');
          this.redirectByRole();
        } else {
          // Login fallido (usuario/contraseña incorrectos)
          this.errorMessage = 'Email o contraseña incorrectos';
        }
      },
      error: (error) => {
        // Error de red o del servidor
        this.isLoading = false;

        // Extraer mensaje del backend (error.error.mensaje) o usar mensaje genérico
        if (error.error && error.error.mensaje) {
          this.errorMessage = error.error.mensaje;
        } else if (error.status === 403) {
          this.errorMessage = 'Acceso denegado. Contacta con administración.';
        } else {
          this.errorMessage = 'Error al conectar con el servidor';
        }

        console.error('❌ Error en login:', error);
      }
    });
  }
  /**
   * Toggle para mostrar/ocultar la contraseña.
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  //  MÉTODOS PRIVADOS 
  /**
   * Redirige al usuario a su dashboard según su rol.
   * 
   * - alumno/profesor → /alumno/dashboard
   * - pas → /pas/dashboard
   */
  private redirectByRole(): void {
    const role = this.authService.currentRole();

    if (role === 'alumno' || role === 'profesor') {
      this.router.navigate(['/alumno/dashboard']);
    } else if (role === 'pas') {
      this.router.navigate(['/pas/dashboard']);
    } else {
      // Caso raro: usuario sin rol válido
      console.error('Usuario sin rol válido');
      this.authService.logout();
    }
  }
}