import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    FlatList,
    Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { Video } from 'expo-av';

const MAX_MEDIA = 5;
const MAX_PDFS = 2; // Changed to 2
const MAX_VIDEO_DURATION = 30; // seconds

const MediaUploader = ({ mediaFiles, setMediaFiles, pdfFiles, setPdfFiles }: any) => {
    const pickMediaFiles = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                allowsMultipleSelection: true,
                selectionLimit: MAX_MEDIA - mediaFiles.length,
                quality: 1,
                videoMaxDuration: MAX_VIDEO_DURATION,
            });

            if (!result.canceled) {
                const filteredAssets = result.assets.filter(asset =>
                    asset.type === 'video'
                        ? asset.duration <= MAX_VIDEO_DURATION
                        : true
                );

                if (filteredAssets.length !== result.assets.length) {
                    Alert.alert('Some videos exceeded 30 seconds and were skipped.');
                }

                const newFiles = filteredAssets.map(asset => ({
                    ...asset,
                    type: asset.type === 'video' ? 'video' : asset.type,
                }));

                const updatedFiles = [...mediaFiles, ...newFiles].slice(0, MAX_MEDIA);
                setMediaFiles(updatedFiles);
            }
        } catch (error) {
            console.error('Media Picker Error:', error);
            Alert.alert('Error', 'Failed to select media files');
        }
    };

    const pickPdfFile = async () => {
        try {
            const res = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
            });

            console.log('PDF Picker Result:', JSON.stringify(res, null, 2));

            if (!res.canceled && res.assets && res.assets.length > 0) {
                const asset = res.assets[0];
                if (pdfFiles.length >= MAX_PDFS) {
                    Alert.alert('Error', 'Maximum of 2 PDFs can be uploaded.');
                    return;
                }
                const pdfData = {
                    uri: asset.uri,
                    name: asset.name || asset.uri.split('/').pop() || 'document.pdf',
                    type: 'pdf',
                };
                setPdfFiles([...pdfFiles, pdfData]);
                console.log('Added PDF:', pdfData);
            } else if (res.canceled) {
                console.log('PDF selection canceled');
            } else {
                Alert.alert('Error', 'Failed to select PDF');
            }
        } catch (error) {
            console.error('PDF Picker Error:', error);
            Alert.alert('Error', 'An error occurred while selecting the PDF');
        }
    };

    const removeMedia = (uri: string) => {
        setMediaFiles(mediaFiles.filter(file => file.uri !== uri));
    };

    const removePdf = (uri: string) => {
        setPdfFiles(pdfFiles.filter(file => file.uri !== uri));
    };

    const renderMediaItem = ({ item }: any) => (
        <View style={styles.previewItem}>
            {item.type === 'video' ? (
                <Video
                    source={{ uri: item.uri }}
                    style={styles.previewMedia}
                    resizeMode="cover"
                    isMuted
                    shouldPlay={false}
                />
            ) : (
                <Image source={{ uri: item.uri }} style={styles.previewMedia} />
            )}
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeMedia(item.uri)}
            >
                <MaterialCommunityIcons name="close" size={16} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    const renderPdfItem = ({ item }: any) => (
        <View style={styles.previewItem}>
            <View style={styles.previewMedia}>
                <MaterialCommunityIcons name="file-pdf-box" size={24} color="#075E54" style={styles.pdfIcon} />
                <Text style={styles.pdfPreviewName} numberOfLines={1}>
                    {item.name || 'document.pdf'}
                </Text>
            </View>
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePdf(item.uri)}
            >
                <MaterialCommunityIcons name="close" size={16} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    const isPdfButtonDisabled = pdfFiles.length >= MAX_PDFS;

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                Media Files <Text style={styles.required}>*</Text>
            </Text>
            <FlatList
                data={mediaFiles}
                horizontal
                renderItem={renderMediaItem}
                keyExtractor={(item) => item.uri}
                style={styles.mediaList}
                contentContainerStyle={styles.mediaListContent}
                ListFooterComponent={
                    mediaFiles.length < MAX_MEDIA ? (
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={pickMediaFiles}
                            activeOpacity={0.7}
                        >
                            <MaterialCommunityIcons name="plus" size={24} color="#075E54" />
                        </TouchableOpacity>
                    ) : null
                }
            />
            <Text style={styles.label}>
                PDF Files <Text style={styles.required}>*</Text> (Max {MAX_PDFS})
            </Text>
            <FlatList
                data={pdfFiles}
                horizontal
                renderItem={renderPdfItem}
                keyExtractor={(item) => item.uri}
                style={styles.mediaList}
                contentContainerStyle={styles.mediaListContent}
                ListEmptyComponent={() => (
                    <Text style={styles.emptyText}>No PDFs uploaded</Text>
                )}
            />
            <TouchableOpacity
                style={[
                    styles.pdfUploadButton,
                    isPdfButtonDisabled && styles.pdfUploadButtonDisabled,
                ]}
                onPress={pickPdfFile}
                disabled={isPdfButtonDisabled}
                activeOpacity={0.7}
            >
                <Text
                    style={[
                        styles.pdfUploadText,
                        isPdfButtonDisabled && styles.pdfUploadTextDisabled,
                    ]}
                >
                    Add PDF
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 20,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 5,
    },
    required: {
        color: 'red',
    },
    mediaList: {
        marginBottom: 10,
    },
    mediaListContent: {
        paddingRight: 10,
    },
    previewItem: {
        position: 'relative',
        marginRight: 10,
        overflow: 'visible',
    },
    previewMedia: {
        width: 80,
        height: 80,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#ccc',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    pdfIcon: {
        marginBottom: 5,
    },
    pdfPreviewName: {
        fontSize: 10,
        color: '#333',
        textAlign: 'center',
        paddingHorizontal: 5,
    },
    addButton: {
        width: 80,
        height: 80,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 4,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    removeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: '#075E54',
        borderRadius: 10,
        padding: 5,
    },
    pdfUploadButton: {
        borderWidth: 1,
        borderColor: '#075E54',
        borderRadius: 4,
        paddingVertical: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginBottom: 10,
    },
    pdfUploadButtonDisabled: {
        borderColor: '#999',
        opacity: 0.5,
    },
    pdfUploadText: {
        color: '#075E54',
        fontSize: 16,
        fontWeight: '600',
    },
    pdfUploadTextDisabled: {
        color: '#999',
    },
    emptyText: {
        fontSize: 14,
        color: '#767577',
        marginVertical: 10,
    },
});

export default MediaUploader;
