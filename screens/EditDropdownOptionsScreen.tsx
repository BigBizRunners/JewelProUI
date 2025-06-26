import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const MANAGE_FIELD_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/manageCategoryField";

const fieldTypeToDisplayName = (fieldType) => {
    switch (fieldType) {
        case 'DROPDOWN_OPTIONS':
            return 'Dropdown Options';
        case 'MULTI_SELECT_DROPDOWN_OPTIONS':
            return 'Multi-select Dropdown Options';
        case 'TEXT':
            return 'Text';
        case 'NOTE':
            return 'Note';
        case 'RANGE':
            return 'Range';
        default:
            return fieldType;
    }
};

const EditDropdownOptionsScreen = ({ navigation, route }) => {
    const { field, categoryId, isOrderFields } = route.params;
    const { fetchData, loading } = useAuthenticatedFetch(navigation);
    const [options, setOptions] = useState(field.validFieldValues || []);
    const [newOption, setNewOption] = useState('');
    const [isAddModalVisible, setAddModalVisible] = useState(false);

    useEffect(() => {
        navigation.setOptions({ title: `Edit ${field.fieldName} Options` });
    }, [navigation, field.fieldName]);

    const openAddModal = () => {
        setNewOption('');
        setAddModalVisible(true);
    };

    const addOption = () => {
        if (!newOption.trim()) {
            Alert.alert('Error', 'Option cannot be empty');
            return;
        }
        if (options.map(opt => opt.toLowerCase()).includes(newOption.trim().toLowerCase())) {
            Alert.alert('Error', 'Option already exists');
            setNewOption('');
            return;
        }
        setOptions([...options, newOption.trim()]);
        setAddModalVisible(false);
        setNewOption('');
    };

    const confirmRemoveOption = (optionToRemove) => {
        Alert.alert(
            'Delete Option',
            `Are you sure you want to delete "${optionToRemove}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        setOptions(options.filter(opt => opt !== optionToRemove));
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const saveOptions = async () => {
        const updatedField = {
            operation: 'update',
            categoryId: field.categoryId,
            fieldId: field.fieldId,
            fieldName: field.fieldName,
            fieldType: fieldTypeToDisplayName(field.fieldType),
            validFieldValues: options,
            position: field.position || 0,
            isVisibleInClientOrderForm: field.isVisibleInClientOrderForm || false,
            isVisibleInKarigarJobCard: field.isVisibleInKarigarJobCard || false,
            isRequired: field.isRequired || false,
            isOrderField: isOrderFields || field.isOrderField || false,
            isRepairField: !isOrderFields || field.isRepairField || false,
        };

        try {
            const response = await fetchData({
                url: MANAGE_FIELD_API_URL,
                method: 'POST',
                data: updatedField,
            });

            if (response?.status === 'success') {
                Alert.alert('Success', 'Dropdown options updated successfully');
                navigation.goBack({ updated: true });
            } else {
                Alert.alert('Error', response?.errorMessage || 'Failed to update options.');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to save options: ' + error.message);
        }
    };

    const renderOptionItem = ({ item }) => (
        <View style={styles.optionItem}>
            <Text style={styles.optionText}>{item}</Text>
            <TouchableOpacity onPress={() => confirmRemoveOption(item)}>
                <MaterialCommunityIcons name="delete-outline" size={24} color="#E53935" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Saving...</Text>
                </View>
            ) : (
                <>
                    <FlatList
                        data={options}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={renderOptionItem}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        style={styles.optionsList}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No options yet.</Text>
                                <Text style={styles.emptySubText}>Tap the '+' button to get started.</Text>
                            </View>
                        }
                    />
                    <TouchableOpacity style={styles.fab} onPress={openAddModal}>
                        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.saveButton} onPress={saveOptions}>
                            <Text style={styles.saveButtonText}>Save Changes</Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}

            <Modal
                visible={isAddModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAddModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.modalOverlay}
                >
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Add New Option</Text>
                        <TextInput
                            style={styles.optionInput}
                            placeholder="Enter option name"
                            placeholderTextColor="#999"
                            value={newOption}
                            onChangeText={setNewOption}
                            autoFocus
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancelButton]}
                                onPress={() => setAddModalVisible(false)}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalSaveButton]}
                                onPress={addOption}
                            >
                                <Text style={[styles.modalButtonText, { color: '#fff' }]}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    optionsList: {
        flex: 1,
        paddingHorizontal: 10,
        paddingTop: 10,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        elevation: 2,
        marginVertical: 4,
    },
    optionText: {
        fontSize: 16,
        color: '#333',
        flex: 1,
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 2,
    },
    fab: {
        position: 'absolute',
        bottom: 80, // Position above the save button
        right: 20,
        backgroundColor: '#075E54',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        zIndex: 1,
    },
    buttonContainer: {
        paddingHorizontal: 10,
        paddingTop: 10,
        paddingBottom: 20, // Matches ViewFieldsScreen for safe area
        backgroundColor: '#f9f9f9', // Match container background
    },
    saveButton: {
        backgroundColor: '#075E54',
        padding: 12,
        borderRadius: 8, // Consistent corner radius
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    emptyContainer: {
        flex: 1,
        paddingTop: 80,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555'
    },
    emptySubText: {
        fontSize: 14,
        color: '#777',
        marginTop: 5
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
        width: '100%',
        backgroundColor: '#fff',
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        padding: 20,
        paddingBottom: 30,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
        textAlign: 'center',
    },
    optionInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: '#f5f5f5',
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalButton: {
        paddingVertical: 12,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },
    modalSaveButton: {
        backgroundColor: '#075E54',
        marginLeft: 5,
    },
    modalCancelButton: {
        backgroundColor: '#E0E0E0',
        marginRight: 5,
    },
    modalButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    }
});

export default EditDropdownOptionsScreen;
