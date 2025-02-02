// Header.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface HeaderProps {
    title: string;
    buttonText: string;
    onPress: () => void;
}

const Header = ({ title, buttonText, onPress }: HeaderProps) => {
    return (
        <View style={styles.header}>
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome,</Text>
                <Text style={styles.welcomeName}>{title}</Text>
            </View>
            <TouchableOpacity
                style={styles.createOrderButton}
                onPress={onPress}
            >
                <Text style={styles.createOrderText}>{buttonText}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        marginBottom: 30,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#075E54',
    },
    welcomeName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#075E54',
        marginTop: 3,
    },
    createOrderButton: {
        borderWidth: 1,
        borderColor: '#075E54',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    createOrderText: {
        color: '#075E54',
        fontWeight: 'bold',
        fontSize: 16,
    },
    welcomeContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
    },
});

export default Header;
