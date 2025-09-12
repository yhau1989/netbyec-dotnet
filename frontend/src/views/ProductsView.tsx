import { useState, useEffect, type FC } from "react";
import { useProductosApi } from "../hooks/useProductosApi";
import type { Producto } from "../hooks/useProductosApi";
import { useForm } from "react-hook-form";

// ...existing code...

type ProductForm = {
  name: string;
  price: number;
  stock: number;
};

// ...existing code...

const ProductsView: FC = () => {
  const { productos, loading, error } = useProductosApi();
  const [products, setProducts] = useState<Producto[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<ProductForm | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductForm>();

  // Actualiza el estado local cuando la API responde
  useEffect(() => {
    setProducts(productos);
  }, [productos]);

  // Filtros avanzados: búsqueda por nombre
  const filteredProducts = products.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  // El formulario local sigue funcionando, pero solo afecta el estado local
  const onSubmit = (data: ProductForm) => {
    if (products.some((p) => p.nombre === data.name)) {
      setMessage("Error: El nombre del producto ya existe.");
      return;
    }
    const newProduct: Producto = {
      id: products.length + 1,
      nombre: data.name,
      descripcion: "",
      categoria: "",
      imagen: "",
      precio: Number(data.price),
      stock: Number(data.stock),
    };
    setProducts([...products, newProduct]);
    setMessage("Producto creado exitosamente (solo local, no API). ");
    reset();
  };

  // Eliminar producto
  const handleDelete = (id: number) => {
    setProducts(products.filter((p) => p.id !== id));
    setMessage("Producto eliminado exitosamente.");
    if (editId === id) {
      setEditId(null);
      setEditForm(null);
    }
  };

  // Iniciar edición
  const handleEdit = (product: Producto) => {
    setEditId(product.id);
    setEditForm({
      name: product.nombre,
      price: product.precio,
      stock: product.stock,
    });
    setMessage(null);
  };

  // Guardar edición
  const handleEditSave = () => {
    if (!editForm) return;
    // Validación compleja: nombre único (excepto el actual)
    if (products.some((p) => p.nombre === editForm.name && p.id !== editId)) {
      setMessage("Error: El nombre del producto ya existe.");
      return;
    }
    setProducts(
      products.map((p) =>
        p.id === editId
          ? {
              ...p,
              ...editForm,
              price: Number(editForm.price),
              stock: Number(editForm.stock),
            }
          : p
      )
    );
    setMessage("Producto editado exitosamente.");
    setEditId(null);
    setEditForm(null);
  };

  // Cancelar edición
  const handleEditCancel = () => {
    setEditId(null);
    setEditForm(null);
    setMessage(null);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Gestión de Productos</h2>

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
          placeholder="Buscar por nombre..."
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

      {/* Formulario de producto */}
      <form className="mb-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label className="block mb-1 font-medium">Nombre</label>
          <input
            className="border p-2 rounded w-full"
            {...register("name", { required: "Campo requerido" })}
          />
          {errors.name && (
            <span className="text-red-600 text-sm">{errors.name.message}</span>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Precio</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            {...register("price", {
              required: "Campo requerido",
              min: { value: 0, message: "Debe ser mayor o igual a 0" },
            })}
          />
          {errors.price && (
            <span className="text-red-600 text-sm">{errors.price.message}</span>
          )}
        </div>
        <div>
          <label className="block mb-1 font-medium">Stock</label>
          <input
            type="number"
            className="border p-2 rounded w-full"
            {...register("stock", {
              required: "Campo requerido",
              min: { value: 0, message: "Debe ser mayor o igual a 0" },
            })}
          />
          {errors.stock && (
            <span className="text-red-600 text-sm">{errors.stock.message}</span>
          )}
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Crear producto
        </button>
      </form>

      {/* Tabla dinámica de productos */}
      {loading ? (
        <div className="text-gray-500">Cargando productos...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1">ID</th>
              <th className="border px-2 py-1">Nombre</th>
              <th className="border px-2 py-1">Precio</th>
              <th className="border px-2 py-1">Stock</th>
              <th className="border px-2 py-1">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id}>
                <td className="border px-2 py-1">{product.id}</td>
                <td className="border px-2 py-1">
                  {editId === product.id ? (
                    <input
                      className="border p-1 rounded w-full"
                      value={editForm?.name ?? ""}
                      onChange={(e) =>
                        setEditForm((f) =>
                          f ? { ...f, name: e.target.value } : null
                        )
                      }
                    />
                  ) : (
                    product.nombre
                  )}
                </td>
                <td className="border px-2 py-1">
                  {editId === product.id ? (
                    <input
                      type="number"
                      className="border p-1 rounded w-full"
                      value={editForm?.price ?? 0}
                      onChange={(e) =>
                        setEditForm((f) =>
                          f ? { ...f, price: Number(e.target.value) } : null
                        )
                      }
                    />
                  ) : (
                    `$${product.precio}`
                  )}
                </td>
                <td className="border px-2 py-1">
                  {editId === product.id ? (
                    <input
                      type="number"
                      className="border p-1 rounded w-full"
                      value={editForm?.stock ?? 0}
                      onChange={(e) =>
                        setEditForm((f) =>
                          f ? { ...f, stock: Number(e.target.value) } : null
                        )
                      }
                    />
                  ) : (
                    product.stock
                  )}
                </td>
                <td className="border px-2 py-1">
                  {editId === product.id ? (
                    <>
                      <button
                        className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                        onClick={handleEditSave}
                      >
                        Guardar
                      </button>
                      <button
                        className="bg-gray-400 px-2 py-1 rounded"
                        onClick={handleEditCancel}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="bg-yellow-400 px-2 py-1 rounded mr-2"
                        onClick={() => handleEdit(product)}
                      >
                        Editar
                      </button>
                      <button
                        className="bg-red-500 text-white px-2 py-1 rounded"
                        onClick={() => handleDelete(product.id)}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ProductsView;
