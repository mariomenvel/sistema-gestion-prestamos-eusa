import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Interceptor
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
// Auth Components
import { LoginComponent } from './features/auth/login/login.component';
import { RegistroComponent } from './features/auth/registro/registro.component';  // ← CORREGIDO


// Alumno Components
import { DashboardComponent as AlumnoDashboardComponent } from './features/alumno/dashboard/dashboard.component';
import { CatalogoComponent } from './features/alumno/catalogo/catalogo.component';
import { MisPrestamosComponent } from './features/alumno/mis-prestamos/mis-prestamos.component';
import { MiPerfilComponent } from './features/alumno/mi-perfil/mi-perfil.component';
import { SolicitarPrestamoComponent } from './features/alumno/modales/solicitar-prestamo/solicitar-prestamo.component';
import { NormasComponent } from './features/alumno/modales/normas/normas.component';

// PAS Components
import { DashboardComponent as PasDashboardComponent } from './features/pas/dashboard/dashboard.component';
import { SolicitudesComponent } from './features/pas/solicitudes/solicitudes.component';
import { PrestamosActivosComponent } from './features/pas/prestamos-activos/prestamos-activos.component';
import { MaterialesComponent } from './features/pas/materiales/materiales.component';
import { ReportesComponent } from './features/pas/reportes/reportes.component';
import { UsuariosComponent } from './features/pas/usuarios/usuarios.component';
import { AniadirMaterialComponent } from './features/pas/modales/aniadir-material/aniadir-material.component';
import { PerfilAlumnoComponent } from './features/pas/modales/perfil-alumno/perfil-alumno.component';

// Shared Components
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { CommonModule } from '@angular/common';
import { PrestamoPresencialComponent } from './features/pas/prestamo-presencial/prestamo-presencial.component';

@NgModule({
  declarations: [
    AppComponent,
    // Auth
    LoginComponent,
    RegistroComponent,

    // Alumno
    AlumnoDashboardComponent,
    CatalogoComponent,
    MisPrestamosComponent,
    MiPerfilComponent,
    SolicitarPrestamoComponent,
    NormasComponent,
    // PAS
    PasDashboardComponent,
    SolicitudesComponent,
    PrestamosActivosComponent,
    MaterialesComponent,
    ReportesComponent,
    UsuariosComponent,
    AniadirMaterialComponent,
    PerfilAlumnoComponent,
    // Shared
    HeaderComponent,
    SidebarComponent,
    ModalComponent,
    PrestamoPresencialComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    CommonModule,
    FormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true
    }
  ],
  exports: [
    ModalComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
