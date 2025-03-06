import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    ScrollView,
    Platform
} from 'react-native';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/addCategory";

const AddCategoryScreen = ({ navigation }: any) => {
    const [categoryName, setCategoryName] = useState('');
    const [minDays, setMinDays] = useState('');
    const [bufferDays, setBufferDays] = useState('');
    const [quantityUnit, setQuantityUnit] = useState('');
    const [apiError, setApiError] = useState(''); // Local state for API-specific errors
    const { fetchData, error: fetchError, loading } = useAuthenticatedFetch(navigation);

    const handleAddCategory = async () => {
        if (!categoryName.trim() || !minDays.trim() || !bufferDays.trim() || !quantityUnit.trim()) return;

        const newCategory = {
            name: categoryName,
            minimumDaysForDueDate: parseInt(minDays),
            bufferDaysForDueDate: parseInt(bufferDays),
            quantityUnit: [quantityUnit],
        };

        // Reset previous error
        setApiError('');

        const responseData = await fetchData({
            url: API_URL,
            method: 'POST',
            data: newCategory,
        });

        console.log("Response is ==> " + JSON.stringify(responseData));

        if (responseData && responseData.status === "success") {
            navigation.goBack();
        } else if (responseData && responseData.status === "failure") {
            // Set API-specific error message
            setApiError(responseData.responseMessage || "Failed to add category");
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <Text style={styles.label}>Category Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter category name"
                    value={categoryName}
                    onChangeText={setCategoryName}
                />
                <Text style={styles.label}>Minimum Days For Due Date <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter minimum days"
                    keyboardType="numeric"
                    value={minDays}
                    onChangeText={setMinDays}
                />
                <Text style={styles.label}>Buffer Days For Due Date <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter buffer days"
                    keyboardType="numeric"
                    value={bufferDays}
                    onChangeText={setBufferDays}
                />
                <Text style={styles.label}>Quantity Unit (Eg. pcs) <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter quantity unit"
                    value={quantityUnit}
                    onChangeText={setQuantityUnit}
                />
                {/* Display API-specific error */}
                {apiError && <Text style={styles.errorText}>{apiError}</Text>}
                {/* Display fetch-related errors (e.g., network issues) */}
                {fetchError && !apiError && <Text style={styles.errorText}>{fetchError}</Text>}
            </ScrollView>
            <View>
                <TouchableOpacity style={styles.addButton} onPress={handleAddCategory} disabled={loading}>
                    <Text style={styles.addButtonText}>{loading ? 'Adding...' : 'Add Category'}</Text>
                </TouchableOpacity>
            </View>
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
        padding: 20,
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#075E54',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 20,
        marginBottom: 20,
        justifyContent: 'center',
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default AddCategoryScreen;
