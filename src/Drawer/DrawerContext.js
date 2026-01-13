import React, { createContext, useState } from "react";

export const DrawerContext = createContext();

export const DrawerProvider = ({ children }) => {
  const [isOpen, setOpen] = useState(false);

  const openDrawer = React.useCallback(() => setOpen(true), []);
  const closeDrawer = React.useCallback(() => setOpen(false), []);

  return (
    <DrawerContext.Provider value={{ isOpen, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext.Provider>
  );
};

