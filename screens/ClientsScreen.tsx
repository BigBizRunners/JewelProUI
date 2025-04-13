import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const HANDLE_CLIENT_OPERATION_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/handleClientOperation";
const GET_CLIENTS_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/getClients";

const ClientsScreen = () => {
    const navigation = useNavigation();
    const { data: responseData, error, loading, fetchData } = useAuthenticatedFetch(navigation);
    const [clients, setClients] = useState([]);
    const [deleteLoading, setDeleteLoading] = useState(false); // Add deleteLoading state

    const fetchDataRef = useRef(fetchData);

    useEffect(() => {
        fetchDataRef.current = fetchData;
    }, [fetchData]);

    const fetchClients = useCallback(async () => {
        try {
            const response = await fetchDataRef.current({ url: GET_CLIENTS_API_URL, method: 'POST' });
            if (response?.clients) {
                setClients(response.clients);
            } else {
                console.log("No clients data:", response);
            }
        } catch (err) {
            console.error("Error fetching clients:", err);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchClients();
        }, [fetchClients])
    );

    const handleDelete = async (clientId: string) => {
        Alert.alert(
            'Delete Client',
            'Are you sure you want to delete this client?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleteLoading(true); // Set loading to true before delete
                        console.log(`Deleting client with ID: ${clientId}`);
                        try {
                            const requestData = {
                                operation: 'delete',
                                clientId,
                            };
                            const response = await fetchDataRef.current({
                                url: HANDLE_CLIENT_OPERATION_API_URL,
                                method: 'POST',
                                data: requestData,
                            });
                            console.log("Delete response:", JSON.stringify(response));

                            setDeleteLoading(false); // Set loading to false after response

                            if (response && response.status === "success") {
                                setClients(clients.filter(client => client.clientId !== clientId));
                                Alert.alert("Success", "Client deleted successfully");
                                fetchClients();
                            } else if (response && response.status === "failure") {
                                Alert.alert("Error", response.responseMessage || "Failed to delete client");
                            }
                        } catch (error) {
                            setDeleteLoading(false); // Set loading to false on error
                            Alert.alert("Error", "Failed to delete client");
                            console.log("Delete error:", error);
                        }
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

    const renderClientItem = ({ item }: { item: any }) => {
        if (!item || typeof item !== 'object') {
            console.log("Invalid item:", item);
            return null;
        }
        return (
            <TouchableOpacity
                style={styles.fieldItem}
                onPress={() => navigation.navigate('ManageClient', { client: item })}
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
    };

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
            {deleteLoading && ( // Show loader when deleteLoading is true
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            )}
            <View style={styles.contentContainer}>
                <FlatList
                    data={clients}
                    keyExtractor={(item) => item.clientId}
                    renderItem={renderClientItem}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                />
            </View>
            <TouchableOpacity style={styles.addFieldButton} onPress={() => navigation.navigate('ManageClient')}>
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
        padding: 12,
        borderRadius: 8,
        elevation: 2,
    },
    clientInfo: {
        flex: 1,
    },
    fieldName: {
        fontSize: 16,
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
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, // Ensure overlay is on top
    },
});

export default ClientsScreen;
