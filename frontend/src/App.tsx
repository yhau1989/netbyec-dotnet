import { type FC } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import ProductsView from "./views/ProductsView";
import GeneralLayout from "./components/layout";
import TransactionView from "./views/TransactionsView";
import ProductTransactionView from "./views/ProductTransactionView";

const App: FC = () => {
  return (
    <Router>
      <GeneralLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/products" />} />
          <Route path="/products" element={<ProductsView />} />
          <Route path="/transactions" element={<TransactionView />} />
          <Route
            path="/product-transaction/:idProducto"
            element={<ProductTransactionView />}
          />
        </Routes>
      </GeneralLayout>
    </Router>
  );
};

export default App;
