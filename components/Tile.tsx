import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TileProps {
    title: string;
    orders: number;
    quantity: number;
    weight: string;
    color: string;
    onPress: () => void;
}

const Tile = ({ title, orders, quantity, weight, color, onPress }: TileProps) => {
    const textColor = color === '#ffffff' ? '#000' : '#fff'; // Adjust text color based on background

    return (
        <TouchableOpacity style={[styles.tile, { backgroundColor: color }]} onPress={onPress}>
            <Text style={[styles.tileTitle, { color: textColor }]} numberOfLines={2}>{title}</Text>
            <View style={styles.tileContent}>
                <Text style={[styles.tileText, { color: textColor }]}>Orders: {orders}</Text>
                <Text style={[styles.tileText, { color: textColor }]}>Quantity: {quantity}</Text>

                {/* Line before weight */}
                <View style={[styles.separator, { backgroundColor: textColor }]} />

                {/* Weight label and value below */}
                <View style={styles.weightContainer}>
                    <Text style={[styles.tileWeight, { color: textColor }]}>Weight:</Text>
                    <Text style={[styles.tileWeightValue, { color: textColor }]}>{weight}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    tile: {
        flex: 1,
        margin: 5,
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        height: 200,
        justifyContent: 'space-between',
    },
    tileTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        lineHeight: 22,  // Maintain proper spacing
        minHeight: 48,   // Ensure space for two lines
        flexWrap: 'wrap', // Allow text to wrap instead of truncating
        textAlignVertical: 'center',
        marginBottom: 5,
    },
    tileContent: {
        marginTop: 5,
    },
    tileText: {
        fontSize: 14,
    },
    weightContainer: {
        marginTop: 10,
    },
    tileWeight: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    tileWeightValue: {
        fontSize: 14,
        fontWeight: 'normal',
        marginTop: 5,
    },
    separator: {
        marginTop: 8,
        height: 1,
        width: '100%',
    },
});

export default Tile;
