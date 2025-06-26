import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Header from '../components/Header';
import Tile from '../components/Tile';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/get-dashboardDetails";

const OrderScreen = ({ navigation }: any) => {
    const { data: ordersData, error, loading, fetchData } = useAuthenticatedFetch(navigation);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // FIX: Using useCallback with an empty dependency array to ensure the function
    // passed to useFocusEffect is stable, preventing an infinite loop.
    // This assumes `fetchData` itself is stable or that omitting it is the intended pattern for this hook.
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
    }, []); // Similar to above, omitting fetchData to prevent potential loops.

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

    const dataForGrid = useMemo(() => {
        const rawStates = ordersData?.ordersPerState?.ordersPerState || [];
        const orderStates = rawStates.map(state => ({
            ...state,
            id: state.orderStateId,
        }));

        const { allOrders, pendingOrders } = calculateTotals(orderStates);

        const defaultTiles = [
            { id: 'allOrders', orderStateName: 'All Orders', ...allOrders, color: '#28a745' },
            { id: 'pendingOrders', orderStateName: 'Pending Orders', ...pendingOrders, color: 'rgb(244,68,102)' },
        ];

        const adjustedStates = orderStates.length % 2 !== 0
            ? [...orderStates, { id: 'placeholder', orderStateName: '' }]
            : orderStates;

        return [...defaultTiles, ...adjustedStates];

    }, [ordersData]);

    const statesForTabs = useMemo(() => {
        const rawStates = ordersData?.ordersPerState?.ordersPerState || [];
        const orderStates = rawStates.map(state => ({
            ...state,
            id: state.orderStateId,
        }));

        const { allOrders, pendingOrders } = calculateTotals(orderStates);

        const defaultTiles = [
            { id: 'allOrders', orderStateName: 'All Orders', ...allOrders },
            { id: 'pendingOrders', orderStateName: 'Pending Orders', ...pendingOrders },
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

    }, [ordersData]);


    const renderTile = useCallback(({ item }: any) => {
        if (item.id === 'placeholder') {
            return <View style={[styles.tile, { backgroundColor: 'transparent', elevation: 0 }]} />;
        }

        const weightRange = `${item.weightFrom?.toFixed(2) || '0.00'} - ${item.weightTo?.toFixed(2) || '0.00'} gms`;

        return (
            <Tile
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
                    <FlatList
                        data={dataForGrid}
                        renderItem={renderTile}
                        keyExtractor={(item) => String(item.id)}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.list}
                        refreshControl={
                            <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={["#075E54"]}/>
                        }
                    />
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
    // FIX: Restored padding to the main container to fix the header layout.
    container: { flex: 1, backgroundColor: '#f7f7f7', paddingHorizontal: 10, paddingTop: 20 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    list: { paddingBottom: 20, paddingTop: 10 },
    row: { justifyContent: 'space-between' },
    tile: { flex: 1, margin: 8, minHeight: Dimensions.get('window').height / 6.5, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1}, shadowOpacity: 0.2, shadowRadius: 2, backgroundColor: '#fff' },
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
