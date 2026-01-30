var models = require('../models');
var nodemailer = require('nodemailer');

/**
 * Crea un registro en la tabla notificaciones
 */
function crearNotificacion(datos) {
    return models.Notificacion.create({
        usuario_id: datos.usuario_id,
        tipo: datos.tipo, // 'estado_solicitud'
        prestamo_id: datos.prestamo_id || null,
        solicitud_id: datos.solicitud_id || null,
        canal: 'email',
        enviada_en: new Date(),
        payload: JSON.stringify(datos.payload)
    });
}

/**
 * Envía un email usando nodemailer
 * @param {string} destinatario - Email del destinatario
 * @param {string} asunto - Asunto del email
 * @param {string} cuerpo - Cuerpo del email (puede ser HTML)
 */
function enviarEmail(destinatario, asunto, cuerpo) {
    console.log('📧 EMAIL A ENVIAR:');
    console.log('Para:', destinatario);
    console.log('Asunto:', asunto);
    console.log('Cuerpo:', cuerpo);
    console.log('---');


    var nodemailer = require('nodemailer');

    var transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false  // Permitir certificados autofirmados en desarrollo
        }
    });

    var mailOptions = {
        from: process.env.EMAIL_FROM,
        to: destinatario,
        subject: asunto,
        html: cuerpo
    };

    return transporter.sendMail(mailOptions)
        .then(function (info) {
            console.log('✅ Email enviado correctamente:', info.messageId);
            return info;
        })
        .catch(function (error) {
            console.error('❌ Error enviando email:', error);
            throw error;
        });
}
/**
 * Envía email de aprobación de solicitud
 * @param {Object} usuario - Datos del usuario
 * @param {Object} prestamo - Datos del préstamo (debe incluir prestamoItems con ejemplares/unidades)
 * @param {string} idioma - 'es' o 'en'
 */
function enviarEmailAprobacion(usuario, prestamo, idioma) {
    var asunto, cuerpo;

    // Construir lista de materiales aprobados
    var listaMateriales = '';
    if (prestamo.items && prestamo.items.length > 0) {
        listaMateriales = '<ul style="margin: 10px 0; padding-left: 20px;">';

        prestamo.items.forEach(function (item) {
            var nombreMaterial = '';
            var codigoBarra = '';

            if (item.Ejemplar) {
                nombreMaterial = item.Ejemplar.libro ? item.Ejemplar.libro.titulo : 'Libro';
                codigoBarra = item.Ejemplar.codigo_barra;
            } else if (item.Unidad) {
                if (item.Unidad.equipo) {
                    // Construir nombre con marca + modelo
                    nombreMaterial = (item.Unidad.equipo.marca + ' ' + item.Unidad.equipo.modelo).trim();
                    if (!nombreMaterial) {
                        nombreMaterial = 'Equipo';
                    }
                } else {
                    nombreMaterial = 'Equipo';
                }
                codigoBarra = item.Unidad.codigo_barra;
            }

            listaMateriales += '<li><strong>' + nombreMaterial + '</strong> (Código: ' + codigoBarra + ')</li>';
        });

        listaMateriales += '</ul>';
    }

    if (idioma === 'en') {
        asunto = 'Loan Request Approved - EUSA Library';
        cuerpo = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Your loan request has been approved</h2>
        <p>Dear ${usuario.nombre},</p>
        <p>We are pleased to inform you that your loan request has been <strong>approved</strong>.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Loan Details:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Start date:</strong> ${new Date(prestamo.fecha_inicio).toLocaleDateString('en-GB')}</li>
            <li><strong>Return date:</strong> ${new Date(prestamo.fecha_devolucion_prevista).toLocaleDateString('en-GB')}</li>
          </ul>
          
          <h3 style="margin-top: 20px;">Approved Materials:</h3>
          ${listaMateriales || '<p style="color: #6c757d; font-size: 14px;">No materials listed</p>'}
        </div>
        
        <p>Please come to the <strong>Technical Service Department</strong> during opening hours to pick up your materials.</p>
        <p>If you have any questions, don't hesitate to contact us.</p>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        <p style="color: #6c757d; font-size: 12px;">
          EUSA Library<br>
          This is an automated message, please do not reply.
        </p>
      </div>
    `;
    } else {
        asunto = 'Solicitud de Préstamo Aprobada - Biblioteca EUSA';
        cuerpo = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Tu solicitud de préstamo ha sido aprobada</h2>
        <p>Estimado/a ${usuario.nombre},</p>
        <p>Te informamos que tu solicitud de préstamo ha sido <strong>aprobada</strong>.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Detalles del préstamo:</h3>
          <ul style="list-style: none; padding: 0;">
            <li><strong>Fecha de inicio:</strong> ${new Date(prestamo.fecha_inicio).toLocaleDateString('es-ES')}</li>
            <li><strong>Fecha de devolución:</strong> ${new Date(prestamo.fecha_devolucion_prevista).toLocaleDateString('es-ES')}</li>
          </ul>
          
          <h3 style="margin-top: 20px;">Materiales aprobados:</h3>
          ${listaMateriales || '<p style="color: #6c757d; font-size: 14px;">No hay materiales listados</p>'}
        </div>
        
        <p>Por favor, pasa por el <strong>departamento de Servicio Técnico</strong> para recoger el material.</p>
        <p>Gracias por usar nuestro servicio.</p>
        
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        <p style="color: #6c757d; font-size: 12px;">
          Biblioteca EUSA<br>
          Este es un mensaje automático, por favor no respondas a este correo.
        </p>
      </div>
    `;
    }

    return enviarEmail(usuario.email, asunto, cuerpo);
}

/**
 * Envía email de rechazo de solicitud con plantilla
 */
function enviarEmailRechazo(usuario, solicitud, plantilla, idioma) {
    var asunto = idioma === 'en' ? plantilla.titulo_en : plantilla.titulo_es;
    var cuerpo = idioma === 'en' ? plantilla.cuerpo_en : plantilla.cuerpo_es;

    // Reemplazar variables en la plantilla
    cuerpo = cuerpo.replace(/\{\{nombre\}\}/g, usuario.nombre);
    cuerpo = cuerpo.replace(/\{\{fecha\}\}/g, new Date().toLocaleDateString(idioma === 'en' ? 'en-GB' : 'es-ES'));

    // Añadir estilo HTML básico si no lo tiene
    if (!cuerpo.includes('<html') && !cuerpo.includes('<div')) {
        cuerpo = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${cuerpo.replace(/\n/g, '<br>')}
        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        <p style="color: #6c757d; font-size: 12px;">
          ${idioma === 'en' ? 'EUSA Library' : 'Biblioteca EUSA'}<br>
          ${idioma === 'en' ? 'This is an automated message, please do not reply.' : 'Este es un mensaje automático, por favor no respondas a este correo.'}
        </p>
      </div>
    `;
    }

    return enviarEmail(usuario.email, asunto, cuerpo);
}

module.exports = {
    crearNotificacion: crearNotificacion,
    enviarEmail: enviarEmail,
    enviarEmailAprobacion: enviarEmailAprobacion,
    enviarEmailRechazo: enviarEmailRechazo
};