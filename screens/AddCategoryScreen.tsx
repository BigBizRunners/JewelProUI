import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    ScrollView,
    Platform
} from 'react-native';

const AddCategoryScreen = ({ navigation, route }: any) => {
    const [categoryName, setCategoryName] = useState('');
    const [minDays, setMinDays] = useState('');
    const [bufferDays, setBufferDays] = useState('');
    const [quantityUnit, setQuantityUnit] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddCategory = async () => {
        if (categoryName.trim() === '' || minDays.trim() === '' || bufferDays.trim() === '' || quantityUnit.trim() === '') return;

        const newCategory = {
            name: categoryName,
            minDays: Number(minDays),
            bufferDays: Number(bufferDays),
            quantityUnit,
        };

        setLoading(true);

        try {
            const response = await fetch('https://your-api-endpoint.com/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newCategory),
            });

            if (!response.ok) {
                throw new Error('Failed to add category');
            }

            const responseData = await response.json();
            route.params?.addCategory(responseData);
            navigation.goBack();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <Text style={styles.label}>Category Name <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter category name"
                    value={categoryName}
                    onChangeText={setCategoryName}
                />
                <Text style={styles.label}>Minimum Days For Due Date <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter minimum days"
                    keyboardType="numeric"
                    value={minDays}
                    onChangeText={setMinDays}
                />
                <Text style={styles.label}>Buffer Days For Due Date <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter buffer days"
                    keyboardType="numeric"
                    value={bufferDays}
                    onChangeText={setBufferDays}
                />
                <Text style={styles.label}>Quantity Unit (Eg. pcs) <Text style={styles.required}>*</Text></Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter quantity unit"
                    value={quantityUnit}
                    onChangeText={setQuantityUnit}
                />
            </ScrollView>
            <View style={styles.footerContainer}>
                <TouchableOpacity style={styles.addButton} onPress={handleAddCategory} disabled={loading}>
                    <Text style={styles.addButtonText}>{loading ? 'Adding...' : 'ADD CATEGORY'}</Text>
                </TouchableOpacity>
            </View>
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
    scrollView: {
        padding: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#000',
    },
    required: {
        color: 'red',
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 20,
        fontSize: 16,
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
        marginLeft: 8
    },
});

export default AddCategoryScreen;
