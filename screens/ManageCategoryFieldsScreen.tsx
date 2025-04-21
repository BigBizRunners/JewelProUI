import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Switch,
} from 'react-native';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const MANAGE_FIELD_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/manageCategoryField";

const ManageCategoryFieldsScreen = ({ navigation, route }: any) => {
    const { categoryId, isOrderFields, onFieldAdded, field } = route.params; // Extract field from params
    const { fetchData, error: fetchError, loading } = useAuthenticatedFetch(navigation);

    // Normalize fieldType for display
    const normalizeFieldTypeForDisplay = (fieldType: string) => {
        switch (fieldType) {
            case 'TEXT': return 'Text';
            case 'SMALL_TEXT': return 'Small Text';
            case 'LARGE_TEXT': return 'Large Text';
            case 'NOTE': return 'Note';
            case 'DROPDOWN_OPTIONS': return 'Dropdown Options';
            case 'MULTI_SELECT_DROPDOWN_OPTIONS': return 'Multi-select Dropdown Options';
            default: return fieldType;
        }
    };


    // Convert string to boolean
    const toBoolean = (value: any) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true' || value === '1';
        }
        return !!value; // Convert to boolean if not string
    };

    // Initialize state with field data if available, with debugging
    useEffect(() => {
        console.log('Received field data:', JSON.stringify(field, null, 2));
        setFieldData({
            fieldId: field?.fieldId || '',
            fieldName: field?.fieldName || '',
            fieldType: field ? normalizeFieldTypeForDisplay(field.fieldType) : 'Text',
            position: field?.position?.toString() || '0',
            isVisibleInClientOrderForm: field ? toBoolean(field.visibleInClientOrderForm) : false, // Map from incoming data
            isVisibleInKarigarJobCard: field ? toBoolean(field.visibleInKarigarJobCard) : false, // Map from incoming data
            isRequired: field ? toBoolean(field.required) : false, // Map from incoming data
            isOrderField: isOrderFields,
            isRepairField: !isOrderFields,
        });
    }, [field, isOrderFields]);

    const [fieldData, setFieldData] = useState({
        fieldId: '',
        fieldName: '',
        fieldType: 'Text',
        position: '0',
        isVisibleInClientOrderForm: false,
        isVisibleInKarigarJobCard: false,
        isRequired: false,
        isOrderField: isOrderFields,
        isRepairField: !isOrderFields,
    });
    const [apiError, setApiError] = useState('');

    // Update navigation title based on whether we're adding or modifying
    useEffect(() => {
        navigation.setOptions({
            title: field ? 'Modify Category Field' : 'Add Category Field',
        });
    }, [navigation, field]);

    const handleSaveField = async () => {
        if (!fieldData.fieldName.trim()) {
            setApiError('Field name is required');
            return;
        }
        if (!fieldData.position || isNaN(Number(fieldData.position))) {
            setApiError('Position must be a valid number');
            return;
        }

        const payload = {
            categoryId,
            fieldId: fieldData.fieldId || '', // Include fieldId for update
            fieldName: fieldData.fieldName,
            fieldType: fieldData.fieldType,
            position: parseInt(fieldData.position, 10),
            isVisibleInClientOrderForm: fieldData.isVisibleInClientOrderForm, // Use expected API key
            isVisibleInKarigarJobCard: fieldData.isVisibleInKarigarJobCard, // Use expected API key
            isRequired: fieldData.isRequired, // Use expected API key
            isOrderField: fieldData.isOrderField, // Use expected API key
            isRepairField: fieldData.isRepairField, // Use expected API key
            operation: field ? 'update' : 'add', // Add operation field
        };

        console.log("Saving field with payload:", JSON.stringify(payload));

        setApiError('');
        const response = await fetchData({
            url: MANAGE_FIELD_API_URL,
            method: 'POST',
            data: payload,
        });

        if (response && response.status === "success") {
            console.log("Field saved, response:", JSON.stringify(response));
            await onFieldAdded();
            navigation.goBack();
            Alert.alert("Success", field ? "Field updated successfully" : "Field added successfully");
        } else {
            setApiError(response?.errorMessage || (field ? "Failed to update field" : "Failed to add field"));
        }
    };

    const fieldTypeOptions = [
        { label: 'Text', value: 'Text' },
        { label: 'Small Text', value: 'Small Text' },
        { label: 'Large Text', value: 'Large Text' },
        { label: 'Note', value: 'Note' },
        { label: 'Dropdown Options', value: 'Dropdown Options' },
        { label: 'Multi-select Dropdown Options', value: 'Multi-select Dropdown Options' },
    ];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollView}>
                <Text style={styles.label}>
                    Field Name <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter field name"
                    value={fieldData.fieldName}
                    onChangeText={(text) => setFieldData({ ...fieldData, fieldName: text })}
                    editable={!loading}
                />

                <Text style={styles.label}>
                    Field Type <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.optionContainer}>
                    {fieldTypeOptions.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.optionButton,
                                fieldData.fieldType === option.value && styles.optionButtonSelected,
                            ]}
                            onPress={() => setFieldData({ ...fieldData, fieldType: option.value })}
                            disabled={loading}
                        >
                            <Text
                                style={[
                                    styles.optionText,
                                    fieldData.fieldType === option.value && styles.optionTextSelected,
                                ]}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {option.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <Text style={styles.label}>
                    Position <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter position (e.g., 0)"
                    keyboardType="numeric"
                    value={fieldData.position}
                    onChangeText={(text) => setFieldData({ ...fieldData, position: text })}
                    editable={!loading}
                />

                <View style={styles.switchContainer}>
                    <Text style={styles.label}>
                        Visible in Client Order Form <Text style={styles.required}>*</Text>
                    </Text>
                    <Switch
                        value={fieldData.isVisibleInClientOrderForm}
                        onValueChange={(value) => setFieldData({ ...fieldData, isVisibleInClientOrderForm: value })}
                        disabled={loading}
                        trackColor={{ false: "#767577", true: "#075E54" }}
                        thumbColor={fieldData.isVisibleInClientOrderForm ? "#f4f3f4" : "#f4f3f4"}
                    />
                </View>

                <View style={styles.switchContainer}>
                    <Text style={styles.label}>
                        Visible in Karigar Job Card <Text style={styles.required}>*</Text>
                    </Text>
                    <Switch
                        value={fieldData.isVisibleInKarigarJobCard}
                        onValueChange={(value) => setFieldData({ ...fieldData, isVisibleInKarigarJobCard: value })}
                        disabled={loading}
                        trackColor={{ false: "#767577", true: "#075E54" }}
                        thumbColor={fieldData.isVisibleInKarigarJobCard ? "#f4f3f4" : "#f4f3f4"}
                    />
                </View>

                <View style={styles.switchContainer}>
                    <Text style={styles.label}>
                        Required <Text style={styles.required}>*</Text>
                    </Text>
                    <Switch
                        value={fieldData.isRequired}
                        onValueChange={(value) => setFieldData({ ...fieldData, isRequired: value })}
                        disabled={loading}
                        trackColor={{ false: "#767577", true: "#075E54" }}
                        thumbColor={fieldData.isRequired ? "#f4f3f4" : "#f4f3f4"}
                    />
                </View>

                {apiError && <Text style={styles.errorText}>{apiError}</Text>}
                {fetchError && !apiError && <Text style={styles.errorText}>{fetchError}</Text>}
            </ScrollView>

            <TouchableOpacity
                style={styles.addButton}
                onPress={handleSaveField}
                disabled={loading}
            >
                <Text style={styles.addButtonText}>
                    {loading ? (field ? 'Updating...' : 'Adding...') : (field ? 'Update Field' : 'Add Field')}
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
        paddingBottom: 80,
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
        color: '#333',
    },
    optionContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    optionButton: {
        width: '32%',
        height: 50,
        padding: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 5,
    },
    optionButtonSelected: {
        borderColor: '#075E54',
        backgroundColor: '#e0f2f1',
    },
    optionText: {
        fontSize: 12,
        color: '#333',
        textAlign: 'center',
    },
    optionTextSelected: {
        color: '#075E54',
        fontWeight: '600',
    },
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
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
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 10,
    },
});

export default ManageCategoryFieldsScreen;
