import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Platform,
    KeyboardAvoidingView,
    TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import MaterialCommunityIcons
import { useFocusEffect } from '@react-navigation/native';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch'; // Adjust path as needed

const GET_CLIENTS_API_URL = process.env.EXPO_PUBLIC_API_URL_GET_CLIENTS;

const ClientSelectorScreen = ({ navigation, route }: any) => {
    const { fetchData } = useAuthenticatedFetch(navigation);
    const [clients, setClients] = useState<any[]>([]);
    const [filteredClients, setFilteredClients] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
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
                setFilteredClients(mappedClients);
                console.log('Clients set:', mappedClients.length);
            } else {
                console.warn('No clients data in response:', response);
                setClients([]);
                setFilteredClients([]);
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

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredClients(clients);
        } else {
            const lowercasedQuery = searchQuery.toLowerCase();
            const filtered = clients.filter(client =>
                client.name.toLowerCase().includes(lowercasedQuery) ||
                (client.clientContactNumber && client.clientContactNumber.toLowerCase().includes(lowercasedQuery))
            );
            setFilteredClients(filtered);
        }
    }, [searchQuery, clients]);

    const onSelectClient = (client: any) => {
        console.log('Selected client:', client);
        const { onSelectClient } = route.params || {};
        if (onSelectClient) {
            onSelectClient(client);
        }
        navigation.goBack();
    };

    const navigateToAddClient = () => {
        navigation.navigate('ManageClient');
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
            <View style={styles.searchContainer}>
                <MaterialCommunityIcons name="magnify" size={20} color="#888" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#888"
                />
            </View>
            <FlatList
                data={filteredClients}
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
                ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>
                        {searchQuery ? 'No clients match your search.' : 'No clients available.'}
                    </Text>
                )}
            />
            <TouchableOpacity style={styles.fab} onPress={navigateToAddClient}>
                <MaterialCommunityIcons name="plus" size={30} color="#fff" />
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginHorizontal: 15,
        marginVertical: 10,
        paddingHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        height: 40,
        fontSize: 16,
        color: '#333',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f9f9f9',
    },
    listContent: {
        paddingBottom: 80,
        paddingHorizontal: 15, // Add horizontal padding to the list content
    },
    clientItem: {
        paddingVertical: 15,
        paddingHorizontal: 5, // Adjust padding for consistency
    },
    clientName: {
        fontSize: 16,
        color: '#333',
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginLeft: 5, // Adjust margin for consistency
    },
    emptyText: {
        textAlign: 'center',
        padding: 20,
        color: '#666',
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    fab: {
        position: 'absolute',
        width: 60,
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        right: 20,
        bottom: 20,
        backgroundColor: '#075E54',
        borderRadius: 30,
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
});

export default ClientSelectorScreen;
