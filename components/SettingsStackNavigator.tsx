import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SettingsScreen from '../screens/SettingsScreen';
import CategoriesScreen from '../screens/CategoriesScreen';
import AddCategoryScreen from '../screens/AddCategoryScreen';
import { TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

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
                name="AddCategory"
                component={AddCategoryScreen}
                options={{
                    title: 'Add Category',
                }}
            />
        </Stack.Navigator>
    );
};

export default SettingsStackNavigator;
