import { Form, InputNumber, Button, Select, Input } from "antd";
import type { Transaccion } from "../types/general-types";
import type { Producto } from "../types/general-types";

interface TransactionDrawerFormProps {
  onFinish: (values: Partial<Transaccion>) => void;
  initialValues?: Partial<Transaccion>;
  loading?: boolean;
  productos: Producto[];
}

const TransactionDrawerForm: React.FC<TransactionDrawerFormProps> = ({
  onFinish,
  initialValues,
  loading,
  productos,
}) => {
  return (
    <Form layout="vertical" initialValues={initialValues} onFinish={onFinish}>
      <Form.Item
        name="tipoTransaccion"
        label="Tipo de Transacción"
        rules={[
          { required: true, message: "Selecciona el tipo de transacción" },
        ]}
      >
        <Select placeholder="Selecciona tipo">
          <Select.Option value="Compra">Compra</Select.Option>
          <Select.Option value="Venta">Venta</Select.Option>
        </Select>
      </Form.Item>
      <Form.Item
        name="productoId"
        label="Producto"
        rules={[{ required: true, message: "Selecciona un producto" }]}
      >
        <Select placeholder="Selecciona un producto">
          {productos.map((producto) => (
            <Select.Option key={producto.id} value={producto.id}>
              {producto.nombre} (ID: {producto.id})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        name="cantidad"
        label="Cantidad"
        rules={[{ required: true, message: "Ingresa la cantidad" }]}
      >
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        name="precioUnitario"
        label="Precio Unitario"
        rules={[{ required: true, message: "Ingresa el precio unitario" }]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item name="detalle" label="Detalle">
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Guardar
        </Button>
      </Form.Item>
    </Form>
  );
};

export default TransactionDrawerForm;
