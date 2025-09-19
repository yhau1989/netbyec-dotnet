# Netbyec Frontend

Este proyecto es el frontend de la aplicación de gestión de productos y transacciones para Netbyec. Permite administrar productos, visualizar y registrar transacciones, y consultar el historial de movimientos de cada producto.

## Tecnologías usadas

- **React 19**
- **TypeScript**
- **Vite**
- **Ant Design** (UI)
- **TailwindCSS** (estilos utilitarios)
- **React Router** (ruteo)

## Estructura principal

- `src/views/ProductsView.tsx`: Gestión y listado de productos.
- `src/views/TransactionsView.tsx`: Gestión y listado de transacciones.
- `src/views/ProductTransactionView.tsx`: Historial de transacciones de un producto.
- `src/components/`: Componentes reutilizables (formularios, drawer, layout, etc).
- `src/hooks/`: Hooks para consumo de APIs.
- `src/types/`: Tipos TypeScript compartidos.

## Pasos para levantar el proyecto

1. **Clonar el repositorio**

   ```bash
   git clone <url-del-repo>
   cd netbyec-dotnet/frontend
   ```

2. **Instalar dependencias**

   ```bash
   npm install
   # o
   yarn install
   ```

3. **Configurar variables de entorno**

   Si es necesario, crea un archivo `.env` con las URLs de las APIs:

   ```env
   VITE_API_PRODUCTS_URL=<url-api-productos>
   VITE_API_TRANSACTIONS_URL=<url-api-transacciones>
   ```

4. **Levantar el servidor de desarrollo**

   ```bash
   npm run dev
   # o
   yarn dev
   ```

5. **Abrir en el navegador**

   Ve a [http://localhost:5173](http://localhost:5173) (o el puerto que indique Vite).

## Notas

- El frontend espera que las APIs de productos y transacciones estén disponibles y configuradas en las variables de entorno.
- El diseño es responsivo y utiliza componentes de Ant Design junto con utilidades de TailwindCSS.

---

![alt text](<Screenshot 2025-09-18 at 19.21.14.png>)
![alt text](<Screenshot 2025-09-18 at 19.21.23.png>)
![alt text](<Screenshot 2025-09-18 at 19.21.31.png>)
![alt text](<Screenshot 2025-09-18 at 19.21.42.png>)
![alt text](<Screenshot 2025-09-18 at 19.21.49.png>)
![alt text](<Screenshot 2025-09-18 at 19.22.07.png>)
![alt text](<Screenshot 2025-09-18 at 19.22.19.png>)
![alt text](<Screenshot 2025-09-18 at 19.41.47.png>)
