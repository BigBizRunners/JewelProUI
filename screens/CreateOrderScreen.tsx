import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    ScrollView,
    Text,
    StyleSheet,
    Alert,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import DateInput from '../components/DateInput';
import TextInputField from '../components/TextInputField';
import QuantityInput from '../components/QuantityInput';
import WeightRangeInput from '../components/WeightRangeInput';
import OptionSelector from '../components/OptionSelector';
import DynamicFieldRenderer from '../components/DynamicFieldRenderer';
import MediaUploader from '../components/MediaUploader';

const mockCategoryFieldsData = {
    fields: [
        {
            name: 'Note1',
            type: 'note',
            label: 'Please make sure all weights are approximate...',
        },
        {
            name: 'TestSingleOptions',
            type: 'options',
            label: 'Test Single Options',
            options: ['A', 'B', 'C'],
            multiSelect: false,
        },
        {
            name: 'TestText',
            type: 'text',
            label: 'Test Text',
        },
        {
            name: 'Testing rsng',
            type: 'range',
            label: 'Test Range knkcns',
            fromLabel: 'Min',
            toLabel: 'Max',
        },
        {
            name: 'TestOptions',
            type: 'options',
            label: 'Test Options',
            options: ['Short', 'Very Long Option Text That Should Wrap'],
            multiSelect: true,
        },
    ],
};

const mockCreateOrder = async (orderData: any) => {
    console.log('Mock creating order with data:', orderData);
    return new Promise((resolve) => {
        setTimeout(() => resolve({ ok: true }), 1000);
    });
};

const CreateOrderScreen = ({ navigation, route }: any) => {
    const { categoryId } = route.params;
    const [selectedClient, setSelectedClient] = useState<any>(null);

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

    const [mediaFiles, setMediaFiles] = useState<any[]>([]);
    const [pdfFiles, setPdfFiles] = useState<any[]>([]); // Changed from pdfFile to pdfFiles

    useEffect(() => {
        console.log('CreateOrderScreen mounted');
        return () => console.log('CreateOrderScreen unmounted');
    }, []);

    useEffect(() => {
        console.log('Current form state:', form);
    }, [form]);

    useFocusEffect(
        useCallback(() => {
            if (route.params?.selectedClient) {
                console.log('Received selectedClient via params:', route.params.selectedClient);
                setSelectedClient(route.params.selectedClient);
                navigation.setParams({ selectedClient: undefined });
            }
        }, [route.params?.selectedClient])
    );

    const handleChange = (key: string, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleDynamicFieldChange = (fieldName: string, value: any) => {
        setForm((prev) => ({
            ...prev,
            dynamicFields: { ...prev.dynamicFields, [fieldName]: value },
        }));
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB').split('/').join('-');
    };

    const onSelectClient = (client: any) => {
        console.log('Callback received client:', client);
        setSelectedClient(client);
    };

    const handleSubmit = async () => {
        if (!selectedClient) {
            Alert.alert('Error', 'Client is required');
            return;
        }

        const required = ['quantity', 'weightFrom', 'weightTo', 'priority'];
        for (const key of required) {
            if (!form[key]) {
                Alert.alert('Error', `${key} is required`);
                return;
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
            pdfFiles, // Changed from pdfFile to pdfFiles
        };

        try {
            const response = await mockCreateOrder(orderData);
            if (response.ok) {
                Alert.alert('Success', 'Order created successfully');
                navigation.navigate('OrdersMain');
            } else {
                throw new Error('Creation failed');
            }
        } catch (error: any) {
            Alert.alert('Error', `Failed to create order: ${error.message}`);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
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
                    fields={mockCategoryFieldsData.fields}
                    values={form.dynamicFields}
                    onChange={handleDynamicFieldChange}
                />
            </ScrollView>
            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit</Text>
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
});

export default CreateOrderScreen;
