import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
    Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const GET_ORDERS_API_URL = 'https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/getOrders';

// Helper function to calculate 'Due in X days' and determine color
const formatDueDate = (dueDateStr) => {
    if (!dueDateStr) return { text: 'N/A', color: '#666' };

    const dueDate = new Date(dueDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to midnight

    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return { text: `Overdue by ${Math.abs(diffDays)} days`, color: '#d9534f' };
    } else if (diffDays === 0) {
        return { text: 'Due Today', color: '#f0ad4e' };
    } else {
        return { text: `Due in ${diffDays} days`, color: '#5cb85c' };
    }
};

// This component now reflects the detailed layout with all fields restored.
const OrderItem = React.memo(({ item }) => {
    const dueDateInfo = formatDueDate(item.deliveryDueDate);

    return (
        <View style={styles.orderItem}>
            {/* Image Container on the left */}
            {item.thumbnailUrl ? (
                <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
            ) : (
                <View style={styles.thumbnailPlaceholder}>
                    <MaterialCommunityIcons name="image-outline" size={40} color="#ccc" />
                </View>
            )}
            {/* Details Container on the right */}
            <View style={styles.detailsContainer}>
                {/* Top Row: Order ID and Status */}
                <View style={styles.orderItemHeader}>
                    <Text style={styles.orderId}>
                        {`#${item.orderId ? item.orderId.substring(0, 8) : 'N/A'}...`}
                    </Text>
                    {item.statusName && (
                        <View style={styles.statusPill}>
                            <Text style={styles.statusPillText}>{item.statusName}</Text>
                        </View>
                    )}
                </View>

                {/* Client Name */}
                <Text style={styles.clientName} numberOfLines={1}>{item.clientName}</Text>

                <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="tag-outline" size={16} color="#666" style={styles.detailIcon} />
                        <Text style={styles.detailText}>{item.categoryName || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="account-outline" size={16} color="#666" style={styles.detailIcon} />
                        <Text style={styles.detailText}>By: {item.placedBy || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="calendar-import" size={16} color="#666" style={styles.detailIcon} />
                        <Text style={styles.detailText}>Created: {item.orderDate || 'N/A'}</Text>
                    </View>
                    {/* Restored Due Date detail row */}
                    <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="calendar-check-outline" size={16} color="#666" style={styles.detailIcon} />
                        <Text style={styles.detailText}>Due: {item.deliveryDueDate || 'N/A'}</Text>
                    </View>
                </View>

                <View style={styles.orderItemFooter}>
                    <View style={[styles.dueDatePill, { backgroundColor: dueDateInfo.color }]}>
                        <MaterialCommunityIcons name="clock-alert-outline" size={14} color="#fff" />
                        <Text style={styles.dueDateText}>{dueDateInfo.text}</Text>
                    </View>
                    <Text style={styles.footerText}>Qty: {item.quantity}</Text>
                </View>
            </View>
        </View>
    );
});


const ListOrdersScreen = ({ route, navigation }) => {
    const { selectedStateId: initialStateId, allStates: initialStates } = route.params;
    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedStateId, setSelectedStateId] = useState(initialStateId);
    const [allStates, setAllStates] = useState(initialStates || []);
    const [filters, setFilters] = useState({});
    const { data, error, loading, fetchData } = useAuthenticatedFetch(navigation);

    const openFilterModal = () => console.log('Filter button pressed.');
    const openCreateOrder = () => navigation.navigate('SelectCategory');

    useEffect(() => {
        navigation.setOptions({
            headerTitle: 'Orders',
            headerRight: () => (
                <TouchableOpacity onPress={openFilterModal} style={styles.headerButton}>
                    <MaterialCommunityIcons name="filter-variant" size={24} color="#fff" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    useEffect(() => {
        fetchOrders();
    }, [selectedStateId, page, filters]);

    const fetchOrders = async () => {
        const payload = { stateId: selectedStateId, page, limit: 15, ...filters };
        const response = await fetchData({ url: GET_ORDERS_API_URL, method: 'POST', data: payload });
        if (response?.status === 'success' && response.orders) {
            setOrders(prev => (page === 1 ? response.orders : [...prev, ...response.orders]));
            if (response.pagination) setTotalPages(response.pagination.totalPages);
        }
    };

    const handleLoadMore = () => {
        if (!loading && page < totalPages) setPage(p => p + 1);
    };

    const handleRefresh = useCallback(() => {
        if (page !== 1) setPage(1);
        else fetchOrders();
    }, [page]);

    const handleStateSelect = (stateId) => {
        if (stateId !== selectedStateId) {
            setOrders([]);
            setPage(1);
            setSelectedStateId(stateId);
        }
    };

    const renderStateTab = ({ item }) => (
        <TouchableOpacity
            style={[styles.stateTab, item.id === selectedStateId && styles.stateTabSelected]}
            onPress={() => handleStateSelect(item.id)}
        >
            <Text style={[styles.stateTabText, item.id === selectedStateId && styles.stateTabTextSelected]}>
                {item.orderStateName}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.stateSelectorContainer}>
                <FlatList
                    data={allStates}
                    renderItem={renderStateTab}
                    keyExtractor={item => String(item.id)}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.stateSelectorContent}
                />
            </View>
            <FlatList
                data={orders}
                renderItem={({ item }) => <OrderItem item={item} />}
                keyExtractor={item => item.orderId}
                contentContainerStyle={styles.listContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                onRefresh={handleRefresh}
                refreshing={loading && page === 1}
                ListFooterComponent={() => loading && page > 1 ? <ActivityIndicator size="large" color="#075E54" style={{ marginVertical: 20 }} /> : null}
                ListEmptyComponent={() => !loading && <Text style={styles.emptyText}>No orders found.</Text>}
            />
            <TouchableOpacity style={styles.fab} onPress={openCreateOrder}>
                <MaterialCommunityIcons name="plus" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f2' },
    headerButton: { marginRight: 15, padding: 5 },
    stateSelectorContainer: { backgroundColor: '#fff', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
    stateSelectorContent: { paddingHorizontal: 10 },
    stateTab: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#e9ecef', marginHorizontal: 5 },
    stateTabSelected: { backgroundColor: '#075E54' },
    stateTabText: { color: '#495057', fontWeight: '600' },
    stateTabTextSelected: { color: '#fff' },
    listContent: { padding: 15, paddingBottom: 80 },
    orderItem: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 18,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    thumbnail: {
        width: 100,
        height: 'auto',
        aspectRatio: 1,
        borderRadius: 8,
        marginRight: 12,
        alignSelf: 'center'
    },
    thumbnailPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        alignSelf: 'center'
    },
    detailsContainer: { flex: 1, justifyContent: 'space-between' },
    orderItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    orderId: { fontSize: 12, color: '#666', fontWeight: 'normal' },
    clientName: { fontSize: 18, color: '#000', fontWeight: '500', marginBottom: 8 },
    statusPill: {
        backgroundColor: '#007bff',
        borderRadius: 10,
        paddingVertical: 3,
        paddingHorizontal: 8,
    },
    statusPillText: {
        color: '#fff',
        fontSize: 11,
        fontWeight: 'bold',
    },
    detailSection: {
        marginVertical: 4,
    },
    detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
    detailIcon: { marginRight: 8 },
    detailText: { fontSize: 14, color: '#444' },
    orderItemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
    dueDatePill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
    },
    dueDateText: { color: '#fff', fontSize: 12, fontWeight: 'bold', marginLeft: 4 },
    footerText: { fontSize: 14, color: '#555' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
    fab: { position: 'absolute', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', right: 20, bottom: 20, backgroundColor: '#075E54', borderRadius: 30, elevation: 8 },
});

export default ListOrdersScreen;
