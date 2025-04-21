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
    Platform, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const MANAGE_STATUS_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/manageStatus";

// Note: This version uses a callback in navigation params, triggering a non-serializable warning.
// Consider using result-based navigation (await navigation.navigate) with React Navigation 5+
// if state persistence or deep linking is needed. See troubleshooting guide for details.
// Temporarily removed useAuthenticatedFetch to isolate hook error.
const ManageStatusScreen = ({ navigation, route }: any) => {
    const { status, statusType, allStatuses } = route.params || { status: null, statusType: 'order', allStatuses: [] };
    const [statusName, setStatusName] = useState(status?.name || '');
    const [position, setPosition] = useState(status?.position?.toString() || '');
    const [showInPendingOrders, setShowInPendingOrders] = useState(status?.showInPendingOrders || false);
    const [allowedStatusChanges, setAllowedStatusChanges] = useState<{ statusId: string; statusName: string; isSelected: boolean }[]>(
        status?.allowedStatusChanges
            ? allStatuses.map(s => ({
                statusId: s.statusId,
                statusName: s.statusName || s.name,
                isSelected: (status.allowedStatusChanges || []).includes(s.statusId),
            }))
            : allStatuses.map(s => ({ statusId: s.statusId, statusName: s.statusName || s.name, isSelected: false }))
    );
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

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
                console.log('Callback received selected statuses:', selectedStatuses);
                const updatedStatuses = allStatuses.map(s => {
                    const matchingStatus = selectedStatuses.find(ns => ns.statusId === s.statusId);
                    return matchingStatus ? { ...s, isSelected: matchingStatus.isSelected } : { ...s, isSelected: false };
                });
                setAllowedStatusChanges(updatedStatuses);
                console.log('Updated allowedStatusChanges state:', updatedStatuses);
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
        console.log('it came here');

        setSaveLoading(true);
        setSaveError(null);

        const requestData = {
            operation: status ? 'update' : 'add',
            statusType,
            status: {
                statusId: status?.statusId || '',
                name: statusName,
                position: Number(position),
                showInPendingOrders,
                allowedStatusChanges: allowedStatusChanges.filter(s => s.isSelected).map(s => s.statusId),
            },
        };

        try {
            console.log('Request Data:', JSON.stringify(requestData));
            // Temporary replacement for useAuthenticatedFetch
            const response = await fetch(MANAGE_STATUS_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authentication headers if needed (e.g., token)
                    // 'Authorization': `Bearer your-token-here`,
                },
                body: JSON.stringify(requestData),
            });
            const data = await response.json();

            if (!response.ok || (data && data.status === 'failure')) {
                Alert.alert('Error', 'Failed to save status');
            } else {
                Alert.alert('Success', `Status ${status ? 'updated' : 'added'} successfully`);
                navigation.goBack();
            }
        } catch (err) {
            console.log('Fetch error:', err);
            setSaveError('An unexpected error occurred');
        } finally {
            setSaveLoading(false);
        }
    };

    const isFormValid = () => {
        return statusName.trim() !== '' && position.trim() !== '';
    };

    const isUpdate = !!status;
    const buttonText = saveLoading ? (isUpdate ? 'Updating...' : 'Adding...') : (isUpdate ? 'Update Status' : 'Add Status');

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <Text style={styles.label}>Status Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter status name"
                    value={statusName}
                    onChangeText={setStatusName}
                    editable={!saveLoading}
                />
                <Text style={styles.label}>Position <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter position"
                    value={position}
                    onChangeText={setPosition}
                    keyboardType="numeric"
                    editable={!saveLoading}
                />
                <Text style={styles.label}>Allows Status Change</Text>
                <TouchableOpacity style={styles.input} onPress={handleSelectStatuses} disabled={saveLoading}>
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
                        disabled={saveLoading}
                        trackColor={{ false: "#767577", true: "#075E54" }}
                        thumbColor={showInPendingOrders ? "#f4f3f4" : "#f4f3f4"}
                    />
                </View>
            </ScrollView>
            <TouchableOpacity
                style={[styles.addButton, (!isFormValid() || saveLoading) ? styles.disabledButton : null]}
                onPress={handleSave}
                disabled={!isFormValid() || saveLoading}
                activeOpacity={0.7}
            >
                <Text style={styles.addButtonText}>{buttonText}</Text>
            </TouchableOpacity>
            {saveLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Saving...</Text>
                </View>
            )}
            {saveError && <Text style={styles.errorText}>{saveError}</Text>}
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
        marginLeft: 10, // Optional: Adds spacing between text and icon
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
