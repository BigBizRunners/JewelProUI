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
            <Text style={[styles.tileTitle, { color: textColor }]}>{title}</Text>
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
        padding: 15, // Adjusted padding to reduce extra space
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        height: 180, // Keep the height smaller to avoid excessive space
        justifyContent: 'space-between', // Ensure content is spaced properly
    },
    tileTitle: {
        fontSize: 18, // Increased font size for title
        fontWeight: 'bold',
        marginBottom: 5, // Reduced space below the title
        lineHeight: 22, // Ensures space even if the title wraps into two lines
    },
    tileContent: {
        marginTop: 5, // Adjusted to bring the content closer to the title
    },
    tileText: {
        fontSize: 14,
    },
    weightContainer: {
        marginTop: 10, // Space between separator and weight section
    },
    tileWeight: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    tileWeightValue: {
        fontSize: 14,
        fontWeight: 'normal', // To differentiate from the label
        marginTop: 5, // Adding some space between the label and value
    },
    separator: {
        marginTop: 8,
        height: 1,
        width: '100%', // Full width of the tile
    },
});

export default Tile;
