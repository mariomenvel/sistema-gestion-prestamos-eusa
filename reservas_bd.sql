-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 20-02-2026 a las 11:36:26
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `reservas_bd`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `negocios`
--

CREATE TABLE `negocios` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `imagen_url` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `negocios`
--

INSERT INTO `negocios` (`id`, `usuario_id`, `nombre`, `descripcion`, `direccion`, `telefono`, `categoria`, `imagen_url`, `activo`, `fecha_creacion`) VALUES
(1, 1, 'Peluquería Chirri', 'Cortes modernos y tratamientos capilares', 'Calle Sevilla 123', '955123456', 'peluqueria', '/images/negocios/peluqueria1.jpg', 1, '2026-02-17 17:05:38'),
(2, 2, 'Clínica Dental Sonrisa', 'Clínica dental especializada en ortodoncia, implantes y estética dental. Más de 15 años cuidando tu sonrisa con la última tecnología.', 'Calle Mayor 23, Madrid', '912345001', 'Clínica Dental', '/images/negocios/clinica1.jpg', 1, '2026-02-18 17:45:40'),
(3, 3, 'GymPower Fitness', 'Centro deportivo con las mejores instalaciones. Sala de musculación, clases dirigidas, piscina y spa. Entrenadores personales certificados.', 'Av. de la Constitución 45, Madrid', '912345002', 'Gimnasio', '/images/negocios/gimnasio1.jpg', 1, '2026-02-18 17:45:40'),
(4, 4, 'Spa Wellness & Relax', 'Espacio de bienestar donde encontrarás masajes relajantes, tratamientos faciales y corporales. Desconecta del estrés diario.', 'Calle Serrano 78, Madrid', '912345003', 'Spa', '/images/negocios/spa1.jpg', 1, '2026-02-18 17:45:40'),
(5, 5, 'Tattoo Art Studio', 'Estudio de tatuajes con artistas especializados en diferentes estilos: realismo, tradicional, japonés y blackwork. Máxima higiene garantizada.', 'Calle Fuencarral 112, Madrid', '912345004', 'Estudio de Tatuajes', '/images/negocios/tattoo1.jpg', 1, '2026-02-18 17:45:40'),
(6, 6, 'Business Consulting Pro', 'Consultoría empresarial especializada en transformación digital, estrategia y gestión del cambio. Impulsa tu negocio al siguiente nivel.', 'Paseo de la Castellana 200, Madrid', '912345005', 'Consultoría', '/images/negocios/consultoria1.jpg', 1, '2026-02-18 17:45:40'),
(7, 7, 'Centro Médico Salud Plus', 'Centro médico multidisciplinar con especialistas en medicina general, dermatología, traumatología y nutrición. Tu salud es nuestra prioridad.', 'Calle Alcalá 156, Madrid', '912345006', 'Centro Médico', '/images/negocios/clinica2.jpg', 1, '2026-02-18 17:45:40'),
(8, 8, 'CrossFit Revolution', 'Box de CrossFit con coaches certificados. Clases para todos los niveles, desde principiantes hasta competidores. Comunidad y resultados.', 'Calle Bravo Murillo 89, Madrid', '912345007', 'CrossFit', '/images/negocios/gimnasio2.jpg', 1, '2026-02-18 17:45:40'),
(9, 9, 'Centro de Belleza Glamour', 'Salón de belleza integral: peluquería, manicura, pedicura, maquillaje y tratamientos estéticos. Luce radiante cada día.', 'Calle Goya 34, Madrid', '912345008', 'Centro de Belleza', '/images/negocios/belleza1.jpg', 1, '2026-02-18 17:45:40');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reservas`
--

CREATE TABLE `reservas` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `servicio_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `hora` time NOT NULL,
  `estado` enum('pendiente','confirmada','cancelada','completada') DEFAULT 'pendiente',
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `reservas`
--

INSERT INTO `reservas` (`id`, `usuario_id`, `servicio_id`, `fecha`, `hora`, `estado`, `notas`, `fecha_creacion`) VALUES
(1, 1, 1, '2025-02-20', '10:00:00', 'cancelada', 'Primera visita', '2026-02-17 17:35:27'),
(2, 1, 3, '2026-02-19', '11:01:00', 'completada', NULL, '2026-02-18 17:59:46'),
(3, 2, 6, '2026-02-20', '05:52:00', 'pendiente', NULL, '2026-02-19 22:52:59');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `servicios`
--

