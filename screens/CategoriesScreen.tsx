import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const GET_CATEGORIES_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/getCategoriesByUser";
const MODIFY_CATEGORY_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/modifyCategoryByUser";

const CategoriesScreen = ({ navigation }: any) => {
    const { data: responseData, error, loading, fetchData } = useAuthenticatedFetch(navigation, {
        url: GET_CATEGORIES_API_URL,
        data: { "isCategoriesScreen": "true" },
        autoFetch: true,
    });

    const [categories, setCategories] = useState(responseData?.categories || []);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Sync local state with fetched data
    useEffect(() => {
        if (responseData?.categories) {
            console.log("Fetched categories:", responseData.categories);
            setCategories(responseData.categories);
        }
    }, [responseData]);

    // Re-fetch categories when screen comes into focus
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log("CategoriesScreen focused, re-fetching data");
            fetchData({
                url: GET_CATEGORIES_API_URL,
                data: { "isCategoriesScreen": "true" },
            });
        });
        return unsubscribe;
    }, [navigation, fetchData]);

    const openModal = (category: any) => {
        setSelectedCategory(category);
        setModalVisible(true);
    };

    const handleEdit = () => {
        setModalVisible(false);
        // TODO: Implement edit functionality later
    };

    const handleViewOrderFields = () => {
        setModalVisible(false);
    };

    const handleViewRepairFields = () => {
        setModalVisible(false);
        Alert.alert('View Repair Fields', `Viewing repair fields for: ${selectedCategory?.name}`);
    };

    const handleDelete = async () => {
        setModalVisible(false);
        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete ${selectedCategory?.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setDeleteLoading(true);
                        try {
                            const deleteResponse = await fetchData({
                                url: MODIFY_CATEGORY_API_URL,
                                method: 'POST',
                                data: {
                                    operation: "delete",
                                    categoryId: selectedCategory.categoryId,
                                },
                            });

                            if (deleteResponse && deleteResponse.status === "success") {
                                setCategories(categories.filter((item) => item.categoryId !== selectedCategory.categoryId));
                                Alert.alert("Success", deleteResponse.message || "Category deleted successfully");
                            } else {
                                Alert.alert("Error", deleteResponse?.errorMessage || "Failed to delete category");
                            }
                        } catch (e) {
                            console.error("Delete error:", e);
                            Alert.alert("Error", "An error occurred while deleting the category");
                        } finally {
                            setDeleteLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const renderCategoryItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => openModal(item)}
        >
            <Text style={styles.categoryText}>{item.name}</Text>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {loading && categories.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                </View>
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <>
                    <FlatList
                        data={categories}
                        keyExtractor={(item) => item.categoryId}
                        renderItem={renderCategoryItem}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('AddCategory')}
                        disabled={deleteLoading}
                    >
                        <Text style={styles.addButtonText}>
                            {deleteLoading ? 'Deleting...' : 'Add Category'}
                        </Text>
                    </TouchableOpacity>
                </>
            )}

            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{selectedCategory?.name}</Text>
                        <TouchableOpacity style={styles.modalOption} onPress={handleEdit}>
                            <Text style={styles.modalOptionText}>Edit Category</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={handleViewOrderFields}>
                            <Text style={styles.modalOptionText}>View Order Fields</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={handleViewRepairFields}>
                            <Text style={styles.modalOptionText}>View Repair Fields</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={handleDelete}>
                            <Text style={[styles.modalOptionText, { color: 'red' }]}>Delete Category</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalOption, { marginTop: 10 }]}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={[styles.modalOptionText, { color: '#333' }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
    },
    categoryText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 8,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#075E54',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginTop: 20,
        marginBottom: 20,
        justifyContent: 'center',
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginLeft: 8,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    modalOption: {
        paddingVertical: 12,
    },
    modalOptionText: {
        fontSize: 16,
        color: '#075E54',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default CategoriesScreen;
