import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/SettingsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import ManageCategoryScreen from '../screens/ManageCategoryScreen';
import ViewFieldsScreen from '../screens/ViewFieldsScreen';
import ManageCategoryFieldsScreen from '../screens/ManageCategoryFieldsScreen';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ClientsScreen from "../screens/ClientsScreen";

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
        </Stack.Navigator>
    );
};

export default SettingsStackNavigator;
