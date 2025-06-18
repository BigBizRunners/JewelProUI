import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const GET_ORDERS_API_URL = 'https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/getOrders';

const OrderItem = React.memo(({ item }) => (
    <View style={styles.orderItem}>
        <View style={styles.orderItemHeader}>
            <Text style={styles.orderId}>{item.orderId}</Text>
            <Text style={styles.orderDate}>{item.orderDate}</Text>
        </View>
        <Text style={styles.clientName}>{item.clientName}</Text>
        <View style={styles.orderItemFooter}>
            <Text style={styles.footerText}>Qty: {item.quantity}</Text>
            <Text style={styles.footerText}>Weight: {item.weight}</Text>
        </View>
    </View>
));

const ListOrdersScreen = ({ route, navigation }) => {
    const { selectedStateId: initialStateId, allStates: initialStates } = route.params;

    const [orders, setOrders] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedStateId, setSelectedStateId] = useState(initialStateId);
    const [allStates, setAllStates] = useState(initialStates || []);
    const [filters, setFilters] = useState({});

    const { data, error, loading, fetchData } = useAuthenticatedFetch(navigation);

    const openFilterModal = () => {
        console.log('Filter button pressed. Implement filter modal here.');
    };

    const openCreateOrder = () => {
        navigation.navigate('SelectCategory');
    };

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
        const payload = {
            stateId: selectedStateId,
            page: page,
            limit: 15,
            ...filters,
        };
        const response = await fetchData({
            url: GET_ORDERS_API_URL,
            method: 'POST',
            data: payload,
        });
        if (response?.status === 'success' && response.orders) {
            setOrders(prevOrders => (page === 1 ? response.orders : [...prevOrders, ...response.orders]));
            if (response.pagination) {
                setTotalPages(response.pagination.totalPages);
            }
        }
    };

    const handleLoadMore = () => {
        if (!loading && page < totalPages) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handleRefresh = useCallback(() => {
        if (page !== 1) {
            setPage(1);
        } else {
            fetchOrders();
        }
    }, [page]);

    const handleStateSelect = (stateId) => {
        if (stateId !== selectedStateId) {
            setOrders([]);
            setPage(1);
            setSelectedStateId(stateId);
        }
    };

    const renderStateTab = ({ item }) => {
        const isSelected = item.id === selectedStateId;
        return (
            <TouchableOpacity
                style={[styles.stateTab, isSelected && styles.stateTabSelected]}
                onPress={() => handleStateSelect(item.id)}
            >
                <Text style={[styles.stateTabText, isSelected && styles.stateTabTextSelected]}>
                    {item.orderStateName}
                </Text>
            </TouchableOpacity>
        );
    };

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
                ListFooterComponent={() =>
                    loading && page > 1 ? <ActivityIndicator size="large" color="#075E54" style={{ marginVertical: 20 }} /> : null
                }
                ListEmptyComponent={() =>
                    !loading && <Text style={styles.emptyText}>No orders found for this state.</Text>
                }
            />

            {/* --- Floating Action Button for Create Order --- */}
            <TouchableOpacity style={styles.fab} onPress={openCreateOrder}>
                <MaterialCommunityIcons name="plus" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f2' },
    headerButton: {
        marginRight: 15,
        padding: 5,
    },
    stateSelectorContainer: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0'
    },
    stateSelectorContent: { paddingHorizontal: 10 },
    stateTab: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#e9ecef',
        marginHorizontal: 5,
    },
    stateTabSelected: { backgroundColor: '#075E54' },
    stateTabText: { color: '#495057', fontWeight: '600' },
    stateTabTextSelected: { color: '#fff' },
    listContent: { padding: 15, paddingBottom: 80 },
    orderItem: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    orderItemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    orderId: { fontSize: 16, fontWeight: 'bold', color: '#075E54' },
    orderDate: { fontSize: 14, color: '#666' },
    clientName: { fontSize: 15, color: '#333', marginBottom: 12 },
    orderItemFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
    footerText: { fontSize: 14, color: '#555' },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 20,
        backgroundColor: '#075E54',
        borderRadius: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowRadius: 5,
        shadowOpacity: 0.3,
        shadowOffset: { height: 2, width: 0 },
    },
});

export default ListOrdersScreen;
