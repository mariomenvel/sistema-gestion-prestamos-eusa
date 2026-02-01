import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Servicio para controlar el estado del Sidebar.
 * Permite toggle del menú lateral, especialmente útil para móvil.
 */
@Injectable({
    providedIn: 'root'
})
export class SidebarService {

    private isOpenSubject = new BehaviorSubject<boolean>(false);
    public isOpen$: Observable<boolean> = this.isOpenSubject.asObservable();

    constructor() { }

    /**
     * Alterna el estado del sidebar (abierto/cerrado)
     */
    toggle(): void {
        this.isOpenSubject.next(!this.isOpenSubject.value);
    }

    /**
     * Abre el sidebar
     */
    open(): void {
        this.isOpenSubject.next(true);
    }

    /**
     * Cierra el sidebar
     */
    close(): void {
        this.isOpenSubject.next(false);
    }

    /**
     * Obtiene el estado actual del sidebar
     */
    get isOpen(): boolean {
        return this.isOpenSubject.value;
    }
}
