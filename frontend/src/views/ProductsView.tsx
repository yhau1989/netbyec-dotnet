import { useState } from "react";
import {
  addProduct,
  updateProduct,
  deleteProduct,
} from "../ports/products-port";
import type { Producto } from "../types/general-types";
import { useProductosApi } from "../hooks/useProductosApi";
import { Table, Button, Alert, Input, Tooltip } from "antd";
import { SearchOutlined, HistoryOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import type { ColumnType } from "antd/es/table";
import { useRef } from "react";
import DrawerBase from "../components/custom-drawer";
import ProductDrawerForm from "../components/product-form";
import type { ProductDrawerFormValues } from "../components/product-form";

const ProductsView = () => {
  const { productos, loading, error, refetch } = useProductosApi();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  // Eliminar duplicados: handleDeleteProduct solo debe estar aquí
  const handleDeleteProduct = async (id: number) => {
    await deleteProduct(id);
    setCurrentPage(1);
    await refetch();
  };

  // Filtros y búsqueda para columnas
  const searchInput = useRef(null);
  const [tableState, setTableState] = useState({
    filteredInfo: {},
    sortedInfo: {},
  });
  const getColumnSearchProps = (
    dataIndex: keyof Producto
  ): ColumnType<Producto> => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
    }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={searchInput}
          placeholder={`Buscar ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => confirm()}
          style={{ marginBottom: 8, display: "block" }}
        />
        <Button
          type="primary"
          onClick={() => confirm()}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90, marginRight: 8 }}
        >
          Buscar
        </Button>
        <Button
          onClick={() => {
            if (clearFilters) clearFilters();
            confirm();
          }}
          size="small"
          style={{ width: 90 }}
        >
          Limpiar
        </Button>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined }} />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex]
            .toString()
            .toLowerCase()
            .includes((value as string).toLowerCase())
        : false,
    sorter: (a, b) => {
      if (
        typeof a[dataIndex] === "number" &&
        typeof b[dataIndex] === "number"
      ) {
        return (a[dataIndex] as number) - (b[dataIndex] as number);
      }
      return a[dataIndex].toString().localeCompare(b[dataIndex].toString());
    },
    sortDirections: ["descend", "ascend"],
    filteredValue: (tableState.filteredInfo as any)[dataIndex] || null,
  });

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", ...getColumnSearchProps("id") },
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      ...getColumnSearchProps("nombre"),
    },
    {
      title: "Descripción",
      dataIndex: "descripcion",
      key: "descripcion",
      ...getColumnSearchProps("descripcion"),
    },
    {
      title: "Categoría",
      dataIndex: "categoria",
      key: "categoria",
      ...getColumnSearchProps("categoria"),
    },
    {
      title: "Imagen",
      dataIndex: "imagen",
      key: "imagen",
      render: (img: string) => (
        <img
          src={img}
          alt="Producto"
          className="w-12 h-12 object-scale-down rounded"
        />
      ),
    },
    {
      title: "Precio",
      dataIndex: "precio",
      key: "precio",
      ...getColumnSearchProps("precio"),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      ...getColumnSearchProps("stock"),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: unknown, record: Producto) => (
        <>
          <Button
            type="link"
            onClick={() => {
              setEditingProduct(record);
              setEditMode(true);
              setDrawerOpen(true);
            }}
          >
            Editar
          </Button>
          <Button
            type="link"
            danger
            onClick={async () => {
              await handleDeleteProduct(record.id);
            }}
          >
            Eliminar
          </Button>
          <Tooltip title="Ver historial de transacciones">
            <Button
              type="link"
              icon={<HistoryOutlined />}
              onClick={() => navigate(`/product-transaction/${record.id}`)}
            />
          </Tooltip>
        </>
      ),
    },
  ];

  const handleAddProduct = async (values: ProductDrawerFormValues) => {
    setSaving(true);
    try {
      await addProduct(values);
      setCurrentPage(1);
      await refetch();
    } finally {
      setSaving(false);
      setDrawerOpen(false);
    }
  };

  const handleEditProduct = async (values: ProductDrawerFormValues) => {
    if (!editingProduct) return;
    setSaving(true);
    try {
      await updateProduct((editingProduct as Producto).id, values);
      setCurrentPage(1);
      await refetch();
    } finally {
      setSaving(false);
      setDrawerOpen(false);
      setEditingProduct(null);
      setEditMode(false);
    }
  };
  return (
    <div className="w-full mx-auto">
      <h1 className="text-3xl font-bold mb-6">Gestión de Productos</h1>

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="mb-6">
        <Button
          type="primary"
          onClick={() => {
            setDrawerOpen(true);
            setEditMode(false);
            setEditingProduct(null);
          }}
        >
          Nuevo Producto
        </Button>
      </div>

      <DrawerBase
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingProduct(null);
          setEditMode(false);
        }}
        title={editMode ? "Editar Producto" : "Agregar Producto"}
      >
        <ProductDrawerForm
          onFinish={editMode ? handleEditProduct : handleAddProduct}
          loading={saving}
          {...(editMode && editingProduct
            ? { initialValues: editingProduct }
            : {})}
        />
      </DrawerBase>

      {/* Tabla de productos */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <div className="mb-2 flex justify-end">
          <Button
            type="default"
            size="small"
            onClick={() => {
              setTableState({ filteredInfo: {}, sortedInfo: {} });
            }}
          >
            Limpiar filtros y ordenamiento
          </Button>
        </div>
        <Table
          loading={loading}
          dataSource={[...productos]}
          rowKey="id"
          columns={columns}
          pagination={{
            current: currentPage,
            onChange: (page) => setCurrentPage(page),
            pageSize: 5,
            showSizeChanger: false,
          }}
          className="min-w-[700px]"
          onChange={(_pagination, filters, sorter) => {
            setTableState({
              filteredInfo: filters || {},
              sortedInfo: sorter || {},
            });
          }}
          {...(Object.keys(tableState.filteredInfo).length > 0 ||
          Object.keys(tableState.sortedInfo).length > 0
            ? {
                filteredInfo: tableState.filteredInfo,
                sortedInfo: tableState.sortedInfo,
              }
            : {})}
        />
      </div>
    </div>
  );
};

export default ProductsView;