CREATE TABLE `servicios` (
  `id` int(11) NOT NULL,
  `negocio_id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `duracion_minutos` int(11) NOT NULL,
  `precio` decimal(10,2) NOT NULL,
  `activo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `servicios`
--

INSERT INTO `servicios` (`id`, `negocio_id`, `nombre`, `descripcion`, `duracion_minutos`, `precio`, `activo`) VALUES
(1, 1, 'Corte de pelo', 'Corte moderno con lavado incluido', 30, 15.00, 1),
(2, 2, 'Limpieza dental', 'Limpieza profesional completa con ultrasonidos', 45, 60.00, 1),
(3, 2, 'Blanqueamiento dental', 'Tratamiento de blanqueamiento con láser LED', 60, 250.00, 1),
(4, 2, 'Revisión general', 'Revisión completa con radiografía incluida', 30, 40.00, 1),
(5, 2, 'Ortodoncia invisible', 'Consulta y planificación de tratamiento Invisalign', 45, 80.00, 1),
(6, 3, 'Entrenamiento personal', 'Sesión individual con entrenador certificado', 60, 45.00, 1),
(7, 3, 'Clase de spinning', 'Clase grupal de ciclismo indoor de alta intensidad', 45, 15.00, 1),
(8, 3, 'Evaluación física', 'Test de composición corporal y planificación', 30, 35.00, 1),
(9, 3, 'Yoga', 'Clase de yoga para todos los niveles', 60, 12.00, 1),
(10, 4, 'Masaje relajante', 'Masaje corporal completo con aceites esenciales', 60, 70.00, 1),
(11, 4, 'Tratamiento facial', 'Limpieza facial profunda con hidratación', 45, 55.00, 1),
(12, 4, 'Circuito spa', 'Acceso a piscina, sauna, jacuzzi y zona relax', 120, 40.00, 1),
(13, 4, 'Masaje piedras calientes', 'Terapia con piedras volcánicas', 75, 85.00, 1),
(14, 5, 'Tatuaje pequeño', 'Diseño de hasta 5cm, cualquier zona', 60, 80.00, 1),
(15, 5, 'Tatuaje mediano', 'Diseño de 5-15cm con detalle medio', 120, 180.00, 1),
(16, 5, 'Consulta diseño', 'Sesión para crear diseño personalizado', 30, 25.00, 1),
(17, 5, 'Retoque', 'Retoque de tatuaje existente', 45, 50.00, 1),
(18, 6, 'Consultoría estratégica', 'Sesión de análisis y planificación empresarial', 90, 150.00, 1),
(19, 6, 'Auditoría digital', 'Evaluación completa de presencia digital', 120, 200.00, 1),
(20, 6, 'Mentoría empresarial', 'Sesión de coaching para emprendedores', 60, 100.00, 1),
(21, 6, 'Plan de negocio', 'Elaboración de business plan completo', 180, 350.00, 1),
(22, 7, 'Consulta medicina general', 'Revisión médica completa', 30, 50.00, 1),
(23, 7, 'Consulta dermatología', 'Evaluación de problemas de piel', 30, 65.00, 1),
(24, 7, 'Consulta nutrición', 'Plan alimenticio personalizado', 45, 55.00, 1),
(25, 7, 'Análisis de sangre', 'Extracción y analítica completa', 15, 45.00, 1),
(26, 8, 'WOD grupal', 'Clase de entrenamiento del día', 60, 18.00, 1),
(27, 8, 'Fundamentals', 'Clase para principiantes, técnica básica', 60, 25.00, 1),
(28, 8, 'Open gym', 'Acceso libre para entrenamiento propio', 90, 10.00, 1),
(29, 8, 'PT CrossFit', 'Entrenamiento personal especializado', 60, 50.00, 1),
(30, 9, 'Corte y peinado', 'Corte de pelo con lavado y secado', 45, 35.00, 1),
(31, 9, 'Manicura completa', 'Limado, cutículas y esmaltado', 40, 25.00, 1),
(32, 9, 'Tinte', 'Coloración completa con tratamiento', 90, 55.00, 1),
(33, 9, 'Maquillaje evento', 'Maquillaje profesional para ocasión especial', 60, 45.00, 1),
(34, 1, 'Corte caballero', 'Corte clásico o moderno con lavado', 30, 15.00, 1),
(35, 1, 'Corte señora', 'Corte y peinado completo', 45, 25.00, 1),
(36, 1, 'Barba', 'Arreglo y perfilado de barba', 20, 10.00, 1),
(37, 1, 'Tinte hombre', 'Coloración completa o mechas', 45, 30.00, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `rol` enum('cliente','negocio') DEFAULT 'cliente',
  `fecha_registro` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password`, `telefono`, `rol`, `fecha_registro`) VALUES
(1, 'Mercedes Peña', 'mercedes@gmail.com', '$2b$10$ooRWqDHsJa5MvH/RrUamo.dVES2CFU1Qr8NGEF/GDQSKBSJizYMPy', '666111222', 'cliente', '2026-02-16 18:45:01'),
(2, 'Carlos García', 'carlos@clinicadental.com', '$2b$10$8i/CQWfNRtOMEtEgIo.AoemCnHTnUUCu.GeMDswyIXk2xbnROWk7G', '612345001', 'negocio', '2026-02-18 17:45:40'),
(3, 'María López', 'maria@gympower.com', '$2b$10$8i/CQWfNRtOMEtEgIo.AoemCnHTnUUCu.GeMDswyIXk2xbnROWk7G', '612345002', 'negocio', '2026-02-18 17:45:40'),
(4, 'Ana Martínez', 'ana@spawellness.com', '$2b$10$8i/CQWfNRtOMEtEgIo.AoemCnHTnUUCu.GeMDswyIXk2xbnROWk7G', '612345003', 'negocio', '2026-02-18 17:45:40'),
(5, 'David Ruiz', 'david@tattooart.com', '$2b$10$8i/CQWfNRtOMEtEgIo.AoemCnHTnUUCu.GeMDswyIXk2xbnROWk7G', '612345004', 'negocio', '2026-02-18 17:45:40'),
(6, 'Laura Sánchez', 'laura@consulting.com', '$2b$10$8i/CQWfNRtOMEtEgIo.AoemCnHTnUUCu.GeMDswyIXk2xbnROWk7G', '612345005', 'negocio', '2026-02-18 17:45:40'),
(7, 'Pedro Gómez', 'pedro@centromedico.com', '$2b$10$8i/CQWfNRtOMEtEgIo.AoemCnHTnUUCu.GeMDswyIXk2xbnROWk7G', '612345006', 'negocio', '2026-02-18 17:45:40'),
(8, 'Elena Torres', 'elena@crossfit.com', '$2b$10$8i/CQWfNRtOMEtEgIo.AoemCnHTnUUCu.GeMDswyIXk2xbnROWk7G', '612345007', 'negocio', '2026-02-18 17:45:40'),
(9, 'Sofía Navarro', 'sofia@belleza.com', '$2b$10$8i/CQWfNRtOMEtEgIo.AoemCnHTnUUCu.GeMDswyIXk2xbnROWk7G', '612345008', 'negocio', '2026-02-18 17:45:40');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `negocios`
--
ALTER TABLE `negocios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `servicio_id` (`servicio_id`);

--
-- Indices de la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD PRIMARY KEY (`id`),
  ADD KEY `negocio_id` (`negocio_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `negocios`
--
ALTER TABLE `negocios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT de la tabla `reservas`
--
ALTER TABLE `reservas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `servicios`
--
ALTER TABLE `servicios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=38;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `negocios`
--
ALTER TABLE `negocios`
  ADD CONSTRAINT `negocios_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reservas`
--
ALTER TABLE `reservas`
  ADD CONSTRAINT `reservas_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reservas_ibfk_2` FOREIGN KEY (`servicio_id`) REFERENCES `servicios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `servicios`
--
ALTER TABLE `servicios`
  ADD CONSTRAINT `servicios_ibfk_1` FOREIGN KEY (`negocio_id`) REFERENCES `negocios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
