import React, { useState } from 'react';
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

const ADD_FIELD_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/addCategoryField";

const ManageCategoryFieldsScreen = ({ navigation, route }: any) => {
    const { categoryId, isOrderFields, onFieldAdded } = route.params;
    const { fetchData, error: fetchError, loading } = useAuthenticatedFetch(navigation);

    const [fieldData, setFieldData] = useState({
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

    const normalizeFieldTypeForBackend = (fieldType) => {
        switch (fieldType) {
            case "Text": return "TEXT";
            case "Small Text": return "SMALL_TEXT";
            case "Large Text": return "LARGE_TEXT";
            case "Note": return "NOTE";
            case "Dropdown Options": return "DROPDOWN_OPTIONS";
            case "Multi-select Dropdown Options": return "MULTI_SELECT_DROPDOWN_OPTIONS";
            default: return fieldType;
        }
    };

    const addField = async () => {
        if (!fieldData.fieldName.trim()) {
            setApiError('Field name is required');
            return;
        }

        const payload = {
            categoryId,
            fieldName: fieldData.fieldName,
            fieldType: normalizeFieldTypeForBackend(fieldData.fieldType),
            position: parseInt(fieldData.position, 10),
            isVisibleInClientOrderForm: fieldData.isVisibleInClientOrderForm,
            isVisibleInKarigarJobCard: fieldData.isVisibleInKarigarJobCard,
            isRequired: fieldData.isRequired,
            isOrderField: fieldData.isOrderField,
            isRepairField: fieldData.isRepairField,
        };

        console.log("Adding field with payload:", JSON.stringify(payload));

        setApiError('');
        const response = await fetchData({
            url: ADD_FIELD_API_URL,
            method: 'POST',
            data: payload,
        });

        if (response && response.status === "success") {
            console.log("Field added, response:", JSON.stringify(response));
            await onFieldAdded();
            navigation.goBack();
            Alert.alert("Success", "Field added successfully");
        } else {
            setApiError(response?.errorMessage || "Failed to add field");
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
                                numberOfLines={2} // Allow text to wrap to 2 lines
                                ellipsizeMode="tail" // Truncate with ellipsis if still too long
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
                onPress={addField}
                disabled={loading}
            >
                <Text style={styles.addButtonText}>
                    {loading ? (route.params?.field ? 'Updating...' : 'Adding...') : (route.params?.field ? 'Update Field' : 'Add Field')}
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
        width: '32%', // Slightly increased width to accommodate longer text
        height: 50, // Increased height to fit wrapped text
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
        fontSize: 12, // Reduced font size to fit longer text
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
