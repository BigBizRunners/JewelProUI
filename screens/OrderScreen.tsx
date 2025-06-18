import React from 'react';
import { View, Text, FlatList, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import Header from '../components/Header';
import Tile from '../components/Tile';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/get-dashboardDetails";

const OrderScreen = ({ navigation }: any) => {
    const { data: ordersData, error, loading } = useAuthenticatedFetch(navigation, {
        url: API_URL,
        data: { "isOrderScreen": "true" },
        autoFetch: true,
    });

    const calculateTotals = (states: any[]) => {
        let allOrders = { noOfOrders: 0, totalQuantity: 0, weightFrom: 0, weightTo: 0 };
        let pendingOrders = { noOfOrders: 0, totalQuantity: 0, weightFrom: 0, weightTo: 0 };

        states.forEach((state: any) => {
            allOrders.noOfOrders += state.noOfOrders;
            allOrders.totalQuantity += state.totalQuantity;
            allOrders.weightFrom += state.weightFrom;
            allOrders.weightTo += state.weightTo;

            if (state.pendingState) { // Corrected from isPendingState to match API response
                pendingOrders.noOfOrders += state.noOfOrders;
                pendingOrders.totalQuantity += state.totalQuantity;
                pendingOrders.weightFrom += state.weightFrom;
                pendingOrders.weightTo += state.weightTo;
            }
        });
        return { allOrders, pendingOrders };
    };

    // --- FIX: Map API response to a standardized format with an 'id' key ---
    const rawStates = ordersData?.ordersPerState?.ordersPerState || [];
    const orderStates = rawStates.map(state => ({
        ...state,
        id: state.orderStateId, // Standardize 'orderStateId' to 'id'
    }));

    const { allOrders, pendingOrders } = calculateTotals(orderStates);

    const defaultTiles = [
        { id: 'allOrders', orderStateName: 'All Orders', ...allOrders, color: '#28a745' },
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

    const statesForTabs = uniqueById([...defaultTiles, ...orderStates]);

    const adjustedStates = orderStates.length % 2 !== 0
        ? [...orderStates, { id: 'placeholder', orderStateName: '' }]
        : orderStates;

    const dataForGrid = [...defaultTiles, ...adjustedStates];

    const renderTile = ({ item }: any) => {
        if (item.id === 'placeholder') {
            return <View style={[styles.tile, { backgroundColor: 'transparent' }]} />;
        }

        const weightRange = `${item.weightFrom || 0} - ${item.weightTo || 0} gms`;

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
    };

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : ordersData ? (
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
                    />
                </>
            ) : (
                <Text style={styles.errorText}>No data available</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f7f7f7', paddingHorizontal: 10, paddingTop: 20 },
    list: { paddingBottom: 20, paddingTop: 10 },
    row: { justifyContent: 'space-between' },
    tile: { flex: 1, margin: 8, minHeight: Dimensions.get('window').height / 6.5 },
    errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 10 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default OrderScreen;
