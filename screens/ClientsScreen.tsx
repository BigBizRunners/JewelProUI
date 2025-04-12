import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Linking,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const GET_CLIENTS_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/getClients"; // Hypothetical endpoint

const ClientsScreen = ({ navigation }: any) => {
    const { data: responseData, error, loading, fetchData } = useAuthenticatedFetch(navigation, {
        url: GET_CLIENTS_API_URL,
        method: 'POST',
        autoFetch: true,
    });

    const [clients, setClients] = useState([]);

    useEffect(() => {
        if (responseData?.clients) {
            setClients(responseData.clients);
        } else {
            console.log("No clients data:", responseData);
        }
    }, [responseData]);

    const handleDelete = (clientId: string) => {
        Alert.alert(
            'Delete Client',
            'Are you sure you want to delete this client?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        console.log(`Delete client with ID: ${clientId}`);
                        setClients(clients.filter(client => client.clientId !== clientId));
                        Alert.alert("Success", "Client deleted successfully");
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const handleWhatsApp = (contactNumber: string) => {
        if (contactNumber) {
            const phoneNumber = contactNumber.replace(/\+/g, '');
            Linking.openURL(`whatsapp://send?phone=${phoneNumber}`)
                .catch(err => Alert.alert("Error", "WhatsApp is not installed or an error occurred"));
        } else {
            Alert.alert("Error", "No contact number available for WhatsApp");
        }
    };

    const handleCall = (contactNumber: string) => {
        if (contactNumber) {
            const phoneNumber = contactNumber.replace(/\+/g, '');
            Linking.openURL(`tel:${phoneNumber}`)
                .catch(err => Alert.alert("Error", "Unable to make a call"));
        } else {
            Alert.alert("Error", "No contact number available for calling");
        }
    };

    const renderClientItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.fieldItem}
            onPress={() => {}}
            disabled={true}
        >
            <View style={styles.clientInfo}>
                <Text style={styles.fieldName}>{item.name || 'N/A'}</Text>
                <Text style={styles.fieldType}>Mobile No: {item.clientContactNumber || 'N/A'}</Text>
                <View style={styles.actionContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleWhatsApp(item.clientContactNumber)}
                    >
                        <MaterialCommunityIcons name="whatsapp" size={20} color="#075E54" />
                        <Text style={styles.actionText}>WhatsApp</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleCall(item.clientContactNumber)}
                    >
                        <MaterialCommunityIcons name="phone" size={20} color="#075E54" />
                        <Text style={styles.actionText}>Call</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <TouchableOpacity onPress={() => handleDelete(item.clientId)} style={styles.deleteButton}>
                <MaterialCommunityIcons name="trash-can-outline" size={24} color="#888" />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    if (loading && clients.length === 0) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Loading clients...</Text>
            </View>
        );
    }

    if (error) {
        return <Text style={styles.errorText}>{error}</Text>;
    }

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <FlatList
                    data={clients}
                    keyExtractor={(item) => item.clientId} // Reverted to direct clientId
                    renderItem={renderClientItem}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            </View>
            <TouchableOpacity style={styles.addFieldButton} onPress={() => navigation.navigate('AddClient')}>
                <Text style={styles.addFieldText}>Add Client</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 5,
        paddingTop: 20,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    fieldItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 8,
        elevation: 2,
    },
    clientInfo: {
        flex: 1,
    },
    fieldName: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    fieldType: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    actionContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: '#e0f2f1',
        borderRadius: 4,
        marginRight: 5,
    },
    actionText: {
        marginLeft: 5,
        fontSize: 14,
        color: '#075E54',
    },
    deleteButton: {
        padding: 10,
        marginTop: 5,
    },
    addFieldButton: {
        flexDirection: 'row',
        backgroundColor: '#075E54',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },
    addFieldText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 8,
    },
});

export default ClientsScreen;
