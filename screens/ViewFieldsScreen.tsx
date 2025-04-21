import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const FIELDS_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/getCategoryFields";
const MANAGE_FIELD_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/manageCategoryField";

const ViewFieldsScreen = ({ navigation, route }: any) => {
    const { categoryId, isOrderFields } = route.params;
    const { data: responseData, error, loading, fetchData } = useAuthenticatedFetch(navigation); // Removed autoFetch: true

    const [fields, setFields] = useState([]);
    const [selectedField, setSelectedField] = useState(null);
    const [dropdownOptions, setDropdownOptions] = useState([]);
    const [newOption, setNewOption] = useState('');
    const [isDropdownModalVisible, setDropdownModalVisible] = useState(false);
    const [isActionModalVisible, setActionModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        navigation.setOptions({
            title: isOrderFields ? 'View Order Fields' : 'View Repair Fields',
        });
    }, [navigation, isOrderFields]);

    useEffect(() => {
        if (responseData?.fields) {
            console.log("Fields set from initial fetch:", JSON.stringify(responseData.fields, null, 2));
            setFields(responseData.fields);
        }
    }, [responseData]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            console.log("ViewFieldsScreen focused, re-fetching data");
            fetchData({
                url: FIELDS_API_URL,
                method: 'POST',
                data: { categoryId, isOrderFields },
            });
        });
        return unsubscribe;
    }, [navigation, fetchData, categoryId, isOrderFields]);

    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: !isDeleting,
        });
    }, [navigation, isDeleting]);

    const openDropdownModal = (field: any) => {
        setSelectedField(field);
        setDropdownOptions(field.fieldDetails?.options || []);
        setDropdownModalVisible(true);
    };

    const addDropdownOption = () => {
        if (!newOption.trim()) return;
        setDropdownOptions([...dropdownOptions, newOption.trim()]);
        setNewOption('');
    };

    const removeDropdownOption = (option: any) => {
        setDropdownOptions(dropdownOptions.filter(opt => opt !== option));
    };

    const saveDropdownOptions = async () => {
        if (!selectedField) return;

        const updatedField = {
            ...selectedField,
            fieldDetails: { options: dropdownOptions },
        };

        const response = await fetchData({
            url: MANAGE_FIELD_API_URL,
            method: 'POST',
            data: updatedField,
        });

        if (response && response.status === "success") {
            setFields(fields.map(f => f.fieldId === selectedField.fieldId ? updatedField : f));
            setDropdownModalVisible(false);
            Alert.alert("Success", "Dropdown options updated successfully");
        } else {
            Alert.alert("Error", response?.errorMessage || "Failed to update dropdown options");
        }
    };

    const navigateToAddField = () => {
        navigation.navigate('ManageCategoryFields', {
            categoryId,
            isOrderFields,
            onFieldAdded: async (...args: any) => {
                console.log("onFieldAdded triggered with args:", args);
                try {
                    const refreshedData = await fetchData({
                        url: FIELDS_API_URL,
                        method: 'POST',
                        data: { categoryId, isOrderFields },
                    });
                    console.log("Refetched fields:", JSON.stringify(refreshedData?.fields, null, 2));
                    if (refreshedData?.fields) {
                        setFields(refreshedData.fields);
                    } else {
                        Alert.alert("Error", "No fields returned after adding");
                    }
                } catch (e) {
                    console.error("Error refetching fields:", e);
                    Alert.alert("Error", "Failed to refresh fields: " + e.message);
                }
            },
        });
    };

    const handleModifyField = () => {
        setActionModalVisible(false);
        navigation.navigate('ManageCategoryFields', {
            categoryId,
            isOrderFields,
            field: selectedField, // Pre-fill with existing field data
            onFieldAdded: async () => {
                try {
                    const refreshedData = await fetchData({
                        url: FIELDS_API_URL,
                        method: 'POST',
                        data: { categoryId, isOrderFields },
                    });
                    if (refreshedData?.fields) {
                        setFields(refreshedData.fields);
                    } else {
                        Alert.alert("Error", "No fields returned after modifying");
                    }
                } catch (e) {
                    console.error("Error refetching fields:", e);
                    Alert.alert("Error", "Failed to refresh fields: " + e.message);
                }
            },
        });
    };

    const handleDeleteField = async () => {
        setActionModalVisible(false);
        Alert.alert(
            'Delete Field',
            `Are you sure you want to delete ${selectedField?.fieldName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        setIsDeleting(true);
                        try {
                            const deleteResponse = await fetchData({
                                url: MANAGE_FIELD_API_URL,
                                method: 'POST',
                                data: {
                                    operation: "delete",
                                    fieldId: selectedField.fieldId,
                                    categoryId: categoryId,
                                },
                            });

                            if (deleteResponse && deleteResponse.status === "success") {
                                setFields(fields.filter(f => f.fieldId !== selectedField.fieldId));
                                Alert.alert("Success", deleteResponse.message || "Field deleted successfully");
                            } else {
                                Alert.alert("Error", deleteResponse?.errorMessage || "Failed to delete field");
                            }
                        } catch (e) {
                            console.error("Delete error:", e);
                            Alert.alert("Error", "An error occurred while deleting the field");
                        } finally {
                            setIsDeleting(false);
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    const openActionModal = (field: any) => {
        if (!isDeleting) {
            setSelectedField(field);
            setActionModalVisible(true);
        }
    };

    const normalizeFieldType = (fieldType: any) => {
        switch (fieldType) {
            case "TEXT": return "Text";
            case "SMALL_TEXT": return "Small Text";
            case "LARGE_TEXT": return "Large Text";
            case "NOTE": return "Node";
            case "DROPDOWN_OPTIONS": return "Dropdown Options";
            case "MULTI_SELECT_DROPDOWN_OPTIONS": return "Multi-select Dropdown Options";
            default: return fieldType;
        }
    };

    const renderFieldItem = ({ item }: any) => (
        <TouchableOpacity
            style={styles.fieldItem}
            onPress={() => openActionModal(item)}
            disabled={isDeleting}
        >
            <Text style={styles.fieldName}>{item.fieldName}</Text>
            <View style={styles.fieldTypeContainer}>
                <Text style={styles.fieldType}>{normalizeFieldType(item.fieldType)}</Text>
                {(item.fieldType === "DROPDOWN_OPTIONS" || item.fieldType === "MULTI_SELECT_DROPDOWN_OPTIONS") && (
                    <TouchableOpacity onPress={() => openDropdownModal(item)}>
                        <MaterialCommunityIcons name="pencil" size={20} color="#075E54" />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {loading && fields.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Loading fields...</Text>
                </View>
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <View style={styles.contentContainer}>
                    <FlatList
                        data={fields}
                        keyExtractor={(item) => item.fieldId}
                        renderItem={renderFieldItem}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                    />
                    <TouchableOpacity style={styles.addFieldButton} onPress={navigateToAddField} disabled={isDeleting}>
                        <Text style={styles.addFieldText}>Add Field</Text>
                    </TouchableOpacity>
                </View>
            )}

            {isDeleting && (
                <View style={styles.fullScreenLoader}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>Deleting field...</Text>
                </View>
            )}

            <Modal
                visible={isActionModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => !isDeleting && setActionModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{selectedField?.fieldName}</Text>
                        <TouchableOpacity style={styles.modalOption} onPress={handleModifyField} disabled={isDeleting}>
                            <Text style={styles.modalOptionText}>Modify Field</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.modalOption} onPress={handleDeleteField} disabled={isDeleting}>
                            <Text style={[styles.modalOptionText, { color: 'red' }]}>Delete Field</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalOption, { marginTop: 10 }]}
                            onPress={() => !isDeleting && setActionModalVisible(false)}
                            disabled={isDeleting}
                        >
                            <Text style={[styles.modalOptionText, { color: '#333' }]}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isDropdownModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setDropdownModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>Edit Dropdown Options</Text>
                        <FlatList
                            data={dropdownOptions}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.optionItem}>
                                    <Text style={styles.optionText}>{item}</Text>
                                    <TouchableOpacity onPress={() => removeDropdownOption(item)}>
                                        <MaterialCommunityIcons name="delete" size={20} color="red" />
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                        <TextInput
                            style={styles.optionInput}
                            placeholder="Add new option"
                            value={newOption}
                            onChangeText={setNewOption}
                        />
                        <TouchableOpacity style={styles.addOptionButton} onPress={addDropdownOption}>
                            <Text style={styles.addOptionText}>Add Option</Text>
                        </TouchableOpacity>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.saveButton} onPress={saveDropdownOptions}>
                                <Text style={styles.buttonText}>Save</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setDropdownModalVisible(false)}>
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
        paddingHorizontal: 5,
        paddingTop: 20,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'space-between',
    },
    fieldItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
    },
    fieldName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    fieldTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fieldType: {
        fontSize: 12,
        color: '#666',
        marginRight: 10,
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginVertical: 8,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullScreenLoader: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#fff',
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginTop: 20,
    },
    addFieldButton: {
        flexDirection: 'row',
        backgroundColor: '#075E54',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
    },
    addFieldText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 5,
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
    optionItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    optionInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        padding: 10,
        marginVertical: 10,
        fontSize: 16,
    },
    addOptionButton: {
        backgroundColor: '#075E54',
        padding: 10,
        borderRadius: 4,
        alignItems: 'center',
        marginBottom: 15,
    },
    addOptionText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    saveButton: {
        backgroundColor: '#075E54',
        padding: 10,
        borderRadius: 4,
        flex: 1,
        marginRight: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ccc',
        padding: 10,
        borderRadius: 4,
        flex: 1,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ViewFieldsScreen;
