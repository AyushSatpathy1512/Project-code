import React from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login      from './src/Screen/Login';
import HomeScreen from './src/Screen/Home';
// Uncomment when ready to connect ProjectDetails:
// import ProjectDetails from './src/Screen/ProjectDetails';

const Stack = createNativeStackNavigator();

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Login"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={Login}      />
          <Stack.Screen name="Home"  component={HomeScreen} />
          {/* <Stack.Screen name="ProjectDetails" component={ProjectDetails} /> */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default App;
