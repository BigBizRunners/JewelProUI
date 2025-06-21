import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Linking,
    Alert,
    Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

const GET_ORDER_DETAILS_API_URL = 'https://vbxy1ldisi.execute-api.ap-south-1.amazonaws.com/Dev/getOrderDetails';

// A generic component to render a row of details
const DetailRow = ({ icon, label, value }) => (
    <View style={styles.detailRow}>
        <MaterialCommunityIcons name={icon} size={20} color="#555" style={styles.detailIcon} />
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

// A new component to render the dynamic fields from the map
const DynamicFieldsSection = ({ title, fields, fieldDetails }) => {
    if (!fields || Object.keys(fields).length === 0) {
        return null;
    }

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {Object.entries(fields).map(([fieldId, fieldValue]) => {
                // Find the field's display name from the fieldDetails map if available
                const fieldName = fieldDetails?.[fieldId]?.fieldName || fieldId;
                // Join array values for display
                const displayValue = fieldValue.values?.join(', ') || 'N/A';
                return <DetailRow key={fieldId} icon="tune" label={fieldName} value={displayValue} />;
            })}
        </View>
    );
};


const OrderDetailsScreen = ({ route, navigation }) => {
    const { orderId } = route.params;
    const { data, error, loading, fetchData } = useAuthenticatedFetch(navigation);
    // You might need to fetch the field definitions to get friendly names
    // For now, we will use the fieldId as the label.

    useEffect(() => {
        fetchData({
            url: GET_ORDER_DETAILS_API_URL,
            method: 'POST',
            data: { orderId },
        });
        navigation.setOptions({ title: `Order #${orderId.substring(0, 8)}...` });
    }, [orderId]);

    const handleAction = (action, contactNumber) => {
        if (!contactNumber || contactNumber === 'N/A') {
            Alert.alert("No Contact", "Contact number is not available.");
            return;
        }
        const url = action === 'call' ? `tel:${contactNumber}` : `whatsapp://send?phone=${contactNumber}`;
        Linking.openURL(url).catch(() => Alert.alert("Error", "Could not perform this action."));
    };

    const renderStatusTracker = (history) => (
        history.map((item, index) => (
            <View key={index} style={styles.statusItem}>
                <View style={styles.statusDotContainer}>
                    <View style={[styles.statusDot, item.isCurrent && styles.currentStatusDot]} />
                    {index < history.length - 1 && <View style={styles.statusLine} />}
                </View>
                <View style={styles.statusDetails}>
                    <Text style={[styles.statusName, item.isCurrent && styles.currentStatusName]}>{item.statusName}</Text>
                    <Text style={styles.statusMeta}>by {item.user} on {item.date}</Text>
                </View>
            </View>
        ))
    );

    if (loading) {
        return <ActivityIndicator size="large" style={styles.centered} />;
    }

    if (error || !data?.orderDetails) {
        return <Text style={styles.errorText}>{error || "Could not load order details."}</Text>;
    }

    const { clientDetails, orderInfo, statusHistory } = data.orderDetails;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Client Details Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Client Details</Text>
                <View style={styles.clientCard}>
                    <Text style={styles.clientName}>{clientDetails.name}</Text>
                    <View style={styles.clientActions}>
                        <TouchableOpacity onPress={() => handleAction('call', clientDetails.contactNumber)} style={styles.actionButton}>
                            <MaterialCommunityIcons name="phone" size={24} color="#075E54" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleAction('whatsapp', clientDetails.contactNumber)} style={styles.actionButton}>
                            <MaterialCommunityIcons name="whatsapp" size={24} color="#25D366" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Order Photos Section */}
            {orderInfo.imageUrls && orderInfo.imageUrls.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Photos</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {orderInfo.imageUrls.map((url, index) => (
                            <Image key={index} source={{ uri: url }} style={styles.photo} />
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Order Information Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Information</Text>
                <DetailRow icon="calendar" label="Order Date" value={orderInfo.orderDate} />
                <DetailRow icon="calendar-check" label="Due Date" value={orderInfo.deliveryDueDate} />
                <DetailRow icon="tag" label="Category" value={orderInfo.categoryName} />
                <DetailRow icon="format-list-numbered" label="Quantity" value={String(orderInfo.quantity)} />
                <DetailRow icon="weight" label="Weight" value={orderInfo.weight} />
                <DetailRow icon="priority-high" label="Priority" value={orderInfo.priority} />
                <DetailRow icon="text" label="Narration" value={orderInfo.narration} />
            </View>

            {/* --- NEW: Display dynamic fields --- */}
            <DynamicFieldsSection title="General Details" fields={orderInfo.generalFields} />
            <DynamicFieldsSection title="Category Specific Details" fields={orderInfo.categorySpecificFields} />

            {/* Status Tracker Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Status Tracker</Text>
                {renderStatusTracker(statusHistory)}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f2' },
    contentContainer: { padding: 15, paddingBottom: 40 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { textAlign: 'center', marginTop: 30, color: 'red' },
    section: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
    clientCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    clientName: { fontSize: 20, fontWeight: '500' },
    clientActions: { flexDirection: 'row' },
    actionButton: { marginLeft: 15, padding: 8 },
    photo: {
        width: 100,
        height: 100,
        borderRadius: 8,
        marginRight: 10,
    },
    detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    detailIcon: { marginRight: 15 },
    detailLabel: { fontSize: 16, color: '#666', width: 100 },
    detailValue: { fontSize: 16, color: '#000', flex: 1 },
    statusItem: { flexDirection: 'row' },
    statusDotContainer: { alignItems: 'center', marginRight: 15 },
    statusDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#ccc' },
    currentStatusDot: { backgroundColor: '#075E54', borderWidth: 2, borderColor: '#fff' },
    statusLine: { flex: 1, width: 2, backgroundColor: '#ccc' },
    statusDetails: { flex: 1, paddingBottom: 20 },
    statusName: { fontSize: 16, fontWeight: 'bold', color: '#666' },
    currentStatusName: { color: '#075E54' },
    statusMeta: { fontSize: 12, color: 'gray' },
});

export default OrderDetailsScreen;
