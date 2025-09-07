import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';
import DonutChartCard from '../components/DonutChartCard';
import StatusListItem from '../components/StatusListItem';

const API_URL = process.env.EXPO_PUBLIC_API_URL_GET_DASHBOARD_DETAILS;

const OrderScreen = ({ navigation }: any) => {
    const { data: ordersData, error, loading, fetchData } = useAuthenticatedFetch(navigation);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchData({
                url: API_URL,
                data: { "isOrderScreen": "true" },
            });
        }, [])
    );

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchData({
            url: API_URL,
            data: { "isOrderScreen": "true" },
        });
        setIsRefreshing(false);
    }, []);

    const calculateTotals = (states: any[]) => {
        let allOrders = { noOfOrders: 0, totalQuantity: 0, weightFrom: 0, weightTo: 0 };
        let pendingOrders = { noOfOrders: 0, totalQuantity: 0, weightFrom: 0, weightTo: 0 };

        if (states) {
            states.forEach((state: any) => {
                allOrders.noOfOrders += state.noOfOrders || 0;
                allOrders.totalQuantity += state.totalQuantity || 0;
                allOrders.weightFrom += state.weightFrom || 0;
                allOrders.weightTo += state.weightTo || 0;

                if (state.pendingState) {
                    pendingOrders.noOfOrders += state.noOfOrders || 0;
                    pendingOrders.totalQuantity += state.totalQuantity || 0;
                    pendingOrders.weightFrom += state.weightFrom || 0;
                    pendingOrders.weightTo += state.weightTo || 0;
                }
            });
        }
        return { allOrders, pendingOrders };
    };

    const sortedOrderStates = useMemo(() => {
        const rawStates = ordersData?.ordersPerState?.ordersPerState || [];
        return [...rawStates].sort((a, b) => a.position - b.position);
    }, [ordersData]);

    const dataForList = useMemo(() => {
        const orderStatesWithColor = sortedOrderStates.map(state => ({
            ...state,
            id: state.orderStateId,
            color: '#bdbdbd'
        }));

        const { allOrders, pendingOrders } = calculateTotals(sortedOrderStates);

        const defaultItems = [
            { id: 'allOrders', orderStateName: 'All Orders', ...allOrders, color: '#28a745' },
            { id: 'pendingOrders', orderStateName: 'Pending Orders', ...pendingOrders, color: 'rgb(244,68,102)' },
        ];

        return [...defaultItems, ...orderStatesWithColor];
    }, [sortedOrderStates]);

    const orderStates = useMemo(() => {
        const colors = [
            '#075E54',
            '#4DB6AC',
            '#60dc64',
            '#FFB74D',
            '#e8c4f1',
            '#64B5F6',
            '#F06292',
            '#FF8A65',
            '#A1887F',
            '#90CAF9',
            '#AED581',
            '#CE93D8',
            '#FFAB91',];
        return sortedOrderStates.map((state, index) => ({
            ...state,
            id: state.orderStateId,
            color: colors[index] || '#BDBDBD'
        }));
    }, [sortedOrderStates]);

    const statesForTabs = useMemo(() => {
        const { allOrders, pendingOrders } = calculateTotals(orderStates);

        const defaultTiles = [
            // Colors from the UX mockup
            { id: 'allOrders', orderStateName: 'All Orders', ...allOrders, color: '#004D40' },
            { id: 'pendingOrders', orderStateName: 'Pending Orders', ...pendingOrders, color: 'rgb(244,68,102)' },
        ];

        const uniqueById = (arr) => {
            const seen = new Set();
            return arr.filter(item => {
                if (!item || typeof item.id === 'undefined') return false;
                const k = item.id;
                return seen.has(k) ? false : seen.add(k);
            });
        };

        return uniqueById([...defaultTiles, ...orderStates]);
    }, [orderStates]);

    const renderListItem = useCallback(({ item }: any) => {
        const weightRange = `${item.weightFrom?.toFixed(2) || '0.00'} - ${item.weightTo?.toFixed(2) || '0.00'} gms`;

        return (
            <StatusListItem
                title={item.orderStateName}
                orders={item.noOfOrders}
                quantity={item.totalQuantity}
                weight={weightRange}
                color={item.color || '#ffffff'}
                onPress={() => navigation.navigate('ListOrders', {
                    selectedStateId: item.id,
                    allStates: statesForTabs,
                    title: item.orderStateName
                })}
            />
        );
    }, [navigation, statesForTabs]);

    const renderContent = () => {
        if (loading && !ordersData) {
            return <ActivityIndicator size="large" color="#0000ff" style={styles.centered} />;
        }

        if (error && !ordersData) {
            return (
                <View style={styles.centered}>
                    <Text style={styles.errorText}>Failed to load data.</Text>
                    <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
                        <Text style={styles.retryButtonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (ordersData) {
            return (
                <>
                    <Header
                        title={ordersData.username || "User"}
                        buttonText="Create Order"
                        onPress={() => navigation.navigate('SelectCategory')}
                    />

                    <ScrollView
                        contentContainerStyle={{ paddingBottom: 20 }}
                        refreshControl={
                            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#075E54"]}/>
                        }
                    >
                        <DonutChartCard states={orderStates} />

                        <FlatList
                            data={dataForList}
                            renderItem={renderListItem}
                            keyExtractor={(item) => String(item.id)}
                            contentContainerStyle={styles.list}
                            scrollEnabled={false}
                        />
                    </ScrollView>
                </>
            );
        }

        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>No data available</Text>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {renderContent()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f7f7f7', paddingHorizontal: 10, paddingTop: 20 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    list: { paddingBottom: 20, paddingTop: 10 },
    errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 10 },
    retryButton: {
        backgroundColor: '#075E54',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default OrderScreen;
