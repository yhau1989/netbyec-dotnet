export type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  imagen: string;
  precio: number;
  stock: number;
};

export type Transaccion = {
  id: number;
  tipoTransaccion: "Compra" | "Venta";
  productoId: number;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  detalle: string;
  fecha: string; // ISO 8601 date string
};

export type NewProducto = Omit<Producto, "id">;
export type UpdateProducto = Partial<Omit<Producto, "id">>;
export type NewTransaccion = Omit<Transaccion, "id" | "fecha">;
export type UpdateTransaccion = Partial<Omit<Transaccion, "id" | "fecha">>;
