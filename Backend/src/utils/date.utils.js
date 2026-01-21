var Sequelize = require('sequelize');

/**
 * Obtiene la fecha de inicio del curso académico actual.
 * Se asume que el curso empieza el 1 de septiembre.
 * @returns {Date} Fecha de inicio del curso.
 */
function obtenerInicioCurso() {
    var hoy = new Date();
    var year = hoy.getFullYear();

    // INICIO DE CURSO: 1 de septiembre
    var inicio = new Date(year, 8, 1); // Mes 8 = septiembre (0-based)

    // Si todavía no hemos llegado a esa fecha este año,
    // el curso actual empezó el año anterior
    if (hoy < inicio) {
        inicio = new Date(year - 1, 8, 1);
    }

    return inicio;
}

/**
 * Parsea una fecha en formato "DD-MM" y devuelve un Date para el año actual o curso actual.
 * @param {string} str - Fecha en formato "DD-MM" (ej: "15-12").
 * @param {number} [yearOverride] - Año opcional.
 * @returns {Date} Objeto Date configurado a las 23:59:59.
 */
function parsearFecha(str, yearOverride) {
    if (!str) return null;

    var hoy = new Date();
    var year = yearOverride || hoy.getFullYear();
    var parts = str.split('-');

    if (parts.length !== 2) return null;

    var mes = parseInt(parts[1]) - 1; // 0-based
    var dia = parseInt(parts[0]);

    // Si no se especifica año, intentar deducir si es del curso actual
    // (Lógica original de usuarios.controller.js)
    if (!yearOverride) {
        if (hoy.getMonth() < 8 && mes > 8) {
            year = year - 1;
        }
    }

    return new Date(year, mes, dia, 23, 59, 59);
}

/**
 * Calcula el rango de fechas del trimestre actual basado en la configuración.
 * @param {Object} config - Objeto con claves TRIMESTRE_X_FIN (ej: { TRIMESTRE_1_FIN: '15-12' })
 * @returns {Object|null} { inicio: Date, fin: Date } o null si fuera de curso.
 */
function obtenerRangoTrimestreActual(config) {
    var hoy = new Date();
    var year = hoy.getFullYear();

    // Determinar año base del curso
    var mesActual = hoy.getMonth(); // 0-11
    var inicioCursoYear = (mesActual >= 8) ? year : year - 1;

    // Fechas fin teóricas (por defecto si no hay config)
    var strFinT1 = config.TRIMESTRE_1_FIN || '15-12';
    var strFinT2 = config.TRIMESTRE_2_FIN || '15-03';
    var strFinT3 = config.TRIMESTRE_3_FIN || '15-06';

    var finT1 = parsearFecha(strFinT1, inicioCursoYear); // Dic YearBase
    var finT2 = parsearFecha(strFinT2, inicioCursoYear + 1); // Marzo YearBase+1
    var finT3 = parsearFecha(strFinT3, inicioCursoYear + 1); // Junio YearBase+1

    // Fechas inicio calculadas a partir de los fines
    var inicioT1 = new Date(inicioCursoYear, 8, 1); // 1 Sept
    var inicioT2 = new Date(finT1); inicioT2.setDate(inicioT2.getDate() + 1); inicioT2.setHours(0, 0, 0, 0);
    var inicioT3 = new Date(finT2); inicioT3.setDate(inicioT3.getDate() + 1); inicioT3.setHours(0, 0, 0, 0);

    if (hoy <= finT1) return { inicio: inicioT1, fin: finT1, numero: 1 };
    if (hoy <= finT2) return { inicio: inicioT2, fin: finT2, numero: 2 };
    if (hoy <= finT3) return { inicio: inicioT3, fin: finT3, numero: 3 };

    return null;
}

/**
 * Calcula el siguiente día lectivo (Lunes a Viernes) a las 9:00 AM.
 * @param {Date} desdeFecha 
 * @returns {Date}
 */
function calcularSiguienteDiaLectivo(desdeFecha) {
    var fecha = new Date(desdeFecha);
    var diaSemana = fecha.getDay(); // 0 = Domingo, 1 = Lunes, ... 6 = Sabado

    // Si es Viernes (5) -> Lunes (+3 dias)
    // Si es Sabado (6)  -> Lunes (+2 dias)
    // Si es Domingo (0) -> Lunes (+1 dia)
    // Si es Lunes-Jueves -> Dia siguiente (+1 dia)

    if (diaSemana === 5) {
        fecha.setDate(fecha.getDate() + 3);
    } else if (diaSemana === 6) {
        fecha.setDate(fecha.getDate() + 2);
    } else {
        fecha.setDate(fecha.getDate() + 1);
    }

    // Fijar a las 9:00 AM
    fecha.setHours(9, 0, 0, 0);
    return fecha;
}

module.exports = {
    obtenerInicioCurso: obtenerInicioCurso,
    parsearFecha: parsearFecha,
    obtenerRangoTrimestreActual: obtenerRangoTrimestreActual,
    calcularSiguienteDiaLectivo: calcularSiguienteDiaLectivo
};
