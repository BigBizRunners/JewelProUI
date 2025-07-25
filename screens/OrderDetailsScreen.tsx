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
    Modal,
    Pressable,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useAuthenticatedFetch from '../hooks/useAuthenticatedFetch';

// --- API URLs ---
const GET_ORDER_DETAILS_API_URL = process.env.EXPO_PUBLIC_API_URL_GET_ORDER_DETAILS;
const CHANGE_ORDER_STATUS_API_URL = process.env.EXPO_PUBLIC_API_URL_CHANGE_ORDER_STATUS;
const DELETE_ORDER_API_URL = process.env.EXPO_PUBLIC_API_URL_DELETE_ORDER;

// --- Reusable Components ---

const DetailRow = ({ icon, label, value }) => (
    <View style={styles.detailRow}>
        <MaterialCommunityIcons name={icon} size={20} color="#555" style={styles.detailIcon} />
        <Text style={styles.detailLabel}>{label}:</Text>
        <Text style={styles.detailValue}>{value}</Text>
    </View>
);

const DynamicFieldsSection = ({ title, fields }) => {
    if (!fields || fields.length === 0) {
        return null;
    }

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {fields.map((field) => {
                const displayValue = field.value?.values?.join(', ') || 'N/A';
                return <DetailRow key={field.fieldId} icon="tune" label={field.fieldName} value={displayValue} />;
            })}
        </View>
    );
};

// --- Main Screen Component ---

