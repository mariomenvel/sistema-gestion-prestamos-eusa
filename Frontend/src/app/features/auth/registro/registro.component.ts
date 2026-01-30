import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit {

  registroForm!: FormGroup;
  registrando: boolean = false;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.crearFormulario();
  }

  private crearFormulario(): void {
    this.registroForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      apellidos: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
        this.emailDominioValidator.bind(this)
      ]],
      telefono: ['', [
        Validators.required,
        Validators.pattern(/^[\+]?[0-9\s\-]{7,20}$/) // permite +, espacios, guiones, 7-20 dígitos (porque hay alumnos extranjeros)
      ]],
      tipo_estudios: ['', Validators.required],
      grado: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      curso: ['', Validators.required],
      fecha_inicio_est: ['', [Validators.required, this.fechaInicioValidator.bind(this)]],
      fecha_fin_prev: ['', [Validators.required, this.fechaFinValidator.bind(this)]],
      password: ['', [
        Validators.required,
        Validators.minLength(6),
        Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/)  // Al menos 1 letra y 1 número
      ]],
      confirmarPassword: ['', Validators.required]
    }, {
      validators: [this.passwordMatchValidator, this.fechasValidator]
    });
  }

  // Validador de fecha inicio (no puede ser futura)
  private fechaInicioValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (!control.value) return null;

    const fechaInicio = new Date(control.value);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaInicio > hoy) {
      return { fechaFutura: true };
    }

    return null;
  }

  // Validador de fecha fin (debe ser posterior a inicio)
  private fechaFinValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (!control.value) return null;

    const form = control.parent;
    if (!form) return null;

    const fechaInicio = form.get('fecha_inicio_est')?.value;
    if (!fechaInicio) return null;

    const inicio = new Date(fechaInicio);
    const fin = new Date(control.value);

    if (fin <= inicio) {
      return { fechaFinInvalida: true };
    }

    return null;
  }

  // Validador de fechas (a nivel de formulario)
  private fechasValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const fechaInicio = control.get('fecha_inicio_est')?.value;
    const fechaFin = control.get('fecha_fin_prev')?.value;

    if (!fechaInicio || !fechaFin) return null;

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    if (fin <= inicio) {
      return { fechasInvalidas: true };
    }

    return null;
  }

  // Añadir después de los otros validadores privados

  private emailDominioValidator(control: AbstractControl): { [key: string]: boolean } | null {
    if (!control.value) return null;

    const email = control.value.toLowerCase();
    const dominiosPermitidos = ['@eusa.es', '@campuscamara.es'];

    const esValido = dominiosPermitidos.some(dominio => email.endsWith(dominio));

    if (!esValido) {
      return { dominioInvalido: true };
    }

    return null;
  }

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmarPassword = control.get('confirmarPassword');

    if (!password || !confirmarPassword) {
      return null;
    }

    return password.value === confirmarPassword.value ? null : { passwordMismatch: true };
  }

  registrarse(): void {
    if (this.registroForm.invalid) {
      Object.keys(this.registroForm.controls).forEach(key => {
        this.registroForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.registrando = true;
    this.errorMessage = '';

    const datos = { ...this.registroForm.value };
    delete datos.confirmarPassword; // No enviar al backend

    this.authService.registrar(datos).subscribe({
      next: (response) => {
        console.log('✅ Registro exitoso:', response);
        // Redirigir al login
        this.router.navigate(['/login'], {
          queryParams: { registroExitoso: 'true' }
        });
      },
      error: (err) => {
        console.error('❌ Error en el registro:', err);
        this.errorMessage = err.error?.mensaje || 'Error al registrarse. Inténtalo de nuevo.';
        this.registrando = false;
      }
    });
  }
}