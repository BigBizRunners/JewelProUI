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

            if (state.isPendingState) {
                pendingOrders.noOfOrders += state.noOfOrders;
                pendingOrders.totalQuantity += state.totalQuantity;
                pendingOrders.weightFrom += state.weightFrom;
                pendingOrders.weightTo += state.weightTo;
            }
        });

        return { allOrders, pendingOrders };
    };

    const orderStates = ordersData?.ordersPerState?.ordersPerState || [];
    const { allOrders, pendingOrders } = calculateTotals(orderStates);

    const adjustedStates = orderStates.length % 2 !== 0
        ? [...orderStates, { id: 'placeholder', orderStateName: '', orders: 0, quantity: 0, weightFrom: 0, weightTo: 0, isPendingState: false, color: 'transparent' }]
        : orderStates;

    const renderTile = ({ item }: any) => {
        if (item.id === 'placeholder') return <View style={[styles.tile, { backgroundColor: 'transparent' }]} />;
        const tileColor = item.id === 'allOrders' ? '#28a745' : item.id === 'pendingOrders' ? 'rgb(244,68,102)' : '#ffffff';
        const weightRange = `${item.weightFrom} - ${item.weightTo} gms`;
        return (
            <Tile
                title={item.orderStateName}
                orders={item.noOfOrders}
                quantity={item.totalQuantity}
                weight={weightRange}
                color={tileColor}
                onPress={() => console.log(`${item.orderStateName} clicked`)}
            />
        );
    };

    const defaultTiles = [
        { id: 'allOrders', orderStateName: 'All Orders', noOfOrders: allOrders.noOfOrders, totalQuantity: allOrders.totalQuantity, weightFrom: allOrders.weightFrom, weightTo: allOrders.weightTo, isPendingState: false, color: '#28a745' },
        { id: 'pendingOrders', orderStateName: 'Pending Orders', noOfOrders: pendingOrders.noOfOrders, totalQuantity: pendingOrders.totalQuantity, weightFrom: pendingOrders.weightFrom, weightTo: pendingOrders.weightTo, isPendingState: true, color: 'rgb(244,68,102)' },
    ];

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
                        onPress={() => navigation.navigate('SelectCategory')} // Updated to navigate to SelectCategory
                    />
                    <FlatList
                        data={[...defaultTiles, ...adjustedStates]}
                        renderItem={renderTile}
                        keyExtractor={(item) => item.id}
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
    tile: { flex: 1, margin: 8, padding: 15, borderRadius: 10, height: Dimensions.get('window').height / 6.5, backgroundColor: '#fff' },
    errorText: { color: 'red', fontSize: 16, textAlign: 'center', marginBottom: 10 },
    loading: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: Dimensions.get('window').height / 3 },
});

export default OrderScreen;
