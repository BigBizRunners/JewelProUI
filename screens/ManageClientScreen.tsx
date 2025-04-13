import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    ScrollView,
    Platform,
    Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const SINGLE_CLIENT_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/handleClientOperation";

const ManageClientScreen = ({ route }: any) => {
    const navigation = useNavigation(); // Use navigation hook
    const { fetchData, error: fetchError, loading } = useAuthenticatedFetch(navigation);
    const { client } = route.params || {};

    const [formData, setFormData] = useState({
        clientId: '',
        name: '',
        clientContactNumber: '',
        emailId: '',
        country: '',
        state: '',
        city: '',
        pincode: '',
        notes: '',
    });

    useEffect(() => {
        if (client) {
            setFormData({
                clientId: client.clientId || '',
                name: client.name || '',
                clientContactNumber: client.clientContactNumber || '',
                emailId: client.emailId || '',
                country: client.country || '',
                state: client.state || '',
                city: client.city || '',
                pincode: client.pincode || '',
                notes: client.notes || '',
            });
        } else {
            setFormData(prev => ({ ...prev, clientId: '' })); // Reset clientId for add
        }
    }, [client]);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isFormValid = () => {
        return (
            formData.name.trim() !== '' &&
            formData.clientContactNumber.trim() !== '' &&
            formData.state.trim() !== '' &&
            formData.city.trim() !== ''
        );
    };

    const handleSave = async () => {
        console.log('Form data on save:', formData); // Debug form data
        const operation = client ? 'update' : 'add';
        const requestData = {
            operation,
            ...(client ? { clientId: formData.clientId } : {}), // Include clientId only for update
            name: formData.name,
            clientContactNumber: formData.clientContactNumber,
            emailId: formData.emailId,
            country: formData.country,
            state: formData.state,
            city: formData.city,
            pincode: formData.pincode,
            notes: formData.notes,
        };

        try {
            const responseData = await fetchData({ url: SINGLE_CLIENT_API_URL, method: 'POST', data: requestData });
            console.log("Response is ==> " + JSON.stringify(responseData));

            if (responseData && responseData.status === "success") {
                if (operation === 'add' && responseData.clientId) {
                    // Store the new clientId for future updates
                    setFormData(prev => ({ ...prev, clientId: responseData.clientId }));
                }
                Alert.alert("Success", `Client ${operation === 'update' ? 'updated' : 'added'} successfully`);
                navigation.goBack(); // Go back to ClientsScreen
            } else if (responseData && responseData.status === "failure") {
                Alert.alert("Error", responseData.responseMessage || `Failed to ${operation === 'update' ? 'update' : 'add'} client`);
            }
        } catch (error) {
            Alert.alert("Error", `Failed to ${client ? 'update' : 'add'} client`);
            console.log("Save error:", error);
        }
    };

    const isUpdate = !!client;
    const buttonText = loading ? (isUpdate ? 'Updating...' : 'Adding...') : (isUpdate ? 'Update Client' : 'Add Client');

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <Text style={styles.label}>Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter client name"
                    value={formData.name}
                    onChangeText={(value) => handleChange('name', value)}
                    editable={!loading}
                />
                <Text style={styles.label}>Contact Number <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter contact number (e.g., +919876543210)"
                    value={formData.clientContactNumber}
                    onChangeText={(value) => handleChange('clientContactNumber', value)}
                    keyboardType="phone-pad"
                    editable={!loading}
                />
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter email address"
                    value={formData.emailId}
                    onChangeText={(value) => handleChange('emailId', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!loading}
                />
                <Text style={styles.label}>Country</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter country"
                    value={formData.country}
                    onChangeText={(value) => handleChange('country', value)}
                    editable={!loading}
                />
                <Text style={styles.label}>State <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter state"
                    value={formData.state}
                    onChangeText={(value) => handleChange('state', value)}
                    editable={!loading}
                />
                <Text style={styles.label}>City <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter city"
                    value={formData.city}
                    onChangeText={(value) => handleChange('city', value)}
                    editable={!loading}
                />
                <Text style={styles.label}>Pincode</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter pincode"
                    value={formData.pincode}
                    onChangeText={(value) => handleChange('pincode', value)}
                    keyboardType="number-pad"
                    editable={!loading}
                />
                <Text style={styles.label}>Notes</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    placeholder="Enter notes"
                    value={formData.notes}
                    onChangeText={(value) => handleChange('notes', value)}
                    multiline
                    numberOfLines={3}
                    editable={!loading}
                />
            </ScrollView>
            <TouchableOpacity
                style={[styles.addButton, !isFormValid() || loading ? styles.disabledButton : null]}
                onPress={handleSave}
                disabled={!isFormValid() || loading}
                activeOpacity={0.7}
            >
                <Text style={styles.addButtonText}>{buttonText}</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 5,
        paddingTop: 5,
    },
    scrollView: {
        paddingBottom: 80, // Space for button
        paddingHorizontal: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#000',
    },
    required: {
        color: 'red',
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    multilineInput: {
        height: 80,
        textAlignVertical: 'top',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#075E54',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 20,
        marginBottom: 20,
        marginHorizontal: 20,
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#A9A9A9', // Grey color for disabled state
        opacity: 0.6, // Slightly transparent for visual cue
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default ManageClientScreen;
