/**
 * Normaliza texto eliminando tildes y convirtiendo a minúsculas.
 * Util para búsqueda robusta en español.
 */
export function normalizarTexto(texto: string): string {
    if (!texto) return '';
    return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
