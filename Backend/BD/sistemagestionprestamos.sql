-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 14-01-2026 a las 17:08:14
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
-- Base de datos: `sistemagestionprestamos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` bigint(20) NOT NULL,
  `codigo` varchar(10) NOT NULL,
  `nombre` varchar(120) DEFAULT NULL,
  `tipo` enum('libro','equipo') NOT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `codigo`, `nombre`, `tipo`, `activa`, `createdAt`, `updatedAt`) VALUES
(1, '038', 'Marketing', 'libro', 1, '2026-01-14 16:07:55', '2026-01-14 16:07:55'),
(2, 'INF', 'Informática', 'libro', 1, '2026-01-14 16:07:55', '2026-01-14 16:07:55'),
(3, 'CAM', 'Cámaras', 'equipo', 1, '2026-01-14 16:07:55', '2026-01-14 16:07:55'),
(4, 'AUD', 'Audio', 'equipo', 1, '2026-01-14 16:07:55', '2026-01-14 16:07:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ejemplares`
--

CREATE TABLE `ejemplares` (
  `id` bigint(20) NOT NULL,
  `libro_id` bigint(20) NOT NULL,
  `codigo_barra` varchar(64) NOT NULL,
  `c122003` varchar(10) DEFAULT NULL,
  `estanteria` varchar(10) DEFAULT NULL,
  `balda` varchar(10) DEFAULT NULL,
  `estado` enum('disponible','no_disponible','bloqueado','en_reparacion') NOT NULL DEFAULT 'disponible',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ejemplares`
--

INSERT INTO `ejemplares` (`id`, `libro_id`, `codigo_barra`, `c122003`, `estanteria`, `balda`, `estado`, `createdAt`, `updatedAt`) VALUES
(1, 1, 'LIB-1-001', NULL, '014', '6', 'disponible', '2026-01-14 16:07:55', '2026-01-14 16:07:55'),
(2, 2, 'LIB-2-001', NULL, '010', '3', 'disponible', '2026-01-14 16:07:55', '2026-01-14 16:07:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipos`
--

CREATE TABLE `equipos` (
  `id` bigint(20) NOT NULL,
  `categoria_codigo` varchar(10) NOT NULL,
  `marca` varchar(120) NOT NULL,
  `modelo` varchar(120) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `foto_url` varchar(400) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `equipos`
--

INSERT INTO `equipos` (`id`, `categoria_codigo`, `marca`, `modelo`, `descripcion`, `foto_url`, `createdAt`, `updatedAt`) VALUES
(1, 'CAM', 'Canon', 'EOS 250D', 'Cámara réflex', NULL, '2026-01-14 16:07:55', '2026-01-14 16:07:55'),
(2, 'AUD', 'Rode', 'NT-USB', 'Micrófono USB', NULL, '2026-01-14 16:07:55', '2026-01-14 16:07:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `libros`
--

CREATE TABLE `libros` (
  `id` bigint(20) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `autor` varchar(255) DEFAULT NULL,
  `editorial` varchar(255) DEFAULT NULL,
  `libro_numero` varchar(20) NOT NULL,
  `categoria_codigo` varchar(10) NOT NULL,
  `foto_url` varchar(400) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `libros`
--

INSERT INTO `libros` (`id`, `titulo`, `autor`, `editorial`, `libro_numero`, `categoria_codigo`, `foto_url`, `createdAt`, `updatedAt`) VALUES
(1, 'Habilidades de Comunicación', 'Fernando de Manuel', 'Marketing Editorial', '00001', '038', NULL, '2026-01-14 16:07:55', '2026-01-14 16:07:55'),
(2, 'Programación en Java', 'Autor Java', 'Tech Books', '00002', 'INF', NULL, '2026-01-14 16:07:55', '2026-01-14 16:07:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notificaciones`
--

CREATE TABLE `notificaciones` (
  `id` bigint(20) NOT NULL,
  `usuario_id` bigint(20) NOT NULL,
  `tipo` enum('preaviso_devolucion','estado_solicitud','inicio_sancion','fin_sancion') NOT NULL,
  `prestamo_id` bigint(20) DEFAULT NULL,
  `solicitud_id` bigint(20) DEFAULT NULL,
  `canal` enum('email') NOT NULL DEFAULT 'email',
  `enviada_en` datetime NOT NULL,
  `payload` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prestamos`
--

CREATE TABLE `prestamos` (
  `id` bigint(20) NOT NULL,
  `usuario_id` bigint(20) NOT NULL,
  `ejemplar_id` bigint(20) DEFAULT NULL,
  `unidad_id` bigint(20) DEFAULT NULL,
  `solicitud_id` bigint(20) DEFAULT NULL,
  `tipo` enum('a','b') NOT NULL,
  `estado` enum('activo','vencido','cerrado') NOT NULL DEFAULT 'activo',
  `fecha_inicio` datetime NOT NULL,
  `fecha_devolucion_prevista` datetime NOT NULL,
  `fecha_devolucion_real` datetime DEFAULT NULL,
  `profesor_solicitante_id` bigint(20) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `prestamos`
--

INSERT INTO `prestamos` (`id`, `usuario_id`, `ejemplar_id`, `unidad_id`, `solicitud_id`, `tipo`, `estado`, `fecha_inicio`, `fecha_devolucion_prevista`, `fecha_devolucion_real`, `profesor_solicitante_id`, `createdAt`, `updatedAt`) VALUES
(1, 3, NULL, 1, 2, 'b', 'activo', '2026-01-13 16:07:55', '2026-01-15 16:07:55', NULL, NULL, '2026-01-14 16:07:55', '2026-01-14 16:07:55'),
(2, 4, 2, NULL, NULL, 'b', 'vencido', '2026-01-07 16:07:55', '2026-01-11 16:07:55', NULL, NULL, '2026-01-14 16:07:55', '2026-01-14 16:07:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `sanciones`
--

CREATE TABLE `sanciones` (
  `id` bigint(20) NOT NULL,
  `usuario_id` bigint(20) NOT NULL,
  `severidad` enum('s1_1sem','s2_1mes','s3_indefinida') NOT NULL,
  `estado` enum('activa','finalizada') NOT NULL DEFAULT 'activa',
  `inicio` datetime NOT NULL,
  `fin` datetime DEFAULT NULL,
  `motivo` text DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `sanciones`
--

INSERT INTO `sanciones` (`id`, `usuario_id`, `severidad`, `estado`, `inicio`, `fin`, `motivo`, `createdAt`, `updatedAt`) VALUES
(1, 4, 's1_1sem', 'activa', '2026-01-14 16:07:55', '2026-01-21 16:07:55', 'Retraso en devolución', '2026-01-14 16:07:55', '2026-01-14 16:07:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes`
--

CREATE TABLE `solicitudes` (
  `id` bigint(20) NOT NULL,
  `usuario_id` bigint(20) NOT NULL,
  `ejemplar_id` bigint(20) DEFAULT NULL,
  `unidad_id` bigint(20) DEFAULT NULL,
  `tipo` enum('prof_trabajo','uso_propio') NOT NULL,
  `estado` enum('pendiente','aprobada','rechazada','cancelada') NOT NULL DEFAULT 'pendiente',
  `normas_aceptadas` tinyint(1) NOT NULL DEFAULT 0,
  `observaciones` text DEFAULT NULL,
  `gestionado_por_id` bigint(20) DEFAULT NULL,
  `creada_en` datetime NOT NULL,
  `resuelta_en` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `solicitudes`
--

INSERT INTO `solicitudes` (`id`, `usuario_id`, `ejemplar_id`, `unidad_id`, `tipo`, `estado`, `normas_aceptadas`, `observaciones`, `gestionado_por_id`, `creada_en`, `resuelta_en`, `createdAt`, `updatedAt`) VALUES
(1, 2, 1, NULL, 'uso_propio', 'pendiente', 1, 'Para estudiar comunicación', NULL, '2026-01-14 16:07:55', NULL, '2026-01-14 16:07:55', '2026-01-14 16:07:55'),
(2, 3, NULL, 1, 'uso_propio', 'aprobada', 1, NULL, 1, '2026-01-14 16:07:55', '2026-01-14 16:07:55', '2026-01-14 16:07:55', '2026-01-14 16:07:55'),
(3, 4, NULL, 3, 'uso_propio', 'rechazada', 1, NULL, 1, '2026-01-14 16:07:55', '2026-01-14 16:07:55', '2026-01-14 16:07:55', '2026-01-14 16:07:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unidades`
--

CREATE TABLE `unidades` (
  `id` bigint(20) NOT NULL,
  `equipo_id` bigint(20) NOT NULL,
  `numero_serie` varchar(120) DEFAULT NULL,
  `codigo_barra` varchar(64) NOT NULL,
  `estado` enum('disponible','no_disponible','bloqueado','en_reparacion') NOT NULL DEFAULT 'disponible',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `unidades`
--

INSERT INTO `unidades` (`id`, `equipo_id`, `numero_serie`, `codigo_barra`, `estado`, `createdAt`, `updatedAt`) VALUES
(1, 1, NULL, 'EQ-CAM-001', 'disponible', '2026-01-14 16:07:55', '2026-01-14 16:07:55'),
(2, 1, NULL, 'EQ-CAM-002', 'disponible', '2026-01-14 16:07:55', '2026-01-14 16:07:55'),
(3, 2, NULL, 'EQ-AUD-001', 'disponible', '2026-01-14 16:07:55', '2026-01-14 16:07:55');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `apellidos` varchar(150) NOT NULL,
  `rol` enum('alumno','profesor','pas') NOT NULL,
  `estado_perfil` enum('activo','bloqueado','inactivo') NOT NULL DEFAULT 'activo',
  `tipo_estudios` enum('grado_uni','grado_sup','master') DEFAULT NULL,
  `grado` varchar(100) DEFAULT NULL,
  `curso` int(11) DEFAULT NULL,
  `fecha_inicio_est` date DEFAULT NULL,
  `fecha_fin_prev` date DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `password_hash`, `nombre`, `apellidos`, `rol`, `estado_perfil`, `tipo_estudios`, `grado`, `curso`, `fecha_inicio_est`, `fecha_fin_prev`, `createdAt`, `updatedAt`) VALUES
(1, 'pas@eusa.es', '$2b$10$CdM.QNCcG/rOnTAVQQK5N.6k8QhYsumDcKm2vvdnOTJrP/lKL3K66', 'PAS', 'EUSA', 'pas', 'activo', NULL, NULL, NULL, NULL, NULL, '2026-01-14 16:07:55', '2026-01-14 16:07:55'),
(2, 'alumno1@eusa.es', '$2b$10$HcUH8hWcjNYmfj0Ax/x2fu.7./lBNnXpFGOAd3gaf2SwF7xnVFs5K', 'Juan', 'Pérez', 'alumno', 'activo', NULL, 'DAM', 2, NULL, NULL, '2026-01-14 16:07:55', '2026-01-14 16:07:55'),
(3, 'alumno2@eusa.es', '$2b$10$BqcEr8y5YQB8P.4ITPLOK.U49/xF0LlBIbInmVoMhN2Hcq1HX9QuG', 'Lucía', 'Gómez', 'alumno', 'activo', NULL, 'DAW', 1, NULL, NULL, '2026-01-14 16:07:55', '2026-01-14 16:07:55'),
(4, 'alumno3@eusa.es', '$2b$10$3xUsSlX6tV/7IJDuEX7eduHRWWQRikbTMUvWWfTToDT8nzJ2O70Aa', 'Mario', 'Ruiz', 'alumno', 'activo', NULL, 'DAM', 1, NULL, NULL, '2026-01-14 16:07:55', '2026-01-14 16:07:55'),
(5, 'profesor@eusa.es', '$2b$10$StYEe462uEqPYie2aT3xu.yrB95YF1zNK94KxeKZJdNeiQdh9lSzK', 'Carlos', 'Profesor', 'profesor', 'activo', NULL, NULL, NULL, NULL, NULL, '2026-01-14 16:07:55', '2026-01-14 16:07:55');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `ejemplares`
--
ALTER TABLE `ejemplares`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_barra` (`codigo_barra`),
  ADD KEY `libro_id` (`libro_id`);

--
-- Indices de la tabla `equipos`
--
ALTER TABLE `equipos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_codigo` (`categoria_codigo`);

--
-- Indices de la tabla `libros`
--
ALTER TABLE `libros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_codigo` (`categoria_codigo`);

--
-- Indices de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `prestamo_id` (`prestamo_id`),
  ADD KEY `solicitud_id` (`solicitud_id`);

--
-- Indices de la tabla `prestamos`
--
ALTER TABLE `prestamos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `ejemplar_id` (`ejemplar_id`),
  ADD KEY `unidad_id` (`unidad_id`),
  ADD KEY `solicitud_id` (`solicitud_id`),
  ADD KEY `profesor_solicitante_id` (`profesor_solicitante_id`);

--
-- Indices de la tabla `sanciones`
--
ALTER TABLE `sanciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `ejemplar_id` (`ejemplar_id`),
  ADD KEY `unidad_id` (`unidad_id`),
  ADD KEY `gestionado_por_id` (`gestionado_por_id`);

--
-- Indices de la tabla `unidades`
--
ALTER TABLE `unidades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo_barra` (`codigo_barra`),
  ADD KEY `equipo_id` (`equipo_id`);

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
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `ejemplares`
--
ALTER TABLE `ejemplares`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `equipos`
--
ALTER TABLE `equipos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `libros`
--
ALTER TABLE `libros`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `prestamos`
--
ALTER TABLE `prestamos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `sanciones`
--
ALTER TABLE `sanciones`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `unidades`
--
ALTER TABLE `unidades`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `ejemplares`
--
ALTER TABLE `ejemplares`
  ADD CONSTRAINT `ejemplares_ibfk_1` FOREIGN KEY (`libro_id`) REFERENCES `libros` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `equipos`
--
ALTER TABLE `equipos`
  ADD CONSTRAINT `equipos_ibfk_1` FOREIGN KEY (`categoria_codigo`) REFERENCES `categorias` (`codigo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `libros`
--
ALTER TABLE `libros`
  ADD CONSTRAINT `libros_ibfk_1` FOREIGN KEY (`categoria_codigo`) REFERENCES `categorias` (`codigo`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  ADD CONSTRAINT `notificaciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `notificaciones_ibfk_2` FOREIGN KEY (`prestamo_id`) REFERENCES `prestamos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `notificaciones_ibfk_3` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `prestamos`
--
ALTER TABLE `prestamos`
  ADD CONSTRAINT `prestamos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `prestamos_ibfk_2` FOREIGN KEY (`ejemplar_id`) REFERENCES `ejemplares` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `prestamos_ibfk_3` FOREIGN KEY (`unidad_id`) REFERENCES `unidades` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `prestamos_ibfk_4` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `prestamos_ibfk_5` FOREIGN KEY (`profesor_solicitante_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `sanciones`
--
ALTER TABLE `sanciones`
  ADD CONSTRAINT `sanciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD CONSTRAINT `solicitudes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `solicitudes_ibfk_2` FOREIGN KEY (`ejemplar_id`) REFERENCES `ejemplares` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `solicitudes_ibfk_3` FOREIGN KEY (`unidad_id`) REFERENCES `unidades` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `solicitudes_ibfk_4` FOREIGN KEY (`gestionado_por_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `unidades`
--
ALTER TABLE `unidades`
  ADD CONSTRAINT `unidades_ibfk_1` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
