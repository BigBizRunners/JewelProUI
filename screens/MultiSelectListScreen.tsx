import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

    const handleDone = () => {
        // Call the onSave callback from the parent screen...
        if (onSave) {
            onSave(Array.from(selected));
        }
        // ...and then simply go back.
        navigation.goBack();
    };

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={handleDone} style={styles.headerButton}>
                    <Text style={styles.headerButtonText}>Done</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation, selected]);

    const renderItem = ({ item }) => {
        const isSelected = selected.has(item.id);
        return (
            <TouchableOpacity style={styles.itemContainer} onPress={() => handleToggle(item.id)}>
                <MaterialCommunityIcons
                    name={isSelected ? 'checkbox-marked' : 'checkbox-blank-outline'}
                    size={24}
                    color={isSelected ? '#075E54' : '#ccc'}
                />
                <Text style={styles.itemText}>{item.name}</Text>
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
        <FlatList
            data={items}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            style={styles.container}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={() => (
                <View style={styles.centered}>
                    <Text>No items found.</Text>
                </View>
            )}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerButton: {
        marginRight: 15,
    },
    headerButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
    },
    itemText: {
        fontSize: 16,
        marginLeft: 15,
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginLeft: 55,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
    }
});

export default MultiSelectListScreen;
