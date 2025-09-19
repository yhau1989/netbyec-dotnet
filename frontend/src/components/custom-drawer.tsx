import React from "react";
import { Drawer } from "antd";

interface CustomDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  width?: number | string;
}

const DrawerBase: React.FC<CustomDrawerProps> = ({
  open,
  onClose,
  title,
  children,
  width = 400,
}) => {
  return (
    <Drawer
      title={title}
      placement="right"
      onClose={onClose}
      open={open}
      width={width}
      destroyOnClose
    >
      {children}
    </Drawer>
  );
};

export default DrawerBase;
