import React, { useEffect, useState } from 'react';
import {View, FlatList, StyleSheet, Dimensions, ActivityIndicator, Alert} from 'react-native';
import Tile from './../components/Tile';
import Header from './../components/Header';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";  // Axios for API calls

const API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/get-dashboardDetails";

const RepairScreen = ({ navigation }: any) => {
    const [repairs, setRepairs] = useState<any[]>([]);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);

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
                {"isOrderScreen": "false"},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            setRepairs(response.data);  // Update state with the fetched data
        } catch (err: any) {
            setError("Failed to fetch orders: " + (err.message || "Unknown error"));
        } finally {
            setLoading(false);
        }
    };

    const renderTile = ({ item }: any) => (
        <Tile
            title={item.title}
            orders={item.orders}
            quantity={item.quantity}
            weight={item.weight}
            color={item.color}
            onPress={() => console.log(`${item.title} clicked`)}
        />
    );

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Reusable Header */}
            <Header
                title="User"
                buttonText="Create Repair"
                onPress={() => navigation.navigate('CreateRepair')}
            />

            {/* Tile Grid */}
            <FlatList
                data={repairs}
                renderItem={renderTile}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.list}
            />
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
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
});

export default RepairScreen;
