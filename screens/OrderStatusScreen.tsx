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
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const GET_ORDER_STATUSES_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/getOrderStatuses";
const HANDLE_STATUS_OPERATION_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/manageStatus";

const OrderStatusScreen = ({ navigation, route }: any) => {
    const { statusType = 'order' } = route.params || {};
    const { data: responseData, error: fetchError, loading: initialLoading, fetchData } = useAuthenticatedFetch(navigation, {
        url: GET_ORDER_STATUSES_API_URL,
        method: 'POST',
        data: { statusType },
        autoFetch: true,
    });

    const [orderStatuses, setOrderStatuses] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<any>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        if (!initialLoading && responseData && responseData.orderStatuses) {
            setOrderStatuses(responseData.orderStatuses);
        } else if (fetchError) {
            Alert.alert('Error', `Failed to load statuses: ${fetchError}`);
        }
    }, [responseData, initialLoading, fetchError]);

    const showModal = (item: any) => {
        setSelectedStatus(item);
        setModalVisible(true);
    };

    const hideModal = () => {
        setModalVisible(false);
        setSelectedStatus(null);
    };

    // --- UPDATED ---
    const handleEditStatus = () => {
        if (selectedStatus) {
            navigation.navigate('ManageOrderStatusScreen', {
                status: selectedStatus, // Pass the full status object, which includes 'allowedNextStatusList'
                statusType,
                allStatuses: orderStatuses, // Pass the clean, original list of all statuses
            });
        }
        hideModal();
    };

    const handleAddStatus = () => {
        navigation.navigate('ManageOrderStatusScreen', {
            status: null,
            statusType,
            allStatuses: orderStatuses.map(s => ({ statusId: s.statusId, statusName: s.name, isSelected: false })),
        });
        hideModal();
    };

    const handleDeleteStatus = async () => {
        if (!selectedStatus) return;
        Alert.alert(
            'Delete Status',
            `Are you sure you want to delete the status "${selectedStatus.name}"?`,
            [
                { text: 'Cancel', style: 'cancel', onPress: hideModal },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleteLoading(true);
                        try {
                            const requestData = {
                                operation: 'delete',
                                statusId: selectedStatus.statusId,
                                statusType,
                            };
                            const response = await fetchData({
                                url: HANDLE_STATUS_OPERATION_API_URL,
                                method: 'POST',
                                data: requestData,
                            });

                            setDeleteLoading(false);

                            if (response && response.status === 'success') {
                                setOrderStatuses(orderStatuses.filter((s: any) => s.statusId !== selectedStatus.statusId));
                                Alert.alert('Success', 'Status deleted successfully');
                            } else {
                                Alert.alert('Error', response.responseMessage || 'Failed to delete status');
                            }
                        } catch (error) {
                            setDeleteLoading(false);
                            Alert.alert('Error', 'Failed to delete status');
                            console.error('Delete error:', error);
                        }
                        hideModal();
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const renderStatusItem = ({ item }: { item: any }) => {
        const getSymbol = () => {
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
            return indicators.length > 0 ? indicators : null;
        };

        return (
            <TouchableOpacity onPress={() => showModal(item)} style={styles.statusItem}>
                <Text style={styles.statusName}>{item.name || 'N/A'}</Text>
                <View style={styles.indicatorContainer}>
                    {getSymbol()}
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
            {deleteLoading && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
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
                        <TouchableOpacity style={styles.modalOption} onPress={() => {}}>
                            <Text style={styles.modalOptionText}>Set Default</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={() => {}}>
                            <Text style={styles.modalOptionText}>Set First</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={() => {}}>
                            <Text style={styles.modalOptionText}>Set Last</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={handleDeleteStatus}>
                            <Text style={[styles.modalOptionText, { color: 'red' }]}>Delete Status</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalOption, { marginTop: 10 }]} onPress={hideModal}>
                            <Text style={[styles.modalOptionText, { color: '#333' }]}>Cancel</Text>
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
    statusItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, elevation: 2, marginVertical: 4 },
    statusName: { fontSize: 16, fontWeight: '500', color: '#333' },
    indicatorContainer: { flexDirection: 'row', alignItems: 'center' },
    arrowIcon: { marginLeft: 10 },
    addStatusButton: { flexDirection: 'row', backgroundColor: '#075E54', padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', margin: 10, marginBottom: 20 },
    addStatusText: { color: '#fff', fontSize: 16, fontWeight: '600' },
    separator: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 4 },
    modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
    modalContainer: { width: '80%', backgroundColor: '#fff', borderRadius: 8, padding: 20 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, color: '#333' },
    modalOption: { paddingVertical: 12 },
    modalOptionText: { fontSize: 16, color: '#075E54' },
    emptyText: { textAlign: 'center', padding: 20, color: '#666' },
    errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginTop: 20 },
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
