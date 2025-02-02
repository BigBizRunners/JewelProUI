// components/CustomHeader.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CustomHeader = () => {
    return (
        <View style={styles.headerContainer}>
            <Text style={styles.companyName}>Your Company</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: 80,
        backgroundColor: '#075E54', // Match the background color with your design
        paddingTop: 40, // Adjust to position it well on top (if needed)
    },
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
});

export default CustomHeader;
