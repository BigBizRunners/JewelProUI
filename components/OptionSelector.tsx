import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const OptionSelector = ({ label, options, value, onChange, required = false, multiSelect = false }: any) => {
    const handleSelect = (option: string) => {
        if (multiSelect) {
            const currentValues = Array.isArray(value) ? value : [];
            const updatedValues = currentValues.includes(option)
                ? currentValues.filter((v: string) => v !== option)
                : [...currentValues, option];
            onChange(updatedValues);
        } else {
            onChange(option);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <View style={styles.optionContainer}>
                {options.map((option: string) => (
                    <TouchableOpacity
                        key={option}
                        style={[
                            styles.optionButton,
                            (multiSelect
                                ? (value || []).includes(option)
                                : value === option) && styles.optionButtonSelected,
                        ]}
                        onPress={() => handleSelect(option)}
                    >
                        <Text
                            style={[
                                styles.optionText,
                                (multiSelect
                                    ? (value || []).includes(option)
                                    : value === option) && styles.optionTextSelected,
                            ]}
                        >
                            {option.toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
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
    optionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    optionButton: {
        minWidth: 80,
        maxWidth: SCREEN_WIDTH * 0.4,
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 10,
        marginRight: 10,
        flexShrink: 1,
    },
    optionButtonSelected: {
        backgroundColor: '#e0f2f1',
        borderColor: '#075E54',
    },
    optionText: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
        flexWrap: 'wrap',
    },
    optionTextSelected: {
        color: '#075E54',
        fontWeight: '600',
    },
});

export default OptionSelector;
