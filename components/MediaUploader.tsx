import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    StyleSheet,
    FlatList,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

const MAX_MEDIA = 5;

const MediaUploader = ({ mediaFiles, setMediaFiles, onRemoveMedia, required = false }: any) => {
    const pickMediaFiles = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                selectionLimit: MAX_MEDIA - mediaFiles.length,
                quality: 1, // Start with high quality, will compress next
            });

            if (result.canceled) {
                return;
            }

            // --- Immediate UI Update with Placeholders ---
            const newFilesWithPlaceholders = result.assets.map(asset => ({
                ...asset,
                type: 'image',
                compressing: true, // Flag to show loading indicator
                originalUri: asset.uri, // Keep track of the original URI
            }));

            const updatedFiles = [...mediaFiles, ...newFilesWithPlaceholders].slice(0, MAX_MEDIA);
            setMediaFiles(updatedFiles);

            // --- Background Compression ---
            result.assets.forEach(asset => {
                compressAndReplace(asset);
            });

        } catch (error) {
            console.error('Media Picker Error:', error);
            Alert.alert('Error', 'Failed to select media files');
        }
    };

    const compressAndReplace = async (asset) => {
        try {
            const manipResult = await ImageManipulator.manipulateAsync(
                asset.uri,
                [{ resize: { width: 1024 } }],
                { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );

            // Replace the placeholder with the compressed file
            setMediaFiles(currentFiles =>
                currentFiles.map(file =>
                    file.originalUri === asset.uri
                        ? { ...file, ...manipResult, uri: manipResult.uri, compressing: false }
                        : file
                )
            );
        } catch (error) {
            console.error('Image Manipulation Error:', error);
            // Optionally remove the file or show an error icon
            setMediaFiles(currentFiles =>
                currentFiles.filter(file => file.originalUri !== asset.uri)
            );
            Alert.alert('Error', `Failed to process image: ${asset.fileName || 'selected image'}`);
        }
    };


    const removeMedia = (uri: string) => {
        if (onRemoveMedia) {
            onRemoveMedia(uri);
        } else {
            setMediaFiles(mediaFiles.filter(file => file.uri !== uri));
        }
    };

    const renderMediaItem = ({ item }: any) => (
        <View style={styles.previewItem}>
            <Image source={{ uri: item.uri }} style={styles.previewMedia} />
            {item.compressing && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="small" color="#fff" />
                </View>
            )}
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeMedia(item.uri)}
                disabled={item.compressing} // Disable removal while processing
            >
                <MaterialCommunityIcons name="close" size={16} color="#fff" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.label}>
                Media Files {required && <Text style={styles.required}>*</Text>}
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
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 80,
        height: 80,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
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
});

export default MediaUploader;
