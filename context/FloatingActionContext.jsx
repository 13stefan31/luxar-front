"use client";
import React, { createContext, useContext, useMemo, useState } from "react";

const FloatingActionContext = createContext(null);

export const useFloatingAction = () => useContext(FloatingActionContext);

export default function FloatingActionProvider({ children }) {
  const [reserveAction, setReserveAction] = useState(null);

  const value = useMemo(
    () => ({
      reserveAction,
      setReserveAction,
    }),
    [reserveAction]
  );

  return (
    <FloatingActionContext.Provider value={value}>
      {children}
    </FloatingActionContext.Provider>
  );
}
