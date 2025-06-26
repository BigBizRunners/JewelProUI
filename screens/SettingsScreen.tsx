import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../components/AuthContext'; // Import useAuth

const settingsOptions = [
    { id: '1', title: 'Categories', navigateTo: 'Categories', icon: 'shape' },
    { id: '2', title: 'Clients', navigateTo: 'Clients', icon: 'account-group' },
    // { id: '3', title: 'Users', navigateTo: 'Users', icon: 'account' },
    { id: '4', title: 'General Order Fields', navigateTo: 'ViewFields', params: { isOrderFields: true }, icon: 'form-textbox' },
    { id: '5', title: 'General Repair Fields', navigateTo: 'ViewFields', params: { isOrderFields: false }, icon: 'wrench' },
    { id: '6', title: 'Order Status', navigateTo: 'OrderStatus', params: { statusType: 'order' }, icon: 'clipboard-check' },
    { id: '7', title: 'Repair Status', navigateTo: 'OrderStatus', params: { statusType: 'repair' }, icon: 'clipboard-text' },
    { id: '8', title: 'Logout', action: 'logout', icon: 'logout' },
];

const SettingsScreen = () => {
    const navigation = useNavigation();
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        navigation.reset({
            index: 0,
            // @ts-ignore
            routes: [{ name: 'Login' }],
        });
    };

    const handleItemPress = (item: any) => {
        if (item.action === 'logout') {
            Alert.alert(
                'Confirm Logout',
                'Are you sure you want to logout?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Logout', onPress: handleLogout },
                ],
                { cancelable: false }
            );
        } else {
            // @ts-ignore
            navigation.navigate(item.navigateTo, item.params || {});
        }
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={[styles.optionContainer, item.action === 'logout' && styles.logoutOption]}
            onPress={() => handleItemPress(item)}
        >
            <View style={styles.iconContainer}>
                <MaterialCommunityIcons name={item.icon} size={20} color="#fff" />
            </View>
            <Text style={styles.optionText}>{item.title}</Text>
            {item.action !== 'logout' && (
                <MaterialCommunityIcons name="chevron-right" size={24} color="#888" style={styles.arrowIcon} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.screenTitle}>Settings</Text>
            <FlatList
                data={settingsOptions}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 16,
        paddingTop: 20,
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#075E54',
        marginBottom: 20,
    },
    optionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    logoutOption: {
        marginTop: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 0,
    },
    iconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#075E54',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    optionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    arrowIcon: {
        marginLeft: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 5,
    },
});

export default SettingsScreen;
