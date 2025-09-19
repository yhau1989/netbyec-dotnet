import React from "react";
import { Form, Input, InputNumber, Button, Select } from "antd";

export interface ProductDrawerFormValues {
  nombre: string;
  descripcion: string;
  categoria: string;
  imagen: string;
  precio: number;
  stock: number;
}

interface ProductDrawerFormProps {
  onFinish: (values: ProductDrawerFormValues) => void;
  loading?: boolean;
  initialValues?: Partial<ProductDrawerFormValues>;
}

const ProductDrawerForm: React.FC<ProductDrawerFormProps> = ({
  onFinish,
  loading,
  initialValues,
}) => {
  const [form] = Form.useForm();

  // Simulación de categorías
  const categorias = [
    { label: "Electrónica", value: "electronica" },
    { label: "Ropa", value: "ropa" },
    { label: "Hogar", value: "hogar" },
  ];

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={initialValues ?? { stock: 1, precio: 0 }}
    >
      <Form.Item
        label="Nombre"
        name="nombre"
        rules={[{ required: true, message: "Ingrese el nombre del producto" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Descripción"
        name="descripcion"
        rules={[{ required: true, message: "Ingrese la descripción" }]}
      >
        <Input.TextArea rows={2} />
      </Form.Item>
      <Form.Item
        label="Categoría"
        name="categoria"
        rules={[{ required: true, message: "Seleccione una categoría" }]}
      >
        <Select options={categorias} />
      </Form.Item>
      <Form.Item
        label="Imagen (URL)"
        name="imagen"
        rules={[{ required: true, message: "Ingrese la URL de la imagen" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label="Precio"
        name="precio"
        rules={[{ required: true, message: "Ingrese el precio" }]}
      >
        <InputNumber min={0} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item
        label="Stock"
        name="stock"
        rules={[{ required: true, message: "Ingrese el stock" }]}
      >
        <InputNumber min={1} style={{ width: "100%" }} />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          Guardar Producto
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProductDrawerForm;
