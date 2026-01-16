require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
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
    curso: 1,
    codigo_tarjeta: 'CARD-123456'
  });

  var profesor = await models.Usuario.create({
    email: 'profesor@eusa.es',
    password_hash: '123456',
    nombre: 'Carlos',
    apellidos: 'Profesor',
    rol: 'profesor'
  });

  // ======================
  // GÉNEROS
  // ======================
  var genMarketing = await models.Genero.create({
    nombre: 'Marketing',
    activo: true
  });

  var genInformatica = await models.Genero.create({
    nombre: 'Informática',
    activo: true
  });

  // ======================
  // CATEGORÍAS (Solo Equipos)
  // ======================
  var catCamaras = await models.Categoria.create({
    nombre: 'Cámaras',
    activa: true
  });

  var catAudio = await models.Categoria.create({
    nombre: 'Audio',
    activa: true
  });

  // ======================
  // LIBROS + EJEMPLARES
  // ======================
  var libro1 = await models.Libro.create({
    titulo: 'Habilidades de Comunicación',
    autor: 'Fernando de Manuel',
    editorial: 'Marketing Editorial',
    libro_numero: '00001',
    genero_id: genMarketing.id
  });

  var libro2 = await models.Libro.create({
    titulo: 'Programación en Java',
    autor: 'Autor Java',
    editorial: 'Tech Books',
    libro_numero: '00002',
    genero_id: genInformatica.id
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
    categoria_id: catCamaras.id,
    marca: 'Canon',
    modelo: 'EOS 250D',
    descripcion: 'Cámara réflex'
  });

  var microfono = await models.Equipo.create({
    categoria_id: catAudio.id,
    marca: 'Rode',
    modelo: 'NT-USB',
    descripcion: 'Micrófono USB'
  });

  var unidadCam1 = await models.Unidad.create({
    equipo_id: camara.id,
    codigo_barra: 'EQ-CAM-001',
    estado_fisico: 'funciona',
    esta_prestado: false
  });

  var unidadCam2 = await models.Unidad.create({
    equipo_id: camara.id,
    codigo_barra: 'EQ-CAM-002',
    estado_fisico: 'funciona',
    esta_prestado: false
  });

  var unidadMic = await models.Unidad.create({
    equipo_id: microfono.id,
    codigo_barra: 'EQ-AUD-001',
    estado_fisico: 'funciona',
    esta_prestado: false
  });

  // ======================
  // SOLICITUDES
  // ======================
  // ======================
  // SOLICITUDES + ITEMS
  // ======================

  // 1. Solicitud Pendiente (Alumno 1 pide Ejemplar 1)
  var solPendiente = await models.Solicitud.create({
    usuario_id: alumno1.id,
    tipo: 'uso_propio',
    estado: 'pendiente',
    normas_aceptadas: true,
    observaciones: 'Para estudiar comunicación'
  });
  await models.SolicitudItem.create({
    solicitud_id: solPendiente.id,
    libro_id: libro1.id,  // Pide el Libro (genérico) o Ejemplar específico si se soporta
    cantidad: 1
  });

  // 2. Solicitud Aprobada (Alumno 2 pidió Cámara, se le da UnidadCam1)
  var solAprobada = await models.Solicitud.create({
    usuario_id: alumno2.id,
    tipo: 'uso_propio',
    estado: 'aprobada',
    normas_aceptadas: true,
    gestionado_por_id: pas.id,
    resuelta_en: new Date()
  });
  await models.SolicitudItem.create({
    solicitud_id: solAprobada.id,
    equipo_id: camara.id,
    cantidad: 1
  });

  // 3. Solicitud Rechazada (Alumno 3 pidió Microfono)
  var solRechazada = await models.Solicitud.create({
    usuario_id: alumno3.id,
    tipo: 'uso_propio',
    estado: 'rechazada',
    normas_aceptadas: true,
    gestionado_por_id: pas.id,
    resuelta_en: new Date()
  });
  await models.SolicitudItem.create({
    solicitud_id: solRechazada.id,
    equipo_id: microfono.id,
    cantidad: 1
  });

  // ======================
  // PRÉSTAMOS
  // ======================
  var ayer = new Date();
  ayer.setDate(ayer.getDate() - 1);

  // Prestamo Activo (viene de solAprobada)
  var prestamoActivo = await models.Prestamo.create({
    usuario_id: alumno2.id,
    solicitud_id: solAprobada.id,
    tipo: 'b',
    estado: 'activo',
    fecha_inicio: ayer,
    fecha_devolucion_prevista: new Date(Date.now() + 24 * 60 * 60 * 1000)
  });

  // Item entregado: UnidadCam1
  await models.PrestamoItem.create({
    prestamo_id: prestamoActivo.id,
    unidad_id: unidadCam1.id,
    devuelto: false
  });
  // Marcar unidad como prestada en seed
  await unidadCam1.update({ esta_prestado: true });

  // Prestamo Vencido (sin solicitud previa explicita en seed, o creamos una dummy)
  // Vamos a asumir que viene de una solicitud anterior no registrada o nula para simplificar, 
  // O creamos una solicitud dummy para consistencia.

  var solVencida = await models.Solicitud.create({
    usuario_id: alumno3.id,
    tipo: 'uso_propio',
    estado: 'aprobada',
    normas_aceptadas: true,
    creada_en: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
  });

  var prestamoVencido = await models.Prestamo.create({
    usuario_id: alumno3.id,
    solicitud_id: solVencida.id,
    tipo: 'b',
    estado: 'vencido',
    fecha_inicio: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    fecha_devolucion_prevista: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  });

  await models.PrestamoItem.create({
    prestamo_id: prestamoVencido.id,
    ejemplar_id: ej2.id,
    devuelto: false
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
