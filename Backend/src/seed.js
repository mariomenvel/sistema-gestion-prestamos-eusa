require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
var models = require('./models');
var db = require('./db');
var bcrypt = require('bcrypt');

async function seed() {
  console.log('🌱 Iniciando SEED COMPLETO (todos los campos)...');

  try {
    console.log('⚠️  RESETEANDO BASE DE DATOS...');
    await db.sequelize.sync({ force: true });

    // ============================================================
    // CONFIGURACIONES DEL SISTEMA
    // ============================================================
    console.log('⚙️  Creando configuraciones...');
    await models.Configuracion.bulkCreate([
      { clave: 'TRIMESTRE_1_INICIO', valor: '15-09', descripcion: 'Inicio del primer trimestre (dd-mm)' },
      { clave: 'TRIMESTRE_1_FIN', valor: '15-12', descripcion: 'Fin del primer trimestre (dd-mm)' },
      { clave: 'TRIMESTRE_2_INICIO', valor: '08-01', descripcion: 'Inicio del segundo trimestre (dd-mm)' },
      { clave: 'TRIMESTRE_2_FIN', valor: '15-03', descripcion: 'Fin del segundo trimestre (dd-mm)' },
      { clave: 'TRIMESTRE_3_INICIO', valor: '01-04', descripcion: 'Inicio del tercer trimestre (dd-mm)' },
      { clave: 'TRIMESTRE_3_FIN', valor: '15-06', descripcion: 'Fin del tercer trimestre (dd-mm)' },
      { clave: 'MAX_PRESTAMOS_ALUMNO', valor: '3', descripcion: 'Máximo préstamos simultáneos para alumnos' },
      { clave: 'MAX_PRESTAMOS_PROFESOR', valor: '10', descripcion: 'Máximo préstamos simultáneos para profesores' },
      { clave: 'DIAS_PRESTAMO_TIPO_A', valor: '1', descripcion: 'Duración en días préstamo tipo A (diario)' },
      { clave: 'DIAS_PRESTAMO_TIPO_B', valor: '5', descripcion: 'Duración en días préstamo tipo B (semanal)' },
      { clave: 'DIAS_PRESTAMO_TIPO_C', valor: '30', descripcion: 'Duración en días préstamo tipo C (mensual)' },
      { clave: 'DIAS_AVISO_DEVOLUCION', valor: '2', descripcion: 'Días antes de vencimiento para enviar aviso' },
      { clave: 'EMAIL_BIBLIOTECA', valor: 'biblioteca@eusa.es', descripcion: 'Email de contacto de biblioteca' },
      { clave: 'HORARIO_ATENCION', valor: 'L-V 9:00-20:00', descripcion: 'Horario de atención al público' }
    ], { ignoreDuplicates: true });

    // ============================================================
    // MOTIVOS DE RECHAZO
    // ============================================================
    console.log('❌ Creando motivos de rechazo...');
    await models.MotivoRechazo.bulkCreate([
      { titulo_es: 'Material no disponible', cuerpo_es: 'Lamentablemente, el material solicitado no se encuentra disponible en este momento. Todos los ejemplares están actualmente en préstamo.', titulo_en: 'Item not available', cuerpo_en: 'Unfortunately, the requested item is not currently available. All copies are currently on loan.', clave: 'NO_STOCK' },
      { titulo_es: 'Sanción vigente', cuerpo_es: 'Tu cuenta tiene una sanción activa que impide realizar nuevos préstamos. Contacta con el PAS para más información.', titulo_en: 'Active sanction', cuerpo_en: 'Your account has an active sanction preventing new loans. Contact staff for more information.', clave: 'SANCION_ACTIVA' },
      { titulo_es: 'Cierre por fin de trimestre', cuerpo_es: 'Los préstamos están cerrados temporalmente por fin de trimestre. Se reabrirán el próximo período académico.', titulo_en: 'End of term closure', cuerpo_en: 'Loans are temporarily closed for end of term. They will reopen next academic period.', clave: 'FIN_TRIMESTRE' },
      { titulo_es: 'Datos de solicitud incompletos', cuerpo_es: 'La solicitud no contiene toda la información necesaria. Por favor, revisa los datos e inténtalo de nuevo.', titulo_en: 'Incomplete request data', cuerpo_en: 'The request does not contain all required information. Please review and try again.', clave: 'DATOS_INCOMPLETOS' },
      { titulo_es: 'Límite de préstamos alcanzado', cuerpo_es: 'Has alcanzado el número máximo de préstamos simultáneos permitidos para tu perfil.', titulo_en: 'Loan limit reached', cuerpo_en: 'You have reached the maximum number of simultaneous loans allowed for your profile.', clave: 'LIMITE_PRESTAMOS' },
      { titulo_es: 'Material reservado para docencia', cuerpo_es: 'Este material está reservado para uso exclusivo en actividades docentes durante este período.', titulo_en: 'Reserved for teaching', cuerpo_en: 'This item is reserved exclusively for teaching activities during this period.', clave: 'RESERVADO_DOCENCIA' },
      { titulo_es: 'Profesor no autorizado', cuerpo_es: 'El profesor indicado no tiene autorización para solicitar préstamos en tu nombre para esta actividad.', titulo_en: 'Unauthorized professor', cuerpo_en: 'The indicated professor is not authorized to request loans on your behalf for this activity.', clave: 'PROF_NO_AUTORIZADO' },
      { titulo_es: 'Material en mantenimiento', cuerpo_es: 'El equipo solicitado está actualmente en mantenimiento o reparación.', titulo_en: 'Item under maintenance', cuerpo_en: 'The requested equipment is currently under maintenance or repair.', clave: 'EN_MANTENIMIENTO' }
    ]);

    // ============================================================
    // GRADOS UNIVERSITARIOS
    // ============================================================
    console.log('🎓 Creando grados...');
    var grados = await models.Grado.bulkCreate([
      { nombre: 'Periodismo', activo: true },
      { nombre: 'Publicidad y RRPP', activo: true },
      { nombre: 'Comunicación Audiovisual', activo: true },
      { nombre: 'Doble Grado PER+CAV', activo: true },
      { nombre: 'Doble Grado PER+PUB', activo: true },
      { nombre: 'Ciclo DAM', activo: true },
      { nombre: 'Ciclo DAW', activo: true },
      { nombre: 'Máster Comunicación Digital', activo: true },
      { nombre: 'Máster Dirección de Cine', activo: false } // Inactivo para testing
    ]);
    var gPer = grados[0], gPub = grados[1], gCav = grados[2], gDoble = grados[3], gDam = grados[5], gDaw = grados[6], gMaster = grados[7];

    // ============================================================
    // GENERADOR DE CÓDIGO DE TARJETA
    // ============================================================
    let seedTime = Date.now();
    function generarCodigoTarjetaSeed() {
      var now = new Date(seedTime);
      seedTime += 1;
      var year = now.getFullYear();
      var month = (now.getMonth() + 1).toString().padStart(2, '0');
      var day = now.getDate().toString().padStart(2, '0');
      var hours = now.getHours().toString().padStart(2, '0');
      var minutes = now.getMinutes().toString().padStart(2, '0');
      var seconds = now.getSeconds().toString().padStart(2, '0');
      var ms = now.getMilliseconds().toString().padStart(3, '0');
      return 'EUSA' + year + month + day + hours + minutes + seconds + ms;
    }

    // ============================================================
    // USUARIOS - PAS
    // ============================================================
    console.log('👥 Creando usuarios PAS...');
    var pas1 = await models.Usuario.create({
      email: 'admin@eusa.es',
      password_hash: '123456',
      nombre: 'Administrador',
      apellidos: 'Sistema Principal',
      telefono: '+34955000001',
      codigo_tarjeta: generarCodigoTarjetaSeed(),
      rol: 'pas',
      estado_perfil: 'activo'
    });

    var pas2 = await models.Usuario.create({
      email: 'biblioteca@eusa.es',
      password_hash: '123456',
      nombre: 'María',
      apellidos: 'García López',
      telefono: '+34955000002',
      codigo_tarjeta: generarCodigoTarjetaSeed(),
      rol: 'pas',
      estado_perfil: 'activo'
    });

    var pas3 = await models.Usuario.create({
      email: 'audiovisuales@eusa.es',
      password_hash: '123456',
      nombre: 'Carlos',
      apellidos: 'Ruiz Fernández',
      telefono: '+34955000003',
      codigo_tarjeta: generarCodigoTarjetaSeed(),
      rol: 'pas',
      estado_perfil: 'activo'
    });

    var pasInactivo = await models.Usuario.create({
      email: 'pas.inactivo@eusa.es',
      password_hash: '123456',
      nombre: 'Juan',
      apellidos: 'Martínez Pérez',
      telefono: '+34955000004',
      codigo_tarjeta: generarCodigoTarjetaSeed(),
      rol: 'pas',
      estado_perfil: 'inactivo'
    });

    // ============================================================
    // USUARIOS - PROFESORES
    // ============================================================
    console.log('👨‍🏫 Creando profesores...');
    var profes = await models.Usuario.bulkCreate([
      { email: 'manuel.chaves@eusa.es', password_hash: '123456', nombre: 'Manuel', apellidos: 'Chaves Jiménez', telefono: '+34612001001', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'profesor', estado_perfil: 'activo' },
      { email: 'laura.video@eusa.es', password_hash: '123456', nombre: 'Laura', apellidos: 'Vídeo Montero', telefono: '+34612001002', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'profesor', estado_perfil: 'activo' },
      { email: 'david.codigo@eusa.es', password_hash: '123456', nombre: 'David', apellidos: 'Código Navarro', telefono: '+34612001003', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'profesor', estado_perfil: 'activo' },
      { email: 'maria.publicidad@eusa.es', password_hash: '123456', nombre: 'María', apellidos: 'Publicidad Gómez', telefono: '+34612001004', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'profesor', estado_perfil: 'activo' },
      { email: 'jose.historia@eusa.es', password_hash: '123456', nombre: 'José', apellidos: 'Historia Blanco', telefono: '+34612001005', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'profesor', estado_perfil: 'activo' },
      { email: 'ana.comunicacion@eusa.es', password_hash: '123456', nombre: 'Ana', apellidos: 'Comunicación Sánchez', telefono: '+34612001006', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'profesor', estado_perfil: 'activo' },
      { email: 'prof.bloqueado@eusa.es', password_hash: '123456', nombre: 'Pedro', apellidos: 'Profesor Bloqueado', telefono: '+34612001007', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'profesor', estado_perfil: 'bloqueado' }
    ], { individualHooks: true });

    // ============================================================
    // USUARIOS - ALUMNOS (todos los campos rellenos)
    // ============================================================
    console.log('👨‍🎓 Creando alumnos...');
    var alumnos = await models.Usuario.bulkCreate([
      // Alumno principal para testing - TODOS LOS DATOS COMPLETOS
      { email: 'alumno1@eusa.es', password_hash: '123456', nombre: 'Alumno', apellidos: 'Uno Testing', telefono: '+34622000000', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_uni', grado: 'Periodismo', grado_id: gPer.id, curso: 2, fecha_inicio_est: new Date('2024-09-15'), fecha_fin_prev: new Date('2028-06-30') },

      // Periodismo
      { email: 'alba.periodismo@eusa.es', password_hash: '123456', nombre: 'Alba', apellidos: 'Moreno Díaz', telefono: '+34622001001', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_uni', grado: 'Periodismo', grado_id: gPer.id, curso: 1, fecha_inicio_est: new Date('2025-09-15'), fecha_fin_prev: new Date('2029-06-30') },
      { email: 'carlos.periodismo@eusa.es', password_hash: '123456', nombre: 'Carlos', apellidos: 'Fernández Ruiz', telefono: '+34622001002', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_uni', grado: 'Periodismo', grado_id: gPer.id, curso: 2, fecha_inicio_est: new Date('2024-09-15'), fecha_fin_prev: new Date('2028-06-30') },
      { email: 'lucia.periodismo@eusa.es', password_hash: '123456', nombre: 'Lucía', apellidos: 'García Martín', telefono: '+34622001003', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_uni', grado: 'Periodismo', grado_id: gPer.id, curso: 3, fecha_inicio_est: new Date('2023-09-15'), fecha_fin_prev: new Date('2027-06-30') },
      { email: 'miguel.periodismo@eusa.es', password_hash: '123456', nombre: 'Miguel', apellidos: 'López Sánchez', telefono: '+34622001004', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_uni', grado: 'Periodismo', grado_id: gPer.id, curso: 4, fecha_inicio_est: new Date('2022-09-15'), fecha_fin_prev: new Date('2026-06-30') },

      // Publicidad y RRPP
      { email: 'paula.publicidad@eusa.es', password_hash: '123456', nombre: 'Paula', apellidos: 'Navarro Torres', telefono: '+34622002001', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_uni', grado: 'Publicidad y RRPP', grado_id: gPub.id, curso: 1, fecha_inicio_est: new Date('2025-09-15'), fecha_fin_prev: new Date('2029-06-30') },
      { email: 'sergio.publicidad@eusa.es', password_hash: '123456', nombre: 'Sergio', apellidos: 'Ramírez Jiménez', telefono: '+34622002002', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_uni', grado: 'Publicidad y RRPP', grado_id: gPub.id, curso: 2, fecha_inicio_est: new Date('2024-09-15'), fecha_fin_prev: new Date('2028-06-30') },
      { email: 'elena.publicidad@eusa.es', password_hash: '123456', nombre: 'Elena', apellidos: 'Gómez Blanco', telefono: '+34622002003', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_uni', grado: 'Publicidad y RRPP', grado_id: gPub.id, curso: 3, fecha_inicio_est: new Date('2023-09-15'), fecha_fin_prev: new Date('2027-06-30') },

      // Comunicación Audiovisual
      { email: 'daniel.cav@eusa.es', password_hash: '123456', nombre: 'Daniel', apellidos: 'Herrera Castro', telefono: '+34622003001', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_uni', grado: 'Comunicación Audiovisual', grado_id: gCav.id, curso: 1, fecha_inicio_est: new Date('2025-09-15'), fecha_fin_prev: new Date('2029-06-30') },
      { email: 'marta.cav@eusa.es', password_hash: '123456', nombre: 'Marta', apellidos: 'Ortiz Vega', telefono: '+34622003002', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_uni', grado: 'Comunicación Audiovisual', grado_id: gCav.id, curso: 2, fecha_inicio_est: new Date('2024-09-15'), fecha_fin_prev: new Date('2028-06-30') },
      { email: 'javier.cav@eusa.es', password_hash: '123456', nombre: 'Javier', apellidos: 'Ramos Peña', telefono: '+34622003003', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_uni', grado: 'Comunicación Audiovisual', grado_id: gCav.id, curso: 3, fecha_inicio_est: new Date('2023-09-15'), fecha_fin_prev: new Date('2027-06-30') },
      { email: 'irene.cav@eusa.es', password_hash: '123456', nombre: 'Irene', apellidos: 'Silva Molina', telefono: '+34622003004', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_uni', grado: 'Comunicación Audiovisual', grado_id: gCav.id, curso: 4, fecha_inicio_est: new Date('2022-09-15'), fecha_fin_prev: new Date('2026-06-30') },

      // Doble Grado
      { email: 'andrea.doble@eusa.es', password_hash: '123456', nombre: 'Andrea', apellidos: 'Delgado Romero', telefono: '+34622004001', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_uni', grado: 'Doble Grado PER+CAV', grado_id: gDoble.id, curso: 2, fecha_inicio_est: new Date('2024-09-15'), fecha_fin_prev: new Date('2029-06-30') },
      { email: 'pablo.doble@eusa.es', password_hash: '123456', nombre: 'Pablo', apellidos: 'Santos Iglesias', telefono: '+34622004002', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_uni', grado: 'Doble Grado PER+CAV', grado_id: gDoble.id, curso: 3, fecha_inicio_est: new Date('2023-09-15'), fecha_fin_prev: new Date('2028-06-30') },

      // Ciclo DAM
      { email: 'marcos.dam@eusa.es', password_hash: '123456', nombre: 'Marcos', apellidos: 'Prieto Cano', telefono: '+34622005001', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_sup', grado: 'Ciclo DAM', grado_id: gDam.id, curso: 1, fecha_inicio_est: new Date('2025-09-15'), fecha_fin_prev: new Date('2027-06-30') },
      { email: 'sofia.dam@eusa.es', password_hash: '123456', nombre: 'Sofía', apellidos: 'Méndez Gil', telefono: '+34622005002', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_sup', grado: 'Ciclo DAM', grado_id: gDam.id, curso: 2, fecha_inicio_est: new Date('2024-09-15'), fecha_fin_prev: new Date('2026-06-30') },

      // Ciclo DAW
      { email: 'raul.daw@eusa.es', password_hash: '123456', nombre: 'Raúl', apellidos: 'Guerrero Muñoz', telefono: '+34622006001', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_sup', grado: 'Ciclo DAW', grado_id: gDaw.id, curso: 1, fecha_inicio_est: new Date('2025-09-15'), fecha_fin_prev: new Date('2027-06-30') },
      { email: 'nuria.daw@eusa.es', password_hash: '123456', nombre: 'Nuria', apellidos: 'Vargas Reyes', telefono: '+34622006002', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'grado_sup', grado: 'Ciclo DAW', grado_id: gDaw.id, curso: 2, fecha_inicio_est: new Date('2024-09-15'), fecha_fin_prev: new Date('2026-06-30') },

      // Máster
      { email: 'victor.master@eusa.es', password_hash: '123456', nombre: 'Víctor', apellidos: 'Campos Serrano', telefono: '+34622007001', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'activo', tipo_estudios: 'master', grado: 'Máster Comunicación Digital', grado_id: gMaster.id, curso: 1, fecha_inicio_est: new Date('2025-09-15'), fecha_fin_prev: new Date('2026-06-30') },

      // Estados especiales para testing
      { email: 'alumno.bloqueado@eusa.es', password_hash: '123456', nombre: 'Test', apellidos: 'Bloqueado User', telefono: '+34622008001', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'bloqueado', tipo_estudios: 'grado_uni', grado: 'Periodismo', grado_id: gPer.id, curso: 2 },
      { email: 'alumno.inactivo@eusa.es', password_hash: '123456', nombre: 'Test', apellidos: 'Inactivo User', telefono: '+34622008002', codigo_tarjeta: generarCodigoTarjetaSeed(), rol: 'alumno', estado_perfil: 'inactivo', tipo_estudios: 'grado_uni', grado: 'Periodismo', grado_id: gPer.id, curso: 3 }
    ], { individualHooks: true });

    // ============================================================
    // CATEGORÍAS DE EQUIPOS
    // ============================================================
    console.log('📁 Creando categorías...');
    var cats = await models.Categoria.bulkCreate([
      { nombre: 'Fotografía', activa: true },
      { nombre: 'Iluminación', activa: true },
      { nombre: 'Sonido', activa: true },
      { nombre: 'Informática', activa: true },
      { nombre: 'Accesorios', activa: true },
      { nombre: 'Video', activa: true },
      { nombre: 'Streaming', activa: true },
      { nombre: 'Almacenamiento', activa: false } // Inactiva para testing
    ]);
    var catFoto = cats[0], catIlu = cats[1], catSon = cats[2], catInfo = cats[3], catAcc = cats[4], catVid = cats[5], catStr = cats[6];

    // ============================================================
    // NOMBRES (Tipos genéricos de equipos)
    // ============================================================
    console.log('📝 Creando tipos de equipos...');
    var nombres = await models.Nombre.bulkCreate([
      { nombre: 'Cámara Réflex', activa: true },
      { nombre: 'Cámara Mirrorless', activa: true },
      { nombre: 'Trípode Video', activa: true },
      { nombre: 'Trípode Foto', activa: true },
      { nombre: 'Micrófono Corbata', activa: true },
      { nombre: 'Micrófono Boom', activa: true },
      { nombre: 'Micrófono USB', activa: true },
      { nombre: 'Portátil Windows', activa: true },
      { nombre: 'Portátil Mac', activa: true },
      { nombre: 'Foco LED', activa: true },
      { nombre: 'Panel LED', activa: true },
      { nombre: 'Softbox', activa: true },
      { nombre: 'Grabadora Audio', activa: true },
      { nombre: 'Tarjeta SD', activa: true },
      { nombre: 'Disco Duro Externo', activa: true },
      { nombre: 'Gimbal', activa: true },
      { nombre: 'Drone', activa: true },
      { nombre: 'Webcam', activa: true },
      { nombre: 'Capturadora', activa: true },
      { nombre: 'Kit Streaming', activa: false } // Inactivo para testing
    ]);

    // ============================================================
    // EQUIPOS (Modelos específicos con TODOS los campos)
    // ============================================================
    console.log('📷 Creando equipos...');
    var equipos = await models.Equipo.bulkCreate([
      // FOTOGRAFÍA
      { nombre_id: nombres[0].id, categoria_id: catFoto.id, marca: 'Canon', modelo: 'EOS 5D Mark IV', descripcion: 'Cámara Full Frame profesional. 30.4MP, video 4K, dual pixel AF. Ideal para fotografía de estudio y eventos.', foto_url: 'assets/images/canon_5d_mark_iv.jpg' },
      { nombre_id: nombres[0].id, categoria_id: catFoto.id, marca: 'Canon', modelo: 'EOS 90D', descripcion: 'Cámara APS-C versátil. 32.5MP, video 4K, 10fps. Perfecta para deportes y naturaleza.', foto_url: 'assets/images/canon_90d.jpg' },
      { nombre_id: nombres[1].id, categoria_id: catFoto.id, marca: 'Sony', modelo: 'A7 III', descripcion: 'Mirrorless Full Frame. 24.2MP, estabilización 5 ejes, 693 puntos AF. Excelente en baja luz.', foto_url: 'assets/images/sony_a7iii.jpg' },
      { nombre_id: nombres[1].id, categoria_id: catFoto.id, marca: 'Sony', modelo: 'A6400', descripcion: 'Mirrorless APS-C compacta. 24.2MP, pantalla abatible, ideal vlogging y viajes.', foto_url: 'assets/images/sony_a6400.jpg' },
      { nombre_id: nombres[1].id, categoria_id: catFoto.id, marca: 'Panasonic', modelo: 'GH5', descripcion: 'Micro 4/3 para video profesional. 4K 60fps, 10-bit interno. Referencia en video.', foto_url: 'assets/images/panasonic_gh5.jpg' },
      { nombre_id: nombres[3].id, categoria_id: catFoto.id, marca: 'Manfrotto', modelo: '055XPRO3', descripcion: 'Trípode aluminio profesional. Carga máx 8kg, columna horizontal para macro.', foto_url: 'assets/images/manfrotto_055.jpg' },
      { nombre_id: nombres[3].id, categoria_id: catFoto.id, marca: 'Manfrotto', modelo: 'Befree Advanced', descripcion: 'Trípode viaje compacto. Plegado 40cm, carga 8kg, ideal para exteriores.', foto_url: 'assets/images/manfrotto_befree.jpg' },

      // VIDEO
      { nombre_id: nombres[2].id, categoria_id: catVid.id, marca: 'Manfrotto', modelo: 'MVH502AH + 546B', descripcion: 'Trípode video con cabezal fluido profesional. Carga 7kg, contrapeso ajustable.', foto_url: 'assets/images/manfrotto_video.jpg' },
      { nombre_id: nombres[2].id, categoria_id: catVid.id, marca: 'Sachtler', modelo: 'Ace M', descripcion: 'Trípode broadcast ligero. Cabezal fluido profesional para documental.', foto_url: 'assets/images/sachtler_ace.jpg' },
      { nombre_id: nombres[15].id, categoria_id: catVid.id, marca: 'DJI', modelo: 'RS 3 Pro', descripcion: 'Estabilizador 3 ejes profesional. Carga 4.5kg, LiDAR focus, control remoto.', foto_url: 'assets/images/dji_rs3_pro.jpg' },
      { nombre_id: nombres[15].id, categoria_id: catVid.id, marca: 'DJI', modelo: 'Ronin SC', descripcion: 'Gimbal compacto para mirrorless. Carga 2kg, control por app, muy portátil.', foto_url: 'assets/images/dji_ronin_sc.jpg' },
      { nombre_id: nombres[16].id, categoria_id: catVid.id, marca: 'DJI', modelo: 'Mini 3 Pro', descripcion: 'Drone <250g sin licencia. 4K60, sensor 1/1.3", evita obstáculos en 3 direcciones.', foto_url: 'assets/images/dji_mini3.jpg' },
      { nombre_id: nombres[16].id, categoria_id: catVid.id, marca: 'DJI', modelo: 'Air 2S', descripcion: 'Drone sensor 1 pulgada. 5.4K, MasterShots, 12km transmisión O3.', foto_url: 'assets/images/dji_air2s.jpg' },

      // SONIDO
      { nombre_id: nombres[4].id, categoria_id: catSon.id, marca: 'Sennheiser', modelo: 'EW 112P G4', descripcion: 'Sistema inalámbrico profesional. Rango 100m, 20 canales, calidad broadcast.', foto_url: 'assets/images/sennheiser_g4.jpg' },
      { nombre_id: nombres[4].id, categoria_id: catSon.id, marca: 'Rode', modelo: 'Wireless GO II', descripcion: 'Sistema dual inalámbrico compacto. Grabación interna 40h, 200m alcance.', foto_url: 'assets/images/rode_wireless_go.jpg' },
      { nombre_id: nombres[5].id, categoria_id: catSon.id, marca: 'Rode', modelo: 'NTG3', descripcion: 'Micrófono shotgun broadcast. RF-bias resistente a humedad, ideal exteriores.', foto_url: 'assets/images/rode_ntg3.jpg' },
      { nombre_id: nombres[5].id, categoria_id: catSon.id, marca: 'Sennheiser', modelo: 'MKE 600', descripcion: 'Shotgun versátil cámara/pértiga. Batería AA o phantom power.', foto_url: 'assets/images/sennheiser_mke600.jpg' },
      { nombre_id: nombres[6].id, categoria_id: catSon.id, marca: 'Blue', modelo: 'Yeti X', descripcion: 'Micrófono USB podcasting profesional. 4 patrones polares, indicador LED.', foto_url: 'assets/images/blue_yeti.jpg' },
      { nombre_id: nombres[6].id, categoria_id: catSon.id, marca: 'Rode', modelo: 'NT-USB Mini', descripcion: 'Micrófono USB compacto. Calidad broadcast, plug & play, filtro pop integrado.', foto_url: 'assets/images/rode_nt_usb.jpg' },
      { nombre_id: nombres[12].id, categoria_id: catSon.id, marca: 'Zoom', modelo: 'H6', descripcion: 'Grabadora 6 pistas profesional. Cápsulas intercambiables, 4 XLR/TRS.', foto_url: 'assets/images/zoom_h6.jpg' },
      { nombre_id: nombres[12].id, categoria_id: catSon.id, marca: 'Zoom', modelo: 'F3', descripcion: 'Grabadora 2 canales 32-bit float. Nunca clipea, ideal para campo.', foto_url: 'assets/images/zoom_f3.jpg' },

      // ILUMINACIÓN
      { nombre_id: nombres[9].id, categoria_id: catIlu.id, marca: 'Aputure', modelo: '120d II', descripcion: 'Foco LED daylight 120W. CRI 96+, control remoto, bowens mount universal.', foto_url: 'assets/images/aputure_120d.jpg' },
      { nombre_id: nombres[9].id, categoria_id: catIlu.id, marca: 'Aputure', modelo: '300d II', descripcion: 'Foco LED daylight 300W. Equivale a HMI 575W, muy potente para cine.', foto_url: 'assets/images/aputure_300d.jpg' },
      { nombre_id: nombres[10].id, categoria_id: catIlu.id, marca: 'Aputure', modelo: 'Amaran 200x', descripcion: 'Panel bicolor 200W. 2700-6500K ajustable, control por app Sidus Link.', foto_url: 'assets/images/aputure_amaran.jpg' },
      { nombre_id: nombres[10].id, categoria_id: catIlu.id, marca: 'Nanlite', modelo: 'Forza 60', descripcion: 'LED compacto 60W muy versátil. Ideal entrevistas, producto y YouTube.', foto_url: 'assets/images/nanlite_forza60.jpg' },
      { nombre_id: nombres[11].id, categoria_id: catIlu.id, marca: 'Aputure', modelo: 'Light Dome II', descripcion: 'Softbox parabólico 90cm. Luz suave envolvente, montaje rápido, con grid.', foto_url: 'assets/images/aputure_lightdome.jpg' },
      { nombre_id: nombres[11].id, categoria_id: catIlu.id, marca: 'Godox', modelo: 'Softbox 60x90', descripcion: 'Softbox rectangular con grid incluido. Bowens mount, económico y efectivo.', foto_url: 'assets/images/godox_softbox.jpg' },

      // INFORMÁTICA
      { nombre_id: nombres[7].id, categoria_id: catInfo.id, marca: 'Dell', modelo: 'XPS 15 9520', descripcion: 'i7-12700H, 32GB RAM, RTX 3050 Ti, SSD 1TB. Pantalla OLED 3.5K táctil.', foto_url: 'assets/images/dell_xps15.jpg' },
      { nombre_id: nombres[7].id, categoria_id: catInfo.id, marca: 'Lenovo', modelo: 'ThinkPad X1 Carbon', descripcion: 'i7-1260P, 16GB RAM, SSD 512GB. Ultraligero 1.12kg, empresarial premium.', foto_url: 'assets/images/lenovo_x1.jpg' },
      { nombre_id: nombres[8].id, categoria_id: catInfo.id, marca: 'Apple', modelo: 'MacBook Pro 14"', descripcion: 'M3 Pro, 18GB RAM, SSD 512GB. Pantalla Liquid Retina XDR, edición pro.', foto_url: 'assets/images/macbook_pro14.jpg' },
      { nombre_id: nombres[8].id, categoria_id: catInfo.id, marca: 'Apple', modelo: 'MacBook Air 13" M2', descripcion: 'M2, 16GB RAM, SSD 512GB. Ultraportátil silencioso, 18h batería.', foto_url: 'assets/images/macbook_air.jpg' },

      // STREAMING
      { nombre_id: nombres[17].id, categoria_id: catStr.id, marca: 'Logitech', modelo: 'Brio 4K', descripcion: 'Webcam 4K HDR profesional. Windows Hello, zoom 5x digital, gran angular.', foto_url: 'assets/images/logitech_brio.jpg' },
      { nombre_id: nombres[17].id, categoria_id: catStr.id, marca: 'Elgato', modelo: 'Facecam', descripcion: 'Webcam 1080p60 para streaming. Sensor Sony STARVIS, sin compresión.', foto_url: 'assets/images/elgato_facecam.jpg' },
      { nombre_id: nombres[18].id, categoria_id: catStr.id, marca: 'Elgato', modelo: 'HD60 S+', descripcion: 'Capturadora HDMI 4K60 passthrough, graba 1080p60. USB 3.0, baja latencia.', foto_url: 'assets/images/elgato_hd60.jpg' },
      { nombre_id: nombres[18].id, categoria_id: catStr.id, marca: 'Elgato', modelo: 'Cam Link 4K', descripcion: 'Convierte cualquier cámara HDMI en webcam. 4K30 / 1080p60.', foto_url: 'assets/images/elgato_camlink.jpg' },

      // ACCESORIOS
      { nombre_id: nombres[13].id, categoria_id: catAcc.id, marca: 'SanDisk', modelo: 'Extreme PRO 128GB', descripcion: 'UHS-I V30, 170MB/s lectura, 90MB/s escritura. Ideal 4K video.', foto_url: 'assets/images/sandisk_sd.jpg' },
      { nombre_id: nombres[13].id, categoria_id: catAcc.id, marca: 'Sony', modelo: 'TOUGH SF-G 64GB', descripcion: 'UHS-II V90, 300MB/s. Resistente agua/polvo/caídas, profesional.', foto_url: 'assets/images/sony_sd.jpg' },
      { nombre_id: nombres[14].id, categoria_id: catAcc.id, marca: 'Samsung', modelo: 'T7 Shield 2TB', descripcion: 'SSD externo USB-C. 1050MB/s, resistente IP65, compacto.', foto_url: 'assets/images/samsung_t7.jpg' },
      { nombre_id: nombres[14].id, categoria_id: catAcc.id, marca: 'LaCie', modelo: 'Rugged SSD 1TB', descripcion: 'SSD todoterreno. IP67, caída 3m, 1050MB/s, naranja icónico.', foto_url: 'assets/images/lacie_rugged.jpg' }
    ]);

    // ============================================================
    // UNIDADES (Items físicos con TODOS los campos)
    // ============================================================
    console.log('🔢 Creando unidades de equipos...');
    var unidades = [];
    var ubicaciones = [
      'Almacén A - Estantería 1 - Balda 1',
      'Almacén A - Estantería 1 - Balda 2',
      'Almacén A - Estantería 2 - Balda 1',
      'Almacén B - Estantería 1 - Balda 1',
      'Almacén B - Estantería 1 - Balda 2',
      'Almacén B - Estantería 2 - Balda 1',
      'Almacén C - Estantería 1 - Balda 1',
      'Vitrina Exposición - Nivel 1',
      'Aula Técnica - Armario 1'
    ];

    for (let i = 0; i < equipos.length; i++) {
      // 2-3 unidades por equipo
      var numUnidades = (i % 3 === 0) ? 3 : 2;
      for (let j = 0; j < numUnidades; j++) {
        var letra = String.fromCharCode(65 + j);
        var estado = (i === 2 && j === 0) ? 'en_reparacion' : (i === 5 && j === 1) ? 'falla' : 'funciona';
        var prestado = (i === 0 && j === 0) || (i === 3 && j === 0);

        var unidad = await models.Unidad.create({
          equipo_id: equipos[i].id,
          numero_serie: 'SN-' + equipos[i].id.toString().padStart(3, '0') + '-' + letra + '-' + (1000 + i * 10 + j),
          codigo_barra: 'EQ-' + equipos[i].id.toString().padStart(3, '0') + '-' + letra,
          ubicacion: ubicaciones[(i + j) % ubicaciones.length],
          estado_fisico: estado,
          esta_prestado: prestado
        });
        unidades.push(unidad);
      }
    }

    // ============================================================
    // GÉNEROS DE LIBROS
    // ============================================================
    console.log('📚 Creando géneros...');
    var generos = await models.Genero.bulkCreate([
      { nombre: 'Novela', activo: true },
      { nombre: 'Manual Técnico', activo: true },
      { nombre: 'Ensayo', activo: true },
      { nombre: 'Arte y Fotografía', activo: true },
      { nombre: 'Historia', activo: true },
      { nombre: 'Comunicación', activo: true },
      { nombre: 'Periodismo', activo: true },
      { nombre: 'Cine y Audiovisual', activo: true },
      { nombre: 'Marketing y Publicidad', activo: true },
      { nombre: 'Diseño', activo: true },
      { nombre: 'Informática', activo: true },
      { nombre: 'Guión', activo: true }
    ]);
    var gNov = generos[0], gTec = generos[1], gEns = generos[2], gArt = generos[3], gHis = generos[4];
    var gCom = generos[5], gPeriod = generos[6], gCine = generos[7], gMark = generos[8], gDis = generos[9], gInf = generos[10], gGui = generos[11];

    // ============================================================
    // LIBROS (con TODOS los campos)
    // ============================================================
    console.log('📖 Creando libros...');
    var libros = await models.Libro.bulkCreate([
      // Manuales Técnicos / Informática
      { titulo: 'Clean Architecture', autor: 'Robert C. Martin', editorial: 'Prentice Hall', genero_id: gTec.id, libro_numero: 'L001', foto_url: 'assets/images/clean_architecture.jpg' },
      { titulo: 'Clean Code', autor: 'Robert C. Martin', editorial: 'Prentice Hall', genero_id: gTec.id, libro_numero: 'L002', foto_url: 'assets/images/clean_code.jpg' },
      { titulo: 'JavaScript: The Good Parts', autor: 'Douglas Crockford', editorial: "O'Reilly Media", genero_id: gTec.id, libro_numero: 'L003', foto_url: 'assets/images/js_good_parts.jpg' },
      { titulo: 'Eloquent JavaScript', autor: 'Marijn Haverbeke', editorial: 'No Starch Press', genero_id: gTec.id, libro_numero: 'L004', foto_url: 'assets/images/eloquent_js.jpg' },
      { titulo: 'Design Patterns', autor: 'Gang of Four', editorial: 'Addison-Wesley', genero_id: gTec.id, libro_numero: 'L005', foto_url: 'assets/images/design_patterns.jpg' },

      // Cine y Audiovisual
      { titulo: 'El ojo del fotógrafo', autor: 'Michael Freeman', editorial: 'Blume', genero_id: gArt.id, libro_numero: 'L006', foto_url: 'assets/images/ojo_fotografo.jpg' },
      { titulo: 'La luz en el cine', autor: 'Vittorio Storaro', editorial: 'Electa', genero_id: gCine.id, libro_numero: 'L007', foto_url: 'assets/images/luz_cine.jpg' },
      { titulo: 'In the Blink of an Eye', autor: 'Walter Murch', editorial: 'Silman-James Press', genero_id: gCine.id, libro_numero: 'L008', foto_url: 'assets/images/blink_eye.jpg' },
      { titulo: 'Directing', autor: 'Michael Rabiger', editorial: 'Focal Press', genero_id: gCine.id, libro_numero: 'L009', foto_url: 'assets/images/directing.jpg' },
      { titulo: 'Cinematography: Theory and Practice', autor: 'Blain Brown', editorial: 'Focal Press', genero_id: gCine.id, libro_numero: 'L010', foto_url: 'assets/images/cinematography.jpg' },

      // Guión
      { titulo: 'El guión', autor: 'Robert McKee', editorial: 'Alba Editorial', genero_id: gGui.id, libro_numero: 'L011', foto_url: 'assets/images/mckee_guion.jpg' },
      { titulo: 'Save the Cat!', autor: 'Blake Snyder', editorial: 'Michael Wiese Productions', genero_id: gGui.id, libro_numero: 'L012', foto_url: 'assets/images/save_the_cat.jpg' },
      { titulo: 'El viaje del escritor', autor: 'Christopher Vogler', editorial: 'Ma Non Troppo', genero_id: gGui.id, libro_numero: 'L013', foto_url: 'assets/images/viaje_escritor.jpg' },

      // Comunicación y Periodismo
      { titulo: 'Teoría de la Comunicación', autor: 'Manuel Martín Serrano', editorial: 'McGraw-Hill', genero_id: gCom.id, libro_numero: 'L014', foto_url: 'assets/images/teoria_comunicacion.jpg' },
      { titulo: 'Redacción Periodística', autor: 'José Luis Martínez Albertos', editorial: 'Paraninfo', genero_id: gPeriod.id, libro_numero: 'L015', foto_url: 'assets/images/redaccion_periodistica.jpg' },
      { titulo: 'Manual de Estilo El País', autor: 'El País', editorial: 'Aguilar', genero_id: gPeriod.id, libro_numero: 'L016', foto_url: 'assets/images/manual_elpais.jpg' },
      { titulo: 'Periodismo Digital', autor: 'Ramón Salaverría', editorial: 'Ariel', genero_id: gPeriod.id, libro_numero: 'L017', foto_url: 'assets/images/periodismo_digital.jpg' },

      // Marketing y Publicidad
      { titulo: 'Positioning', autor: 'Al Ries & Jack Trout', editorial: 'McGraw-Hill', genero_id: gMark.id, libro_numero: 'L018', foto_url: 'assets/images/positioning.jpg' },
      { titulo: 'Ogilvy on Advertising', autor: 'David Ogilvy', editorial: 'Vintage Books', genero_id: gMark.id, libro_numero: 'L019', foto_url: 'assets/images/ogilvy.jpg' },
      { titulo: 'Hey Whipple, Squeeze This', autor: 'Luke Sullivan', editorial: 'Wiley', genero_id: gMark.id, libro_numero: 'L020', foto_url: 'assets/images/hey_whipple.jpg' },

      // Diseño
      { titulo: 'No me hagas pensar', autor: 'Steve Krug', editorial: 'Pearson', genero_id: gDis.id, libro_numero: 'L021', foto_url: 'assets/images/no_me_hagas_pensar.jpg' },
      { titulo: 'The Design of Everyday Things', autor: 'Don Norman', editorial: 'Basic Books', genero_id: gDis.id, libro_numero: 'L022', foto_url: 'assets/images/design_everyday.jpg' },
      { titulo: 'Grid Systems', autor: 'Josef Müller-Brockmann', editorial: 'Niggli', genero_id: gDis.id, libro_numero: 'L023', foto_url: 'assets/images/grid_systems.jpg' },

      // Ensayos
      { titulo: 'Sapiens', autor: 'Yuval Noah Harari', editorial: 'Debate', genero_id: gEns.id, libro_numero: 'L024', foto_url: 'assets/images/sapiens.jpg' },
      { titulo: 'El arte de la guerra', autor: 'Sun Tzu', editorial: 'Edaf', genero_id: gEns.id, libro_numero: 'L025', foto_url: 'assets/images/arte_guerra.jpg' },

      // Novelas
      { titulo: 'Don Quijote de la Mancha', autor: 'Miguel de Cervantes', editorial: 'RAE', genero_id: gNov.id, libro_numero: 'L026', foto_url: 'assets/images/quijote.jpg' },
      { titulo: '1984', autor: 'George Orwell', editorial: 'Debolsillo', genero_id: gNov.id, libro_numero: 'L027', foto_url: 'assets/images/1984.jpg' },
      { titulo: 'Un mundo feliz', autor: 'Aldous Huxley', editorial: 'Debolsillo', genero_id: gNov.id, libro_numero: 'L028', foto_url: 'assets/images/mundo_feliz.jpg' }
    ]);

    // ============================================================
    // EJEMPLARES (con TODOS los campos)
    // ============================================================
    console.log('📕 Creando ejemplares...');
    var ejemplares = [];
    var estanterias = ['E1', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8'];
    var baldas = ['B1', 'B2', 'B3', 'B4'];

    for (let i = 0; i < libros.length; i++) {
      // 2-4 ejemplares por libro
      var numEjemplares = (i % 4 === 0) ? 4 : (i % 3 === 0) ? 3 : 2;
      for (let j = 0; j < numEjemplares; j++) {
        var letra = String.fromCharCode(65 + j);
        var estado = (i === 0 && j === 0) ? 'no_disponible' : (i === 3 && j === 1) ? 'en_reparacion' : (i === 5 && j === 0) ? 'bloqueado' : 'disponible';

        var ejemplar = await models.Ejemplar.create({
          libro_id: libros[i].id,
          codigo_barra: 'BK-' + libros[i].id.toString().padStart(3, '0') + '-' + letra,
          c122003: 'C' + libros[i].id.toString().padStart(3, '0') + j,
          estanteria: estanterias[(i + j) % estanterias.length],
          balda: baldas[j % baldas.length],
          estado: estado
        });
        ejemplares.push(ejemplar);
      }
    }

    // ============================================================
    // SOLICITUDES (variedad de estados y tipos)
    // ============================================================
    console.log('📋 Creando solicitudes...');

    // SOLICITUD 1: Pendiente - Uso propio
    var s1 = await models.Solicitud.create({
      usuario_id: alumnos[0].id,
      tipo: 'uso_propio',
      estado: 'pendiente',
      normas_aceptadas: true,
      observaciones: 'Necesito el equipo para un proyecto personal de fotografía de paisaje urbano.',
      creada_en: new Date(Date.now() - 2 * 86400000)
    });
    await models.SolicitudItem.create({ solicitud_id: s1.id, equipo_id: equipos[0].id, cantidad: 1 });
    await models.SolicitudItem.create({ solicitud_id: s1.id, equipo_id: equipos[5].id, cantidad: 1 });

    // SOLICITUD 2: Pendiente - Trabajo profesor
    var s2 = await models.Solicitud.create({
      usuario_id: alumnos[1].id,
      tipo: 'prof_trabajo',
      estado: 'pendiente',
      normas_aceptadas: true,
      observaciones: 'Práctica de clase de periodismo digital - reportaje multimedia.',
      profesor_asociado_id: profes[0].id,
      grado_id: gPer.id,
      creada_en: new Date(Date.now() - 1 * 86400000)
    });
    await models.SolicitudItem.create({ solicitud_id: s2.id, equipo_id: equipos[2].id, cantidad: 1 });
    await models.SolicitudItem.create({ solicitud_id: s2.id, equipo_id: equipos[13].id, cantidad: 2 });

    // SOLICITUD 3: Pendiente - Presencial (libro)
    var s3 = await models.Solicitud.create({
      usuario_id: alumnos[2].id,
      tipo: 'presencial',
      estado: 'pendiente',
      normas_aceptadas: true,
      observaciones: 'Consulta en sala de libros de guión para TFG.',
      creada_en: new Date(Date.now() - 3 * 86400000)
    });
    await models.SolicitudItem.create({ solicitud_id: s3.id, libro_id: libros[10].id, cantidad: 1 });
    await models.SolicitudItem.create({ solicitud_id: s3.id, libro_id: libros[11].id, cantidad: 1 });

    // SOLICITUD 4: Aprobada - Uso propio (genera préstamo activo)
    var s4 = await models.Solicitud.create({
      usuario_id: alumnos[3].id,
      tipo: 'uso_propio',
      estado: 'aprobada',
      normas_aceptadas: true,
      observaciones: 'Rodaje de cortometraje de ficción.',
      gestionado_por_id: pas1.id,
      creada_en: new Date(Date.now() - 5 * 86400000),
      resuelta_en: new Date(Date.now() - 4 * 86400000)
    });
    await models.SolicitudItem.create({ solicitud_id: s4.id, equipo_id: equipos[4].id, cantidad: 1 });
    await models.SolicitudItem.create({ solicitud_id: s4.id, equipo_id: equipos[7].id, cantidad: 1 });
    await models.SolicitudItem.create({ solicitud_id: s4.id, equipo_id: equipos[21].id, cantidad: 2 });

    // SOLICITUD 5: Aprobada - Trabajo profesor
    var s5 = await models.Solicitud.create({
      usuario_id: alumnos[4].id,
      tipo: 'prof_trabajo',
      estado: 'aprobada',
      normas_aceptadas: true,
      profesor_asociado_id: profes[1].id,
      grado_id: gCav.id,
      gestionado_por_id: pas2.id,
      creada_en: new Date(Date.now() - 7 * 86400000),
      resuelta_en: new Date(Date.now() - 6 * 86400000)
    });
    await models.SolicitudItem.create({ solicitud_id: s5.id, equipo_id: equipos[19].id, cantidad: 1 });

    // SOLICITUD 6: Aprobada - Presencial
    var s6 = await models.Solicitud.create({
      usuario_id: alumnos[5].id,
      tipo: 'presencial',
      estado: 'aprobada',
      normas_aceptadas: true,
      gestionado_por_id: pas1.id,
      creada_en: new Date(Date.now() - 4 * 86400000),
      resuelta_en: new Date(Date.now() - 3 * 86400000)
    });
    await models.SolicitudItem.create({ solicitud_id: s6.id, libro_id: libros[0].id, cantidad: 1 });

    // SOLICITUD 7: Aprobada - Podcast
    var s7 = await models.Solicitud.create({
      usuario_id: alumnos[6].id,
      tipo: 'uso_propio',
      estado: 'aprobada',
      normas_aceptadas: true,
      observaciones: 'Grabación podcast universitario semanal.',
      gestionado_por_id: pas2.id,
      creada_en: new Date(Date.now() - 10 * 86400000),
      resuelta_en: new Date(Date.now() - 9 * 86400000)
    });
    await models.SolicitudItem.create({ solicitud_id: s7.id, equipo_id: equipos[17].id, cantidad: 2 });
    await models.SolicitudItem.create({ solicitud_id: s7.id, equipo_id: equipos[19].id, cantidad: 1 });

    // SOLICITUD 8: Rechazada - No hay stock
    var s8 = await models.Solicitud.create({
      usuario_id: alumnos[7].id,
      tipo: 'uso_propio',
      estado: 'rechazada',
      normas_aceptadas: true,
      observaciones: 'Proyecto personal de fotografía.',
      gestionado_por_id: pas1.id,
      motivo_rechazo: 'Material no disponible temporalmente - todos los equipos de ese modelo están prestados.',
      creada_en: new Date(Date.now() - 6 * 86400000),
      resuelta_en: new Date(Date.now() - 5 * 86400000)
    });
    await models.SolicitudItem.create({ solicitud_id: s8.id, equipo_id: equipos[0].id, cantidad: 1 });

    // SOLICITUD 9: Rechazada - Profesor no autorizado
    var s9 = await models.Solicitud.create({
      usuario_id: alumnos[8].id,
      tipo: 'prof_trabajo',
      estado: 'rechazada',
      normas_aceptadas: true,
      profesor_asociado_id: profes[2].id,
      grado_id: gDoble.id,
      gestionado_por_id: pas2.id,
      motivo_rechazo: 'El profesor indicado no tiene clases programadas esta semana según el calendario académico.',
      creada_en: new Date(Date.now() - 8 * 86400000),
      resuelta_en: new Date(Date.now() - 7 * 86400000)
    });
    await models.SolicitudItem.create({ solicitud_id: s9.id, equipo_id: equipos[27].id, cantidad: 1 });

    // SOLICITUD 10: Rechazada - Límite alcanzado
    var s10 = await models.Solicitud.create({
      usuario_id: alumnos[9].id,
      tipo: 'uso_propio',
      estado: 'rechazada',
      normas_aceptadas: true,
      gestionado_por_id: pas1.id,
      motivo_rechazo: 'Has alcanzado el límite de préstamos simultáneos permitidos (3). Devuelve algún material antes de solicitar más.',
      creada_en: new Date(Date.now() - 3 * 86400000),
      resuelta_en: new Date(Date.now() - 2 * 86400000)
    });
    await models.SolicitudItem.create({ solicitud_id: s10.id, equipo_id: equipos[9].id, cantidad: 1 });

    // SOLICITUD 11: Cancelada por usuario
    var s11 = await models.Solicitud.create({
      usuario_id: alumnos[10].id,
      tipo: 'uso_propio',
      estado: 'cancelada',
      normas_aceptadas: true,
      observaciones: 'Ya no necesito el material, se ha cancelado el evento.',
      creada_en: new Date(Date.now() - 4 * 86400000)
    });
    await models.SolicitudItem.create({ solicitud_id: s11.id, equipo_id: equipos[11].id, cantidad: 1 });

    // SOLICITUD 12: Cancelada
    var s12 = await models.Solicitud.create({
      usuario_id: alumnos[11].id,
      tipo: 'prof_trabajo',
      estado: 'cancelada',
      normas_aceptadas: true,
      profesor_asociado_id: profes[3].id,
      grado_id: gPub.id,
      creada_en: new Date(Date.now() - 9 * 86400000)
    });
    await models.SolicitudItem.create({ solicitud_id: s12.id, equipo_id: equipos[31].id, cantidad: 1 });

    // ============================================================
    // PRÉSTAMOS
    // ============================================================
    console.log('🤝 Creando préstamos...');

    // PRÉSTAMO 1: Activo - Tipo A (diario) con profesor
    var p1 = await models.Prestamo.create({
      usuario_id: alumnos[3].id,
      solicitud_id: s4.id,
      tipo: 'a',
      estado: 'activo',
      fecha_inicio: new Date(Date.now() - 0 * 86400000),
      fecha_devolucion_prevista: new Date(Date.now() + 1 * 86400000),
      profesor_solicitante_id: profes[0].id
    });
    await models.PrestamoItem.create({ prestamo_id: p1.id, unidad_id: unidades[10].id, devuelto: false });
    await models.PrestamoItem.create({ prestamo_id: p1.id, unidad_id: unidades[17].id, devuelto: false });

    // PRÉSTAMO 2: Activo - Tipo B (semanal)
    var p2 = await models.Prestamo.create({
      usuario_id: alumnos[4].id,
      solicitud_id: s5.id,
      tipo: 'b',
      estado: 'activo',
      fecha_inicio: new Date(Date.now() - 2 * 86400000),
      fecha_devolucion_prevista: new Date(Date.now() + 3 * 86400000)
    });
    await models.PrestamoItem.create({ prestamo_id: p2.id, unidad_id: unidades[45].id, devuelto: false });

    // PRÉSTAMO 3: Activo - Tipo B
    var p3 = await models.Prestamo.create({
      usuario_id: alumnos[6].id,
      solicitud_id: s7.id,
      tipo: 'b',
      estado: 'activo',
      fecha_inicio: new Date(Date.now() - 1 * 86400000),
      fecha_devolucion_prevista: new Date(Date.now() + 4 * 86400000)
    });
    await models.PrestamoItem.create({ prestamo_id: p3.id, unidad_id: unidades[40].id, devuelto: false });
    await models.PrestamoItem.create({ prestamo_id: p3.id, unidad_id: unidades[41].id, devuelto: false });

    // PRÉSTAMO 4: Activo - Tipo C (mensual)
    var p4 = await models.Prestamo.create({
      usuario_id: alumnos[12].id,
      tipo: 'c',
      estado: 'activo',
      fecha_inicio: new Date(Date.now() - 10 * 86400000),
      fecha_devolucion_prevista: new Date(Date.now() + 20 * 86400000)
    });
    await models.PrestamoItem.create({ prestamo_id: p4.id, ejemplar_id: ejemplares[20].id, devuelto: false });

    // PRÉSTAMO 5: Vencido - Tipo A (no devuelto)
    var p5 = await models.Prestamo.create({
      usuario_id: alumnos[7].id,
      tipo: 'a',
      estado: 'vencido',
      fecha_inicio: new Date(Date.now() - 3 * 86400000),
      fecha_devolucion_prevista: new Date(Date.now() - 2 * 86400000)
    });
    await models.PrestamoItem.create({ prestamo_id: p5.id, unidad_id: unidades[0].id, devuelto: false });

    // PRÉSTAMO 6: Vencido - Tipo B
    var p6 = await models.Prestamo.create({
      usuario_id: alumnos[8].id,
      tipo: 'b',
      estado: 'vencido',
      fecha_inicio: new Date(Date.now() - 10 * 86400000),
      fecha_devolucion_prevista: new Date(Date.now() - 5 * 86400000),
      profesor_solicitante_id: profes[1].id
    });
    await models.PrestamoItem.create({ prestamo_id: p6.id, unidad_id: unidades[3].id, devuelto: false });

    // PRÉSTAMO 7: Vencido - Tipo B
    var p7 = await models.Prestamo.create({
      usuario_id: alumnos[9].id,
      tipo: 'b',
      estado: 'vencido',
      fecha_inicio: new Date(Date.now() - 8 * 86400000),
      fecha_devolucion_prevista: new Date(Date.now() - 3 * 86400000)
    });
    await models.PrestamoItem.create({ prestamo_id: p7.id, unidad_id: unidades[6].id, devuelto: false });
    await models.PrestamoItem.create({ prestamo_id: p7.id, ejemplar_id: ejemplares[5].id, devuelto: false });

    // PRÉSTAMOS CERRADOS (históricos)
    var fechasCerrados = [
      { inicio: 5, duracion: 1, devolucion: 1 },
      { inicio: 15, duracion: 5, devolucion: 4 },
      { inicio: 20, duracion: 5, devolucion: 5 },
      { inicio: 45, duracion: 30, devolucion: 28 },
      { inicio: 7, duracion: 1, devolucion: 1 },
      { inicio: 25, duracion: 5, devolucion: 5 },
      { inicio: 60, duracion: 30, devolucion: 30 },
      { inicio: 30, duracion: 5, devolucion: 4 }
    ];

    for (let i = 0; i < fechasCerrados.length; i++) {
      var f = fechasCerrados[i];
      var tipo = f.duracion === 1 ? 'a' : f.duracion === 5 ? 'b' : 'c';
      var alumno = alumnos[i % alumnos.length];
      var prof = (i % 3 === 0) ? profes[i % profes.length].id : null;

      var pCerrado = await models.Prestamo.create({
        usuario_id: alumno.id,
        tipo: tipo,
        estado: 'cerrado',
        fecha_inicio: new Date(Date.now() - f.inicio * 86400000),
        fecha_devolucion_prevista: new Date(Date.now() - (f.inicio - f.duracion) * 86400000),
        fecha_devolucion_real: new Date(Date.now() - (f.inicio - f.devolucion) * 86400000),
        profesor_solicitante_id: prof
      });

      // Alternar entre unidades y ejemplares
      if (i % 2 === 0) {
        await models.PrestamoItem.create({
          prestamo_id: pCerrado.id,
          unidad_id: unidades[(i * 3) % unidades.length].id,
          fecha_devolucion: new Date(Date.now() - (f.inicio - f.devolucion) * 86400000),
          devuelto: true
        });
      } else {
        await models.PrestamoItem.create({
          prestamo_id: pCerrado.id,
          ejemplar_id: ejemplares[(i * 2) % ejemplares.length].id,
          fecha_devolucion: new Date(Date.now() - (f.inicio - f.devolucion) * 86400000),
          devuelto: true
        });
      }
    }

    // ============================================================
    // SANCIONES
    // ============================================================
    console.log('⚠️  Creando sanciones...');

    // Sanciones ACTIVAS
    await models.Sancion.create({
      usuario_id: alumnos[7].id,
      severidad: 's1_1sem',
      estado: 'activa',
      inicio: new Date(Date.now() - 2 * 86400000),
      fin: new Date(Date.now() + 5 * 86400000),
      motivo: 'Retraso de 2 días en devolución de equipo de iluminación Aputure 120d.'
    });

    await models.Sancion.create({
      usuario_id: alumnos[8].id,
      severidad: 's2_1mes',
      estado: 'activa',
      inicio: new Date(Date.now() - 5 * 86400000),
      fin: new Date(Date.now() + 25 * 86400000),
      motivo: 'Daño menor en trípode de video Manfrotto. Rótula con juego excesivo.'
    });

    await models.Sancion.create({
      usuario_id: alumnos[9].id,
      severidad: 's1_1sem',
      estado: 'activa',
      inicio: new Date(Date.now() - 1 * 86400000),
      fin: new Date(Date.now() + 6 * 86400000),
      motivo: 'Segunda devolución tardía del trimestre. Aviso formal.'
    });

    // Sanciones FINALIZADAS (historial)
    await models.Sancion.create({
      usuario_id: alumnos[0].id,
      severidad: 's1_1sem',
      estado: 'finalizada',
      inicio: new Date(Date.now() - 30 * 86400000),
      fin: new Date(Date.now() - 23 * 86400000),
      motivo: 'Retraso menor en devolución de cámara Canon 90D.'
    });

    await models.Sancion.create({
      usuario_id: alumnos[1].id,
      severidad: 's1_1sem',
      estado: 'finalizada',
      inicio: new Date(Date.now() - 45 * 86400000),
      fin: new Date(Date.now() - 38 * 86400000),
      motivo: 'Primera advertencia por retraso en devolución.'
    });

    await models.Sancion.create({
      usuario_id: alumnos[5].id,
      severidad: 's2_1mes',
      estado: 'finalizada',
      inicio: new Date(Date.now() - 60 * 86400000),
      fin: new Date(Date.now() - 30 * 86400000),
      motivo: 'Pérdida de tarjeta SD SanDisk durante préstamo.'
    });

    await models.Sancion.create({
      usuario_id: alumnos[10].id,
      severidad: 's1_1sem',
      estado: 'finalizada',
      inicio: new Date(Date.now() - 90 * 86400000),
      fin: new Date(Date.now() - 83 * 86400000),
      motivo: 'Devolución fuera del horario establecido sin aviso previo.'
    });

    // Sanciones extra para tener 5+ por tabla
    for (let i = 0; i < 5; i++) {
      await models.Sancion.create({
        usuario_id: alumnos[(i + 3) % alumnos.length].id,
        severidad: 's1_1sem',
        estado: 'finalizada',
        inicio: new Date(Date.now() - (60 + i * 15) * 86400000),
        fin: new Date(Date.now() - (53 + i * 15) * 86400000),
        motivo: 'Sanción histórica generada #' + (i + 1) + ' - Retraso leve.'
      });
    }

    // ============================================================
    // NOTIFICACIONES
    // ============================================================
    console.log('🔔 Creando notificaciones...');

    // Preaviso de devolución
    await models.Notificacion.create({
      usuario_id: alumnos[3].id,
      tipo: 'preaviso_devolucion',
      prestamo_id: p1.id,
      canal: 'email',
      enviada_en: new Date(Date.now() - 1 * 86400000),
      payload: JSON.stringify({ tipo: 'preaviso', dias_restantes: 1, equipo: 'Panasonic GH5' })
    });

    await models.Notificacion.create({
      usuario_id: alumnos[4].id,
      tipo: 'preaviso_devolucion',
      prestamo_id: p2.id,
      canal: 'email',
      enviada_en: new Date(Date.now() - 2 * 86400000),
      payload: JSON.stringify({ tipo: 'preaviso', dias_restantes: 2, equipo: 'Zoom F3' })
    });

    await models.Notificacion.create({
      usuario_id: alumnos[6].id,
      tipo: 'preaviso_devolucion',
      prestamo_id: p3.id,
      canal: 'email',
      enviada_en: new Date(),
      payload: JSON.stringify({ tipo: 'preaviso', dias_restantes: 1, equipo: 'Blue Yeti X' })
    });

    // Estado de solicitud
    await models.Notificacion.create({
      usuario_id: alumnos[3].id,
      tipo: 'estado_solicitud',
      solicitud_id: s4.id,
      canal: 'email',
      enviada_en: new Date(Date.now() - 4 * 86400000),
      payload: JSON.stringify({ tipo: 'aprobacion', solicitud_id: s4.id, mensaje: 'Tu solicitud ha sido aprobada' })
    });

    await models.Notificacion.create({
      usuario_id: alumnos[7].id,
      tipo: 'estado_solicitud',
      solicitud_id: s8.id,
      canal: 'email',
      enviada_en: new Date(Date.now() - 5 * 86400000),
      payload: JSON.stringify({ tipo: 'rechazo', solicitud_id: s8.id, motivo: 'Material no disponible' })
    });

    await models.Notificacion.create({
      usuario_id: alumnos[4].id,
      tipo: 'estado_solicitud',
      solicitud_id: s5.id,
      canal: 'email',
      enviada_en: new Date(Date.now() - 6 * 86400000),
      payload: JSON.stringify({ tipo: 'aprobacion', solicitud_id: s5.id, mensaje: 'Tu solicitud ha sido aprobada' })
    });

    // Inicio de sanción
    await models.Notificacion.create({
      usuario_id: alumnos[7].id,
      tipo: 'inicio_sancion',
      canal: 'email',
      enviada_en: new Date(Date.now() - 2 * 86400000),
      payload: JSON.stringify({ tipo: 'inicio_sancion', severidad: 's1_1sem', fin: new Date(Date.now() + 5 * 86400000) })
    });

    await models.Notificacion.create({
      usuario_id: alumnos[8].id,
      tipo: 'inicio_sancion',
      canal: 'email',
      enviada_en: new Date(Date.now() - 5 * 86400000),
      payload: JSON.stringify({ tipo: 'inicio_sancion', severidad: 's2_1mes', motivo: 'Daño en equipo' })
    });

    // Fin de sanción
    await models.Notificacion.create({
      usuario_id: alumnos[0].id,
      tipo: 'fin_sancion',
      canal: 'email',
      enviada_en: new Date(Date.now() - 23 * 86400000),
      payload: JSON.stringify({ tipo: 'fin_sancion', mensaje: 'Tu sanción ha finalizado. Ya puedes volver a solicitar préstamos.' })
    });

    await models.Notificacion.create({
      usuario_id: alumnos[1].id,
      tipo: 'fin_sancion',
      canal: 'email',
      enviada_en: new Date(Date.now() - 38 * 86400000),
      payload: JSON.stringify({ tipo: 'fin_sancion', mensaje: 'Tu sanción ha finalizado.' })
    });

    await models.Notificacion.create({
      usuario_id: alumnos[5].id,
      tipo: 'fin_sancion',
      canal: 'email',
      enviada_en: new Date(Date.now() - 30 * 86400000),
      payload: JSON.stringify({ tipo: 'fin_sancion', mensaje: 'Tu sanción mensual ha finalizado.' })
    });

    // ============================================================
    // RESUMEN FINAL
    // ============================================================
    console.log('\n' + '═'.repeat(60));
    console.log('✅ SEED COMPLETO FINALIZADO');
    console.log('═'.repeat(60));

    console.log('\n📊 RESUMEN DE DATOS CREADOS:\n');
    console.log('   ⚙️  Configuraciones:    14');
    console.log('   ❌ Motivos rechazo:    8');
    console.log('   🎓 Grados:             9');
    console.log('   👥 Usuarios PAS:       4');
    console.log('   👨‍🏫 Profesores:         7');
    console.log('   👨‍🎓 Alumnos:            22');
    console.log('   📁 Categorías:         8');
    console.log('   📝 Tipos equipo:       20');
    console.log('   📷 Equipos:            ' + equipos.length);
    console.log('   🔢 Unidades:           ' + unidades.length);
    console.log('   📚 Géneros:            12');
    console.log('   📖 Libros:             ' + libros.length);
    console.log('   📕 Ejemplares:         ' + ejemplares.length);
    console.log('   📋 Solicitudes:        12');
    console.log('   🤝 Préstamos:          15+');
    console.log('   ⚠️  Sanciones:          12+');
    console.log('   🔔 Notificaciones:     11');

    console.log('\n🔐 CREDENCIALES DE ACCESO:');
    console.log('   Contraseña universal: 123456');
    console.log('\n   Usuarios principales:');
    console.log('   ─────────────────────────────────────');
    console.log('   PAS:      admin@eusa.es');
    console.log('   PAS:      biblioteca@eusa.es');
    console.log('   PAS:      audiovisuales@eusa.es');
    console.log('   Profesor: manuel.chaves@eusa.es');
    console.log('   Profesor: laura.video@eusa.es');
    console.log('   Profesor: david.codigo@eusa.es');
    console.log('   ⭐ Alumno: alumno1@eusa.es (PERFIL COMPLETO)');
    console.log('   Alumno:   alba.periodismo@eusa.es');
    console.log('   Alumno:   daniel.cav@eusa.es');
    console.log('   Alumno:   marcos.dam@eusa.es');
    console.log('   Alumno:   nuria.daw@eusa.es');
    console.log('   Alumno:   victor.master@eusa.es');

    console.log('\n📸 NOTA: Las imágenes deben estar en frontend/src/assets/images/\n');

    process.exit(0);

  } catch (e) {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  }
}

seed();