-- Script para la base de datos ProductosDb
CREATE TABLE Productos
(
    Id INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(100) NOT NULL,
    Descripcion NVARCHAR(255),
    Categoria NVARCHAR(50),
    Imagen NVARCHAR(255),
    Precio DECIMAL(18,2) NOT NULL,
    Stock INT NOT NULL
);
