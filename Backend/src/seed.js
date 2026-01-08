var models = require('./models');

async function seed() {
  await models.Usuario.create({
    email: 'pas@eusa.es',
    password_hash: '123456',
    nombre: 'PAS',
    apellidos: 'EUSA',
    rol: 'pas'
  });

  await models.Usuario.create({
    email: 'alumno1@eusa.es',
    password_hash: '123456',
    nombre: 'Juan',
    apellidos: 'Pérez',
    rol: 'alumno',
    grado: 'DAM',
    curso: 2
  });

  await models.Usuario.create({
    email: 'alumno2@eusa.es',
    password_hash: '123456',
    nombre: 'Lucía',
    apellidos: 'Gómez',
    rol: 'alumno',
    grado: 'DAW',
    curso: 1
  });

  await models.Usuario.create({
    email: 'profesor@eusa.es',
    password_hash: '123456',
    nombre: 'Carlos',
    apellidos: 'Profesor',
    rol: 'profesor'
  });

  await models.Categoria.bulkCreate([
    { codigo: '038', nombre: 'Marketing', tipo: 'libro' },
    { codigo: 'INF', nombre: 'Informática', tipo: 'libro' },
    { codigo: 'CAM', nombre: 'Cámaras', tipo: 'equipo' }
  ]);

  var libro = await models.Libro.create({
    titulo: 'Habilidades de Comunicación',
    autor: 'Fernando de Manuel',
    editorial: 'Marketing Editorial',
    libro_numero: '00001',
    categoria_codigo: '038'
  });

  await models.Ejemplar.create({
    libro_id: libro.id,
    codigo_barra: 'LIB-1-001',
    estanteria: '014',
    balda: '6',
    estado: 'disponible'
  });

  var equipo = await models.Equipo.create({
    categoria_codigo: 'CAM',
    marca: 'Canon',
    modelo: 'EOS 250D',
    descripcion: 'Cámara réflex'
  });

  await models.Unidad.create({
    equipo_id: equipo.id,
    codigo_barra: 'EQ-1-001',
    estado: 'disponible'
  });

  console.log('🌱 Seed completado');
  process.exit();
}

seed();
