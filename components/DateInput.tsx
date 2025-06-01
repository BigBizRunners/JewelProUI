import React, { useState } from 'react';
import { Text, TouchableOpacity, StyleSheet, View, Platform } from 'react-native';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const DateInput = ({ label, value, onChange, required = false }: any) => {
    const [visible, setVisible] = useState(false);

    const isValidDate = (date: any) => date instanceof Date && !isNaN(date.getTime());
    const validDate = isValidDate(value) ? value : new Date();
    const formattedDate = validDate.toLocaleDateString('en-GB').split('/').join('-');

    const handleConfirm = (date: Date) => {
        setVisible(false);
        onChange(date);
    };

    const handleCancel = () => {
        setVisible(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                {label} {required && <Text style={styles.required}>*</Text>}
            </Text>
            <TouchableOpacity
                onPress={() => setVisible(true)}
                style={styles.input}
            >
                <Text style={styles.inputText}>{formattedDate}</Text>
            </TouchableOpacity>
            <DateTimePickerModal
                isVisible={visible}
                mode="date"
                date={validDate}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
                display={Platform.OS === 'ios' ? 'inline' : 'default'} // inline for iOS calendar view
                themeVariant="light" // avoids white text on white background
                pickerStyle={Platform.OS === 'ios' ? { backgroundColor: '#fff' } : undefined}
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
