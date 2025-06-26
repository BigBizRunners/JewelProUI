import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import OrdersScreen from '../screens/OrderScreen';
import RepairScreen from '../screens/RepairScreen';
import BottomNavBar from '../components/BottomNavBar';
import SettingsStackNavigator from "../components/SettingsStackNavigator";

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            tabBar={(props) => <BottomNavBar {...props} />}
            screenOptions={{
                headerShown: true,
                headerStyle: { backgroundColor: '#075E54' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
            }}
        >
            <Tab.Screen name="Orders" component={OrdersScreen} options={{ headerTitle: 'JewelPro' }} />
            {/*<Tab.Screen name="Repair" component={RepairScreen} options={{ headerTitle: 'JewelPro' }} />*/}
            <Tab.Screen name="Settings" component={SettingsStackNavigator} options={{ headerTitle: 'JewelPro' }} />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