const OrderDetailsScreen = ({ route, navigation }) => {
    const { orderId } = route.params;
    // Hook for fetching order details (the main query)
    const { data, error, loading, fetchData: fetchOrderDetails } = useAuthenticatedFetch(navigation);

    // A dedicated hook for the status update mutation
    const {
        data: updateResponse,
        error: updateError,
        loading: isUpdatingStatus,
        fetchData: changeOrderStatus,
    } = useAuthenticatedFetch(navigation);

    // A dedicated hook for the delete mutation
    const {
        data: deleteResponse,
        error: deleteError,
        loading: isDeleting,
        fetchData: deleteOrder,
    } = useAuthenticatedFetch(navigation);

    // State for image viewer modal
    const [selectedImage, setSelectedImage] = useState(null);
    const [isImageModalVisible, setIsImageModalVisible] = useState(false);

    // State for status change modal
    const [isStatusModalVisible, setIsStatusModalVisible] = useState(false);

    // --- Action Handlers ---

    const handleDeletePress = () => {
        Alert.alert(
            "Delete Order",
            "Are you sure you want to delete this order? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteOrder({
                            url: DELETE_ORDER_API_URL,
                            method: 'POST', // Assuming POST, could be DELETE
                            data: { orderId },
                        });
                    },
                },
            ]
        );
    };

    // Set navigation options and disable gestures during updates
    useEffect(() => {
        navigation.setOptions({
            title: `Order #${orderId.substring(0, 8)}...`,
            gestureEnabled: !isUpdatingStatus && !isDeleting,
            headerRight: () => (
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity
                        onPress={() => {
                            if (data && data.orderDetails) {
                                navigation.navigate('CreateOrder', { orderDetails: data.orderDetails });
                            }
                        }}
                        disabled={isUpdatingStatus || isDeleting || !data?.orderDetails}
                        style={{ marginRight: 15 }}
                    >
                        <MaterialCommunityIcons name="pencil" size={24} color="#fff" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleDeletePress}
                        disabled={isUpdatingStatus || isDeleting}
                        style={{ marginRight: 15 }}
                    >
                        <MaterialCommunityIcons name="delete" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
            ),
        });
    }, [navigation, orderId, isUpdatingStatus, isDeleting, data]);

    // Initial fetch of order details when the component mounts or orderId changes
    useEffect(() => {
        if (orderId) {
            fetchOrderDetails({
                url: GET_ORDER_DETAILS_API_URL,
                method: 'POST',
                data: { orderId },
            });
        }
    }, [orderId]);

    // Handle the result of the status update operation
    useEffect(() => {
        if (!isUpdatingStatus) {
            if (updateError) {
                Alert.alert("Error", updateError.message || "Failed to update status.");
            } else if (updateResponse) {
                Alert.alert("Success", "Order status has been updated.");
                fetchOrderDetails({
                    url: GET_ORDER_DETAILS_API_URL,
                    method: 'POST',
                    data: { orderId },
                });
            }
        }
    }, [isUpdatingStatus, updateResponse, updateError]);

    // Handle the result of the delete operation
    useEffect(() => {
        if (!isDeleting) {
            if (deleteError) {
                Alert.alert("Error", deleteError.message || "Failed to delete order.");
            } else if (deleteResponse) {
                Alert.alert("Success", "Order has been deleted.", [
                    { text: "OK", onPress: () => navigation.goBack() }
                ]);
            }
        }
    }, [isDeleting, deleteResponse, deleteError, navigation]);


    const handleContactAction = (action, contactNumber) => {
        if (!contactNumber || contactNumber === 'N/A') {
            Alert.alert("No Contact", "Contact number is not available.");
            return;
        }
        const url = action === 'call' ? `tel:${contactNumber}` : `whatsapp://send?phone=${contactNumber}`;
        Linking.openURL(url).catch(() => Alert.alert("Error", "Could not perform this action."));
    };

    const openImageModal = (uri) => {
        setSelectedImage(uri);
        setIsImageModalVisible(true);
    };

    const handleDownloadPress = () => {
        // TODO: Implement PDF download functionality
        Alert.alert("Download PDF", "This feature is not yet implemented.");
    };

    const handleStatusUpdate = (newStatus) => {
        setIsStatusModalVisible(false);
        changeOrderStatus({
            url: CHANGE_ORDER_STATUS_API_URL,
            method: 'POST',
            data: {
                orderId: orderId,
                newStatusId: newStatus.id,
            },
        });
    };

    // --- Render Functions ---

    const renderStatusTracker = (history) => (
        [...history].reverse().map((item, index, arr) => (
            <View key={index} style={styles.statusItem}>
                <View style={styles.statusDotContainer}>
                    <View style={[styles.statusDot, item.current && styles.currentStatusDot]} />
                    {index < arr.length - 1 && <View style={styles.statusLine} />}
                </View>
                <View style={styles.statusDetails}>
                    <Text style={[styles.statusName, item.current && styles.currentStatusName]}>{item.statusName}</Text>
                    <Text style={styles.statusMeta}>by {item.user} on {item.date}</Text>
                </View>
            </View>
        ))
    );

    // --- Loading and Error States ---
    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Loading order details...</Text>
            </View>
        );
    }

    if (error || !data?.orderDetails) {
        return <Text style={styles.errorText}>{error?.message || "Could not load order details."}</Text>;
    }

    // --- Destructure data after loading and error checks ---
    const { clientDetails, orderInfo, statusHistory, allowedNextStatus } = data.orderDetails;
    const canChangeStatus = allowedNextStatus && allowedNextStatus.length > 0;
    const isActionInProgress = isUpdatingStatus || isDeleting;

    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                {/* Client Details Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Client Details</Text>
                    <View style={styles.clientCard}>
                        <Text style={styles.clientName}>{clientDetails.name}</Text>
                        <View style={styles.clientActions}>
                            <TouchableOpacity
                                onPress={() => handleContactAction('call', clientDetails.contactNumber)}
                                style={styles.actionButton}
                                disabled={isActionInProgress}
                            >
                                <MaterialCommunityIcons name="phone" size={24} color="#075E54" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => handleContactAction('whatsapp', clientDetails.contactNumber)}
                                style={styles.actionButton}
                                disabled={isActionInProgress}
                            >
                                <MaterialCommunityIcons name="whatsapp" size={24} color="#25D366" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.divider} />
                    <DetailRow icon="cellphone" label="Mobile" value={clientDetails.contactNumber} />
                </View>

                {/* Order Photos Section */}
                {orderInfo.imageUrls && orderInfo.imageUrls.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Order Photos</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {orderInfo.imageUrls.map((url, index) => (
                                <TouchableOpacity key={index} onPress={() => openImageModal(url)} disabled={isActionInProgress}>
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

                {/* Dynamic Fields */}
                <DynamicFieldsSection title="General Details" fields={orderInfo.generalFields} />
                <DynamicFieldsSection title="Category Specific Details" fields={orderInfo.categorySpecificFields} />

                {/* Status Tracker Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status Tracker</Text>
                    {renderStatusTracker(statusHistory)}
                </View>
            </ScrollView>

            {/* --- Bottom Action Buttons --- */}
            <View style={styles.bottomActionContainer}>
                {canChangeStatus && (
                    <TouchableOpacity
                        style={[styles.bottomActionButton, styles.changeStatusButton, isActionInProgress ? styles.disabledButton : {}]}
                        onPress={() => setIsStatusModalVisible(true)}
                        disabled={isActionInProgress}
                    >
                        <MaterialCommunityIcons name="sync" size={20} color="#fff" />
                        <Text style={styles.bottomActionButtonText}>Change Status</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity
                    style={[
                        styles.bottomActionButton,
                        styles.downloadButton,
                        isActionInProgress ? styles.disabledButton : {},
                        !canChangeStatus && styles.fullWidthButton // Make download full-width if it's the only button
                    ]}
                    onPress={handleDownloadPress}
                    disabled={isActionInProgress}
                >
                    <MaterialCommunityIcons name="download" size={20} color="#fff" />
                    <Text style={styles.bottomActionButtonText}>Download PDF</Text>
                </TouchableOpacity>
            </View>

            {/* --- Modal for Full-Screen Image --- */}
            <Modal
                visible={isImageModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => !isActionInProgress && setIsImageModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <Image source={{ uri: selectedImage }} style={styles.modalImage} resizeMode="contain" />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setIsImageModalVisible(false)}
                        disabled={isActionInProgress}
                    >
                        <MaterialCommunityIcons name="close" size={30} color="#fff" />
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* --- Modal for Changing Status --- */}
            {canChangeStatus && (
                <Modal
                    visible={isStatusModalVisible}
                    transparent={true}
                    animationType="slide"
                    onRequestClose={() => !isActionInProgress && setIsStatusModalVisible(false)}
                >
                    <Pressable
                        style={styles.statusModalBackdrop}
                        onPress={() => !isActionInProgress && setIsStatusModalVisible(false)}
                    >
                        <View style={styles.statusModalContent}>
                            <View style={styles.handleBar} />
                            <Text style={styles.statusModalTitle}>Select Next Status</Text>
                            {allowedNextStatus.map((status) => (
                                <TouchableOpacity
                                    key={status.id}
                                    style={styles.statusOption}
                                    onPress={() => handleStatusUpdate(status)}
                                    disabled={isActionInProgress}
                                >
                                    <Text style={styles.statusOptionText}>{status.name}</Text>
                                </TouchableOpacity>
                            ))}
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setIsStatusModalVisible(false)}
                                disabled={isActionInProgress}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </Pressable>
                </Modal>
            )}

            {/* --- Full-Screen Loader for Status Update or Deletion --- */}
            {isActionInProgress && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text style={styles.loadingText}>{isDeleting ? 'Deleting order...' : 'Updating status...'}</Text>
                </View>
            )}
        </View>
    );
};

// --- Styles ---
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f2f2' },
    contentContainer: { padding: 15, paddingBottom: 100 },
    loadingContainer: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#333',
    },
    errorText: { textAlign: 'center', marginTop: 30, color: 'red' },
    section: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 15, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
    clientCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    clientName: { fontSize: 20, fontWeight: '500', flexShrink: 1 },
    clientActions: { flexDirection: 'row' },
    actionButton: { marginLeft: 15, padding: 8 },
    divider: { height: 1, backgroundColor: '#eee', marginVertical: 12 },
    photo: { width: 120, height: 120, borderRadius: 8, marginRight: 10 },
    detailRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    detailIcon: { marginRight: 15 },
    detailLabel: { fontSize: 16, color: '#666', width: 100 },
    detailValue: { fontSize: 16, color: '#000', flex: 1 },
    statusItem: { flexDirection: 'row' },
    statusDotContainer: { alignItems: 'center', marginRight: 15 },
    statusDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#ccc' },
    currentStatusDot: { backgroundColor: '#075E54', borderWidth: 2, borderColor: '#fff', elevation: 2, shadowColor: '#000' },
    statusLine: { flex: 1, width: 2, backgroundColor: '#ccc' },
    statusDetails: { flex: 1, paddingBottom: 20 },
    statusName: { fontSize: 16, fontWeight: 'bold', color: '#666' },
    currentStatusName: { color: '#075E54' },
    statusMeta: { fontSize: 12, color: 'gray' },
    modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'center', alignItems: 'center' },
    modalImage: { width: '95%', height: '80%' },
    closeButton: { position: 'absolute', top: 40, right: 20, padding: 10 },
    bottomActionContainer: {
        position: 'absolute',
        bottom: 25,
        left: 15,
        right: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bottomActionButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 30,
        marginHorizontal: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    changeStatusButton: {
        backgroundColor: '#075E54',
    },
    downloadButton: {
        backgroundColor: '#007BFF',
    },
    fullWidthButton: {
        marginHorizontal: 0, // No horizontal margin when it's the only button
    },
    disabledButton: {
        backgroundColor: '#A9A9A9',
        opacity: 0.7,
    },
    bottomActionButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    statusModalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        justifyContent: 'flex-end',
    },
    statusModalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 40,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 10,
    },
    handleBar: {
        width: 40,
        height: 5,
        backgroundColor: '#ccc',
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 15,
    },
    statusModalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
        color: '#333',
    },
    statusOption: {
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    statusOptionText: {
        textAlign: 'center',
        fontSize: 17,
        fontWeight: '500',
        color: '#075E54',
    },
    cancelButton: {
        marginTop: 15,
        padding: 15,
        borderRadius: 8,
        backgroundColor: '#f1f1f1',
    },
    cancelButtonText: {
        textAlign: 'center',
        color: '#555',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default OrderDetailsScreen;
