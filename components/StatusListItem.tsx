import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface StatusListItemProps {
    title: string;
    orders: number;
    quantity: number;
    weight: string;
    color: string;
    onPress: () => void;
}

const StatusListItem = ({ title, orders, quantity, weight, color, onPress }: StatusListItemProps) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={[styles.colorBar, { backgroundColor: color }]} />
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>{title}</Text>
                <View style={styles.statRow}>
                    <View style={styles.labelContainer}>
                        <Icon name="package-variant-closed" size={18} color="#888" style={styles.icon} />
                        <Text style={styles.statLabel}>Orders:</Text>
                    </View>
                    <Text style={styles.statValue}>{orders}</Text>
                </View>
                <View style={styles.statRow}>
                    <View style={styles.labelContainer}>
                        <Icon name="stack-overflow" size={18} color="#888" style={styles.icon} />
                        <Text style={styles.statLabel}>Quantity:</Text>
                    </View>
                    <Text style={styles.statValue}>{quantity}</Text>
                </View>
                <View style={styles.statRow}>
                    <View style={styles.labelContainer}>
                        <Icon name="weight-gram" size={18} color="#888" style={styles.icon} />
                        <Text style={styles.statLabel}>Weight:</Text>
                    </View>
                    <Text style={styles.statValue}>{weight}</Text>
                </View>
            </View>
            <Icon name="chevron-right" size={24} color="#ccc" style={styles.chevron} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    colorBar: {
        width: 6,
        height: '100%',
        borderTopLeftRadius: 10,
        borderBottomLeftRadius: 10,
    },
    content: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    title: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 105,
    },
    icon: {
        marginRight: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    statValue: {
        fontSize: 14,
        color: '#333',
        fontWeight: '500',
        flex: 1,
    },
    chevron: {
        marginRight: 12,
    },
});

export default StatusListItem;