import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
} from 'react-native';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const GET_CATEGORIES_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/getCategoriesByUser";

const SelectCategoryScreen = ({ navigation }: any) => {
    const { data: responseData, error, loading, fetchData } = useAuthenticatedFetch(navigation);
    const [categories, setCategories] = useState([]);

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
        }
    }, [responseData]);

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
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Select Product Category</Text>
                <Text style={styles.stepText}>Step 1 of 2</Text>
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
                    data={categories}
                    keyExtractor={(item) => item.categoryId}
                    renderItem={renderItem}
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 10,
        paddingTop: 20,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#075E54',
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
    },
    stepText: {
        fontSize: 14,
        color: '#fff',
        borderWidth: 1,
        borderColor: '#fff',
        borderRadius: 15,
        paddingVertical: 4,
        paddingHorizontal: 10,
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
        marginBottom: 10,
    },
});

export default SelectCategoryScreen;
