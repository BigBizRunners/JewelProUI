import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const DateInput = ({ label, value, onChange, required = false }: any) => {
    const [visible, setVisible] = useState(false);
    const formattedDate = value.toLocaleDateString('en-GB').split('/').join('-');

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <TouchableOpacity onPress={() => setVisible(true)} style={styles.input}>
                <Text style={styles.inputText}>{formattedDate}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
                isVisible={visible}
                mode="date"
                date={value}
                onConfirm={(date) => {
                    setVisible(false);
                    onChange(date);
                }}
                onCancel={() => setVisible(false)}
            />
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
    input: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
    },
    inputText: {
        fontSize: 16,
        color: '#333',
    },
});

export default DateInput;
