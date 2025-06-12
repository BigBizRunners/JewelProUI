import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    StyleSheet,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const GET_ORDER_STATUSES_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/getOrderStatuses";
const HANDLE_STATUS_OPERATION_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/manageStatus";

type StatusOperation = 'delete' | 'setDefault' | 'setFirst' | 'setLast';

const OrderStatusScreen = ({ navigation, route }: any) => {
    const { statusType = 'order' } = route.params || {};
    const { data: responseData, error: fetchError, loading: initialLoading, fetchData } = useAuthenticatedFetch(navigation);

    const [orderStatuses, setOrderStatuses] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<any>(null);
    const [operationLoading, setOperationLoading] = useState(false);

    // Fetches statuses whenever the screen comes into focus.
    useFocusEffect(
        useCallback(() => {
            const getStatuses = async () => {
                console.log("OrderStatusScreen focused, fetching statuses...");
                const data = await fetchData({
                    url: GET_ORDER_STATUSES_API_URL,
                    method: 'POST',
                    data: { statusType },
                });
                if (data && data.orderStatuses) {
                    setOrderStatuses(data.orderStatuses);
                } else if (data && data.status === 'failure') {
                    Alert.alert('Error', data.responseMessage || 'Failed to load statuses');
                }
            };

            getStatuses();

            return () => {
                console.log("OrderStatusScreen unfocused.");
            };
        }, [statusType]) // Dependency on statusType to refetch if it changes.
    );

    const showModal = (item: any) => {
        setSelectedStatus(item);
        setModalVisible(true);
    };

    const hideModal = () => {
        setModalVisible(false);
        setSelectedStatus(null);
    };

    const handleEditStatus = () => {
        if (selectedStatus) {
            navigation.navigate('ManageOrderStatusScreen', {
                status: selectedStatus,
                statusType,
                allStatuses: orderStatuses,
            });
        }
        hideModal();
    };

    const handleAddStatus = () => {
        navigation.navigate('ManageOrderStatusScreen', {
            status: null,
            statusType,
            allStatuses: orderStatuses,
        });
        hideModal();
    };

    /**
     * Handles various status operations like delete, setDefault, etc.
     * @param operation The operation to perform.
     */
    const handleStatusOperation = (operation: StatusOperation) => {
        if (!selectedStatus) return;

        // Map operation to a user-friendly action name for alerts.
        const actionName = {
            delete: 'Delete',
            setDefault: 'Set as Default',
            setFirst: 'Set as First',
            setLast: 'Set as Last',
        }[operation];

        const alertMessage = `Are you sure you want to ${actionName.toLowerCase()} the status "${selectedStatus.name}"?`;

        Alert.alert(
            actionName,
            alertMessage,
            [
                { text: 'Cancel', style: 'cancel', onPress: hideModal },
                {
                    text: actionName,
                    style: operation === 'delete' ? 'destructive' : 'default',
                    onPress: async () => {
                        hideModal(); // Hide modal before starting the operation
                        setOperationLoading(true);
                        try {
                            const requestData = {
                                // The backend operation name is camelCase (e.g., 'setDefault')
                                operation: operation,
                                statusId: selectedStatus.statusId,
                                statusType,
                            };

                            const response = await fetchData({
                                url: HANDLE_STATUS_OPERATION_API_URL,
                                method: 'POST',
                                data: requestData,
                            });

                            if (response && response.status === 'success') {
                                // Update local state for immediate UI feedback
                                updateLocalStatuses(operation, selectedStatus.statusId);
                                Alert.alert('Success', `Status successfully ${operation === 'delete' ? 'deleted' : 'updated'}.`);
                            } else {
                                Alert.alert('Error', response?.responseMessage || `Failed to ${actionName.toLowerCase()} status.`);
                            }
                        } catch (error) {
                            Alert.alert('Error', `An unexpected error occurred while trying to ${actionName.toLowerCase()} the status.`);
                            console.error(`${actionName} error:`, error);
                        } finally {
                            setOperationLoading(false);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    /**
     * Updates the local orderStatuses state based on the operation performed.
     * @param operation The operation that was performed.
     * @param statusId The ID of the status that was affected.
     */
    const updateLocalStatuses = (operation: StatusOperation, statusId: string) => {
        let updatedStatuses = [...orderStatuses];

        if (operation === 'delete') {
            updatedStatuses = updatedStatuses.filter(s => s.statusId !== statusId);
        } else {
            updatedStatuses = updatedStatuses.map(status => {
                const isCurrentStatus = status.statusId === statusId;
                // For flag operations, unset the flag on all other statuses.
                if (operation === 'setDefault') {
                    return { ...status, isDefaultStatus: isCurrentStatus };
                }
                if (operation === 'setFirst') {
                    return { ...status, isFirstStage: isCurrentStatus };
                }
                if (operation === 'setLast') {
                    return { ...status, isLastStage: isCurrentStatus };
                }
                return status;
            });
        }
        setOrderStatuses(updatedStatuses);
    };

    const renderStatusItem = ({ item }: { item: any }) => {
        const indicators = [];
        if (item.isDefaultStatus) {
            indicators.push(
                <View key="default" style={[styles.badge, { backgroundColor: '#FFE082' }]}>
                    <Text style={[styles.badgeText, { color: '#333' }]}>Default</Text>
                </View>
            );
        }
        if (item.isFirstStage) {
            indicators.push(
                <View key="first" style={[styles.badge, { backgroundColor: '#A5D6A7' }]}>
                    <Text style={[styles.badgeText, { color: '#333' }]}>First</Text>
                </View>
            );
        }
        if (item.isLastStage) {
            indicators.push(
                <View key="last" style={[styles.badge, { backgroundColor: '#EF9A9A' }]}>
                    <Text style={[styles.badgeText, { color: '#FFF' }]}>Last</Text>
                </View>
            );
        }

        return (
            <TouchableOpacity onPress={() => showModal(item)} style={styles.statusItem}>
                <Text style={styles.statusName}>{item.name || 'N/A'}</Text>
                <View style={styles.indicatorContainer}>
                    {indicators}
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#888" style={styles.arrowIcon} />
                </View>
            </TouchableOpacity>
        );
    };

    if (initialLoading && orderStatuses.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Loading statuses...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {operationLoading && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Processing...</Text>
                </View>
            )}
            <FlatList
                data={orderStatuses}
                renderItem={renderStatusItem}
                keyExtractor={(item: any) => item.statusId}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>No statuses available</Text>}
            />
            <TouchableOpacity style={styles.addStatusButton} onPress={handleAddStatus}>
                <Text style={styles.addStatusText}>Add Status</Text>
            </TouchableOpacity>
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={hideModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{selectedStatus?.name || 'Status'}</Text>
                        <TouchableOpacity style={styles.modalOption} onPress={handleEditStatus}>
                            <Text style={styles.modalOptionText}>Edit Status</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={() => handleStatusOperation('setDefault')}>
                            <Text style={styles.modalOptionText}>Set Default</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={() => handleStatusOperation('setFirst')}>
                            <Text style={styles.modalOptionText}>Set First</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={() => handleStatusOperation('setLast')}>
                            <Text style={styles.modalOptionText}>Set Last</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={() => handleStatusOperation('delete')}>
                            <Text style={[styles.modalOptionText, { color: 'red' }]}>Delete Status</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalOption, { marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 }]} onPress={hideModal}>
                            <Text style={[styles.modalOptionText, { color: '#333', textAlign: 'center' }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            {fetchError && <Text style={styles.errorText}>{fetchError}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', paddingHorizontal: 5, paddingTop: 20 },
    listContent: { paddingBottom: 60 },
    statusItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, elevation: 2, marginVertical: 4, marginHorizontal: 10 },
    statusName: { fontSize: 16, fontWeight: '500', color: '#333', flex: 1 },
    indicatorContainer: { flexDirection: 'row', alignItems: 'center' },
    arrowIcon: { marginLeft: 10 },
    addStatusButton: { flexDirection: 'row', backgroundColor: '#075E54', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', margin: 10, marginBottom: 20 },
    addStatusText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    separator: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 2 },
    modalOverlay: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContainer: { width: '100%', backgroundColor: '#fff', borderTopLeftRadius: 15, borderTopRightRadius: 15, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#333', textAlign: 'center' },
    modalOption: { paddingVertical: 14 },
    modalOptionText: { fontSize: 16, color: '#075E54', textAlign: 'center' },
    emptyText: { textAlign: 'center', padding: 20, color: '#666', marginTop: 50 },
    errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginTop: 20 },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 5,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
});

export default OrderStatusScreen;
