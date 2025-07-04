import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';
import ProgressHeader from '../components/ProgressHeader'; // Import the new component

const GET_CATEGORIES_API_URL = process.env.EXPO_PUBLIC_API_URL_GET_CATEGORIES_BY_USER;

const SelectCategoryScreen = ({ navigation }: any) => {
    const { data: responseData, error, loading, fetchData } = useAuthenticatedFetch(navigation);
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchData({
                url: GET_CATEGORIES_API_URL,
                data: { isCategoriesScreen: true },
            });
        });
        return unsubscribe;
    }, [navigation, fetchData]);

    useEffect(() => {
        if (responseData?.categories) {
            setCategories(responseData.categories);
            setFilteredCategories(responseData.categories);
        }
    }, [responseData]);

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredCategories(categories);
        } else {
            const lowercasedQuery = searchQuery.toLowerCase();
            const filtered = categories.filter(category =>
                category.name.toLowerCase().includes(lowercasedQuery)
            );
            setFilteredCategories(filtered);
        }
    }, [searchQuery, categories]);

    const handleCategorySelect = (categoryId: string) => {
        navigation.navigate('CreateOrder', { categoryId });
    };

    const renderItem = ({ item }: any) => (
        <TouchableOpacity style={styles.categoryItem} onPress={() => handleCategorySelect(item.categoryId)}>
            <Text style={styles.categoryText}>{item.name}</Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* --- REPLACED HEADER --- */}
            <ProgressHeader title="Select Category" currentStep={1} totalSteps={2} />

            <View style={styles.contentContainer}>
                <View style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={20} color="#888" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#888"
                    />
                </View>
                {loading && categories.length === 0 ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0000ff" />
                        <Text style={styles.loadingText}>Loading categories...</Text>
                    </View>
                ) : error ? (
                    <Text style={styles.errorText}>{error}</Text>
                ) : (
                    <FlatList
                        data={filteredCategories}
                        keyExtractor={(item) => item.categoryId}
                        renderItem={renderItem}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={() => (
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'No categories match your search.' : 'No categories available.'}
                            </Text>
                        )}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 15,
        paddingTop: 20,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 8,
        marginHorizontal: 0, // Adjusted for contentContainer padding
        marginBottom: 10,
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
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 14,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    categoryText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    separator: {
        height: 12,
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
    emptyText: {
        textAlign: 'center',
        padding: 20,
        color: '#666',
        fontSize: 16,
    },
});

export default SelectCategoryScreen;
