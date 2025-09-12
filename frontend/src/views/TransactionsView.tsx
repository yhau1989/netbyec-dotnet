import { useState, type FC } from "react";
import { useForm } from "react-hook-form";

type Transaction = {
  id: number;
  product: string;
  quantity: number;
  date: string;
};

type TransactionForm = {
  product: string;
  quantity: number;
};

const initialProducts = [
  { name: "Producto A", stock: 10 },
  { name: "Producto B", stock: 5 },
];

const initialTransactions: Transaction[] = [
  { id: 1, product: "Producto A", quantity: 2, date: "2025-09-11" },
];

const TransactionsView: FC = () => {
  const [transactions, setTransactions] =
    useState<Transaction[]>(initialTransactions);
  const [products, setProducts] = useState(initialProducts);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionForm>();

  // Filtros avanzados: búsqueda por producto
  const filteredTransactions = transactions.filter((t) =>
    t.product.toLowerCase().includes(search.toLowerCase())
  );

  // Validación compleja: no vender más stock del disponible
  const onSubmit = (data: TransactionForm) => {
    const prod = products.find((p) => p.name === data.product);
    if (!prod) {
      setMessage("Error: Producto no encontrado.");
      return;
    }
    if (data.quantity > prod.stock) {
      setMessage("Error: No se puede vender más stock del disponible.");
      return;
    }
    // Registrar transacción
    const newTransaction: Transaction = {
      id: transactions.length + 1,
      product: data.product,
      quantity: Number(data.quantity),
      date: new Date().toISOString().slice(0, 10),
    };
    setTransactions([...transactions, newTransaction]);
    // Actualizar stock
    setProducts(
      products.map((p) =>
        p.name === data.product ? { ...p, stock: p.stock - data.quantity } : p
      )
    );
    setMessage("Transacción registrada exitosamente.");
    reset();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Gestión de Transacciones</h2>

      {/* Mensaje de éxito/error */}
      {message && (
        <div
          className={`mb-4 p-2 rounded ${
            message.startsWith("Error")
              ? "bg-red-200 text-red-800"
              : "bg-green-200 text-green-800"
          }`}
        >
          {message}
        </div>
      )}

      {/* Búsqueda avanzada */}
      <div className="mb-6 flex gap-2 items-center">
        <input
          type="text"
          placeholder="Buscar por producto..."
          className="border p-2 rounded w-full max-w-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="bg-gray-300 px-3 py-2 rounded"
          onClick={() => setSearch("")}
        >
          Limpiar
        </button>
      </div>

      {/* Formulario de transacción */}
      <form className="mb-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block mb-1 font-medium">Producto</label>
          <select
            className="border p-2 rounded w-full"
            {...register("product", { required: "Campo requerido" })}
          >
            <option value="">Seleccione un producto</option>
            {products.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name} (Stock: {p.stock})
              </option>
            ))}
          </select>
          {errors.product && (
            <span className="text-red-600 text-sm">
              {errors.product.message}
            </span>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Cantidad</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            {...register("quantity", {
              required: "Campo requerido",
              min: { value: 1, message: "Debe ser mayor a 0" },
            })}
          />
          {errors.quantity && (
            <span className="text-red-600 text-sm">
              {errors.quantity.message}
            </span>
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Registrar transacción
        </button>
      </form>

      {/* Tabla dinámica de transacciones */}
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Producto</th>
            <th className="border px-2 py-1">Cantidad</th>
            <th className="border px-2 py-1">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {filteredTransactions.map((t) => (
            <tr key={t.id}>
              <td className="border px-2 py-1">{t.id}</td>
              <td className="border px-2 py-1">{t.product}</td>
              <td className="border px-2 py-1">{t.quantity}</td>
              <td className="border px-2 py-1">{t.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionsView;
