import React, { useState, useEffect } from 'react';
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

const ADD_CATEGORY_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/addCategory";
const MODIFY_CATEGORY_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/modifyCategoryByUser";

const ManageCategoryScreen = ({ navigation, route }: any) => {
    const isEditing = !!route.params?.category;
    const existingCategory = route.params?.category || {};

    const [categoryName, setCategoryName] = useState(existingCategory.name || '');
    const [minDays, setMinDays] = useState(existingCategory.minimumDaysForDueDate?.toString() || '');
    const [bufferDays, setBufferDays] = useState(existingCategory.bufferDaysForDueDate?.toString() || '');
    const [quantityUnit, setQuantityUnit] = useState(existingCategory.quantityUnit?.[0] || '');
    const [apiError, setApiError] = useState('');
    const { fetchData, error: fetchError, loading } = useAuthenticatedFetch(navigation);

    useEffect(() => {
        navigation.setOptions({
            title: isEditing ? 'Edit Category' : 'Add Category',
        });
    }, [navigation, isEditing]);

    const handleSubmit = async () => {
        if (!categoryName.trim() || !minDays.trim() || !bufferDays.trim() || !quantityUnit.trim()) {
            setApiError('All fields are required');
            return;
        }

        const categoryData = {
            name: categoryName,
            minimumDaysForDueDate: parseInt(minDays),
            bufferDaysForDueDate: parseInt(bufferDays),
            quantityUnit: [quantityUnit],
            ...(isEditing && { categoryId: existingCategory.categoryId, operation: "update" }),
        };

        setApiError('');
        const url = isEditing ? MODIFY_CATEGORY_API_URL : ADD_CATEGORY_API_URL;
        const responseData = await fetchData({
            url,
            method: 'POST',
            data: categoryData,
        });

        console.log("Response is ==> " + JSON.stringify(responseData));

        if (responseData && responseData.status === "success") {
            navigation.goBack();
        } else if (responseData && responseData.status === "failure") {
            setApiError(responseData.responseMessage || `Failed to ${isEditing ? 'update' : 'add'} category`);
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
                    editable={!loading}
                />
                <Text style={styles.label}>Minimum Days For Due Date <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter minimum days"
                    keyboardType="numeric"
                    value={minDays}
                    onChangeText={setMinDays}
                    editable={!loading}
                />
                <Text style={styles.label}>Buffer Days For Due Date <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter buffer days"
                    keyboardType="numeric"
                    value={bufferDays}
                    onChangeText={setBufferDays}
                    editable={!loading}
                />
                <Text style={styles.label}>Quantity Unit (Eg. pcs) <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter quantity unit"
                    value={quantityUnit}
                    onChangeText={setQuantityUnit}
                    editable={!loading}
                />
                {apiError && <Text style={styles.errorText}>{apiError}</Text>}
                {fetchError && !apiError && <Text style={styles.errorText}>{fetchError}</Text>}
            </ScrollView>
            <TouchableOpacity
                style={styles.addButton}
                onPress={handleSubmit}
                disabled={loading}
            >
                <Text style={styles.addButtonText}>
                    {loading ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Category' : 'Add Category')}
                </Text>
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
        padding: 20,
        paddingBottom: 80, // Extra space to prevent overlap with button
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
        marginHorizontal: 20, // Match CategoriesScreen horizontal spacing
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

export default ManageCategoryScreen;
