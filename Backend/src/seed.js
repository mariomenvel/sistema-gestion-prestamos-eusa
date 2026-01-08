var models = require('./models');

async function seed() {
  console.log('🌱 Iniciando seed...');

  // ======================
  // USUARIOS
  // ======================
  var pas = await models.Usuario.create({
    email: 'pas@eusa.es',
    password_hash: '123456',
    nombre: 'PAS',
    apellidos: 'EUSA',
    rol: 'pas'
  });

  var alumno1 = await models.Usuario.create({
    email: 'alumno1@eusa.es',
    password_hash: '123456',
    nombre: 'Juan',
    apellidos: 'Pérez',
    rol: 'alumno',
    grado: 'DAM',
    curso: 2
  });

  var alumno2 = await models.Usuario.create({
    email: 'alumno2@eusa.es',
    password_hash: '123456',
    nombre: 'Lucía',
    apellidos: 'Gómez',
    rol: 'alumno',
    grado: 'DAW',
    curso: 1
  });

  var alumno3 = await models.Usuario.create({
    email: 'alumno3@eusa.es',
    password_hash: '123456',
    nombre: 'Mario',
    apellidos: 'Ruiz',
    rol: 'alumno',
    grado: 'DAM',
    curso: 1
  });

  var profesor = await models.Usuario.create({
    email: 'profesor@eusa.es',
    password_hash: '123456',
    nombre: 'Carlos',
    apellidos: 'Profesor',
    rol: 'profesor'
  });

  // ======================
  // CATEGORÍAS
  // ======================
  await models.Categoria.bulkCreate([
    { codigo: '038', nombre: 'Marketing', tipo: 'libro' },
    { codigo: 'INF', nombre: 'Informática', tipo: 'libro' },
    { codigo: 'CAM', nombre: 'Cámaras', tipo: 'equipo' },
    { codigo: 'AUD', nombre: 'Audio', tipo: 'equipo' }
  ]);

  // ======================
  // LIBROS + EJEMPLARES
  // ======================
  var libro1 = await models.Libro.create({
    titulo: 'Habilidades de Comunicación',
    autor: 'Fernando de Manuel',
    editorial: 'Marketing Editorial',
    libro_numero: '00001',
    categoria_codigo: '038'
  });

  var libro2 = await models.Libro.create({
    titulo: 'Programación en Java',
    autor: 'Autor Java',
    editorial: 'Tech Books',
    libro_numero: '00002',
    categoria_codigo: 'INF'
  });

  var ej1 = await models.Ejemplar.create({
    libro_id: libro1.id,
    codigo_barra: 'LIB-1-001',
    estanteria: '014',
    balda: '6',
    estado: 'disponible'
  });

  var ej2 = await models.Ejemplar.create({
    libro_id: libro2.id,
    codigo_barra: 'LIB-2-001',
    estanteria: '010',
    balda: '3',
    estado: 'disponible'
  });

  // ======================
  // EQUIPOS + UNIDADES
  // ======================
  var camara = await models.Equipo.create({
    categoria_codigo: 'CAM',
    marca: 'Canon',
    modelo: 'EOS 250D',
    descripcion: 'Cámara réflex'
  });

  var microfono = await models.Equipo.create({
    categoria_codigo: 'AUD',
    marca: 'Rode',
    modelo: 'NT-USB',
    descripcion: 'Micrófono USB'
  });

  var unidadCam1 = await models.Unidad.create({
    equipo_id: camara.id,
    codigo_barra: 'EQ-CAM-001',
    estado: 'disponible'
  });

  var unidadCam2 = await models.Unidad.create({
    equipo_id: camara.id,
    codigo_barra: 'EQ-CAM-002',
    estado: 'disponible'
  });

  var unidadMic = await models.Unidad.create({
    equipo_id: microfono.id,
    codigo_barra: 'EQ-AUD-001',
    estado: 'disponible'
  });

  // ======================
  // SOLICITUDES
  // ======================
  var solPendiente = await models.Solicitud.create({
    usuario_id: alumno1.id,
    ejemplar_id: ej1.id,
    tipo: 'uso_propio',
    estado: 'pendiente',
    normas_aceptadas: true,
    observaciones: 'Para estudiar comunicación'
  });

  var solAprobada = await models.Solicitud.create({
    usuario_id: alumno2.id,
    unidad_id: unidadCam1.id,
    tipo: 'uso_propio',
    estado: 'aprobada',
    normas_aceptadas: true,
    gestionado_por_id: pas.id,
    resuelta_en: new Date()
  });

  var solRechazada = await models.Solicitud.create({
    usuario_id: alumno3.id,
    unidad_id: unidadMic.id,
    tipo: 'uso_propio',
    estado: 'rechazada',
    normas_aceptadas: true,
    gestionado_por_id: pas.id,
    resuelta_en: new Date()
  });

  // ======================
  // PRÉSTAMOS
  // ======================
  var ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);

  var prestamoActivo = await models.Prestamo.create({
    usuario_id: alumno2.id,
    unidad_id: unidadCam1.id,
    solicitud_id: solAprobada.id,
    tipo: 'b',
    estado: 'activo',
    fecha_inicio: ayer,
    fecha_devolucion_prevista: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  var prestamoVencido = await models.Prestamo.create({
    usuario_id: alumno3.id,
    ejemplar_id: ej2.id,
    tipo: 'b',
    estado: 'vencido',
    fecha_inicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    fecha_devolucion_prevista: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  });

  // ======================
  // SANCIÓN DE EJEMPLO
  // ======================
  await models.Sancion.create({
    usuario_id: alumno3.id,
    severidad: 's1_1sem',
    estado: 'activa',
    inicio: new Date(),
    fin: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    motivo: 'Retraso en devolución'
  });

  console.log('✅ Seed completo creado');
  process.exit();
}

seed();
