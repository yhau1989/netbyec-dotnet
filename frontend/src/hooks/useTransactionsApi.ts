import { useState, useEffect } from "react";
import type { Transaccion } from "../types/general-types";
import { apiTransactionUrl } from "../constants";

export const useTransactionApi = () => {
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransacciones = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(apiTransactionUrl);
      if (!res.ok) throw new Error("Error al obtener transacciones");
      const data = await res.json();
      setTransacciones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransacciones();
  }, []);

  return { transacciones, loading, error, refetch: fetchTransacciones };
};
