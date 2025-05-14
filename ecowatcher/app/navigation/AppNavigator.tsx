// app/navigation/AppNavigator.tsx
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TongScreen from "../(tabs)/TongSampah";
import PenyetoranScreen from "../(tabs)/penyetoran";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TongSampah" component={TongScreen} />
      <Stack.Screen name="Penyetoran" component={PenyetoranScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;