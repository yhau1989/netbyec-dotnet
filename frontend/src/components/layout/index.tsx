import * as React from "react";
import type { PropsWithChildren } from "react";
import { Layout } from "antd";

const { Header } = Layout;

const GeneralLayout: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 relative">
      <Header className="flex text-white text-sm items-center gap-4">
        <a href="/products" className="text-blue-600">
          Productos
        </a>
        <a href="/transactions" className="text-blue-600">
          Transacciones
        </a>
      </Header>
      <main className="p-8">{children}</main>
    </div>
  );
};

export default GeneralLayout;
