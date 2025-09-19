import { type FC } from "react";
import { useParams } from "react-router-dom";
import { Table, Spin, Alert, Input, Tag, Space, Button } from "antd";
import { useTransactionApi } from "../hooks/useTransactionsApi";
import { useProductosApi } from "../hooks/useProductosApi";
import {
  ShoppingCartOutlined,
  DollarOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useRef, useState } from "react";
import type { ColumnType } from "antd/es/table";

const ProductTransactionView: FC = () => {
  const { idProducto } = useParams();
  const { transacciones, loading, error } = useTransactionApi();
  const { productos } = useProductosApi();
  const producto = productos.find((p) => p.id === Number(idProducto));
  const filtered = transacciones.filter(
    (t) => t.productoId === Number(idProducto)
  );

  // Filtros y búsqueda para columnas
  const searchInput = useRef(null);
  const tableRef = useRef<any>(null);
  const [tableState, setTableState] = useState({
    filteredInfo: {},
    sortedInfo: {},
  });
  const getColumnSearchProps = (dataIndex: string): ColumnType<any> => ({
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
        <button
          type="button"
          className="ant-btn ant-btn-primary"
          style={{ width: 90, marginRight: 8 }}
          onClick={() => confirm()}
        >
          <SearchOutlined /> Buscar
        </button>
        <button
          type="button"
          className="ant-btn"
          style={{ width: 90 }}
          onClick={() => {
            if (clearFilters) clearFilters();
            confirm();
          }}
        >
          Limpiar
        </button>
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
        return a[dataIndex] - b[dataIndex];
      }
      return a[dataIndex]?.toString().localeCompare(b[dataIndex]?.toString());
    },
    sortDirections: ["descend", "ascend"],
    filteredValue: (tableState.filteredInfo as any)[dataIndex] || null,
  });

  const columns = [
    { title: "ID", dataIndex: "id", key: "id", ...getColumnSearchProps("id") },
    {
      title: "Fecha de transacción",
      dataIndex: "fecha",
      key: "fecha",
      ...getColumnSearchProps("fecha"),
    },
    {
      title: "Tipo",
      dataIndex: "tipoTransaccion",
      key: "tipoTransaccion",
      ...getColumnSearchProps("tipoTransaccion"),
      render: (_: string, record: any) => (
        <Space>
          <span>
            {record.tipoTransaccion === "Venta" ? (
              <DollarOutlined style={{ color: "#f5222d", marginLeft: 6 }} />
            ) : (
              <ShoppingCartOutlined
                style={{ color: "#52c41a", marginLeft: 6 }}
              />
            )}
          </span>
          <Tag color={record.tipoTransaccion === "Venta" ? "red" : "green"}>
            {record.tipoTransaccion}
          </Tag>
        </Space>
      ),
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
  ];

  return (
    <div className="w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">
              Historial de Transacciones
              {producto && (
                <span className="ml-2 text-lg font-normal text-gray-600">
                  - {producto.nombre}
                </span>
              )}
            </h1>
            {producto && (
              <div className="flex items-center gap-4 mt-1">
                <span className="text-base font-medium">
                  Stock actual:{" "}
                  <span className="font-bold">{producto.stock}</span>
                </span>
              </div>
            )}
          </div>
        </div>
        {producto && (
          <img
            src={producto.imagen}
            alt={producto.nombre}
            className="w-48 h-48 object-scale-down rounded shadow border"
          />
        )}
      </div>
      {error && <Alert type="error" message={error} className="mb-4" />}
      {loading ? (
        <Spin />
      ) : (
        <>
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
            ref={tableRef}
            dataSource={filtered}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
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
        </>
      )}
    </div>
  );
};

export default ProductTransactionView;
