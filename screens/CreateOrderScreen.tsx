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

// Import the new reusable component
import ProgressHeader from '../components/ProgressHeader';

import DateInput from '../components/DateInput';
import TextInputField from '../components/TextInputField';
import QuantityInput from '../components/QuantityInput';
import WeightRangeInput from '../components/WeightRangeInput';
import OptionSelector from '../components/OptionSelector';
import DynamicFieldRenderer from '../components/DynamicFieldRenderer';
import MediaUploader from '../components/MediaUploader';

// API Endpoints
const GET_CATEGORY_FIELDS_API_URL = process.env.EXPO_PUBLIC_API_URL_GET_CREATE_ORDER_FIELDS;
const GET_PRESIGNED_URL_API_URL = process.env.EXPO_PUBLIC_API_URL_GET_PRESIGNED_URLS;
const CREATE_ORDER_API_URL = process.env.EXPO_PUBLIC_API_URL_CREATE_ORDER;

// --- REMOVED ProgressHeader component and headerStyles from here ---

// Map backend FieldType to frontend field type
const mapFieldType = (backendType) => {
    switch (backendType) {
        case 'TEXT': return 'text';
        case 'NOTE': return 'note';
        case 'RANGE': return 'range';
        case 'DROPDOWN_OPTIONS': return 'options';
        case 'MULTI_SELECT_DROPDOWN_OPTIONS': return 'options';
        default:
            console.warn('Unknown fieldType:', backendType);
            return 'text';
    }
};

// Map API response to DynamicFieldRenderer format
const mapApiFieldsToFrontend = (apiFields) => {
    return apiFields.map((field) => ({
        name: field.fieldId,
        type: mapFieldType(field.fieldType),
        label: field.fieldName,
        options: field.validFieldValues || [],
        multiSelect: field.fieldType === 'MULTI_SELECT_DROPDOWN_OPTIONS',
        required: !!field.required,
    }));
};


