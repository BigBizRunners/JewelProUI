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
import OrderSuccessScreen from "./screens/OrderSuccessScreen";
import ListOrdersScreen from "./screens/ListOrdersScreen";
import OrderDetailsScreen from "./screens/OrderDetailsScreen";
import FilterScreen from "./screens/FilterScreen";
import MultiSelectListScreen from "./screens/MultiSelectListScreen";

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
        return null;
    }

    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ headerShown: true, headerTitle: 'Reset Password' }} />
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
                <Stack.Screen
                    name="OrderSuccess"
                    component={OrderSuccessScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="ListOrders"
                    component={ListOrdersScreen}
                    options={{
                        headerShown: true,
                        headerTitle: 'Orders',
                        headerStyle: { backgroundColor: '#075E54' },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: 'bold' },
                    }}
                />
                <Stack.Screen
                    name="OrderDetails"
                    component={OrderDetailsScreen}
                    options={{
                        headerShown: true,
                        headerTitle: 'Order Details',
                        headerStyle: { backgroundColor: '#075E54' },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: 'bold' },
                    }}
                />
                <Stack.Screen
                    name="FilterScreen"
                    component={FilterScreen}
                    options={{
                        headerShown: true,
                        headerTitle: 'Filter Orders',
                        headerStyle: { backgroundColor: '#075E54' },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: 'bold' },
                    }}
                />
                <Stack.Screen
                    name="MultiSelectList"
                    component={MultiSelectListScreen}
                    options={({ route }) => ({
                        title: route.params.title,
                        headerShown: true,
                        headerStyle: { backgroundColor: '#075E54' },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: 'bold' },
                    })}
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
