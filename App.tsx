import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
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
import ManageClientScreen from "./screens/ManageClientScreen";

const Stack = createStackNavigator();

const AppNavigator = () => {
    const { isAuthenticated, isAuthLoading } = useAuth();
    const [initialRoute, setInitialRoute] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            if (!isAuthLoading) {
                const authenticated = await isAuthenticated();
                setInitialRoute(authenticated ? 'Home' : 'Login');
            }
        };
        checkAuth();
    }, [isAuthLoading, isAuthenticated]);

    if (isAuthLoading || !initialRoute) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#075E54" />
            </View>
        );
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
                    options={({ route }: any) => ({
                        title: route.params.title,
                        headerShown: true,
                        headerStyle: { backgroundColor: '#075E54' },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: 'bold' },
                    })}
                />
                <Stack.Screen
                    name="ManageClient"
                    component={ManageClientScreen}
                    options={({ route }: any) => ({
                        headerShown: true,
                        headerTitle: route.params?.client ? 'Edit Client' : 'Add Client',
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

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
});

export default App;
