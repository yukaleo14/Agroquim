CREATE DATABASE agroquimicos_db;
USE agroquimicos_db;

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE lotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE agroquimicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL,
  unidad ENUM('litros', 'kilogramos', 'dosis', 'cajas') NOT NULL
);

CREATE TABLE registros_lotes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  lote_id INT NOT NULL,
  fecha DATE NOT NULL,
  comentario TEXT,
  hectareas DECIMAL(10, 2) NOT NULL,
  FOREIGN KEY (lote_id) REFERENCES lotes(id)
);

CREATE TABLE registros_agroquimicos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  registro_id INT NOT NULL,
  agroquimico_id INT NOT NULL,
  cantidad DECIMAL(10, 2) NOT NULL,
  unidad ENUM('litros', 'kilogramos', 'dosis', 'cajas') NOT NULL,
  FOREIGN KEY (registro_id) REFERENCES registros_lotes(id),
  FOREIGN KEY (agroquimico_id) REFERENCES agroquimicos(id)
);
