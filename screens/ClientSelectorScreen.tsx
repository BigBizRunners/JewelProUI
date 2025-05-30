import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch'; // Adjust path as needed

const GET_CLIENTS_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/getClients";

const ClientSelectorScreen = ({ navigation, route }: any) => {
    const { fetchData } = useAuthenticatedFetch(navigation);
    const [clients, setClients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fetchDataRef = useRef(fetchData);

    const fetchClients = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching clients from API');
            const response = await fetchDataRef.current({ url: GET_CLIENTS_API_URL, method: 'POST' });
            console.log('API Response:', JSON.stringify(response, null, 2));
            if (response?.clients) {
                const mappedClients = response.clients.map((client: any) => ({
                    id: client.clientId,
                    name: client.name,
                    ...client, // Include other properties for compatibility
                }));
                setClients(mappedClients);
                console.log('Clients set:', mappedClients.length);
            } else {
                console.warn('No clients data in response:', response);
                setClients([]);
            }
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to fetch clients';
            console.error('Error fetching clients:', err);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchClients();
            return () => {
                console.log('ClientSelectorScreen unfocused, cleanup');
            };
        }, [fetchClients])
    );

    const onSelectClient = (client: any) => {
        console.log('Selected client:', client);
        const { onSelectClient } = route.params || {};
        if (onSelectClient) {
            onSelectClient(client);
        } else {
            console.warn('No onSelectClient callback provided');
        }
        navigation.goBack();
    };

    if (loading && clients.length === 0) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#075E54" />
                </View>
            </KeyboardAvoidingView>
        );
    }

    if (error) {
        return (
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
            >
                <Text style={styles.errorText}>{error}</Text>
            </KeyboardAvoidingView>
        );
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <FlatList
                data={clients}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        style={styles.clientItem}
                        onPress={() => onSelectClient(item)}
                    >
                        <Text style={styles.clientName}>{item.name}</Text>
                    </TouchableOpacity>
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => <Text style={styles.emptyText}>No clients available</Text>}
            />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 5,
        paddingTop: 5,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    listContent: {
        padding: 20,
        paddingBottom: 80,
    },
    clientItem: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    clientName: {
        fontSize: 16,
        color: '#333',
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    emptyText: {
        textAlign: 'center',
        padding: 20,
        color: '#666',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
});

export default ClientSelectorScreen;
