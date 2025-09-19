import message from "antd/es/message";
import { apiTransactionUrl } from "../constants";
import type { Transaccion } from "../types/general-types";

export async function updateTransaction(
  id: number,
  data: Partial<Transaccion>
) {
  try {
    const result = await fetch(`${apiTransactionUrl}${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log("Update result:", result);
    message.success("Transacción actualizada exitosamente");
  } catch (error) {
    if (error instanceof Error) {
      message.error(`Error al actualizar la transacción ${error.message}`);
    } else {
      message.error("Error al actualizar la transacción");
    }
  }
}

export async function addTransaction(data: Partial<Transaccion>) {
  try {
    const result = await fetch(`${apiTransactionUrl}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!result.ok) {
      let errorMessage = "Error al agregar la transacción";
      try {
        const errorText = await result.text();
        errorMessage = errorText ?? errorMessage;
      } catch {
        // Intentionally ignored
      }
      throw new Error(errorMessage);
    }

    message.success("Transacción agregada exitosamente");
  } catch (error) {
    if (error instanceof Error) {
      message.error(`Error al agregar la transacción: ${error.message}`);
    } else {
      message.error("Error al agregar la transacción");
    }
  }
}

export async function deleteTransaction(id: number) {
  try {
    await fetch(`${apiTransactionUrl}${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    message.success("Transacción eliminada exitosamente");
  } catch (error) {
    if (error instanceof Error) {
      message.error(`Error al eliminar la transacción ${error.message}`);
    } else {
      message.error("Error al eliminar la transacción");
    }
  }
}
