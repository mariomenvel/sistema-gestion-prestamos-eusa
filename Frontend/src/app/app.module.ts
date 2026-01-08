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
import { AprobarSolicitudComponent } from './features/pas/modales/aprobar-solicitud/aprobar-solicitud.component';
import { RechazarSolicitudComponent } from './features/pas/modales/rechazar-solicitud/rechazar-solicitud.component';
import { AniadirMaterialComponent } from './features/pas/modales/aniadir-material/aniadir-material.component';
import { PerfilAlumnoComponent } from './features/pas/modales/perfil-alumno/perfil-alumno.component';

// Shared Components
import { HeaderComponent } from './shared/components/header/header.component';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    // Auth
    LoginComponent,
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
    AprobarSolicitudComponent,
    RechazarSolicitudComponent,
    AniadirMaterialComponent,
    PerfilAlumnoComponent,
    // Shared
    HeaderComponent,
    SidebarComponent,
    ModalComponent
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
  bootstrap: [AppComponent]
})
export class AppModule { }
