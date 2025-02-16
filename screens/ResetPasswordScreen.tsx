import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import {useAuth} from "../components/AuthContext";

const ResetPasswordScreen = ({ route, navigation }: any) => {
    const { cognitoUser } = useAuth();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle session expiration properly
    useEffect(() => {
        if (cognitoUser === null) {
            Alert.alert('Error', 'Session expired. Please log in again.', [
                { text: 'OK', onPress: () => navigation.replace('Login') }
            ]);
        }
    }, [cognitoUser, navigation]);

    const handleResetPassword = () => {
        if (!newPassword.trim() || newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match or are empty');
            return;
        }

        setLoading(true);

        // @ts-ignore
        cognitoUser.completeNewPasswordChallenge(newPassword, {}, {
            onSuccess: () => {
                setLoading(false);
                Alert.alert('Success', 'Password updated successfully');
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
            },
            onFailure: (err) => {
                setLoading(false);
                Alert.alert('Error', err.message || 'Password reset failed');
            },
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter New Password"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
            />

            <TextInput
                style={styles.input}
                placeholder="Confirm New Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <TouchableOpacity style={styles.button} onPress={handleResetPassword} disabled={loading}>
                {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Submit</Text>}
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
    title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginBottom: 15, fontSize: 16 },
    button: { backgroundColor: '#075E54', padding: 15, borderRadius: 8, alignItems: 'center' },
    buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default ResetPasswordScreen;
