import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const GET_ORDER_STATUSES_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/getOrderStatuses";
const MANAGE_STATUS_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/manageStatus";

const OrderStatusScreen = ({ navigation, route }: any) => {
    const { statusType } = route.params || { statusType: 'order' }; // Default to 'order' if not provided
    const { data: responseData, error: fetchError, loading: initialLoading, fetchData } = useAuthenticatedFetch(navigation, {
        url: GET_ORDER_STATUSES_API_URL,
        method: 'POST',
        data: { statusType }, // Only pass statusType for get API
        autoFetch: true,
    });

    const [orderStatuses, setOrderStatuses] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [operationLoading, setOperationLoading] = useState(false);

    useEffect(() => {
        console.log("useEffect triggered, initialLoading:", initialLoading, "fetchError:", fetchError);
        if (initialLoading === false && responseData) {
            if (responseData.orderStatuses) {
                setOrderStatuses(responseData.orderStatuses);
                console.log("Received orderStatuses:", responseData.orderStatuses);
            } else {
                console.log("No orderStatuses data:", responseData);
            }
        }
        if (fetchError) {
            console.log("Fetch error occurred:", fetchError);
            Alert.alert('Error', `Failed to load statuses: ${fetchError}`);
        }
    }, [responseData, initialLoading, fetchError]);

    const showModal = (item: any) => {
        console.log("Tapped status:", item.name); // Debug log for tap
        setSelectedStatus(item);
        setModalVisible(true);
        console.log("Modal visible set to:", true); // Debug log for state
    };

    const hideModal = () => {
        setModalVisible(false);
        setSelectedStatus(null);
        setOperationLoading(false); // Reset loading state
    };

    const handleEditStatus = () => {
        if (selectedStatus) {
            navigation.navigate('ManageOrderStatus', {
                status: selectedStatus,
                statusType,
                allStatuses: orderStatuses
            });
        }
        hideModal();
    };

    const handleAddStatus = () => {
        navigation.navigate('ManageOrderStatus', {
            statusType,
            allStatuses: orderStatuses
        });
        hideModal();
    };

    const handleManageStatus = async (operation: string) => {
        console.log("Handling operation:", operation); // Debug log for button press
        if (!selectedStatus) {
            console.log("No selected status");
            return;
        }

        setOperationLoading(true); // Start loading
        console.log("Operation loading started");

        const requestData = {
            operation,
            statusType,
            userId: selectedStatus.userId,
            status: {
                statusId: selectedStatus.statusId,
                isDefaultStatus: operation === 'Set Default' ? true : selectedStatus.isDefaultStatus,
                isFirstStage: operation === 'Set First' ? true : selectedStatus.isFirstStage,
                isLastStage: operation === 'Set Last' ? true : selectedStatus.isLastStage,
            },
        };

        console.log("Sending API request:", requestData); // Debug log for API request
        const { data, error: manageError } = await useAuthenticatedFetch(navigation, {
            url: MANAGE_STATUS_API_URL,
            method: 'POST',
            data: requestData,
        });

        console.log("API Response:", data, "Error:", manageError);
        if (manageError || (data && data.status === 'failure')) {
            Alert.alert('Error', manageError || data?.errorMessage || 'Failed to update status');
        } else {
            if (operation === 'Delete Status') {
                setOrderStatuses(orderStatuses.filter(s => s.statusId !== selectedStatus.statusId));
                Alert.alert('Success', 'Status deleted successfully');
            } else {
                const updatedStatuses = orderStatuses.map(s =>
                    s.statusId === selectedStatus.statusId
                        ? { ...s,
                            isDefaultStatus: operation === 'Set Default' ? true : s.isDefaultStatus,
                            isFirstStage: operation === 'Set First' ? true : s.isFirstStage,
                            isLastStage: operation === 'Set Last' ? true : s.isLastStage
                        }
                        : s
                );
                setOrderStatuses(updatedStatuses);
                Alert.alert('Success', `${operation.replace('Set ', '')} updated successfully`);
            }
        }
        setOperationLoading(false); // Stop loading
        console.log("Operation loading stopped");
    };

    const renderStatusItem = ({ item }: { item: any }) => {
        if (!item || typeof item !== 'object') {
            console.log("Invalid status item:", item);
            return null;
        }
        const isDefault = item.isDefaultStatus;
        const isFirst = item.isFirstStage;
        const isLast = item.isLastStage;

        return (
            <TouchableOpacity onPress={() => showModal(item)} activeOpacity={0.7}>
                <View style={styles.statusItem}>
                    <Text style={styles.statusName}>{item.name || 'N/A'}</Text>
                    <View style={styles.indicatorContainer}>
                        {isFirst && (
                            <View style={[styles.indicator, styles.firstIndicator]}>
                                <Text style={styles.indicatorText}>F</Text>
                            </View>
                        )}
                        {isLast && (
                            <View style={[styles.indicator, styles.lastIndicator]}>
                                <Text style={styles.indicatorText}>L</Text>
                            </View>
                        )}
                        {isDefault && (
                            <View style={[styles.indicator, styles.defaultIndicator]}>
                                <Text style={styles.indicatorText}>D</Text>
                            </View>
                        )}
                        <MaterialCommunityIcons
                            name="chevron-right"
                            size={24}
                            color="#888"
                            style={styles.arrowIcon}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <FlatList
                    data={orderStatuses}
                    keyExtractor={(item) => item.statusId} // Uses statusId
                    renderItem={renderStatusItem}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            </View>
            <TouchableOpacity style={styles.addStatusButton} onPress={handleAddStatus}>
                <Text style={styles.addStatusText}>ADD STATUS</Text>
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
                        <TouchableOpacity style={styles.modalOption} onPress={handleEditStatus} activeOpacity={0.7}>
                            <Text style={styles.modalOptionText}>Edit Status</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={() => handleManageStatus('Set Default')} activeOpacity={0.7}>
                            <Text style={styles.modalOptionText}>Set Default</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={() => handleManageStatus('Set First')} activeOpacity={0.7}>
                            <Text style={styles.modalOptionText}>Set First</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={() => handleManageStatus('Set Last')} activeOpacity={0.7}>
                            <Text style={styles.modalOptionText}>Set Last</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={() => handleManageStatus('Delete Status')} activeOpacity={0.7}>
                            <Text style={[styles.modalOptionText, { color: 'red' }]}>Delete Status</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalOption, { marginTop: 10 }]}
                            onPress={hideModal}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.modalOptionText, { color: '#333' }]}>Cancel</Text>
                        </TouchableOpacity>
                        {operationLoading && (
                            <View style={styles.modalLoader}>
                                <ActivityIndicator size="large" color="#0000ff" />
                                <Text style={styles.loadingText}>Processing...</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
            {(initialLoading && orderStatuses.length === 0) && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Loading statuses...</Text>
                </View>
            )}
            {fetchError && <Text style={styles.errorText}>{fetchError}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', paddingHorizontal: 5, paddingTop: 20 },
    contentContainer: { flex: 1, justifyContent: 'space-between' },
    screenTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', backgroundColor: '#075E54', padding: 10, textAlign: 'center', marginBottom: 10 },
    statusItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, elevation: 2 },
    statusName: { fontSize: 16, fontWeight: '500', color: '#333' },
    indicatorContainer: { flexDirection: 'row', alignItems: 'center' },
    indicator: { width: 24, height: 24, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
    firstIndicator: { backgroundColor: '#00CC00' }, // Green for First
    lastIndicator: { backgroundColor: '#FF0000' }, // Red for Last
    defaultIndicator: { backgroundColor: '#0000FF' }, // Blue for Default
    indicatorText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
    arrowIcon: { marginLeft: 10 },
    addStatusButton: { flexDirection: 'row', backgroundColor: '#075E54', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', margin: 10, marginBottom: 20 },
    addStatusText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)'
    },
    loadingText: { marginTop: 10, fontSize: 16, color: '#333' },
    errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginTop: 20 },
    separator: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 8 },
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
        padding: 20,
        position: 'relative' // Ensure loader is positioned relative to container
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333'
    },
    modalOption: {
        paddingVertical: 12
    },
    modalOptionText: {
        fontSize: 16,
        color: '#075E54'
    },
    modalLoader: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
    },
});

export default OrderStatusScreen;
