import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Switch,
    Alert,
    KeyboardAvoidingView,
    ScrollView,
    StyleSheet,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch'; // Import the custom hook

// Use the same API endpoint as defined in OrderStatusScreen for consistency
const HANDLE_STATUS_OPERATION_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/manageStatus";

const ManageStatusScreen = ({ navigation, route }: any) => {
    const { status, statusType, allStatuses } = route.params || { status: null, statusType: 'order', allStatuses: [] };

    // Use the authenticated fetch hook
    const { fetchData, loading, error: fetchError } = useAuthenticatedFetch(navigation);

    const [statusName, setStatusName] = useState(status?.name || '');
    const [position, setPosition] = useState(status?.position?.toString() || '');
    const [showInPendingOrders, setShowInPendingOrders] = useState(status?.showInPending || false);

    const existingAllowedIds = status?.allowedNextStatusList || [];
    const [allowedStatusChanges, setAllowedStatusChanges] = useState<{ statusId: string; statusName: string; isSelected: boolean }[]>(
        allStatuses.map((s: any) => ({
            statusId: s.statusId,
            statusName: s.name || s.statusName,
            isSelected: existingAllowedIds.includes(s.statusId),
        }))
    );

    useEffect(() => {
        navigation.setOptions({
            title: status ? 'Edit Status' : 'Add Status',
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, status]);

    const handleSelectStatuses = () => {
        navigation.navigate('SelectAllowedStatuses', {
            allStatuses,
            selectedStatuses: allowedStatusChanges.filter(s => s.isSelected),
            currentStatusId: status?.statusId,
            onSave: (selectedStatuses: { statusId: string; statusName: string; isSelected: boolean }[]) => {
                const updatedStatuses = allStatuses.map((s: any) => {
                    const matchingStatus = selectedStatuses.find(ns => ns.statusId === s.statusId);
                    return { ...s, statusName: s.name || s.statusName, isSelected: !!matchingStatus };
                });
                setAllowedStatusChanges(updatedStatuses);
            },
        });
    };

    const handleSave = async () => {
        if (!statusName.trim()) {
            Alert.alert('Error', 'Status Name is required');
            return;
        }
        if (!position || isNaN(Number(position))) {
            Alert.alert('Error', 'Position must be a valid number');
            return;
        }

        // Determine the operation type based on whether a status object exists
        const operation = status ? 'modify' : 'add';

        // Construct the request data to match the backend's ModifyOrderStatusRequest model
        const requestData = {
            operation,
            statusType,
            // Only include statusId for modify operations
            ...(status ? { statusId: status.statusId } : {}),
            name: statusName,
            position: Number(position),
            showInPending: showInPendingOrders,
            // Use the correct key 'allowedNextStatusList' and map to an array of IDs
            allowedNextStatusList: allowedStatusChanges.filter(s => s.isSelected).map(s => s.statusId),
        };

        try {
            console.log('Request Data:', JSON.stringify(requestData, null, 2));

            // Use the fetchData function from the hook
            const responseData = await fetchData({
                url: HANDLE_STATUS_OPERATION_API_URL,
                method: 'POST',
                data: requestData,
            });

            console.log("Response is ==> " + JSON.stringify(responseData));

            if (responseData && responseData.status === "success") {
                Alert.alert("Success", responseData.responseMessage || `Status ${operation === 'modify' ? 'updated' : 'added'} successfully`);
                navigation.goBack(); // Go back to the previous screen
            } else if (responseData && responseData.status === "failure") {
                Alert.alert("Error", responseData.responseMessage || `Failed to ${operation} status`);
            }
        } catch (error) {
            // The hook already sets the error state, but we can log for debugging
            console.log("Save error:", error);
            Alert.alert("Error", `An unexpected error occurred while trying to ${operation} the status.`);
        }
    };

    const isFormValid = () => {
        return statusName.trim() !== '' && position.trim() !== '';
    };

    const isUpdate = !!status;
    // Use the 'loading' state from the hook
    const buttonText = loading ? (isUpdate ? 'Updating...' : 'Adding...') : (isUpdate ? 'Update Status' : 'Add Status');

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <Text style={styles.label}>Status Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter status name"
                    value={statusName}
                    onChangeText={setStatusName}
                    editable={!loading}
                />
                <Text style={styles.label}>Position <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter position"
                    value={position}
                    onChangeText={setPosition}
                    keyboardType="numeric"
                    editable={!loading}
                />
                <Text style={styles.label}>Allows Status Change</Text>
                <TouchableOpacity style={styles.input} onPress={handleSelectStatuses} disabled={loading}>
                    <View style={styles.dropdownContainer}>
                        <Text style={styles.dropdownText}>
                            {allowedStatusChanges.filter(s => s.isSelected).length > 0
                                ? `${allowedStatusChanges.filter(s => s.isSelected).length} Selected`
                                : 'Select statuses'}
                        </Text>
                        <MaterialCommunityIcons name="chevron-down" size={20} color="#888" style={styles.dropdownIcon} />
                    </View>
                </TouchableOpacity>
                <View style={styles.switchContainer}>
                    <Text style={styles.label}>Show in Pending Orders</Text>
                    <Switch
                        value={showInPendingOrders}
                        onValueChange={setShowInPendingOrders}
                        disabled={loading}
                        trackColor={{ false: "#767577", true: "#075E54" }}
                        thumbColor={showInPendingOrders ? "#f4f3f4" : "#f4f3f4"}
                    />
                </View>
            </ScrollView>
            <TouchableOpacity
                style={[styles.addButton, (!isFormValid() || loading) ? styles.disabledButton : null]}
                onPress={handleSave}
                disabled={!isFormValid() || loading}
                activeOpacity={0.7}
            >
                <Text style={styles.addButtonText}>{buttonText}</Text>
            </TouchableOpacity>
            {loading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Saving...</Text>
                </View>
            )}
            {fetchError && <Text style={styles.errorText}>{fetchError}</Text>}
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
        paddingBottom: 80,
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
    switchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderColor: '#ccc',
        padding: 10,
    },
    dropdownContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    dropdownIcon: {
        marginLeft: 10,
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
        backgroundColor: '#A9A9A9',
        opacity: 0.6,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 20,
    },
});

export default ManageStatusScreen;
