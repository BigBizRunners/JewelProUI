// App.tsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import BottomTabNavigator from './screens/BottomTabNavigator';
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import SelectCategoryScreen from "./screens/SelectCategoryScreen";
import CreateOrderScreen from "./screens/CreateOrderScreen";
import { AuthProvider, useAuth } from "./components/AuthContext";
import ClientSelectorScreen from "./screens/ClientSelectorScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
    const {isAuthenticated } = useAuth();
    const [initialRoute, setInitialRoute] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const authenticated = await isAuthenticated();
                setInitialRoute(authenticated ? 'Home' : 'Login');
            } catch (error) {
                setInitialRoute('Login');
            }
        };
        checkAuth();
    }, []);

    if (!initialRoute) {
        return null; // Or a loading spinner
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerTitle: 'Reset Password' }} />
                <Stack.Screen name="Home" component={BottomTabNavigator} />
                <Stack.Screen
                    name="SelectCategory"
                    component={SelectCategoryScreen}
                    options={{
                        headerShown: true,
                        headerTitle: 'New Order',
                        headerStyle: { backgroundColor: '#075E54' },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: 'bold' },
                    }}
                />
                <Stack.Screen
                    name="CreateOrder"
                    component={CreateOrderScreen}
                    options={{
                        headerShown: true,
                        headerTitle: 'New Order',
                        headerStyle: { backgroundColor: '#075E54' },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: 'bold' },
                    }}
                />
                <Stack.Screen
                    name="ClientSelector"
                    component={ClientSelectorScreen}
                    options={{
                        headerShown: true,
                        headerTitle: 'Select Client',
                        headerStyle: { backgroundColor: '#075E54' },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: 'bold' },
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppNavigator />
        </AuthProvider>
    );
};

export default App;
