import { useState, useEffect } from "react";

export type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  imagen: string;
  precio: number;
  stock: number;
};

export const useProductosApi = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error("Error al obtener productos");
        const data = await res.json();
        setProductos(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, []);

  return { productos, loading, error };
};
