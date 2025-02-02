import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import Tile from './../components/Tile';
import Header from './../components/Header';
import axios from 'axios';  // Axios for API calls

const RepairScreen = ({ navigation }: any) => {
    const [repairs, setRepairs] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        const fetchRepairs = async () => {
            setLoading(true);
            try {
                const response = await axios.get('API_URL_FOR_REPAIRS'); // Replace with your repair API
                setRepairs(response.data); // Set data to state
            } catch (error) {
                console.error('Error fetching repairs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRepairs();
    }, []);

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
