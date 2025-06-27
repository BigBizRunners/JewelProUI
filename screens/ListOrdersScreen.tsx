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

// OrderItem component for rendering individual orders
const OrderItem = React.memo(({ item, navigation }) => {
    const dueDateInfo = formatDueDate(item.deliveryDueDate);

    return (
        <TouchableOpacity onPress={() => navigation.navigate('OrderDetails', { orderId: item.orderId })}>
            <View style={styles.orderItem}>
                {item.thumbnailUrl ? (
                    <Image source={{ uri: item.thumbnailUrl }} style={styles.thumbnail} />
                ) : (
                    <View style={styles.thumbnailPlaceholder}>
                        <MaterialCommunityIcons name="image-outline" size={40} color="#ccc" />
                    </View>
                )}
                <View style={styles.detailsContainer}>
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
        </TouchableOpacity>
    );
});

const ListOrdersScreen = ({ route, navigation }) => {
    const { selectedStateId: initialStateId, allStates: initialStates } = route.params;
    const [orders, setOrders] = useState([]);
    const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
    const [hasNextPage, setHasNextPage] = useState(true);
    const [selectedStateId, setSelectedStateId] = useState(initialStateId);
    const [allStates, setAllStates] = useState(initialStates || []);
    const [filters, setFilters] = useState({});
    const [error, setError] = useState(null);
    const { data, error: fetchError, loading, fetchData } = useAuthenticatedFetch(navigation);

    // FIX: Pass a callback to the filter screen to receive updated filters
    const openFilterScreen = () => {
        navigation.navigate('FilterScreen', {
            currentFilters: filters,
            onApply: (newFilters) => {
                setFilters(newFilters);
            },
        });
    };

    const openCreateOrder = () => navigation.navigate('SelectCategory');

    useEffect(() => {
        navigation.setOptions({
            headerTitle: 'Orders',
            headerRight: () => (
                <TouchableOpacity onPress={openFilterScreen} style={styles.headerButton}>
                    <MaterialCommunityIcons name="filter-variant" size={24} color="#fff" />
                </TouchableOpacity>
            ),
        });
    }, [navigation, filters]);

    // This useEffect is no longer needed because we use the onApply callback
    // useEffect(() => {
    //     if (route.params?.newFilters) {
    //         setFilters(route.params.newFilters);
    //         navigation.setParams({ newFilters: null }); // Clear params
    //     }
    // }, [route.params?.newFilters]);

    const fetchOrdersAPI = useCallback(async (isInitialFetch = true) => {
        setError(null);
        let keyToUse = isInitialFetch ? null : lastEvaluatedKey;

        const payload = {
            stateId: selectedStateId,
            limit: 15,
            lastEvaluatedKey: keyToUse,
            filters: {
                ...filters,
            },
        };

        const response = await fetchData({ url: GET_ORDERS_API_URL, method: 'POST', data: payload });

        if (response?.status === 'success' && response.orders) {
            setOrders(prev => (isInitialFetch ? response.orders : [...prev, ...response.orders]));
            setLastEvaluatedKey(response.pagination?.lastEvaluatedKey || null);
            setHasNextPage(!!response.pagination?.lastEvaluatedKey);
        } else {
            setError(response?.message || fetchError || 'Failed to fetch orders');
        }
    }, [selectedStateId, filters, lastEvaluatedKey, hasNextPage, loading]);

    // Fetch orders when stateId or filters change
    useEffect(() => {
        setOrders([]);
        setLastEvaluatedKey(null);
        setHasNextPage(true);
        fetchOrdersAPI(true);
    }, [selectedStateId, filters]);

    const handleLoadMore = useCallback(() => {
        if (!loading && hasNextPage) {
            fetchOrdersAPI(false);
        }
    }, [loading, hasNextPage]);

    const handleRefresh = useCallback(() => {
        setOrders([]);
        setLastEvaluatedKey(null);
        setHasNextPage(true);
        fetchOrdersAPI(true);
    }, [selectedStateId, filters]);

    const handleStateSelect = (stateId) => {
        if (stateId !== selectedStateId) {
            setSelectedStateId(stateId);
        }
    };

    const renderStateTab = ({item}) => (
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
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            )}
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
                renderItem={({ item }) => <OrderItem item={item} navigation={navigation} />}
                keyExtractor={(item, index) => `${item.orderId}-${index}`}
                contentContainerStyle={styles.listContent}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                onRefresh={handleRefresh}
                refreshing={loading && orders.length === 0}
                ListFooterComponent={() =>
                    loading && orders.length > 0 ? (
                        <ActivityIndicator size="large" color="#075E54" style={{ marginVertical: 20 }} />
                    ) : null
                }
                ListEmptyComponent={() =>
                    !loading && !error ? (
                        <View style={styles.centered}>
                            <Text style={styles.emptyText}>No orders found.</Text>
                        </View>
                    ) : null
                }
            />
            <TouchableOpacity style={styles.fab} onPress={openCreateOrder}>
                <MaterialCommunityIcons name="plus" size={30} color="#fff" />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f2' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 50 },
    headerButton: { marginRight: 15, padding: 5 },
    stateSelectorContainer: {
        backgroundColor: '#fff',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
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
        height: 100,
        borderRadius: 8,
        marginRight: 12,
        alignSelf: 'center',
    },
    thumbnailPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 8,
        backgroundColor: '#f0f0f0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        alignSelf: 'center',
    },
    detailsContainer: { flex: 1, justifyContent: 'space-between' },
    orderItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
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
    orderItemFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 8,
    },
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
    },
    errorContainer: {
        padding: 15,
        backgroundColor: '#f8d7da',
        borderRadius: 8,
        margin: 15,
        alignItems: 'center',
    },
    errorText: {
        color: '#721c24',
        fontSize: 16,
        marginBottom: 10,
    },
    retryButton: {
        backgroundColor: '#075E54',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default ListOrdersScreen;
