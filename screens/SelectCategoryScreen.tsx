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
import ProgressHeader from '../components/ProgressHeader'; // Import the new component

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
            {/* --- REPLACED HEADER --- */}
            <ProgressHeader title="Select Category" currentStep={1} totalSteps={2} />

            <View style={styles.contentContainer}>
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
    // --- REMOVED OLD HEADER STYLES ---
    // headerContainer, headerTitle, stepText are no longer needed.
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
});

export default SelectCategoryScreen;