const CreateOrderScreen = ({ navigation, route }) => {
    const { categoryId } = route.params;
    const { data: fieldsData, error, loading: fieldsLoading, fetchData } = useAuthenticatedFetch(navigation);
    const fetchDataRef = useRef(fetchData);

    const [submissionLoading, setSubmissionLoading] = useState(false);
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

    useEffect(() => {
        fetchDataRef.current = fetchData;
    }, [fetchData]);

    useEffect(() => {
        const loadFields = async () => {
            try {
                const response = await fetchDataRef.current({
                    url: GET_CATEGORY_FIELDS_API_URL,
                    method: 'POST',
                    data: { categoryId, orderFields: true },
                });
                if (response?.status === 'success' && Array.isArray(response.orderFields)) {
                    setDynamicFields(mapApiFieldsToFrontend(response.orderFields));
                } else {
                    setDynamicFields([]);
                }
            } catch (err) {
                Alert.alert('Error', 'Failed to fetch dynamic fields.');
            }
        };
        loadFields();
    }, [categoryId]);

    useFocusEffect(
        useCallback(() => {
            if (route.params?.selectedClient) {
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
        return date.toISOString().split('T')[0];
    };

    const onSelectClient = (client) => {
        setSelectedClient(client);
    };

    const handleSubmit = async () => {
        // --- FORM VALIDATION ---
        if (!selectedClient) {
            Alert.alert('Validation Error', 'Please select a client.');
            return;
        }
        // ... (rest of validation)

        setSubmissionLoading(true);

        try {
            // --- Normalize file objects before processing ---
            const allFiles = [...mediaFiles, ...pdfFiles].map((file, index) => {
                if (!file.uri) {
                    console.error("File at index", index, "is missing a URI:", file);
                    return null;
                }
                const fileName = file.name || file.fileName || `upload-${Date.now()}.${file.type === 'pdf' ? 'pdf' : 'jpg'}`;
                const fileType = file.type === 'pdf' ? 'application/pdf' : (file.type || 'image/jpeg');

                return { ...file, name: fileName, type: fileType };
            }).filter(file => file !== null);

            const fileMetadatas = allFiles.map(file => ({
                fileName: file.name,
                fileType: file.type,
            }));

            let uploadedFileKeys = [];
            if (fileMetadatas.length > 0) {
                const presignedUrlResponse = await fetchDataRef.current({
                    url: GET_PRESIGNED_URL_API_URL,
                    method: 'POST',
                    data: { files: fileMetadatas }
                });

                if (presignedUrlResponse?.status !== 'success' || !presignedUrlResponse.urls) {
                    throw new Error('Could not get file upload URLs.');
                }

                const uploadPromises = presignedUrlResponse.urls.map(async (item, index) => {
                    const fileToUpload = allFiles[index];
                    const blob = await (await fetch(fileToUpload.uri)).blob();

                    const response = await fetch(item.uploadUrl, {
                        method: 'PUT',
                        headers: { 'Content-Type': fileToUpload.type },
                        body: blob,
                    });

                    if (!response.ok) {
                        console.error('S3 Upload Error Response:', await response.text());
                        throw new Error(`Failed to upload ${fileToUpload.name}`);
                    }
                    return item.fileKey;
                });

                uploadedFileKeys = await Promise.all(uploadPromises);
            }

            const orderData = {
                categoryId,
                clientId: selectedClient.clientId,
                orderDate: formatDate(form.orderDate),
                deliveryDueDate: formatDate(form.deliveryDueDate),
                referenceNo: form.referenceNo,
                quantity: parseInt(form.quantity, 10),
                weightFrom: parseFloat(form.weightFrom),
                weightTo: parseFloat(form.weightTo),
                narration: form.narration,
                priority: form.priority,
                dynamicFields: form.dynamicFields,
                uploadedFileKeys: uploadedFileKeys,
            };

            const createOrderResponse = await fetchDataRef.current({
                url: CREATE_ORDER_API_URL,
                method: 'POST',
                data: orderData,
            });

            // --- UPDATED: Navigate to success screen on success ---
            if (createOrderResponse?.status === 'success') {
                navigation.replace('OrderSuccess', {
                    orderId: createOrderResponse.orderId,
                });
            } else {
                throw new Error(createOrderResponse?.errorMessage || 'Order creation failed.');
            }

        } catch (err) {
            Alert.alert('Error', `An error occurred: ${err.message}`);
        } finally {
            setSubmissionLoading(false);
        }
    };

    const isLoading = fieldsLoading || submissionLoading;

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            {/* Use the new component */}
            <ProgressHeader title="Create Order" currentStep={2} totalSteps={2} />
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#075E54" />
                    <Text style={styles.loadingText}>
                        {submissionLoading ? 'Submitting Order...' : 'Loading Fields...'}
                    </Text>
                </View>
            ) : error ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollView} keyboardShouldPersistTaps="handled">
                    <MediaUploader
                        mediaFiles={mediaFiles}
                        setMediaFiles={setMediaFiles}
                        pdfFiles={pdfFiles}
                        setPdfFiles={setPdfFiles}
                    />
                    <View style={styles.clientDropdownContainer}>
                        <Text style={styles.label}>Select Client <Text style={styles.required}>*</Text></Text>
                        <TouchableOpacity
                            style={styles.clientDropdown}
                            onPress={() => navigation.navigate('ClientSelector', { onSelectClient })}
                        >
                            <Text style={selectedClient ? styles.clientText : styles.clientPlaceholder}>
                                {selectedClient ? selectedClient.name : 'Select a client'}
                            </Text>
                            <MaterialCommunityIcons name="menu-down" size={24} color="#333" />
                        </TouchableOpacity>
                    </View>
                    <DateInput label="Order Date" value={form.orderDate} onChange={(date) => handleChange('orderDate', date)} required />
                    <TextInputField label="Reference No" value={form.referenceNo} onChange={(val) => handleChange('referenceNo', val)} />
                    <QuantityInput value={form.quantity} onChange={(val) => handleChange('quantity', val)} required />
                    <WeightRangeInput required={true} label="Weight" from={form.weightFrom} to={form.weightTo} onChangeFrom={(val) => handleChange('weightFrom', val)} onChangeTo={(val) => handleChange('weightTo', val)} />
                    <DateInput label="Delivery Due Date" value={form.deliveryDueDate} onChange={(date) => handleChange('deliveryDueDate', date)} required />
                    <TextInputField label="Narration" value={form.narration} onChange={(val) => handleChange('narration',val)} multiline />
                    <OptionSelector label="Priority" options={['Customer Order', 'Stock Order']} value={form.priority} onChange={(val) => handleChange('priority', val)} required />
                    <DynamicFieldRenderer fields={dynamicFields} values={form.dynamicFields} onChange={handleDynamicFieldChange} />
                </ScrollView>
            )}
            {!isLoading && !error && (
                <TouchableOpacity style={[styles.submitButton, submissionLoading && styles.disabledButton]} onPress={handleSubmit} disabled={submissionLoading}>
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            )}
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9' },
    scrollView: { padding: 20, paddingBottom: 80 },
    clientDropdownContainer: { marginBottom: 20 },
    label: { fontSize: 12, fontWeight: 'bold', color: '#000', marginBottom: 5 },
    required: { color: 'red' },
    clientDropdown: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#ccc', paddingVertical: 10 },
    clientText: { fontSize: 16, color: '#333' },
    clientPlaceholder: { fontSize: 16, color: '#767577' },
    submitButton: { backgroundColor: '#075E54', borderRadius: 8, paddingVertical: 14, margin: 20, alignItems: 'center' },
    disabledButton: { backgroundColor: '#A9A9A9' },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#333' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    errorText: { color: 'red', fontSize: 16, textAlign: 'center' },
});

export default CreateOrderScreen;
