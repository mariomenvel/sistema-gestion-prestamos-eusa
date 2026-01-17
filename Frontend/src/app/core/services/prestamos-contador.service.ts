import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ContadorPrestamosB } from '../models/contador-prestamos-b.interface';

@Injectable({
    providedIn: 'root'
})
export class PrestamosContadorService {
    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    obtenerContador(): Observable<ContadorPrestamosB> {
        var token = this.authService.getToken();
        var headers = new HttpHeaders({
            'Authorization': 'Bearer ' + token
        });

        var url = this.apiUrl + '/usuarios/me/contador-prestamos-b';

        return this.http.get<ContadorPrestamosB>(url, { headers: headers }).pipe(
            catchError(function (error) {
                console.error('Error al obtener contador de préstamos B:', error);
                return throwError(function () { return error; });
            })
        );
    }
}
