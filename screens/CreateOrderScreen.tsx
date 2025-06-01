import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

import DateInput from '../components/DateInput';
import TextInputField from '../components/TextInputField';
import QuantityInput from '../components/QuantityInput';
import WeightRangeInput from '../components/WeightRangeInput';
import OptionSelector from '../components/OptionSelector';
import DynamicFieldRenderer from '../components/DynamicFieldRenderer';
import MediaUploader from '../components/MediaUploader';

// API endpoint for fetching dynamic fields
const GET_CATEGORY_FIELDS_API_URL = 'https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/getCreateOrderFields';

// Map backend FieldType to frontend field type
const mapFieldType = (backendType) => {
    switch (backendType) {
        case 'TEXT':
            return 'text';
        case 'NOTE':
            return 'note';
        case 'RANGE':
            return 'range';
        case 'DROPDOWN_OPTIONS':
            return 'options';
        case 'MULTI_SELECT_DROPDOWN_OPTIONS':
            return 'options';
        default:
            console.warn('Unknown fieldType:', backendType);
            return 'text'; // Fallback to text if unknown
    }
};

// Map API response to DynamicFieldRenderer format
const mapApiFieldsToFrontend = (apiFields) => {
    return apiFields.map((field) => ({
        name: field.fieldId, // Use fieldId as the key for dynamicFields
        type: mapFieldType(field.fieldType),
        label: field.fieldName,
        options: field.validFieldValues || [],
        multiSelect: field.fieldType === 'MULTI_SELECT_DROPDOWN_OPTIONS',
        required: !!field.required,
    }));
};

// Mock create order function (replace with actual API call later)
const mockCreateOrder = async (orderData) => {
    console.log('Mock creating order with data:', orderData);
    return new Promise((resolve) => {
        setTimeout(() => resolve({ ok: true }), 1000);
    });
};

