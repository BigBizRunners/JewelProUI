import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RepairScreen = () => {
    return (
        <View style={styles.container}>
            <MaterialCommunityIcons name="progress-wrench" size={64} color="#888" />
            <Text style={styles.title}>Work in Progress</Text>
            <Text style={styles.subtitle}>This screen is currently under construction and will be available soon.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f7f7f7',
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        textAlign: 'center',
    },
});

export default RepairScreen;
