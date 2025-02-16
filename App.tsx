import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import BottomTabNavigator from './screens/BottomTabNavigator';
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import {AuthProvider} from "./components/AuthContext";

const Stack = createStackNavigator();

const App = () => {
    return (
        <AuthProvider>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerTitle: 'Reset Password' }} />
                    <Stack.Screen name="Home" component={BottomTabNavigator} />
                </Stack.Navigator>
            </NavigationContainer>
        </AuthProvider>
    );
};

export default App;
