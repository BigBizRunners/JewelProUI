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
    Modal, // Import Modal for full-screen view
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
const DynamicFieldsSection = ({ title, fields }) => {
    if (!fields || Object.keys(fields).length === 0) {
        return null;
    }

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {Object.entries(fields).map(([fieldId, fieldValue]) => {
                const displayValue = fieldValue.values?.join(', ') || 'N/A';
                return <DetailRow key={fieldId} icon="tune" label={fieldId} value={displayValue} />;
            })}
        </View>
    );
};


const OrderDetailsScreen = ({ route, navigation }) => {
    const { orderId } = route.params;
    const { data, error, loading, fetchData } = useAuthenticatedFetch(navigation);
    const [selectedImage, setSelectedImage] = useState(null); // State for the selected image URI
    const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility

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

    const openImageModal = (uri) => {
        setSelectedImage(uri);
        setIsModalVisible(true);
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
        <View style={{flex: 1}}>
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
                    {/* Display the client's mobile number */}
                    <View style={styles.divider} />
                    <DetailRow icon="cellphone" label="Mobile" value={clientDetails.contactNumber} />
                </View>

                {/* Order Photos Section */}
                {orderInfo.imageUrls && orderInfo.imageUrls.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Order Photos</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {orderInfo.imageUrls.map((url, index) => (
                                <TouchableOpacity key={index} onPress={() => openImageModal(url)}>
                                    <Image source={{ uri: url }} style={styles.photo} />
                                </TouchableOpacity>
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

                <DynamicFieldsSection title="General Details" fields={orderInfo.generalFields} />
                <DynamicFieldsSection title="Category Specific Details" fields={orderInfo.categorySpecificFields} />

                {/* Status Tracker Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status Tracker</Text>
                    {renderStatusTracker(statusHistory)}
                </View>
            </ScrollView>

            {/* Modal for Full-Screen Image */}
            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setIsModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />
                    <TouchableOpacity style={styles.closeButton} onPress={() => setIsModalVisible(false)}>
                        <MaterialCommunityIcons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
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
    clientName: { fontSize: 20, fontWeight: '500', flexShrink: 1 },
    clientActions: { flexDirection: 'row' },
    actionButton: { marginLeft: 15, padding: 8 },
    divider: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 12,
    },
    photo: {
        width: 120, // Increased size
        height: 120, // Increased size
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
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalImage: {
        width: '95%',
        height: '80%',
    },
    closeButton: {
        position: 'absolute',
        top: 40,
        right: 20,
        padding: 10,
    },
});

export default OrderDetailsScreen;
