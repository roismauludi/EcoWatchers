import React from 'react';
import { SelectedItemsProvider } from './context/SelectedItemsContext'; // Path to context file
import CatalogScreen from '../screens/CatalogScreen'; // Your CatalogScreen
import TongScreen from '../(tabs)/TongSampah'; // Your TongScreen

const App = () => {
  return (
    <SelectedItemsProvider>
      {/* Your app components go here */}
      <CatalogScreen />
      <TongScreen />
    </SelectedItemsProvider>
  );
};

export default App;
