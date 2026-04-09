/**
 * App.tsx — Navigation Root
 *
 * Sets up the React Navigation Native Stack with all 3 screens.
 * This file never changes unless you add a new screen.
 *
 * Stack order:
 *   Login  →  Home  ↔  Project
 *
 * navigation.replace() is used for Login→Home and Logout
 * so those screens are removed from the stack.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login          from './src/Screen/Login';
import HomeScreen     from './src/Screen/HomeScreen';
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
