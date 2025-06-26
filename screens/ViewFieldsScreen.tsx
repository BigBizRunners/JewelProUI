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

const FIELDS_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/getCategoryFields";
const MANAGE_FIELD_API_URL = "https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/manageCategoryField";

const ViewFieldsScreen = ({ navigation, route }) => {
    const { categoryId, isOrderFields } = route.params;
    const { data: responseData, error, loading, fetchData } = useAuthenticatedFetch(navigation);

    const [fields, setFields] = useState([]);
    const [selectedField, setSelectedField] = useState(null);
    const [isActionModalVisible, setActionModalVisible] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        navigation.setOptions({
            title: isOrderFields ? 'Order Form Fields' : 'Repair Form Fields',
        });
    }, [navigation, isOrderFields]);

    useEffect(() => {
        if (responseData?.fields) {
            setFields(responseData.fields);
        }
    }, [responseData]);

    useEffect(() => {
        const unsubscribeFocus = navigation.addListener('focus', () => {
            fetchData({
                url: FIELDS_API_URL,
                method: 'POST',
                data: { categoryId, isOrderFields },
            });
        });

        return unsubscribeFocus;
    }, [navigation, fetchData, categoryId, isOrderFields]);


    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: !isDeleting,
        });
    }, [navigation, isDeleting]);

    const openActionModal = (field) => {
        if (!isDeleting) {
            setSelectedField(field);
            setActionModalVisible(true);
        }
    };

    const closeActionModal = () => {
        if (!isDeleting) {
            setActionModalVisible(false);
            setSelectedField(null);
        }
    };

    const navigateToEditDropdownOptions = (field) => {
        closeActionModal();
        navigation.navigate('EditDropdownOptions', {
            field,
            categoryId,
            isOrderFields,
        });
    };

    const navigateToAddField = () => {
        navigation.navigate('ManageCategoryFields', {
            categoryId,
            isOrderFields,
            field: null,
            onFieldUpdated: () => {
                fetchData({
                    url: FIELDS_API_URL,
                    method: 'POST',
                    data: { categoryId, isOrderFields },
                });
            },
        });
    };

    const handleModifyField = () => {
        closeActionModal();
        navigation.navigate('ManageCategoryFields', {
            categoryId,
            isOrderFields,
            field: selectedField,
            onFieldUpdated: () => {
                fetchData({
                    url: FIELDS_API_URL,
                    method: 'POST',
                    data: { categoryId, isOrderFields },
                });
            },
        });
    };

    const handleDeleteField = async () => {
        closeActionModal();
        Alert.alert(
            'Delete Field',
            `Are you sure you want to delete the field "${selectedField?.fieldName}"?`,
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
                        } catch (error) {
                            console.error("Delete error:", error);
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

    const normalizeFieldType = (fieldType) => {
        const typeMap = {
            "TEXT": "Text",
            "SMALL_TEXT": "Small Text",
            "LARGE_TEXT": "Large Text",
            "NOTE": "Note",
            "DROPDOWN_OPTIONS": "Dropdown",
            "MULTI_SELECT_DROPDOWN_OPTIONS": "Multi-select",
        };
        return typeMap[fieldType] || fieldType;
    };

    const renderFieldItem = ({ item }) => (
        <TouchableOpacity
            style={styles.fieldItem}
            onPress={() => openActionModal(item)}
            disabled={isDeleting}
        >
            <Text style={styles.fieldName}>{item.fieldName}</Text>
            <View style={styles.fieldTypeContainer}>
                <Text style={styles.fieldType}>{normalizeFieldType(item.fieldType)}</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#888" />
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
                <>
                    <FlatList
                        data={fields}
                        keyExtractor={(item) => item.fieldId}
                        renderItem={renderFieldItem}
                        ItemSeparatorComponent={() => <View style={styles.separator} />}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={<Text style={styles.emptyText}>No fields available. Add one to get started.</Text>}
                    />
                    <TouchableOpacity style={styles.addFieldButton} onPress={navigateToAddField} disabled={isDeleting}>
                        <Text style={styles.addFieldText}>Add Field</Text>
                    </TouchableOpacity>
                </>
            )}

            {isDeleting && (
                <View style={styles.overlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.deletingText}>Deleting field...</Text>
                </View>
            )}

            <Modal
                visible={isActionModalVisible}
                transparent
                animationType="slide"
                onRequestClose={closeActionModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>{selectedField?.fieldName}</Text>
                        <TouchableOpacity style={styles.modalOption} onPress={handleModifyField} disabled={isDeleting}>
                            <Text style={styles.modalOptionText}>Modify Field</Text>
                        </TouchableOpacity>
                        {(selectedField?.fieldType === "DROPDOWN_OPTIONS" || selectedField?.fieldType === "MULTI_SELECT_DROPDOWN_OPTIONS") && (
                            <TouchableOpacity style={styles.modalOption} onPress={() => navigateToEditDropdownOptions(selectedField)} disabled={isDeleting}>
                                <Text style={styles.modalOptionText}>Edit Dropdown Options</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.modalOption} onPress={handleDeleteField} disabled={isDeleting}>
                            <Text style={[styles.modalOptionText, { color: 'red' }]}>Delete Field</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalOption, { marginTop: 10, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 }]}
                            onPress={closeActionModal}
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
        paddingBottom: 60,
    },
    fieldItem: {
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
        fontSize: 14,
        color: '#666',
        marginRight: 8,
    },
    separator: {
        height: 1,
        backgroundColor: '#f0f0f0',
        marginVertical: 2,
    },
    addFieldButton: {
        backgroundColor: '#075E54',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 10,
        marginBottom: 20,
    },
    addFieldText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
    emptyText: {
        textAlign: 'center',
        padding: 20,
        color: '#666',
        marginTop: 50,
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
    overlay: {
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

export default ViewFieldsScreen;
