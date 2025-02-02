import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const settingsOptions = [
    { id: '1', title: 'Categories', navigateTo: 'Categories', icon: 'shape' },
    { id: '2', title: 'Clients', navigateTo: 'AddClient', icon: 'account-group' },
    { id: '3', title: 'Users', navigateTo: 'AddClient', icon: 'account' },
    { id: '4', title: 'Logout', action: 'logout', icon: 'logout' },
];

const SettingsScreen = () => {
    const navigation = useNavigation();

    const handleLogout = async () => {
        try {
            await AsyncStorage.removeItem('authToken'); // Remove token from storage
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }], // Reset navigation to Login screen
            });
        } catch (err) {
            console.log('Logout Error:', err);
        }
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
            navigation.navigate(item.navigateTo);
        }
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity
            style={[styles.optionContainer, item.action === 'logout' && styles.logoutOption]} // Apply logout specific styling
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
        marginTop: 10, // Separation for the logout button
        backgroundColor: '#fff', // Keep the background color consistent with other items
        borderBottomWidth: 0, // Remove bottom border so it aligns with the last separator
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
