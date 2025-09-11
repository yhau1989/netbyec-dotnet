-- Script para la base de datos TransaccionesDb
CREATE TABLE Transacciones
(
    Id INT PRIMARY KEY IDENTITY(1,1),
    Fecha DATETIME NOT NULL,
    TipoTransaccion NVARCHAR(10) NOT NULL,
    -- 'Compra' o 'Venta'
    ProductoId INT NOT NULL,
    Cantidad INT NOT NULL,
    PrecioUnitario DECIMAL(18,2) NOT NULL,
    PrecioTotal DECIMAL(18,2) NOT NULL,
    Detalle NVARCHAR(255),
    FOREIGN KEY (ProductoId) REFERENCES Productos(Id)
);