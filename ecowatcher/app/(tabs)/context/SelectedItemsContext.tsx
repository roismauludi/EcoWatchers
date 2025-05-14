import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CatalogItem {
  id: string;
  name: string;
  category: string;
  points: number;
  unit: string;
  image: string;
  description: string;
  type?: string
}

interface SelectedItemsContextType {
  selectedItems: CatalogItem[];
  setSelectedItems: React.Dispatch<React.SetStateAction<CatalogItem[]>>;
}

const SelectedItemsContext = createContext<SelectedItemsContextType | undefined>(undefined);

interface SelectedItemsProviderProps {
  children: ReactNode;
}

export const SelectedItemsProvider: React.FC<SelectedItemsProviderProps> = ({ children }) => {
  const [selectedItems, setSelectedItems] = useState<CatalogItem[]>([]);

  return (
    <SelectedItemsContext.Provider value={{ selectedItems, setSelectedItems }}>
      {children}
    </SelectedItemsContext.Provider>
  );
};

export const useSelectedItems = (): SelectedItemsContextType => {
  const context = useContext(SelectedItemsContext);
  if (!context) {
    throw new Error("useSelectedItems must be used within a SelectedItemsProvider");
  }
  return context;
};
