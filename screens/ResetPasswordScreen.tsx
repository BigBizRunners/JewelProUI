import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import { useAuth } from '../components/AuthContext';
import Icon from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ResetPasswordScreen = ({ navigation }: any) => {
    const { cognitoUser, setSession } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (!cognitoUser && !isResetting) {
            Alert.alert('Session Expired', 'Your session has expired. Please log in again.', [
                { text: 'OK', onPress: () => navigation.replace('Login') }
            ]);
        }
    }, [cognitoUser, navigation, isResetting]);

    const validatePassword = (password: string) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    };

    const handleResetPassword = () => {
        if (!newPassword.trim() || newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match or are empty');
            return;
        }
        if (!validatePassword(newPassword)) {
            Alert.alert('Error', 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.');
            return;
        }

        if (!cognitoUser) {
            Alert.alert('Error', 'No user session available. Please log in again.');
            navigation.replace('Login');
            return;
        }

        setLoading(true);
        setIsResetting(true);

        cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
            onSuccess: async (session) => {
                setSession(session);
                setLoading(false);
                setIsResetting(false);
                const newToken = session.getIdToken().getJwtToken();
                await AsyncStorage.setItem('authToken', newToken);
                await AsyncStorage.setItem('cognitoUsername', cognitoUser.getUsername());
                Alert.alert('Success', 'Password updated successfully', [
                    { text: 'OK', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] }) }
                ]);
            },
            onFailure: (err) => {
                setLoading(false);
                setIsResetting(false);
                Alert.alert('Error', err.message || 'Password reset failed');
            },
        });
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>Reset Password</Text>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter New Password"
                        secureTextEntry={!showPassword}
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <TouchableOpacity style={styles.showPasswordButton} onPress={() => setShowPassword(!showPassword)}>
                        <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} color="#333" />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Confirm New Password"
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity style={styles.showPasswordButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                        <Icon name={showConfirmPassword ? 'eye' : 'eye-slash'} size={20} color="#333" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity style={[styles.button, loading && styles.disabledButton]} onPress={handleResetPassword} disabled={loading}>
                    {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Submit</Text>}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, backgroundColor: '#f9f9f9' },
    scrollContainer: { flexGrow: 1, justifyContent: 'center' },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#075E54' },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#fff', marginBottom: 15, paddingHorizontal: 10 },
    input: { flex: 1, padding: 10, fontSize: 16 },
    toggleText: { color: '#075E54', fontSize: 14, fontWeight: 'bold', marginLeft: 10 },
    button: { backgroundColor: '#075E54', padding: 15, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    disabledButton: { backgroundColor: '#aaa' },
    showPasswordButton: { paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center', height: 45 }
});

export default ResetPasswordScreen;
