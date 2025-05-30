import React from 'react';
import { Text, TextInput, StyleSheet, View } from 'react-native';

const TextInputField = ({ label, value, onChange, placeholder = '', multiline = false, required = false }: any) => (
    <View style={styles.container}>
        <Text style={styles.label}>
            {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        <TextInput
            style={[styles.input, multiline && styles.multiline]}
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            placeholderTextColor="#767577"
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
        />
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
    input: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
        fontSize: 16,
        color: '#333',
    },
    multiline: {
        height: 80,
        paddingTop: 10,
    },
});

export default TextInputField;
