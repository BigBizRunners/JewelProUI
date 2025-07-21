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

const MAX_MEDIA = 5;

const MediaUploader = ({ mediaFiles, setMediaFiles, onRemoveMedia, required = false }: any) => {
    const pickMediaFiles = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                selectionLimit: MAX_MEDIA - mediaFiles.length,
                quality: 1,
            });

            if (!result.canceled) {
                const newFiles = result.assets.map(asset => ({
                    ...asset,
                    type: 'image',
                }));

                const updatedFiles = [...mediaFiles, ...newFiles].slice(0, MAX_MEDIA);
                setMediaFiles(updatedFiles);
            }
        } catch (error) {
            console.error('Media Picker Error:', error);
            Alert.alert('Error', 'Failed to select media files');
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
            <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeMedia(item.uri)}
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
