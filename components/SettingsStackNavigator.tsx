import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/SettingsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ManageCategoryScreen from '../screens/ManageCategoryScreen';
import ViewFieldsScreen from '../screens/ViewFieldsScreen';
import ManageCategoryFieldsScreen from '../screens/ManageCategoryFieldsScreen';
import EditDropdownOptionsScreen from '../screens/EditDropdownOptionsScreen';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ClientsScreen from '../screens/ClientsScreen';
import ManageClientScreen from '../screens/ManageClientScreen';
import OrderStatusScreen from '../screens/OrderStatusScreen';
import ManageOrderStatusScreen from '../screens/ManageOrderStatusScreen';
import SelectAllowedStatusesScreen from '../screens/SelectAllowedStatusesScreen';

const Stack = createStackNavigator();

const SettingsStackNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen
                name="SettingsMain"
                component={SettingsScreen}
                options={{ headerTitle: 'Settings', headerShown: false }}
            />
            <Stack.Screen
                name="Categories"
                component={CategoriesScreen}
                options={({ navigation }) => ({
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="ManageCategory"
                component={ManageCategoryScreen}
                options={({ route }) => ({
                    title: route.params?.category ? 'Edit Category' : 'Add Category',
                })}
            />
            <Stack.Screen
                name="ViewFields"
                component={ViewFieldsScreen}
                options={({ navigation }) => ({
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="ManageCategoryFields"
                component={ManageCategoryFieldsScreen}
                options={({ navigation, route }) => ({
                    title: route.params?.field ? 'Edit Field' : 'Add Field',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="EditDropdownOptions"
                component={EditDropdownOptionsScreen}
                options={({ navigation, route }) => ({
                    title: `Edit ${route.params?.field?.fieldName || 'Field'} Options`,
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="Clients"
                component={ClientsScreen}
                options={({ navigation }) => ({
                    title: 'Client Details',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="ManageClient"
                component={ManageClientScreen}
                options={({ navigation, route }) => ({
                    title: route.params?.client ? 'Update Client' : 'Add Client',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="OrderStatus"
                component={OrderStatusScreen}
                options={({ navigation, route }) => ({
                    title: route.params?.statusType === 'order' ? 'Order Status' : 'Repair Status',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="ManageOrderStatusScreen"
                component={ManageOrderStatusScreen}
                options={({ navigation, route }) => ({
                    title: route.params?.status ? 'Edit Status' : 'Add Status',
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                        </TouchableOpacity>
                    ),
                })}
            />
            <Stack.Screen
                name="SelectAllowedStatuses"
                component={SelectAllowedStatusesScreen}
                options={({ navigation }) => ({
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                            <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                        </TouchableOpacity>
                    ),
                })}
            />
        </Stack.Navigator>
    );
};

export default SettingsStackNavigator;
