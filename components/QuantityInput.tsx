import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const QuantityInput = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                Quantity <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputRow}>
                <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={(text) => {
                        const numeric = text.replace(/[^0-9]/g, '');
                        onChange(numeric);
                    }}
                    placeholder="Enter Quantity"
                    placeholderTextColor="#767577"
                    keyboardType="numeric"
                />
                <Text style={styles.unit}>PCS</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    required: {
        color: 'red',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        flex: 1,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
        fontSize: 16,
        color: '#333',
    },
    unit: {
        marginLeft: 10,
        fontSize: 16,
        color: '#075E54',
        fontWeight: '500',
    },
});

export default QuantityInput;
