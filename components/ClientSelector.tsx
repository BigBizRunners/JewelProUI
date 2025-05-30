import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

const ClientSelector = ({ clients, value, onChange }: any) => {
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState(
        clients.map((client: any) => ({ label: client.name, value: client.id }))
    );

    // To update items if clients prop changes
    useEffect(() => {
        setItems(clients.map((client: any) => ({ label: client.name, value: client.id })));
    }, [clients]);

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Select Client *</Text>
            <DropDownPicker
                open={open}
                value={value}
                items={items}
                setOpen={setOpen}
                setValue={onChange}
                setItems={setItems}
                placeholder="Select a client"
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                zIndex={1000}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
        zIndex: 1000, // important for dropdown to appear above other UI
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'rgb(244,68,102)',
        marginBottom: 5,
        marginTop: 10,
    },
    dropdown: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
    },
    dropdownContainer: {
        backgroundColor: '#fff',
        borderColor: '#ccc',
    },
});

export default ClientSelector;
