import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FilterScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    const { currentFilters = {}, onApply } = route.params || {};

    // Store the initial filters to compare against for changes
    const initialFiltersRef = useRef(currentFilters);

    const [selectedClientIds, setSelectedClientIds] = useState(currentFilters.clientIds || []);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState(currentFilters.categoryIds || []);
    const [isDirty, setIsDirty] = useState(false);

    // Check if filters have changed from their initial state
    useEffect(() => {
        const initialClients = JSON.stringify(initialFiltersRef.current.clientIds?.sort() || []);
        const currentClients = JSON.stringify([...selectedClientIds].sort());

        const initialCategories = JSON.stringify(initialFiltersRef.current.categoryIds?.sort() || []);
        const currentCategories = JSON.stringify([...selectedCategoryIds].sort());

        if (initialClients !== currentClients || initialCategories !== currentCategories) {
            setIsDirty(true);
        } else {
            setIsDirty(false);
        }
    }, [selectedClientIds, selectedCategoryIds]);


    const navigateToMultiSelect = (type, selectedIds) => {
        const title = type === 'clients' ? 'Select Clients' : 'Select Categories';

        const onSave = (newSelectedIds) => {
            if (type === 'clients') {
                setSelectedClientIds(newSelectedIds);
            } else if (type === 'categories') {
                setSelectedCategoryIds(newSelectedIds);
            }
        };

        navigation.navigate('MultiSelectList', {
            title,
            selectedIds,
            selectionType: type,
            onSave: onSave,
        });
    };

    const handleApplyFilters = () => {
        if (onApply) {
            const newFilters = {};
            if (selectedClientIds.length > 0) newFilters.clientIds = selectedClientIds;
            if (selectedCategoryIds.length > 0) newFilters.categoryIds = selectedCategoryIds;
            onApply(newFilters);
        }
        navigation.goBack();
    };

    const handleClearFilters = () => {
        setSelectedClientIds([]);
        setSelectedCategoryIds([]);
    };

    const getSelectionText = (count, singular, plural) => {
        if (count === 0) return `All ${plural}`;
        if (count === 1) return `1 ${singular} selected`;
        return `${count} ${plural} selected`;
    };

    const hasActiveSelections = selectedClientIds.length > 0 || selectedCategoryIds.length > 0;

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <Text style={styles.label}>Clients</Text>
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => navigateToMultiSelect('clients', selectedClientIds)}
                >
                    <View style={styles.dropdownContainer}>
                        <Text style={styles.dropdownText}>
                            {getSelectionText(selectedClientIds.length, 'Client', 'Clients')}
                        </Text>
                        <MaterialCommunityIcons name="chevron-down" size={20} color="#888" />
                    </View>
                </TouchableOpacity>

                <Text style={styles.label}>Categories</Text>
                <TouchableOpacity
                    style={styles.input}
                    onPress={() => navigateToMultiSelect('categories', selectedCategoryIds)}
                >
                    <View style={styles.dropdownContainer}>
                        <Text style={styles.dropdownText}>
                            {getSelectionText(selectedCategoryIds.length, 'Category', 'Categories')}
                        </Text>
                        <MaterialCommunityIcons name="chevron-down" size={20} color="#888" />
                    </View>
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity
                    style={[styles.button, styles.clearButton, !hasActiveSelections && styles.disabledButton]}
                    onPress={handleClearFilters}
                    disabled={!hasActiveSelections}
                >
                    <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.button, styles.applyButton, !isDirty && styles.disabledButton]}
                    onPress={handleApplyFilters}
                    disabled={!isDirty}
                >
                    <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
    },
    scrollView: {
        padding: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#000',
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 20,
        backgroundColor: 'transparent', // Ensure no background color
    },
    dropdownContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownText: {
        fontSize: 16,
        color: '#333',
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    button: {
        paddingVertical: 14,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },
    applyButton: {
        backgroundColor: '#075E54',
        marginLeft: 10,
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    clearButton: {
        backgroundColor: '#f0f0f0',
    },
    clearButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.5,
    },
});

export default FilterScreen;
