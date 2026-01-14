import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MaterialesService } from '../../../../core/services/materiales.service';
import { Categoria } from '../../../../core/models/categoria.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-aniadir-material',
  templateUrl: './aniadir-material.component.html',
  styleUrls: ['./aniadir-material.component.scss']
})
export class AniadirMaterialComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  @Output() materialGuardado = new EventEmitter<void>();

  aniadirForm!: FormGroup;
  categorias: Categoria[] = [];
  estados = ['Disponible', 'No Disponible'];
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private materialesService: MaterialesService
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
    this.initForm();
  }

  initForm(): void {
    this.aniadirForm = this.fb.group({
      codigo: ['', Validators.required],
      modelo: ['', Validators.required],
      nombre: ['', Validators.required],
      estado: ['Disponible', Validators.required],
      categoria_id: ['', Validators.required],
      unidades: ['', [Validators.required, Validators.min(1)]],
      marca: ['', Validators.required],
      ubicacion: [''],
      descripcion: ['']
    });
  }

  cargarCategorias(): void {
    this.materialesService.getCategorias().subscribe(res => {
      this.categorias = res.filter(c => c.activa);
    });
  }

  onGuardar(): void {
    if (this.aniadirForm.invalid) return;

    this.isLoading = true;
    const formVal = this.aniadirForm.value;
    const categoria = this.categorias.find(c => c.id === +formVal.categoria_id);

    // Lógica dinámica: Si la categoría es tipo 'libro' usa crearLibro, si no crearEquipo
    const peticion: Observable<any> = categoria?.tipo === 'libro' 
      ? this.materialesService.aniadirLibro(formVal)
      : this.materialesService.aniadirEquipo(formVal);

    peticion.subscribe({
      next: () => {
        this.isLoading = false;
        this.materialGuardado.emit();
        this.cerrar.emit();
      },
      error: () => this.isLoading = false
    });
  }

  onCancelar(): void {
    this.cerrar.emit();
  }
}