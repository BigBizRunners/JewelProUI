import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Alert,
    KeyboardAvoidingView,
    StyleSheet,
    Platform,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const SelectAllowedStatusesScreen = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { allStatuses = [], selectedStatuses = [], currentStatusId, onSave } = route.params || {};
    const [selectedStatusesState, setSelectedStatusesState] = useState<{ statusId: string; statusName: string; isSelected: boolean }[]>([]);

    useEffect(() => {
        console.log('Initial allStatuses:', JSON.stringify(allStatuses));
        const updatedStatuses = allStatuses.map(status => ({
            statusId: status.statusId,
            statusName: status.statusName || status.name,
            isSelected: selectedStatuses.some(s => s.statusId === status.statusId && s.isSelected),
        }));
        setSelectedStatusesState(updatedStatuses);
        console.log('Initial selectedStatusesState:', JSON.stringify(updatedStatuses));
    }, [allStatuses, selectedStatuses]);

    useEffect(() => {
        navigation.setOptions({
            title: 'Select Allowed Statuses',
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 15 }}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);

    const handleSave = () => {
        // if (selectedStatusesState.filter(s => s.isSelected).length === 0) {
        //     Alert.alert('Error', 'Please select at least one status');
        //     return;
        // }
        const filteredSelectedStatuses = selectedStatusesState.filter(s => s.isSelected);
        console.log('Saving selected statuses:', JSON.stringify(filteredSelectedStatuses));
        if (onSave) {
            onSave(filteredSelectedStatuses); // Call the callback to update parent state
        }
        navigation.goBack(); // Return to previous screen
    };

    const renderStatusItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.statusItem}
            onPress={() => {
                setSelectedStatusesState(prev =>
                    prev.map(s =>
                        s.statusId === item.statusId ? { ...s, isSelected: !s.isSelected } : s
                    )
                );
                console.log('Toggled:', item.statusName, 'isSelected:', !item.isSelected);
            }}
        >
            <Text style={styles.statusText}>{item.statusName}</Text>
            {item.isSelected && <Text style={styles.selectedIndicator}>✓</Text>}
        </TouchableOpacity>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container} keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
            <FlatList
                data={selectedStatusesState.filter(s => s.statusId !== currentStatusId)}
                renderItem={renderStatusItem}
                keyExtractor={(item) => item.statusId}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={<Text style={styles.emptyText}>No statuses available</Text>}
            />
            <TouchableOpacity
                style={[styles.addButton]}
                onPress={handleSave}
                activeOpacity={0.7}
            >
                <Text style={styles.addButtonText}>Save</Text>
            </TouchableOpacity>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9f9f9',
        paddingHorizontal: 5,
        paddingTop: 5,
    },
    listContent: {
        padding: 20,
        paddingBottom: 80,
    },
    statusItem: {
        paddingVertical: 15,
        paddingHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    statusText: {
        fontSize: 16,
        color: '#333',
    },
    selectedIndicator: {
        fontSize: 18,
        color: '#075E54',
        fontWeight: 'bold',
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
        marginHorizontal: 20,
        justifyContent: 'center',
    },
    disabledButton: {
        backgroundColor: '#A9A9A9',
        opacity: 0.6,
    },
    addButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    separator: {
        height: 1,
        backgroundColor: '#e0e0e0',
    },
    emptyText: {
        textAlign: 'center',
        padding: 20,
        color: '#666',
    },
});

export default SelectAllowedStatusesScreen;
