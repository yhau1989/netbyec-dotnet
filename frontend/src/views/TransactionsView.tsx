import { useState, useRef } from "react";
import type { Transaccion } from "../types/general-types";
import { Table, Button, Alert, Input, Drawer } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { ColumnType } from "antd/es/table";
import { useTransactionApi } from "../hooks/useTransactionsApi";
import TransactionDrawerForm from "../components/transaction-form";
import {
  addTransaction,
  updateTransaction,
  deleteTransaction,
} from "../ports/transactions-port";
import { useProductosApi } from "../hooks/useProductosApi";

const TransactionView = () => {
  const { transacciones, loading, error, refetch } = useTransactionApi();
  const { productos, loading: loadingProductos } = useProductosApi();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaccion | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Filtros y búsqueda para columnas
  const searchInput = useRef(null);
  const [tableState, setTableState] = useState({
    filteredInfo: {},
    sortedInfo: {},
  });
  const getColumnSearchProps = (
    dataIndex: keyof Transaccion
  ): ColumnType<Transaccion> => ({
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
      title: "Tipo",
      dataIndex: "tipoTransaccion",
      key: "tipoTransaccion",
      ...getColumnSearchProps("tipoTransaccion"),
    },
    {
      title: "Producto ID",
      dataIndex: "productoId",
      key: "productoId",
      ...getColumnSearchProps("productoId"),
    },
    {
      title: "Cantidad",
      dataIndex: "cantidad",
      key: "cantidad",
      ...getColumnSearchProps("cantidad"),
    },
    {
      title: "Precio Unitario",
      dataIndex: "precioUnitario",
      key: "precioUnitario",
      ...getColumnSearchProps("precioUnitario"),
    },
    {
      title: "Precio Total",
      dataIndex: "precioTotal",
      key: "precioTotal",
      ...getColumnSearchProps("precioTotal"),
    },
    {
      title: "Detalle",
      dataIndex: "detalle",
      key: "detalle",
      ...getColumnSearchProps("detalle"),
    },
    {
      title: "Fecha",
      dataIndex: "fecha",
      key: "fecha",
      ...getColumnSearchProps("fecha"),
    },
    {
      title: "Acciones",
      key: "acciones",
      render: (_: unknown, record: Transaccion) => (
        <>
          <Button
            type="link"
            onClick={() => {
              setEditingTransaction(record);
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
              await handleDeleteTransaction(record.id);
            }}
            disabled={saving}
          >
            Eliminar
          </Button>
        </>
      ),
    },
  ];

  // Handlers para agregar, editar y eliminar transacciones
  const handleAddTransaction = async (values: Partial<Transaccion>) => {
    setSaving(true);
    const data: Partial<Transaccion> = {
      ...values,
      precioTotal: values.cantidad! * values.precioUnitario!,
    };
    await addTransaction(data);
    setSaving(false);
    setDrawerOpen(false);
    refetch();
  };

  const handleEditTransaction = async (values: Partial<Transaccion>) => {
    if (!editingTransaction) return;
    setSaving(true);
    await updateTransaction(editingTransaction.id, values);
    setSaving(false);
    setDrawerOpen(false);
    setEditingTransaction(null);
    setEditMode(false);
    refetch();
  };

  const handleDeleteTransaction = async (id: number) => {
    setSaving(true);
    await deleteTransaction(id);
    setSaving(false);
    refetch();
  };

  return (
    <div className="w-full mx-auto">
      <h1 className="text-3xl font-bold mb-6">Transacciones</h1>

      {error && <Alert type="error" message={error} className="mb-4" />}

      <div className="mb-6">
        <Button
          type="primary"
          onClick={() => {
            setDrawerOpen(true);
            setEditMode(false);
            // setEditingProduct(null);
          }}
        >
          Nueva Transacción
        </Button>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setEditingTransaction(null);
          setEditMode(false);
        }}
        title={editMode ? "Editar Transacción" : "Agregar Transacción"}
        width={400}
        destroyOnClose
      >
        <TransactionDrawerForm
          onFinish={editMode ? handleEditTransaction : handleAddTransaction}
          initialValues={editingTransaction || {}}
          loading={saving || loadingProductos}
          productos={productos}
        />
      </Drawer>

      {/* Tabla de transacciones */}
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
          dataSource={[...transacciones]}
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

export default TransactionView;
