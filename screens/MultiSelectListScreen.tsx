import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const GET_CLIENTS_API_URL = 'https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/getClients';
const GET_CATEGORIES_API_URL = 'https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/getCategoriesByUser';

const MultiSelectListScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { selectedIds = [], selectionType, onSave } = route.params;

    const [items, setItems] = useState([]);
    const [selected, setSelected] = useState(new Set(selectedIds));
    const { loading, error, fetchData } = useAuthenticatedFetch(navigation);

    useEffect(() => {
        const fetchFilterData = async () => {
            let url;
            let params = {};
            if (selectionType === 'clients') {
                url = GET_CLIENTS_API_URL;
                params.method = 'POST';
            } else if (selectionType === 'categories') {
                url = GET_CATEGORIES_API_URL;
                params.method = 'POST';
                params.data = { isCategoriesScreen: "true" };
            } else {
                return;
            }

            const response = await fetchData({ url, ...params });

            if (response) {
                if (selectionType === 'clients' && response.clients) {
                    setItems(response.clients.map(c => ({ id: c.clientId, name: c.name })));
                } else if (selectionType === 'categories' && response.categories) {
                    setItems(response.categories.map(c => ({ id: c.categoryId, name: c.name })));
                }
            }
        };
        fetchFilterData();
    }, [selectionType]);

    const handleToggle = (id) => {
        const newSelection = new Set(selected);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelected(newSelection);
    };

    const handleSave = () => {
        // Call the onSave callback from the parent screen...
        if (onSave) {
            onSave(Array.from(selected));
        }
        // ...and then simply go back.
        navigation.goBack();
    };

    const renderItem = ({ item }) => {
        const isSelected = selected.has(item.id);
        return (
            <TouchableOpacity style={styles.itemContainer} onPress={() => handleToggle(item.id)}>
                <Text style={styles.itemText}>{item.name}</Text>
                {isSelected && <Text style={styles.selectedIndicator}>✓</Text>}
            </TouchableOpacity>
        );
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#075E54" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Failed to load items.</Text>
            </View>
        )
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
        >
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListEmptyComponent={() => (
                    <View style={styles.centered}>
                        <Text>No items found.</Text>
                    </View>
                )}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        flex: 1,
    },
    listContent: {
        padding: 20,
        paddingBottom: 80,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    itemText: {
        fontSize: 16,
        color: '#333',
    },
    selectedIndicator: {
        fontSize: 18,
        color: '#075E54',
        fontWeight: 'bold',
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: '#075E54',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        margin: 20,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default MultiSelectListScreen;
