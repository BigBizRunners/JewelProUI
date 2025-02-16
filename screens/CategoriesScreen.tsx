import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const CategoriesScreen = ({ navigation }: any) => {
    const [categories, setCategories] = useState([
        { id: '1', name: 'Rings' },
        { id: '2', name: 'Necklaces' },
        { id: '3', name: 'Bracelets' },
    ]);

    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isModalVisible, setModalVisible] = useState(false);

    // Open modal for the selected category
    const openModal = ({category}: any) => {
        setSelectedCategory(category);
        setModalVisible(true);
    };

    // Handle category actions
    const handleEdit = () => {
        setModalVisible(false);
    };

    const handleViewOrderFields = () => {
        setModalVisible(false);
    };

    const handleViewRepairFields = () => {
        setModalVisible(false);
        // @ts-ignore
        Alert.alert('View Repair Fields', `Viewing repair fields for: ${selectedCategory.name}`);
    };

    const handleDelete = () => {
        setModalVisible(false);
        // @ts-ignore
        Alert.alert(
            'Delete Category',
            `Are you sure you want to delete ${selectedCategory.name}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setCategories(categories.filter((item) => item.id !== selectedCategory.id));
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
            <FlatList
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={renderCategoryItem}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />

            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddCategory')}
            >
                <Text style={styles.addButtonText}>Add Category</Text>
            </TouchableOpacity>

            {/* Modal for Category Options */}
            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>
                            {selectedCategory?.name}
                        </Text>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={handleEdit}
                        >
                            <Text style={styles.modalOptionText}>
                                Edit Category
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={handleViewOrderFields}
                        >
                            <Text style={styles.modalOptionText}>
                                View Order Fields
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={handleViewRepairFields}
                        >
                            <Text style={styles.modalOptionText}>
                                View Repair Fields
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={handleDelete}
                        >
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
});

export default CategoriesScreen;
