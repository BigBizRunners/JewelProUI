import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const WeightRangeInput = ({
  label,
  required,
  from,
  to,
  onChangeFrom,
  onChangeTo,
  error,
}: {
  label: string;
  required: boolean;
  from: string;
  to: string;
  onChangeFrom: (text: string) => void;
  onChangeTo: (text: string) => void;
  error?: string;
}) => (
    <View style={styles.container}>
        <Text style={styles.label}>
            {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <View style={styles.row}>
            <TextInput
                style={[styles.input, styles.inputLeft]}
                value={from}
                onChangeText={onChangeFrom}
                placeholder="From"
                placeholderTextColor="#767577"
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                value={to}
                onChangeText={onChangeTo}
                placeholder="To"
                placeholderTextColor="#767577"
                keyboardType="numeric"
            />
        </View>
        {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
);

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
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    input: {
        flex: 1,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
        fontSize: 16,
        color: '#333',
    },
    inputLeft: {
        marginRight: 10,
    },
    errorText: {
        color: 'red',
        marginTop: 5,
    },
});

export default WeightRangeInput;
