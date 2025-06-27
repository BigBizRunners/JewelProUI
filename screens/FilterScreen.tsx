import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const FilterScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();

    // Safely get the onApply callback and current filters from the route params
    const { currentFilters = {}, onApply } = route.params || {};

    const [selectedClientIds, setSelectedClientIds] = useState(currentFilters.clientIds || []);
    const [selectedCategoryIds, setSelectedCategoryIds] = useState(currentFilters.categoryIds || []);

    const navigateToMultiSelect = (type, selectedIds) => {
        const title = type === 'clients' ? 'Select Clients' : 'Select Categories';

        // This onSave callback will be called from the MultiSelectListScreen
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
            onSave: onSave, // Pass the callback here
        });
    };

    const handleApplyFilters = () => {
        const newFilters = {};
        if (selectedClientIds.length > 0) newFilters.clientIds = selectedClientIds;
        if (selectedCategoryIds.length > 0) newFilters.categoryIds = selectedCategoryIds;

        // FIX: Call the onApply callback passed from ListOrdersScreen...
        if (onApply) {
            onApply(newFilters);
        }
        // ...and then go back to the previous screen. This fixes the issue.
        navigation.goBack();
    };

    const handleClearFilters = () => {
        setSelectedClientIds([]);
        setSelectedCategoryIds([]);

        // FIX: Call onApply with empty filters...
        if (onApply) {
            onApply({});
        }
        // ...and then go back.
        navigation.goBack();
    };

    const getSelectionText = (count, singular, plural) => {
        if (count === 0) return `All ${plural}`;
        if (count === 1) return `1 ${singular} selected`;
        return `${count} ${plural} selected`;
    };

    return (
        <View style={styles.container}>
            <ScrollView>
                <TouchableOpacity
                    style={styles.filterRow}
                    onPress={() => navigateToMultiSelect('clients', selectedClientIds)}
                >
                    <View>
                        <Text style={styles.filterLabel}>Clients</Text>
                        <Text style={styles.filterValue}>{getSelectionText(selectedClientIds.length, 'Client', 'Clients')}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.filterRow}
                    onPress={() => navigateToMultiSelect('categories', selectedCategoryIds)}
                >
                    <View>
                        <Text style={styles.filterLabel}>Categories</Text>
                        <Text style={styles.filterValue}>{getSelectionText(selectedCategoryIds.length, 'Category', 'Categories')}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
                </TouchableOpacity>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
                    <Text style={styles.clearButtonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.applyButton} onPress={handleApplyFilters}>
                    <Text style={styles.applyButtonText}>Apply Filters</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    filterLabel: {
        fontSize: 16,
        color: '#333',
    },
    filterValue: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    footer: {
        flexDirection: 'row',
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        backgroundColor: '#fff',
    },
    applyButton: {
        backgroundColor: '#075E54',
        paddingVertical: 14,
        borderRadius: 8,
        flex: 1,
        marginLeft: 10,
        alignItems: 'center',
    },
    applyButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    clearButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 14,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center',
    },
    clearButtonText: {
        color: '#333',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default FilterScreen;
