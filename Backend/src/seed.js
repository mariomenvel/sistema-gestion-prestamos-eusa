require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
var models = require('./models');
var db = require('./db'); // Importante para sync
var bcrypt = require('bcrypt');

async function seed() {
  console.log('🌱 Iniciando UPDATE SEED (5+ rows per table)...');

  try {
    console.log('⚠️  RESETEANDO BASE DE DATOS...');
    await db.sequelize.sync({ force: true }); // Wipe total

    // Configuración Trimestres
    await models.Configuracion.bulkCreate([
      { clave: 'TRIMESTRE_1_FIN', valor: '15-12', descripcion: 'Fin T1' },
      { clave: 'TRIMESTRE_2_FIN', valor: '15-03', descripcion: 'Fin T2' },
      { clave: 'TRIMESTRE_3_FIN', valor: '15-06', descripcion: 'Fin T3' }
    ], { ignoreDuplicates: true });

    // Motivos de Rechazo (Standarized)
    await models.MotivoRechazo.bulkCreate([
      { titulo_es: 'Material no disponible', cuerpo_es: 'El material no se encuentra disponible.', titulo_en: 'Item not available', cuerpo_en: 'Item not available.' },
      { titulo_es: 'Sanción vigente', cuerpo_es: 'Tienes sanción activa.', titulo_en: 'Sanction active', cuerpo_en: 'You have an active sanction.' },
      { titulo_es: 'Fin de Curso', cuerpo_es: 'Cierre de préstamos por fin de curso.', titulo_en: 'End of Term', cuerpo_en: 'Loans closed.' },
      { titulo_es: 'Datos incompletos', cuerpo_es: 'Solicitud mal formada.', titulo_en: 'Incomplete data', cuerpo_en: 'Bad request.' },
      { titulo_es: 'Exceso de cupo', cuerpo_es: 'Has superado el límite de préstamos.', titulo_en: 'Quota exceeded', cuerpo_en: 'Limit reached.' }
    ]);

    // Grados
    var grados = await models.Grado.bulkCreate([
      { nombre: 'Periodismo' },
      { nombre: 'Publicidad y RRPP' },
      { nombre: 'Comunicación Audiovisual' },
      { nombre: 'Doble Grado PER+CAV' },
      { nombre: 'Ciclo DAM' },
      { nombre: 'Ciclo DAW' } // 6 grados
    ]);
    var gPer = grados[0]; var gPub = grados[1]; var gCav = grados[2]; var gDam = grados[4];

    // Usuarios (1 Admin + 3 Profes + 6 Alumnos)
    var pass = await bcrypt.hash('123456', 10);
    var pas = await models.Usuario.create({ email: 'pas@eusa.es', password_hash: pass, nombre: 'Admin', apellidos: 'PAS', telefono: '+34955123456', rol: 'pas' });

    var profes = await models.Usuario.bulkCreate([
      { email: 'prof1@eusa.es', password_hash: pass, nombre: 'Manuel', apellidos: 'Chaves', telefono: '+34612345001', rol: 'profesor' },
      { email: 'prof2@eusa.es', password_hash: pass, nombre: 'Laura', apellidos: 'Video', telefono: '+34612345002', rol: 'profesor' },
      { email: 'prof3@eusa.es', password_hash: pass, nombre: 'David', apellidos: 'Codigo', telefono: '+34612345003', rol: 'profesor' },
      { email: 'prof4@eusa.es', password_hash: pass, nombre: 'Maria', apellidos: 'Mates', telefono: '+34612345004', rol: 'profesor' },
      { email: 'prof5@eusa.es', password_hash: pass, nombre: 'Jose', apellidos: 'Historia', telefono: '+34612345005', rol: 'profesor' }
    ]);

    var alumnos = await models.Usuario.bulkCreate([
      { email: 'alum1@eusa.es', password_hash: pass, nombre: 'Juan', apellidos: 'Uno', telefono: '+34622111001', rol: 'alumno', grado_id: gPer.id, curso: 1, codigo_tarjeta: 'CARD-1' },
      { email: 'alum2@eusa.es', password_hash: pass, nombre: 'Pedro', apellidos: 'Dos', telefono: '+34622111002', rol: 'alumno', grado_id: gCav.id, curso: 2, codigo_tarjeta: 'CARD-2' },
      { email: 'alum3@eusa.es', password_hash: pass, nombre: 'Luis', apellidos: 'Tres', telefono: '+34622111003', rol: 'alumno', grado_id: gDam.id, curso: 1, codigo_tarjeta: 'CARD-3' },
      { email: 'alum4@eusa.es', password_hash: pass, nombre: 'Ana', apellidos: 'Cuatro', telefono: '+34622111004', rol: 'alumno', grado_id: gPub.id, curso: 3, codigo_tarjeta: 'CARD-4' },
      { email: 'alum5@eusa.es', password_hash: pass, nombre: 'Eva', apellidos: 'Cinco', telefono: '+34622111005', rol: 'alumno', grado_id: gCav.id, curso: 4, codigo_tarjeta: 'CARD-5' },
      { email: 'alum6@eusa.es', password_hash: pass, nombre: 'Cris', apellidos: 'Seis', telefono: '+34622111006', rol: 'alumno', grado_id: gDam.id, curso: 2, codigo_tarjeta: 'CARD-6' }
    ]);

    // Categorías
    var cats = await models.Categoria.bulkCreate([
      { nombre: 'Fotografía', activa: true },
      { nombre: 'Iluminación', activa: true },
      { nombre: 'Sonido', activa: true },
      { nombre: 'Informática', activa: true },
      { nombre: 'Accesorios', activa: true }
    ]);

    // Nombres (Generic Equipment Names) - REQUIRED FIELD FIX
    var nombres = await models.Nombre.bulkCreate([
      { nombre: 'Cámara Réflex', activa: true },
      { nombre: 'Trípode Video', activa: true },
      { nombre: 'Micrófono Corbata', activa: true },
      { nombre: 'Portátil Windows', activa: true },
      { nombre: 'Foco LED', activa: true }
    ]);

    // Equipos (Specific Models linked to Nombres & Cats)
    var equipos = await models.Equipo.bulkCreate([
      { nombre_id: nombres[0].id, categoria_id: cats[0].id, marca: 'Canon', modelo: '5D Mark IV', descripcion: 'Full Frame' },
      { nombre_id: nombres[0].id, categoria_id: cats[0].id, marca: 'Sony', modelo: 'A7 III', descripcion: 'Mirrorless' },
      { nombre_id: nombres[1].id, categoria_id: cats[0].id, marca: 'Manfrotto', modelo: '055', descripcion: 'Trípode robusto' },
      { nombre_id: nombres[2].id, categoria_id: cats[2].id, marca: 'Sennheiser', modelo: 'G4', descripcion: 'Inalámbrico' },
      { nombre_id: nombres[3].id, categoria_id: cats[3].id, marca: 'Dell', modelo: 'Latitude', descripcion: 'i5 8GB' },
      { nombre_id: nombres[4].id, categoria_id: cats[1].id, marca: 'Aputure', modelo: '120d', descripcion: 'Luz día' }
    ]);

    // Unidades (Physical Items) - Generamos 10 unidades
    var unidades = [];
    for (let i = 0; i < equipos.length; i++) {
      unidades.push(await models.Unidad.create({ equipo_id: equipos[i].id, codigo_barra: 'EQ-' + i + '-A', estado_fisico: 'funciona', esta_prestado: false }));
      unidades.push(await models.Unidad.create({ equipo_id: equipos[i].id, codigo_barra: 'EQ-' + i + '-B', estado_fisico: 'funciona', esta_prestado: false }));
    }
    // Marcar algunas rotas o prestadas
    unidades[0].esta_prestado = true; await unidades[0].save();
    unidades[2].estado_fisico = 'averiado'; await unidades[2].save();

    // Libros & Géneros
    var generos = await models.Genero.bulkCreate([
      { nombre: 'Novela' }, { nombre: 'Manual Técnico' }, { nombre: 'Ensayo' }, { nombre: 'Arte' }, { nombre: 'Historia' }
    ]);

    var libros = await models.Libro.bulkCreate([
      { titulo: 'Clean Architecture', autor: 'Uncle Bob', genero_id: generos[1].id, libro_numero: 'L001' },
      { titulo: 'El Quijote', autor: 'Cervantes', genero_id: generos[0].id, libro_numero: 'L002' },
      { titulo: 'La Luz en Cine', autor: 'Storaro', genero_id: generos[3].id, libro_numero: 'L003' },
      { titulo: 'Sapiens', autor: 'Harari', genero_id: generos[2].id, libro_numero: 'L004' },
      { titulo: 'JavaScript Good Parts', autor: 'Crockford', genero_id: generos[1].id, libro_numero: 'L005' }
    ]);

    // Ejemplares
    var ejemplares = [];
    for (let i = 0; i < libros.length; i++) {
      ejemplares.push(await models.Ejemplar.create({ libro_id: libros[i].id, codigo_barra: 'BK-' + i + '-A', estado: 'disponible' }));
      ejemplares.push(await models.Ejemplar.create({ libro_id: libros[i].id, codigo_barra: 'BK-' + i + '-B', estado: 'disponible' }));
    }
    ejemplares[0].estado = 'prestado'; await ejemplares[0].save();

    // Solicitudes (Mix types and states)
    // Sol 1: Pendiente Propio
    var s1 = await models.Solicitud.create({ usuario_id: alumnos[0].id, tipo: 'uso_propio', estado: 'pendiente', normas_aceptadas: true, observaciones: 'Urgente' });
    await models.SolicitudItem.create({ solicitud_id: s1.id, equipo_id: equipos[0].id, cantidad: 1 });

    // Sol 2: Aprobada Trabajo (Avalada Prof 1)
    var s2 = await models.Solicitud.create({ usuario_id: alumnos[1].id, tipo: 'prof_trabajo', estado: 'aprobada', normas_aceptadas: true, profesor_asociado_id: profes[0].id, grado_id: gPer.id, gestor: pas.id, resuelta_en: new Date() });
    await models.SolicitudItem.create({ solicitud_id: s2.id, equipo_id: equipos[1].id, cantidad: 1 });

    // Sol 3: Rechazada
    var s3 = await models.Solicitud.create({ usuario_id: alumnos[2].id, tipo: 'uso_propio', estado: 'rechazada', normas_aceptadas: true, gestor: pas.id, resuelta_en: new Date(), motivo_rechazo: 'No hay stock' });
    await models.SolicitudItem.create({ solicitud_id: s3.id, libro_id: libros[0].id, cantidad: 1 });

    // Sol 4: Pendiente Trabajo
    var s4 = await models.Solicitud.create({ usuario_id: alumnos[3].id, tipo: 'prof_trabajo', estado: 'pendiente', normas_aceptadas: true, profesor_asociado_id: profes[1].id, grado_id: gPub.id });
    await models.SolicitudItem.create({ solicitud_id: s4.id, equipo_id: equipos[4].id, cantidad: 1 });

    // Sol 5: Aprobada Propio (Generará Préstamo)
    var s5 = await models.Solicitud.create({ usuario_id: alumnos[4].id, tipo: 'uso_propio', estado: 'aprobada', normas_aceptadas: true, gestor: pas.id });
    await models.SolicitudItem.create({ solicitud_id: s5.id, equipo_id: equipos[2].id, cantidad: 1 });

    // Préstamos
    // Prestamo 1: Activo (de Sol 2)
    var p1 = await models.Prestamo.create({ usuario_id: alumnos[1].id, solicitud_id: s2.id, tipo: 'a', estado: 'activo', fecha_inicio: new Date(), fecha_devolucion_prevista: new Date(Date.now() + 86400000), profesor_solicitante_id: profes[0].id });
    await models.PrestamoItem.create({ prestamo_id: p1.id, unidad_id: unidades[2].id, devuelto: false }); // Sony A7 unit

    // Prestamo 2: Vencido (de Sol 5)
    var p2 = await models.Prestamo.create({ usuario_id: alumnos[4].id, solicitud_id: s5.id, tipo: 'b', estado: 'vencido', fecha_inicio: new Date(Date.now() - 5 * 86400000), fecha_devolucion_prevista: new Date(Date.now() - 1 * 86400000) });
    await models.PrestamoItem.create({ prestamo_id: p2.id, unidad_id: unidades[4].id, devuelto: false });

    // Prestamo 3: Cerrado
    var p3 = await models.Prestamo.create({ usuario_id: alumnos[5].id, tipo: 'c', estado: 'cerrado', fecha_inicio: new Date(Date.now() - 10 * 86400000), fecha_devolucion_prevista: new Date(Date.now() - 9 * 86400000), fecha_devolucion_real: new Date(Date.now() - 9 * 86400000) });

    // Sanciones
    await models.Sancion.create({ usuario_id: alumnos[5].id, severidad: 'leve', estado: 'historica', inicio: new Date('2025-01-01'), fin: new Date('2025-01-07'), motivo: 'Retraso leve' });
    await models.Sancion.create({ usuario_id: alumnos[2].id, severidad: 'grave', estado: 'activa', inicio: new Date(), fin: new Date(Date.now() + 15 * 86400000), motivo: 'Rotura Material' });

    // Generación extra para garantizar 5+ filas
    for (let i = 0; i < 5; i++) {
      // Prestamo dummy cerrado
      let pExtra = await models.Prestamo.create({
        usuario_id: alumnos[i % alumnos.length].id,
        tipo: 'b',
        estado: 'cerrado',
        fecha_inicio: new Date(Date.now() - 30 * 86400000),
        fecha_devolucion_prevista: new Date(Date.now() - 25 * 86400000),
        fecha_devolucion_real: new Date(Date.now() - 25 * 86400000)
      });
      await models.PrestamoItem.create({ prestamo_id: pExtra.id, unidad_id: unidades[i % unidades.length].id, devuelto: true });

      // Sancion dummy histórica
      await models.Sancion.create({
        usuario_id: alumnos[i % alumnos.length].id,
        severidad: 'leve',
        estado: 'historica',
        inicio: new Date(Date.now() - 60 * 86400000),
        fin: new Date(Date.now() - 55 * 86400000),
        motivo: 'Seed generado #' + i
      });
    }

    console.log('✅ MEGA-SEED 5+ ROWS COMPLETO');
    process.exit();

  } catch (e) {
    console.error('❌ Error Major:', e);
    process.exit(1);
  }
}

seed();
