import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PresencialService, UsuarioPresencial, ItemPresencial } from '../../../core/services/presencial.service';

interface ItemCarrito {
  id: number;
  tipo: 'unidad' | 'ejemplar';
  codigo: string;
  titulo: string;
}

@Component({
  selector: 'app-prestamo-presencial',
  templateUrl: './prestamo-presencial.component.html',
  styleUrls: ['./prestamo-presencial.component.scss']
})
export class PrestamoPresencialComponent implements OnInit {

  // ===== PASO ACTUAL =====
  pasoActual: 'buscar-alumno' | 'agregar-materiales' | 'confirmar' = 'buscar-alumno';

  // ===== BÚSQUEDA ALUMNO =====
  codigoAlumno: string = '';
  buscandoAlumno: boolean = false;
  errorAlumno: string = '';
  
  // ===== DATOS ALUMNO =====
  alumnoEncontrado: UsuarioPresencial | null = null;

  // ===== BÚSQUEDA MATERIAL =====
  codigoMaterial: string = '';
  buscandoMaterial: boolean = false;
  errorMaterial: string = '';

  // ===== CARRITO =====
  carrito: ItemCarrito[] = [];

  // ===== FECHA DEVOLUCIÓN =====
  fechaDevolucion: string = '';
  horaDevolucion: string = '09:00';

  // ===== ESTADO FINAL =====
  creandoPrestamo: boolean = false;

  // ===== MODAL NOTIFICACIONES =====
  mostrarModalNotificacion: boolean = false;
  tipoModalNotificacion: 'exito' | 'error' | 'info' = 'info';
  tituloModalNotificacion: string = '';
  mensajeModalNotificacion: string = '';

  constructor(
    private presencialService: PresencialService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.calcularFechaDevolucion();
  }

  // ===== PASO 1: BUSCAR ALUMNO =====

  buscarAlumno(): void {
    if (!this.codigoAlumno.trim()) {
      this.errorAlumno = 'Introduce el código de tarjeta del alumno';
      return;
    }

    this.buscandoAlumno = true;
    this.errorAlumno = '';
    this.alumnoEncontrado = null;

    this.presencialService.buscarUsuarioPorTarjeta(this.codigoAlumno.trim()).subscribe({
      next: (data) => {
        console.log('✅ Alumno encontrado:', data);
        
        // Verificar si está bloqueado
        if (data.bloqueado) {
          this.errorAlumno = 'Este alumno tiene sanciones activas y no puede realizar préstamos';
          this.buscandoAlumno = false;
          return;
        }

        this.alumnoEncontrado = data;
        this.pasoActual = 'agregar-materiales';
        this.buscandoAlumno = false;
      },
      error: (err) => {
        console.error('❌ Error buscando alumno:', err);
        this.errorAlumno = err.error?.mensaje || 'Alumno no encontrado';
        this.buscandoAlumno = false;
      }
    });
  }

  // ===== PASO 2: AGREGAR MATERIALES =====

  buscarMaterial(): void {
    if (!this.codigoMaterial.trim()) {
      this.errorMaterial = 'Introduce el código de barras del material';
      return;
    }

    // Verificar si ya está en el carrito
    if (this.carrito.some(item => item.codigo === this.codigoMaterial.trim())) {
      this.errorMaterial = 'Este material ya está en el carrito';
      return;
    }

    this.buscandoMaterial = true;
    this.errorMaterial = '';

    this.presencialService.buscarItemPorCodigo(this.codigoMaterial.trim()).subscribe({
      next: (item) => {
        console.log('✅ Material encontrado:', item);

        if (!item.disponible) {
          this.errorMaterial = 'Este material no está disponible';
          this.buscandoMaterial = false;
          return;
        }

        // Añadir al carrito
        this.carrito.push({
          id: item.id,
          tipo: item.tipo,
          codigo: item.codigo,
          titulo: item.titulo
        });

        this.codigoMaterial = '';
        this.buscandoMaterial = false;
      },
      error: (err) => {
        console.error('❌ Error buscando material:', err);
        this.errorMaterial = err.error?.mensaje || 'Material no encontrado';
        this.buscandoMaterial = false;
      }
    });
  }

  eliminarDelCarrito(index: number): void {
    this.carrito.splice(index, 1);
  }

  continuarAConfirmar(): void {
    if (this.carrito.length === 0) {
      this.errorMaterial = 'Añade al menos un material al carrito';
      return;
    }
    this.pasoActual = 'confirmar';
  }

  // ===== PASO 3: CONFIRMAR PRÉSTAMO =====

  confirmarPrestamo(): void {
    if (!this.alumnoEncontrado || this.carrito.length === 0) {
      return;
    }

    this.creandoPrestamo = true;

    // Separar items por tipo
    const unidades = this.carrito.filter(i => i.tipo === 'unidad').map(i => i.id);
    const ejemplares = this.carrito.filter(i => i.tipo === 'ejemplar').map(i => i.id);

    // Construir fecha límite
    const fechaLimite = `${this.fechaDevolucion}T${this.horaDevolucion}:00`;

    const datos = {
      codigo_tarjeta: this.codigoAlumno,
      entregas: {
        unidades,
        ejemplares
      },
      fecha_limite: fechaLimite
    };

    console.log('📤 Creando préstamo presencial:', datos);

    this.presencialService.crearPrestamoPresencial(datos).subscribe({
      next: (response) => {
        console.log('✅ Préstamo creado:', response);
        this.creandoPrestamo = false;
        
        this.tipoModalNotificacion = 'exito';
        this.tituloModalNotificacion = 'Préstamo Creado';
        this.mensajeModalNotificacion = `Préstamo presencial creado correctamente para ${this.alumnoEncontrado?.usuario.nombre}. Se ha enviado un correo de confirmación.`;
        this.mostrarModalNotificacion = true;
      },
      error: (err) => {
        console.error('❌ Error creando préstamo:', err);
        this.creandoPrestamo = false;
        
        this.tipoModalNotificacion = 'error';
        this.tituloModalNotificacion = 'Error al Crear Préstamo';
        this.mensajeModalNotificacion = err.error?.mensaje || 'No se pudo crear el préstamo. Inténtalo de nuevo.';
        this.mostrarModalNotificacion = true;
      }
    });
  }

  // ===== UTILIDADES =====

  calcularFechaDevolucion(): void {
    const hoy = new Date();
    let siguiente = new Date(hoy);
    
    // Añadir 1 día
    siguiente.setDate(siguiente.getDate() + 1);
    
    // Si es sábado, pasar al lunes
    if (siguiente.getDay() === 6) {
      siguiente.setDate(siguiente.getDate() + 2);
    }
    // Si es domingo, pasar al lunes
    if (siguiente.getDay() === 0) {
      siguiente.setDate(siguiente.getDate() + 1);
    }

    // Formato YYYY-MM-DD para el input date
    this.fechaDevolucion = siguiente.toISOString().split('T')[0];
  }

  volverAPaso(paso: 'buscar-alumno' | 'agregar-materiales'): void {
    this.pasoActual = paso;
  }

  cancelar(): void {
    this.router.navigate(['/pas/dashboard']);
  }

  cerrarModalNotificacion(): void {
    this.mostrarModalNotificacion = false;
    
    // Si fue éxito, volver al dashboard
    if (this.tipoModalNotificacion === 'exito') {
      this.router.navigate(['/pas/dashboard']);
    }
  }


  get nombreCompletoAlumno(): string {
    if (!this.alumnoEncontrado) return '';
    const u = this.alumnoEncontrado.usuario;
    return `${u.nombre} ${u.apellidos || ''}`.trim();
  }
}