const CreateOrderScreen = ({ navigation, route }) => {
    const { categoryId } = route.params;
    // Explicitly disable autoFetch to prevent duplicate calls
    const { data: fieldsData, error, loading, fetchData } = useAuthenticatedFetch(navigation, {
        autoFetch: false,
    });
    const fetchDataRef = useRef(fetchData); // Stabilize fetchData with useRef
    const [selectedClient, setSelectedClient] = useState(null);
    const [form, setForm] = useState({
        orderDate: new Date(),
        deliveryDueDate: new Date(),
        referenceNo: '',
        quantity: '',
        weightFrom: '',
        weightTo: '',
        narration: '',
        priority: '',
        dynamicFields: {},
    });
    const [mediaFiles, setMediaFiles] = useState([]);
    const [pdfFiles, setPdfFiles] = useState([]);
    const [dynamicFields, setDynamicFields] = useState([]);

    // Update fetchDataRef when fetchData changes
    useEffect(() => {
        fetchDataRef.current = fetchData;
    }, [fetchData]);

    // Fetch dynamic fields when the screen mounts or categoryId changes
    useEffect(() => {
        const loadFields = async () => {
            try {
                const response = await fetchDataRef.current({
                    url: GET_CATEGORY_FIELDS_API_URL,
                    method: 'POST',
                    data: { categoryId, orderFields: true },
                });
                if (response?.status === 'success') {
                    if (response.orderFields && Array.isArray(response.orderFields)) {
                        const mappedFields = mapApiFieldsToFrontend(response.orderFields);
                        setDynamicFields(mappedFields);
                    } else {
                        console.warn('No orderFields in response:', response);
                        setDynamicFields([]); // Set empty fields if none returned
                    }
                } else {
                    throw new Error(response?.errorMessage || 'Failed to fetch fields');
                }
            } catch (err) {
                console.error('Error fetching dynamic fields:', err);
                Alert.alert('Error', err.message || 'Failed to fetch dynamic fields');
            }
        };
        loadFields();
    }, [categoryId]);

    useFocusEffect(
        useCallback(() => {
            if (route.params?.selectedClient) {
                console.log('Received selectedClient via params:', route.params.selectedClient);
                setSelectedClient(route.params.selectedClient);
                navigation.setParams({ selectedClient: undefined });
            }
        }, [route.params?.selectedClient])
    );

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleDynamicFieldChange = (fieldId, value) => {
        setForm((prev) => ({
            ...prev,
            dynamicFields: { ...prev.dynamicFields, [fieldId]: value },
        }));
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB').split('/').join('-');
    };

    const onSelectClient = (client) => {
        console.log('Callback received client:', client);
        setSelectedClient(client);
    };

    const handleSubmit = async () => {
        if (!selectedClient) {
            Alert.alert('Error', 'Client is required');
            return;
        }

        // Validate static required fields
        const requiredStaticFields = [
            { key: 'quantity', label: 'Quantity' },
            { key: 'weightFrom', label: 'Weight From' },
            { key: 'weightTo', label: 'Weight To' },
            { key: 'priority', label: 'Priority' },
        ];
        for (const { key, label } of requiredStaticFields) {
            if (!form[key]) {
                Alert.alert('Error', `${label} is required`);
                return;
            }
        }

        // Validate required dynamic fields
        for (const field of dynamicFields) {
            if (field.required) {
                const value = form.dynamicFields[field.name];
                if (!value || (Array.isArray(value) && value.length === 0)) {
                    Alert.alert('Error', `${field.label} is required`);
                    return;
                }
            }
        }

        const orderData = {
            categoryId,
            clientId: selectedClient.id,
            orderDate: formatDate(form.orderDate),
            deliveryDueDate: formatDate(form.deliveryDueDate),
            referenceNo: form.referenceNo,
            quantity: parseInt(form.quantity),
            weightFrom: parseFloat(form.weightFrom),
            weightTo: parseFloat(form.weightTo),
            narration: form.narration,
            priority: form.priority,
            dynamicFields: form.dynamicFields,
            mediaFiles,
            pdfFiles,
        };

        try {
            const response = await mockCreateOrder(orderData);
            if (response.ok) {
                Alert.alert('Success', 'Order created successfully');
                navigation.navigate('OrdersMain');
            } else {
                throw new Error('Creation failed');
            }
        } catch (error) {
            Alert.alert('Error', `Failed to create order: ${error.message}`);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#075E54" />
                    <Text style={styles.loadingText}>Loading fields...</Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollView}
                    keyboardShouldPersistTaps="handled"
                >
                    <MediaUploader
                        mediaFiles={mediaFiles}
                        setMediaFiles={setMediaFiles}
                        pdfFiles={pdfFiles}
                        setPdfFiles={setPdfFiles}
                    />
                    <View style={styles.clientDropdownContainer}>
                        <Text style={styles.label}>
                            Select Client <Text style={styles.required}>*</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.clientDropdown}
                            onPress={() => navigation.navigate('ClientSelector', { onSelectClient })}
                        >
                            <Text
                                style={
                                    selectedClient ? styles.clientText : styles.clientPlaceholder
                                }
                            >
                                {selectedClient ? selectedClient.name : 'Select a client'}
                            </Text>
                            <MaterialCommunityIcons name="menu-down" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <DateInput
                        label="Order Date"
                        value={form.orderDate}
                        onChange={(date) => handleChange('orderDate', date)}
                        required
                    />
                    <TextInputField
                        label="Reference No"
                        value={form.referenceNo}
                        onChange={(val) => handleChange('referenceNo', val)}
                    />
                    <QuantityInput
                        value={form.quantity}
                        onChange={(val) => handleChange('quantity', val)}
                        required
                    />
                    <WeightRangeInput
                        required={true}
                        label="Weight"
                        from={form.weightFrom}
                        to={form.weightTo}
                        onChangeFrom={(val) => handleChange('weightFrom', val)}
                        onChangeTo={(val) => handleChange('weightTo', val)}
                    />
                    <DateInput
                        label="Delivery Due Date"
                        value={form.deliveryDueDate}
                        onChange={(date) => handleChange('deliveryDueDate', date)}
                        required
                    />
                    <TextInputField
                        label="Narration"
                        value={form.narration}
                        onChange={(val) => handleChange('narration', val)}
                        multiline
                    />
                    <OptionSelector
                        label="Priority"
                        options={['Customer Order', 'Stock Order']}
                        value={form.priority}
                        onChange={(val) => handleChange('priority', val)}
                        required
                    />
                    <DynamicFieldRenderer
                        fields={dynamicFields}
                        values={form.dynamicFields}
                        onChange={handleDynamicFieldChange}
                    />
                </ScrollView>
            )}
            {!loading && !error && (
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            )}
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
    clientDropdownContainer: {
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
    clientDropdown: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
    },
    clientText: {
        fontSize: 16,
        color: '#333',
    },
    clientPlaceholder: {
        fontSize: 16,
        color: '#767577',
    },
    submitButton: {
        backgroundColor: '#075E54',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 16,
        margin: 20,
        alignItems: 'center',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default CreateOrderScreen;
