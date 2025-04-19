import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Switch,
    Modal,
    FlatList,
    Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const MANAGE_STATUS_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/manageStatus";

const ManageOrderStatusScreen = ({ navigation, route }: any) => {
    const { status, statusType, allStatuses } = route.params || { status: null, statusType: 'order', allStatuses: [] };
    const [statusName, setStatusName] = useState(status?.name || '');
    const [position, setPosition] = useState(status?.position?.toString() || '');
    const [showInPendingOrders, setShowInPendingOrders] = useState(status?.showInPendingOrders || false);
    const [allowedStatusChanges, setAllowedStatusChanges] = useState<{ id: string; status: string }[]>(
        status?.allowedStatusChanges?.map((id: string) => {
            const s = allStatuses.find((s: any) => s.statusId === id);
            return { id, status: s?.name || '' };
        }) || []
    );
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStatuses, setSelectedStatuses] = useState<{ id: string; status: string }[]>([]);
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        if (status) {
            setSelectedStatuses(
                status.allowedStatusChanges?.map((id: string) => {
                    const s = allStatuses.find((s: any) => s.statusId === id);
                    return { id, status: s?.name || '' };
                }) || []
            );
        }
    }, [status, allStatuses]);

    const openMultiSelectModal = () => {
        setSelectedStatuses([...allowedStatusChanges]);
        setModalVisible(true);
    };

    const handleMultiSelectSubmit = () => {
        setAllowedStatusChanges(selectedStatuses);
        setModalVisible(false);
    };

    const renderStatusItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.statusItem}
            onPress={() => {
                setSelectedStatuses(prev =>
                    prev.some(s => s.id === item.statusId)
                        ? prev.filter(s => s.id !== item.statusId)
                        : [...prev, { id: item.statusId, status: item.name }]
                );
            }}
        >
            <Text style={styles.statusText}>{item.name}</Text>
            {selectedStatuses.some(s => s.id === item.statusId) && (
                <MaterialCommunityIcons name="check" size={20} color="#075E54" />
            )}
        </TouchableOpacity>
    );

    const handleSave = async () => {
        if (!statusName.trim()) {
            Alert.alert('Error', 'Status Name is required');
            return;
        }
        if (!position || isNaN(Number(position))) {
            Alert.alert('Error', 'Position must be a valid number');
            return;
        }

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
                allowedStatusChanges: allowedStatusChanges,
            },
        };

        try {
            const { data, error: manageError } = await useAuthenticatedFetch(navigation, {
                url: MANAGE_STATUS_API_URL,
                method: 'POST',
                data: requestData,
            });

            if (manageError || (data && data.status === 'failure')) {
                setSaveError(manageError || data?.errorMessage || 'Failed to save status');
            } else {
                Alert.alert('Success', `Status ${status ? 'updated' : 'added'} successfully`);
                navigation.goBack();
            }
        } catch (err) {
            setSaveError('An unexpected error occurred');
        } finally {
            setSaveLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.screenTitle}>{status ? 'Edit Status' : 'Add Status'}</Text>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Status Name</Text>
                <TextInput
                    style={styles.input}
                    value={statusName}
                    onChangeText={setStatusName}
                    placeholder="Enter status name"
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Position</Text>
                <TextInput
                    style={styles.input}
                    value={position}
                    onChangeText={setPosition}
                    placeholder="Enter position"
                    keyboardType="numeric"
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Show in Pending Orders</Text>
                <Switch
                    trackColor={{ false: '#767577', true: '#075E54' }}
                    thumbColor={showInPendingOrders ? '#fff' : '#f4f3f4'}
                    ios_backgroundColor="#3e3e3e"
                    onValueChange={setShowInPendingOrders}
                    value={showInPendingOrders}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Allows Status Change</Text>
                <TouchableOpacity style={styles.dropdown} onPress={openMultiSelectModal} activeOpacity={0.7}>
                    <Text style={styles.dropdownText}>
                        {allowedStatusChanges.length > 0
                            ? allowedStatusChanges.map(s => s.status).join(', ')
                            : 'Select statuses'}
                    </Text>
                    <MaterialCommunityIcons name="chevron-down" size={20} color="#888" />
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.7} disabled={saveLoading}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Select Allowed Statuses</Text>
                        <FlatList
                            data={allStatuses.filter(s => s.statusId !== (status?.statusId || ''))}
                            renderItem={renderStatusItem}
                            keyExtractor={(item) => item.statusId}
                            ItemSeparatorComponent={() => <View style={styles.separator} />}
                        />
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleMultiSelectSubmit}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.submitButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {saveLoading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Saving...</Text>
                </View>
            )}
            {saveError && <Text style={styles.errorText}>{saveError}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', paddingHorizontal: 16, paddingTop: 20 },
    screenTitle: { fontSize: 24, fontWeight: 'bold', color: '#075E54', marginBottom: 20 },
    inputContainer: { marginBottom: 15 },
    label: { fontSize: 16, color: '#333', marginBottom: 5 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 16 },
    dropdown: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    dropdownText: { fontSize: 16, color: '#333' },
    saveButton: {
        backgroundColor: '#075E54',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 20
    },
    saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)'
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20
    },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#333' },
    statusItem: { padding: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    statusText: { fontSize: 16, color: '#333' },
    submitButton: {
        backgroundColor: '#075E54',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 15
    },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: { marginTop: 10, fontSize: 16, color: '#333' },
    errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginTop: 10 },
    separator: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 5 },
});

export default ManageOrderStatusScreen;
