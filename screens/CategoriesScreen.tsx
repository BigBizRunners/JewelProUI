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
    const { data: responseData, error, loading, fetchData } = useAuthenticatedFetch(navigation);

    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);
    const [isModalVisible, setModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (responseData?.categories) {
            console.log("Fetched categories:", responseData.categories);
            setCategories(responseData.categories);
        }
    }, [responseData]);

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

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: !isDeleting,
        });
    }, [navigation, isDeleting]);

    const openModal = (category: any) => {
        if (!isDeleting) {
            setSelectedCategory(category);
            setModalVisible(true);
        }
    };

    const closeModal = () => {
        if (!isDeleting) {
            setModalVisible(false);
            setSelectedCategory(null);
        }
    }

    const handleEdit = () => {
        setModalVisible(false);
        navigation.navigate('ManageCategory', { category: selectedCategory });
    };

    const handleViewOrderFields = () => {
        setModalVisible(false);
        // @ts-ignore
        navigation.navigate('ViewFields', { categoryId: selectedCategory.categoryId, isOrderFields: true });
    };

    const handleViewRepairFields = () => {
        setModalVisible(false);
        // @ts-ignore
        navigation.navigate('ViewFields', { categoryId: selectedCategory.categoryId, isOrderFields: false });
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
                        setIsDeleting(true);
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
                                setCategories(categories.filter((item: { categoryId: any; }) => item.categoryId !== selectedCategory.categoryId));
                                Alert.alert("Success", deleteResponse.message || "Category deleted successfully");
                            } else {
                                Alert.alert("Error", deleteResponse?.errorMessage || "Failed to delete category");
                            }
                        } catch (e) {
                            console.error("Delete error:", e);
                            Alert.alert("Error", "An error occurred while deleting the category");
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const renderCategoryItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.categoryItem}
            onPress={() => openModal(item)}
            disabled={isDeleting}
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
                    <Text style={styles.loadingText}>Loading categories...</Text>
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
                        contentContainerStyle={styles.listContent}
                    />
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => navigation.navigate('ManageCategory')}
                        disabled={isDeleting}
                    >
                        <Text style={styles.addButtonText}>Add Category</Text>
                    </TouchableOpacity>
                </>
            )}

            {isDeleting && (
                <View style={styles.fullScreenLoader}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.deletingText}>Deleting category...</Text>
                </View>
            )}

            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={closeModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{selectedCategory?.name}</Text>
                        <TouchableOpacity style={styles.modalOption} onPress={handleEdit} disabled={isDeleting}>
                            <Text style={styles.modalOptionText}>Edit Category</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={handleViewOrderFields} disabled={isDeleting}>
                            <Text style={styles.modalOptionText}>View Order Fields</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={handleViewRepairFields} disabled={isDeleting}>
                            <Text style={styles.modalOptionText}>View Repair Fields</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={handleDelete} disabled={isDeleting}>
                            <Text style={[styles.modalOptionText, { color: 'red' }]}>Delete Category</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalOption, { marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 }]}
                            onPress={closeModal}
                            disabled={isDeleting}
                        >
                            <Text style={[styles.modalOptionText, { color: '#333', textAlign: 'center' }]}>Cancel</Text>
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
    listContent: {
        paddingBottom: 60
    },
    categoryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        elevation: 2,
        marginVertical: 4,
        marginHorizontal: 10,
    },
    categoryText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 2,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#075E54',
        padding: 12,
        borderRadius: 8,
        justifyContent: 'center',
        margin: 10,
        marginBottom: 20,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    modalOption: {
        paddingVertical: 14,
    },
    modalOptionText: {
        fontSize: 16,
        color: '#075E54',
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f9f9f9',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    fullScreenLoader: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    deletingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
});

export default CategoriesScreen;
