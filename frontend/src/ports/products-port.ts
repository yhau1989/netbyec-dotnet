import message from "antd/es/message";
import { apiProductsUrl } from "../constants";
import type { Producto } from "../types/general-types";

export async function updateProduct(id: number, data: Partial<Producto>) {
  try {
    await fetch(`${apiProductsUrl}${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    message.success("Producto actualizado exitosamente");
  } catch (error) {
    if (error instanceof Error) {
      message.error(`Error al actualizar el producto ${error.message}`);
    } else {
      message.error("Error al actualizar el producto");
    }
  }
}

export async function addProduct(data: Partial<Producto>) {
  try {
    await fetch(`${apiProductsUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    message.success("Producto agregado exitosamente");
  } catch (error) {
    if (error instanceof Error) {
      message.error(`Error al agregar el producto ${error.message}`);
    } else {
      message.error("Error al agregar el producto");
    }
  }
}

export async function deleteProduct(id: number) {
  try {
    await fetch(`${apiProductsUrl}${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    message.success("Producto eliminado exitosamente");
  } catch (error) {
    if (error instanceof Error) {
      message.error(`Error al eliminar el producto ${error.message}`);
    } else {
      message.error("Error al eliminar el producto");
    }
  }
}
