import { useState, type FC } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProductsView from "./views/ProductsView";
import TransactionsView from "./views/TransactionsView";

const initialProducts = [
  { name: "Producto A", stock: 10 },
  { name: "Producto B", stock: 5 },
];

const App: FC = () => {
  const [products, setProducts] = useState(initialProducts);

  return (
    <Router>
      <nav className="flex gap-4 p-4 bg-gray-100 mb-4">
        <a href="/products" className="text-blue-600">
          Productos
        </a>
        <a href="/transactions" className="text-blue-600">
          Transacciones
        </a>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/products" />} />
        <Route path="/products" element={<ProductsView />} />
        <Route path="/transactions" element={<TransactionsView />} />
      </Routes>
    </Router>
  );
};

export default App;
