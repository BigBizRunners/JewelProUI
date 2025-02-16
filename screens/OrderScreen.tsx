import React, { useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, View, Text, Dimensions, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Tile from './../components/Tile';
import Header from './../components/Header';

const API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/get-dashboardDetails";

const OrderScreen = ({ navigation }: any) => {
    const [ordersData, setOrdersData] = useState<any>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);  // Add a loading state

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");

            if (!token) {
                setError("User not authenticated");
                Alert.alert("Session Expired", "Please login again", [
                    { text: "OK", onPress: () => navigation.replace("Login") },
                ]);
                return;
            }

            const response = await axios.post(
                API_URL,
                {"isOrderScreen": "true"},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            setOrdersData(response.data);  // Update state with the fetched data
        } catch (err: any) {
            setError("Failed to fetch orders: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);  // Set loading to false after the data is fetched or if an error occurs
        }
    };

    const orderStates = ordersData?.ordersPerState.ordersPerState || [];

    // Helper function to calculate totals for All Orders and Pending Orders
    const calculateTotals = (states: any[]) => {
        let allOrders = { noOfOrders: 0, totalQuantity: 0, weightFrom: 0, weightTo: 0 };
        let pendingOrders = { noOfOrders: 0, totalQuantity: 0, weightFrom: 0, weightTo: 0 };

        states.forEach((state: any) => {
            // Add to All Orders
            allOrders.noOfOrders += state.noOfOrders;
            allOrders.totalQuantity += state.totalQuantity;
            allOrders.weightFrom += state.weightFrom;
            allOrders.weightTo += state.weightTo;

            // Add to Pending Orders if the state is pending
            if (state.isPendingState) {
                pendingOrders.noOfOrders += state.noOfOrders;
                pendingOrders.totalQuantity += state.totalQuantity;
                pendingOrders.weightFrom += state.weightFrom;
                pendingOrders.weightTo += state.weightTo;
            }
        });

        return { allOrders, pendingOrders };
    };

    // Get totals for all and pending orders
    const { allOrders, pendingOrders } = calculateTotals(orderStates);

    // Adjust for even number of tiles if necessary
    const adjustedStates = orderStates.length % 2 !== 0
        ? [...orderStates, { id: 'placeholder', orderStateName: '', orders: 0, quantity: 0, weightFrom: 0, weightTo: 0, isPendingState: false, color: 'transparent' }]
        : orderStates;

    const renderTile = ({ item }: any) => {
        if (item.id === 'placeholder') {
            return <View style={[styles.tile, { backgroundColor: 'transparent' }]} />;
        }

        // Determine color based on the item type
        const tileColor = item.id === 'allOrders'
            ? '#28a745' // Green for All Orders
            : item.id === 'pendingOrders'
                ? 'rgb(244,68,102)' // Red for Pending Orders
                : '#ffffff'; // Default color for others

        const weightRange = `${item.weightFrom} - ${item.weightTo} gms`;

        return (
            <Tile
                title={item.orderStateName}
                orders={item.noOfOrders}
                quantity={item.totalQuantity}
                weight={weightRange}
                color={tileColor} // Apply the dynamic color
                onPress={() => console.log(`${item.orderStateName} clicked`)}
            />
        );
    };

    // Add default tiles for "All Orders" and "Pending Orders"
    const defaultTiles = [
        {
            id: 'allOrders',
            orderStateName: 'All Orders',
            noOfOrders: allOrders.noOfOrders,
            totalQuantity: allOrders.totalQuantity,
            weightFrom: allOrders.weightFrom,
            weightTo: allOrders.weightTo,
            isPendingState: false,
            color: '#28a745',
        },
        {
            id: 'pendingOrders',
            orderStateName: 'Pending Orders',
            noOfOrders: pendingOrders.noOfOrders,
            totalQuantity: pendingOrders.totalQuantity,
            weightFrom: pendingOrders.weightFrom,
            weightTo: pendingOrders.weightTo,
            isPendingState: true,
            color: 'rgb(244,68,102)',
        },
    ];

    return (
        <View style={styles.container}>
            {/* Render Header only after data is fetched */}
            {!loading && ordersData && (
                <Header
                    title={ordersData.username}  // Assuming 'userName' is in the response
                    buttonText="Create Order"
                    onPress={() => navigation.navigate('CreateOrder')}
                />
            )}

            {/* Show error if present */}
            {error && <Text style={styles.errorText}>{error}</Text>}

            {/* Show Loading Indicator while data is being fetched */}
            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" style={styles.loading} />
            ) : (
                // Tile Grid
                <FlatList
                    data={[...defaultTiles, ...adjustedStates]} // Combine default tiles with the order states
                    renderItem={renderTile}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    columnWrapperStyle={styles.row}
                    contentContainerStyle={styles.list}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f7f7f7',
        paddingHorizontal: 10,
        paddingTop: 20,
    },
    list: {
        paddingBottom: 20,
        paddingTop: 10,
    },
    row: {
        justifyContent: 'space-between',
    },
    tile: {
        flex: 1,
        margin: 8,
        padding: 15,
        borderRadius: 10,
        height: Dimensions.get('window').height / 6.5,
        backgroundColor: '#fff',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Dimensions.get('window').height / 3,
    },
});

export default OrderScreen;
