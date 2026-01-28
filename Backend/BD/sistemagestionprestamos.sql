-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 28-01-2026 a las 09:44:38
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
  `nombre` varchar(120) NOT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `activa`, `createdAt`, `updatedAt`) VALUES
(1, 'Fotografía', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(2, 'Iluminación', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(3, 'Sonido', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(4, 'Informática', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(5, 'Accesorios', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `configuraciones`
--

CREATE TABLE `configuraciones` (
  `clave` varchar(50) NOT NULL,
  `valor` varchar(255) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `configuraciones`
--

INSERT INTO `configuraciones` (`clave`, `valor`, `descripcion`) VALUES
('TRIMESTRE_1_FIN', '15-12', 'Fin T1'),
('TRIMESTRE_2_FIN', '15-03', 'Fin T2'),
('TRIMESTRE_3_FIN', '15-06', 'Fin T3');

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
(1, 1, 'BK-0-A', NULL, NULL, NULL, '', '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(2, 1, 'BK-0-B', NULL, NULL, NULL, 'disponible', '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(3, 2, 'BK-1-A', NULL, NULL, NULL, 'disponible', '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(4, 2, 'BK-1-B', NULL, NULL, NULL, 'disponible', '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(5, 3, 'BK-2-A', NULL, NULL, NULL, 'disponible', '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(6, 3, 'BK-2-B', NULL, NULL, NULL, 'disponible', '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(7, 4, 'BK-3-A', NULL, NULL, NULL, 'disponible', '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(8, 4, 'BK-3-B', NULL, NULL, NULL, 'disponible', '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(9, 5, 'BK-4-A', NULL, NULL, NULL, 'disponible', '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(10, 5, 'BK-4-B', NULL, NULL, NULL, 'disponible', '2026-01-28 08:44:02', '2026-01-28 08:44:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `equipos`
--

CREATE TABLE `equipos` (
  `id` bigint(20) NOT NULL,
  `categoria_id` bigint(20) NOT NULL,
  `nombre_id` bigint(20) NOT NULL,
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

INSERT INTO `equipos` (`id`, `categoria_id`, `nombre_id`, `marca`, `modelo`, `descripcion`, `foto_url`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 'Canon', '5D Mark IV', 'Full Frame', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(2, 1, 1, 'Sony', 'A7 III', 'Mirrorless', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(3, 1, 2, 'Manfrotto', '055', 'Trípode robusto', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(4, 3, 3, 'Sennheiser', 'G4', 'Inalámbrico', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(5, 4, 4, 'Dell', 'Latitude', 'i5 8GB', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(6, 2, 5, 'Aputure', '120d', 'Luz día', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `generos`
--

CREATE TABLE `generos` (
  `id` bigint(20) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `generos`
--

INSERT INTO `generos` (`id`, `nombre`, `activo`, `createdAt`, `updatedAt`) VALUES
(1, 'Novela', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(2, 'Manual Técnico', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(3, 'Ensayo', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(4, 'Arte', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(5, 'Historia', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `grados`
--

CREATE TABLE `grados` (
  `id` bigint(20) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `grados`
--

INSERT INTO `grados` (`id`, `nombre`, `activo`, `createdAt`, `updatedAt`) VALUES
(1, 'Periodismo', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(2, 'Publicidad y RRPP', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(3, 'Comunicación Audiovisual', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(4, 'Doble Grado PER+CAV', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(5, 'Ciclo DAM', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(6, 'Ciclo DAW', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02');

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
  `genero_id` bigint(20) NOT NULL,
  `foto_url` varchar(400) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `libros`
--

INSERT INTO `libros` (`id`, `titulo`, `autor`, `editorial`, `libro_numero`, `genero_id`, `foto_url`, `createdAt`, `updatedAt`) VALUES
(1, 'Clean Architecture', 'Uncle Bob', NULL, 'L001', 2, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(2, 'El Quijote', 'Cervantes', NULL, 'L002', 1, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(3, 'La Luz en Cine', 'Storaro', NULL, 'L003', 4, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(4, 'Sapiens', 'Harari', NULL, 'L004', 3, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(5, 'JavaScript Good Parts', 'Crockford', NULL, 'L005', 2, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `motivos_rechazo`
--

CREATE TABLE `motivos_rechazo` (
  `id` bigint(20) NOT NULL,
  `titulo_es` varchar(255) NOT NULL,
  `cuerpo_es` text NOT NULL,
  `titulo_en` varchar(255) DEFAULT NULL,
  `cuerpo_en` text DEFAULT NULL,
  `clave` varchar(50) DEFAULT NULL COMMENT 'Identificador interno opcional (ej: NO_STOCK)',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `motivos_rechazo`
--

INSERT INTO `motivos_rechazo` (`id`, `titulo_es`, `cuerpo_es`, `titulo_en`, `cuerpo_en`, `clave`, `createdAt`, `updatedAt`) VALUES
(1, 'Material no disponible', 'El material no se encuentra disponible.', 'Item not available', 'Item not available.', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(2, 'Sanción vigente', 'Tienes sanción activa.', 'Sanction active', 'You have an active sanction.', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(3, 'Fin de Curso', 'Cierre de préstamos por fin de curso.', 'End of Term', 'Loans closed.', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(4, 'Datos incompletos', 'Solicitud mal formada.', 'Incomplete data', 'Bad request.', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(5, 'Exceso de cupo', 'Has superado el límite de préstamos.', 'Quota exceeded', 'Limit reached.', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `nombres`
--

CREATE TABLE `nombres` (
  `id` bigint(20) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `activa` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `nombres`
--

INSERT INTO `nombres` (`id`, `nombre`, `activa`, `createdAt`, `updatedAt`) VALUES
(1, 'Cámara Réflex', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(2, 'Trípode Video', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(3, 'Micrófono Corbata', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(4, 'Portátil Windows', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(5, 'Foco LED', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02');

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
  `solicitud_id` bigint(20) DEFAULT NULL,
  `tipo` enum('a','b','c') NOT NULL,
  `estado` enum('activo','vencido','cerrado') NOT NULL DEFAULT 'activo',
  `fecha_inicio` datetime NOT NULL,
  `fecha_devolucion_prevista` datetime NOT NULL,
  `fecha_devolucion_real` datetime DEFAULT NULL COMMENT 'Fecha en la que se cerró COMPLETAMENTE el préstamo',
  `profesor_solicitante_id` bigint(20) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ejemplar_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `prestamos`
--

INSERT INTO `prestamos` (`id`, `usuario_id`, `solicitud_id`, `tipo`, `estado`, `fecha_inicio`, `fecha_devolucion_prevista`, `fecha_devolucion_real`, `profesor_solicitante_id`, `createdAt`, `updatedAt`, `ejemplar_id`) VALUES
(1, 7, 2, 'a', 'activo', '2026-01-28 08:44:02', '2026-01-29 08:44:02', NULL, 3, '2026-01-28 08:44:02', '2026-01-28 08:44:02', NULL),
(2, 12, 5, 'b', 'vencido', '2026-01-23 08:44:02', '2026-01-27 08:44:02', NULL, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02', NULL),
(3, 11, NULL, 'c', 'cerrado', '2026-01-18 08:44:02', '2026-01-19 08:44:02', '2026-01-19 08:44:02', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02', NULL),
(4, 8, NULL, 'b', 'cerrado', '2025-12-29 08:44:02', '2026-01-03 08:44:02', '2026-01-03 08:44:02', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02', NULL),
(5, 7, NULL, 'b', 'cerrado', '2025-12-29 08:44:02', '2026-01-03 08:44:02', '2026-01-03 08:44:02', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02', NULL),
(6, 10, NULL, 'b', 'cerrado', '2025-12-29 08:44:02', '2026-01-03 08:44:02', '2026-01-03 08:44:02', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02', NULL),
(7, 9, NULL, 'b', 'cerrado', '2025-12-29 08:44:02', '2026-01-03 08:44:02', '2026-01-03 08:44:02', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02', NULL),
(8, 12, NULL, 'b', 'cerrado', '2025-12-29 08:44:02', '2026-01-03 08:44:02', '2026-01-03 08:44:02', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `prestamo_items`
--

CREATE TABLE `prestamo_items` (
  `id` bigint(20) NOT NULL,
  `prestamo_id` bigint(20) NOT NULL,
  `unidad_id` bigint(20) DEFAULT NULL,
  `ejemplar_id` bigint(20) DEFAULT NULL,
  `fecha_devolucion` datetime DEFAULT NULL COMMENT 'Fecha real de devolución de este item específico',
  `devuelto` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `prestamo_items`
--

INSERT INTO `prestamo_items` (`id`, `prestamo_id`, `unidad_id`, `ejemplar_id`, `fecha_devolucion`, `devuelto`, `createdAt`, `updatedAt`) VALUES
(1, 1, 3, NULL, NULL, 0, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(2, 2, 5, NULL, NULL, 0, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(3, 4, 1, NULL, NULL, 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(4, 5, 2, NULL, NULL, 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(5, 6, 3, NULL, NULL, 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(6, 7, 4, NULL, NULL, 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(7, 8, 5, NULL, NULL, 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02');

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
(1, 11, '', '', '2025-01-01 00:00:00', '2025-01-07 00:00:00', 'Retraso leve', '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(2, 10, '', 'activa', '2026-01-28 08:44:02', '2026-02-12 08:44:02', 'Rotura Material', '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(3, 8, '', '', '2025-11-29 08:44:02', '2025-12-04 08:44:02', 'Seed generado #0', '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(4, 7, '', '', '2025-11-29 08:44:02', '2025-12-04 08:44:02', 'Seed generado #1', '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(5, 10, '', '', '2025-11-29 08:44:02', '2025-12-04 08:44:02', 'Seed generado #2', '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(6, 9, '', '', '2025-11-29 08:44:02', '2025-12-04 08:44:02', 'Seed generado #3', '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(7, 12, '', '', '2025-11-29 08:44:02', '2025-12-04 08:44:02', 'Seed generado #4', '2026-01-28 08:44:02', '2026-01-28 08:44:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes`
--

CREATE TABLE `solicitudes` (
  `id` bigint(20) NOT NULL,
  `usuario_id` bigint(20) NOT NULL,
  `tipo` enum('prof_trabajo','uso_propio','presencial') NOT NULL,
  `estado` enum('pendiente','aprobada','rechazada','cancelada') NOT NULL DEFAULT 'pendiente',
  `normas_aceptadas` tinyint(1) NOT NULL DEFAULT 0,
  `observaciones` text DEFAULT NULL,
  `gestionado_por_id` bigint(20) DEFAULT NULL,
  `profesor_asociado_id` bigint(20) DEFAULT NULL,
  `grado_id` bigint(20) DEFAULT NULL,
  `motivo_rechazo` text DEFAULT NULL,
  `creada_en` datetime NOT NULL,
  `resuelta_en` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ejemplar_id` bigint(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `solicitudes`
--

INSERT INTO `solicitudes` (`id`, `usuario_id`, `tipo`, `estado`, `normas_aceptadas`, `observaciones`, `gestionado_por_id`, `profesor_asociado_id`, `grado_id`, `motivo_rechazo`, `creada_en`, `resuelta_en`, `createdAt`, `updatedAt`, `ejemplar_id`) VALUES
(1, 8, 'uso_propio', 'pendiente', 1, 'Urgente', NULL, NULL, NULL, NULL, '2026-01-28 08:44:02', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02', NULL),
(2, 7, 'prof_trabajo', 'aprobada', 1, NULL, NULL, 3, 1, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02', '2026-01-28 08:44:02', '2026-01-28 08:44:02', NULL),
(3, 10, 'uso_propio', 'rechazada', 1, NULL, NULL, NULL, NULL, 'No hay stock', '2026-01-28 08:44:02', '2026-01-28 08:44:02', '2026-01-28 08:44:02', '2026-01-28 08:44:02', NULL),
(4, 9, 'prof_trabajo', 'pendiente', 1, NULL, NULL, 4, 2, NULL, '2026-01-28 08:44:02', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02', NULL),
(5, 12, 'uso_propio', 'aprobada', 1, NULL, NULL, NULL, NULL, NULL, '2026-01-28 08:44:02', NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitud_items`
--

CREATE TABLE `solicitud_items` (
  `id` bigint(20) NOT NULL,
  `solicitud_id` bigint(20) NOT NULL,
  `libro_id` bigint(20) DEFAULT NULL,
  `equipo_id` bigint(20) DEFAULT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `solicitud_items`
--

INSERT INTO `solicitud_items` (`id`, `solicitud_id`, `libro_id`, `equipo_id`, `cantidad`, `createdAt`, `updatedAt`) VALUES
(1, 1, NULL, 1, 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(2, 2, NULL, 2, 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(3, 3, 1, NULL, 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(4, 4, NULL, 5, 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(5, 5, NULL, 3, 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `unidades`
--

CREATE TABLE `unidades` (
  `id` bigint(20) NOT NULL,
  `equipo_id` bigint(20) NOT NULL,
  `numero_serie` varchar(120) DEFAULT NULL,
  `codigo_barra` varchar(120) NOT NULL,
  `ubicacion` varchar(150) DEFAULT NULL COMMENT 'Ej: Almacén A - Estantería 3 - Balda 2',
  `estado_fisico` enum('funciona','no_funciona','en_reparacion','obsoleto','falla','perdido_sustraido') NOT NULL DEFAULT 'funciona',
  `esta_prestado` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `unidades`
--

INSERT INTO `unidades` (`id`, `equipo_id`, `numero_serie`, `codigo_barra`, `ubicacion`, `estado_fisico`, `esta_prestado`, `createdAt`, `updatedAt`) VALUES
(1, 1, NULL, 'EQ-0-A', NULL, 'funciona', 1, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(2, 1, NULL, 'EQ-0-B', NULL, 'funciona', 0, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(3, 2, NULL, 'EQ-1-A', NULL, '', 0, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(4, 2, NULL, 'EQ-1-B', NULL, 'funciona', 0, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(5, 3, NULL, 'EQ-2-A', NULL, 'funciona', 0, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(6, 3, NULL, 'EQ-2-B', NULL, 'funciona', 0, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(7, 4, NULL, 'EQ-3-A', NULL, 'funciona', 0, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(8, 4, NULL, 'EQ-3-B', NULL, 'funciona', 0, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(9, 5, NULL, 'EQ-4-A', NULL, 'funciona', 0, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(10, 5, NULL, 'EQ-4-B', NULL, 'funciona', 0, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(11, 6, NULL, 'EQ-5-A', NULL, 'funciona', 0, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(12, 6, NULL, 'EQ-5-B', NULL, 'funciona', 0, '2026-01-28 08:44:02', '2026-01-28 08:44:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `codigo_tarjeta` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `apellidos` varchar(150) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `rol` enum('alumno','profesor','pas') NOT NULL,
  `estado_perfil` enum('activo','bloqueado','inactivo') NOT NULL DEFAULT 'activo',
  `tipo_estudios` enum('grado_uni','grado_sup','master') DEFAULT NULL,
  `grado` varchar(100) DEFAULT NULL,
  `grado_id` bigint(20) DEFAULT NULL,
  `curso` int(11) DEFAULT NULL,
  `fecha_inicio_est` date DEFAULT NULL,
  `fecha_fin_prev` date DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `email`, `codigo_tarjeta`, `password_hash`, `nombre`, `apellidos`, `telefono`, `rol`, `estado_perfil`, `tipo_estudios`, `grado`, `grado_id`, `curso`, `fecha_inicio_est`, `fecha_fin_prev`, `createdAt`, `updatedAt`) VALUES
(1, 'pas@eusa.es', 'EUSA20260128094402412', '$2b$10$uOzsVOhB569LWMoQbgilTum1UcTv5viREk82J6V1BUyueRf6dfzSa', 'Admin', 'PAS', '+34955123456', 'pas', 'activo', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(2, 'prof4@eusa.es', 'EUSA20260128094402416', '$2b$10$VoU0e710eQr9tzXnMsH55uryHyjiKPFy6DS49.ygsPUqjPB7zWxmC', 'Maria', 'Mates', '+34612345004', 'profesor', 'activo', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(3, 'prof1@eusa.es', 'EUSA20260128094402413', '$2b$10$TV5yN40n6rRuIY08QuMINeDasoj6ZyERvv2e0QN0ft88Slin2trJq', 'Manuel', 'Chaves', '+34612345001', 'profesor', 'activo', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(4, 'prof2@eusa.es', 'EUSA20260128094402414', '$2b$10$yXrLfCAxSRuvPay5RI7pWOSWWhGbX7X1zpup/UYzh8tRxv3MmqGV.', 'Laura', 'Video', '+34612345002', 'profesor', 'activo', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(5, 'prof3@eusa.es', 'EUSA20260128094402415', '$2b$10$1YFq5ohg0aDouW7LmQM5TuF9hSsp2A90oXbAu69WRXYy/C8U5ZTeK', 'David', 'Codigo', '+34612345003', 'profesor', 'activo', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(6, 'prof5@eusa.es', 'EUSA20260128094402417', '$2b$10$bz9bQG7A4u8abKcAmRiDBeNg5IaFzdH.cp2U1tNUg0rrBKPIroBKK', 'Jose', 'Historia', '+34612345005', 'profesor', 'activo', NULL, NULL, NULL, NULL, NULL, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(7, 'alum2@eusa.es', 'EUSA20260128094402419', '$2b$10$wQGIxbGyWasetHpT7DkvCOXkwlSIrfo34LgORgtJC5xuLEhDeM.KC', 'Pedro', 'Dos', '+34622111002', 'alumno', 'activo', NULL, NULL, 3, 2, NULL, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(8, 'alum1@eusa.es', 'EUSA20260128094402418', '$2b$10$w8DMT1YOmn8mwyP.jX6RVehFBurB54sYwBqsVT6zXnXCnAZg987E2', 'Juan', 'Uno', '+34622111001', 'alumno', 'activo', NULL, NULL, 1, 1, NULL, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(9, 'alum4@eusa.es', 'EUSA20260128094402421', '$2b$10$zTcUZ07hHcKMy7yHILt0.uAHxW8..HDq3jddC0kz6rHA5r3GvtG2O', 'Ana', 'Cuatro', '+34622111004', 'alumno', 'activo', NULL, NULL, 2, 3, NULL, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(10, 'alum3@eusa.es', 'EUSA20260128094402420', '$2b$10$fmfb.WZ8bYlkp4lelGRiNuxClHtYarJp9xjuQMQGDKzc4stvAKHbq', 'Luis', 'Tres', '+34622111003', 'alumno', 'activo', NULL, NULL, 5, 1, NULL, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(11, 'alum6@eusa.es', 'EUSA20260128094402423', '$2b$10$nKUfkDYlzdODuGlyfenSFuRmFufHUIg1vh9fFhEX6BL1EyV04hUgC', 'Cris', 'Seis', '+34622111006', 'alumno', 'activo', NULL, NULL, 5, 2, NULL, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02'),
(12, 'alum5@eusa.es', 'EUSA20260128094402422', '$2b$10$smlIdUudq2PlFH8ivrYjoOpsljkt.4RGziVQUwLIdi1GD9YlNtd4m', 'Eva', 'Cinco', '+34622111005', 'alumno', 'activo', NULL, NULL, 3, 4, NULL, NULL, '2026-01-28 08:44:02', '2026-01-28 08:44:02');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `configuraciones`
--
ALTER TABLE `configuraciones`
  ADD PRIMARY KEY (`clave`);

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
  ADD KEY `categoria_id` (`categoria_id`),
  ADD KEY `nombre_id` (`nombre_id`);

--
-- Indices de la tabla `generos`
--
ALTER TABLE `generos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `grados`
--
ALTER TABLE `grados`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `libros`
--
ALTER TABLE `libros`
  ADD PRIMARY KEY (`id`),
  ADD KEY `genero_id` (`genero_id`);

--
-- Indices de la tabla `motivos_rechazo`
--
ALTER TABLE `motivos_rechazo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clave` (`clave`);

--
-- Indices de la tabla `nombres`
--
ALTER TABLE `nombres`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

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
  ADD KEY `solicitud_id` (`solicitud_id`),
  ADD KEY `profesor_solicitante_id` (`profesor_solicitante_id`),
  ADD KEY `ejemplar_id` (`ejemplar_id`);

--
-- Indices de la tabla `prestamo_items`
--
ALTER TABLE `prestamo_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `prestamo_id` (`prestamo_id`),
  ADD KEY `unidad_id` (`unidad_id`),
  ADD KEY `ejemplar_id` (`ejemplar_id`);

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
  ADD KEY `gestionado_por_id` (`gestionado_por_id`),
  ADD KEY `profesor_asociado_id` (`profesor_asociado_id`),
  ADD KEY `grado_id` (`grado_id`),
  ADD KEY `ejemplar_id` (`ejemplar_id`);

--
-- Indices de la tabla `solicitud_items`
--
ALTER TABLE `solicitud_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `solicitud_id` (`solicitud_id`),
  ADD KEY `libro_id` (`libro_id`),
  ADD KEY `equipo_id` (`equipo_id`);

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
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `codigo_tarjeta` (`codigo_tarjeta`),
  ADD KEY `grado_id` (`grado_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `ejemplares`
--
ALTER TABLE `ejemplares`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `equipos`
--
ALTER TABLE `equipos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `generos`
--
ALTER TABLE `generos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `grados`
--
ALTER TABLE `grados`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `libros`
--
ALTER TABLE `libros`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `motivos_rechazo`
--
ALTER TABLE `motivos_rechazo`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `nombres`
--
ALTER TABLE `nombres`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `notificaciones`
--
ALTER TABLE `notificaciones`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `prestamos`
--
ALTER TABLE `prestamos`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `prestamo_items`
--
ALTER TABLE `prestamo_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `sanciones`
--
ALTER TABLE `sanciones`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `solicitud_items`
--
ALTER TABLE `solicitud_items`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `unidades`
--
ALTER TABLE `unidades`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

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
  ADD CONSTRAINT `equipos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `equipos_ibfk_2` FOREIGN KEY (`nombre_id`) REFERENCES `nombres` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `libros`
--
ALTER TABLE `libros`
  ADD CONSTRAINT `libros_ibfk_1` FOREIGN KEY (`genero_id`) REFERENCES `generos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

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
  ADD CONSTRAINT `prestamos_ibfk_2` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `prestamos_ibfk_3` FOREIGN KEY (`profesor_solicitante_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `prestamos_ibfk_4` FOREIGN KEY (`ejemplar_id`) REFERENCES `ejemplares` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `prestamo_items`
--
ALTER TABLE `prestamo_items`
  ADD CONSTRAINT `prestamo_items_ibfk_1` FOREIGN KEY (`prestamo_id`) REFERENCES `prestamos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `prestamo_items_ibfk_2` FOREIGN KEY (`unidad_id`) REFERENCES `unidades` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `prestamo_items_ibfk_3` FOREIGN KEY (`ejemplar_id`) REFERENCES `ejemplares` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

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
  ADD CONSTRAINT `solicitudes_ibfk_2` FOREIGN KEY (`gestionado_por_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `solicitudes_ibfk_3` FOREIGN KEY (`profesor_asociado_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `solicitudes_ibfk_4` FOREIGN KEY (`grado_id`) REFERENCES `grados` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `solicitudes_ibfk_5` FOREIGN KEY (`ejemplar_id`) REFERENCES `ejemplares` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `solicitud_items`
--
ALTER TABLE `solicitud_items`
  ADD CONSTRAINT `solicitud_items_ibfk_1` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `solicitud_items_ibfk_2` FOREIGN KEY (`libro_id`) REFERENCES `libros` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `solicitud_items_ibfk_3` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `unidades`
--
ALTER TABLE `unidades`
  ADD CONSTRAINT `unidades_ibfk_1` FOREIGN KEY (`equipo_id`) REFERENCES `equipos` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`grado_id`) REFERENCES `grados` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
