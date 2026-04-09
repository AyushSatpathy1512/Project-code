/**
 * App.tsx — Navigation Root
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login          from './src/Screen/Login';
import HomeScreen     from './src/Screen/Home';
import ProjectDetails from './src/Screen/ProjectDetails';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Login"   component={Login}          />
        <Stack.Screen name="Home"    component={HomeScreen}     />
        <Stack.Screen name="Project" component={ProjectDetails} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
