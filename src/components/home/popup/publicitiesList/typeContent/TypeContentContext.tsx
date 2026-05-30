import { Publicity, PublicityType } from "@/types/publicity";
import React, { createContext, useContext } from "react";

// 专门给 TypeContent 这一小块用的关闭上下文，避免名字太“全局”
type TypeContentContextValue = {
  onRequestClose: () => void;
  publicityType: PublicityType;
  publicities: Publicity[];
};

const TypeContentContext = createContext<TypeContentContextValue | null>(null);

interface TypeContentProviderProps {
  children: React.ReactNode;
  onRequestClose: () => void;
  publicityType: PublicityType;
  publicities: Publicity[];
}

export function TypeContentProvider({
  children,
  onRequestClose,
  publicityType,
  publicities,
}: TypeContentProviderProps) {
  return (
    <TypeContentContext.Provider value={{ onRequestClose, publicityType, publicities }}>
      {children}
    </TypeContentContext.Provider>
  );
}

export function useTypeContentContext() {
  const context = useContext(TypeContentContext);

  if (!context) {
    throw new Error("useTypeContentContext 必须在 TypeContentProvider 内使用");
  }

  return context;
}
