
export interface Categoria {
    id: number;
    codigo: string;
    nombre: string;
    tipo: 'libro' | 'equipo';
    activa: boolean;
  
  // Metadatos (Sequalize)
  createdAt?: string;
  updatedAt?: string;
}