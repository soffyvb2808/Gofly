CREATE DATABASE IF NOT EXISTS gofly;
USE gofly;

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  rol VARCHAR(30) DEFAULT 'cliente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) DEFAULT 0,
  pais VARCHAR(100),
  ciudad VARCHAR(100),
  imagen VARCHAR(255),
  puntuacion TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ejemplo: contraseña "123456" hasheada (puede no coincidir en tu entorno)
INSERT INTO usuarios (nombre, email, password) VALUES
('Admin Demo', 'admin@gofly.test', '$2a$10$2bJtVw6g6w8mQxIu6y0bV.B2QW6A8dzA7/1s1CjP8qHbt6t6jv0Zu');

INSERT INTO productos (nombre, descripcion, precio, pais, ciudad, imagen, puntuacion) VALUES
('Torre Eiffel - París', 'Visita la icónica Torre Eiffel y descubre París.', 250000.00, 'Francia', 'París', 'eiffel.jpg', 5),
('Museo del Louvre', 'Entrada al Louvre y recorrido guiado.', 180000.00, 'Francia', 'París', 'louvre.jpg', 4),
('Disneyland Paris', 'Pase de un día en Disneyland Paris.', 300000.00, 'Francia', 'Marne-la-Vallée', 'disney.jpg', 5);
