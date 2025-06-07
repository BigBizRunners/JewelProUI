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
        if (options.includes(newOption.trim())) {
            Alert.alert('Error', 'Option already exists');
            setNewOption('');
            return;
        }
        setOptions([...options, newOption.trim()]);
        setAddModalVisible(false);
        setNewOption('');
    };

    const removeOption = (option) => {
        setOptions(options.filter(opt => opt !== option));
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
            console.log('Sending payload:', JSON.stringify(updatedField, null, 2));
            const response = await fetchData({
                url: MANAGE_FIELD_API_URL,
                method: 'POST',
                data: updatedField,
            });

            if (response?.status === 'success') {
                Alert.alert('Success', 'Dropdown options updated successfully');
                navigation.goBack({ updated: true });
            } else {
                Alert.alert('Error', response?.errorMessage || 'Failed to update options');
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to save options: ' + error.message);
        }
    };

    const renderOptionItem = ({ item }) => (
        <View style={styles.optionItem}>
            <Text style={styles.optionText}>{item}</Text>
            <TouchableOpacity onPress={() => removeOption(item)}>
                <MaterialCommunityIcons name="delete" size={20} color="red" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#075E54" />
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
                    />
                    <TouchableOpacity style={styles.fab} onPress={openAddModal}>
                        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.saveButton} onPress={saveOptions}>
                            <Text style={styles.buttonText}>Save</Text>
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
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Add New Option</Text>
                        <TextInput
                            style={styles.optionInput}
                            placeholder="Enter option"
                            value={newOption}
                            onChangeText={setNewOption}
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.modalSaveButton} onPress={addOption}>
                                <Text style={styles.buttonText}>Add</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalCancelButton}
                                onPress={() => setAddModalVisible(false)}
                            >
                                <Text style={styles.buttonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
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
        paddingHorizontal: 10,
        paddingTop: 20,
    },
    optionsList: {
        flex: 1,
    },
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 80,
        right: 20,
        backgroundColor: '#075E54',
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    buttonContainer: {
        paddingBottom: 20,
    },
    saveButton: {
        backgroundColor: '#075E54',
        padding: 12,
        borderRadius: 4,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
        marginBottom: 15,
        color: '#333',
    },
    optionInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        fontSize: 16,
        backgroundColor: '#fff',
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    modalSaveButton: {
        backgroundColor: '#075E54',
        padding: 10,
        borderRadius: 4,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
    },
    modalCancelButton: {
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 4,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
    },
});

export default EditDropdownOptionsScreen;
