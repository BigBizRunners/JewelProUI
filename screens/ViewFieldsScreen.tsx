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
const UPDATE_FIELD_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/updateCategoryField";

const ViewFieldsScreen = ({ navigation, route }: any) => {
    const { categoryId, isOrderFields } = route.params;
    const { data: responseData, error, loading, fetchData } = useAuthenticatedFetch(navigation, {
        url: FIELDS_API_URL,
        method: 'POST',
        data: { categoryId, isOrderFields },
        autoFetch: true,
    });

    const [fields, setFields] = useState([]);
    const [selectedField, setSelectedField] = useState(null);
    const [dropdownOptions, setDropdownOptions] = useState([]);
    const [newOption, setNewOption] = useState('');
    const [isModalVisible, setModalVisible] = useState(false);

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

    const openDropdownModal = (field : any) => {
        setSelectedField(field);
        setDropdownOptions(field.fieldDetails?.options || []);
        setModalVisible(true);
    };

    const addDropdownOption = () => {
        if (!newOption.trim()) return;
        // @ts-ignore
        setDropdownOptions([...dropdownOptions, newOption.trim()]);
        setNewOption('');
    };

    const removeDropdownOption = (option : any) => {
        setDropdownOptions(dropdownOptions.filter(opt => opt !== option));
    };

    const saveDropdownOptions = async () => {
        if (!selectedField) return;

        const updatedField = {
            ...selectedField,
            fieldDetails: { options: dropdownOptions },
        };

        const response = await fetchData({
            url: UPDATE_FIELD_API_URL,
            method: 'POST',
            data: updatedField,
        });

        if (response && response.status === "success") {
            // @ts-ignore
            setFields(fields.map(f => f.fieldId === selectedField.fieldId ? updatedField : f));
            setModalVisible(false);
            Alert.alert("Success", "Dropdown options updated successfully");
        } else {
            Alert.alert("Error", response?.errorMessage || "Failed to update dropdown options");
        }
    };

    const navigateToAddField = () => {
        navigation.navigate('ManageCategoryFields', {
            categoryId,
            isOrderFields,
            onFieldAdded: async (...args: any) => { // Explicitly ignore arguments
                console.log("onFieldAdded triggered with args:", args); // Debug
                try {
                    const refreshedData = await fetchData({
                        url: FIELDS_API_URL,
                        method: 'POST',
                        data: { categoryId, isOrderFields },
                    });
                    console.log("Refetched fields:", JSON.stringify(refreshedData?.fields, null, 2)); // Debug
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

    const normalizeFieldType = (fieldType: any) => {
        switch (fieldType) {
            case "TEXT": return "Text";
            case "DROPDOWN_OPTIONS": return "Dropdown Options";
            case "MULTI_SELECT_DROPDOWN_OPTIONS": return "Multi-select Dropdown Options";
            default: return fieldType;
        }
    };

    // @ts-ignore
    const renderFieldItem = ({ item }) => (
        <View key={item.fieldId} style={styles.fieldItem}>
            <Text style={styles.fieldName}>{item.fieldName}</Text>
            <View style={styles.fieldTypeContainer}>
                <Text style={styles.fieldType}>{normalizeFieldType(item.fieldType)}</Text>
                {(item.fieldType === "DROPDOWN_OPTIONS" || item.fieldType === "MULTI_SELECT_DROPDOWN_OPTIONS") && (
                    <TouchableOpacity onPress={() => openDropdownModal(item)}>
                        <MaterialCommunityIcons name="pencil" size={20} color="#075E54" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
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
                    <TouchableOpacity style={styles.addFieldButton} onPress={navigateToAddField}>
                        <MaterialCommunityIcons name="plus" size={24} color="#fff" />
                        <Text style={styles.addFieldText}>Add Field</Text>
                    </TouchableOpacity>
                </View>
            )}

            <Modal
                visible={isModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
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
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
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
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333',
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
