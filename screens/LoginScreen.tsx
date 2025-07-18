import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    ScrollView,
    KeyboardAvoidingView,
    Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import * as SecureStore from 'expo-secure-store';
import userPool from '../cognitoConfig';
import { useAuth } from '../components/AuthContext';
import { BackHandler } from 'react-native';

const LoginScreen = ({ navigation }: any) => {
    useEffect(() => {
        const checkToken = async () => {
            const token = await SecureStore.getItemAsync('authToken');
            if (token) {
                navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
            }
        };
        checkToken();
    }, []);


    useEffect(() => {
        const backAction = () => true;
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    const { setCognitoUser, setSession } = useAuth();

    const [mobileNumber, setMobileNumber] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = () => {
        if (!/^[0-9]{10}$/.test(mobileNumber)) {
            Alert.alert('Error', 'Please enter a valid 10-digit mobile number');
            return;
        }
        if (!password.trim()) {
            Alert.alert('Error', 'Password cannot be empty');
            return;
        }

        setLoading(true);

        const authenticationDetails = new AuthenticationDetails({
            Username: `+91${mobileNumber}`,
            Password: password,
        });

        const user = new CognitoUser({
            Username: `+91${mobileNumber}`,
            Pool: userPool,
        });

        user.authenticateUser(authenticationDetails, {
            onSuccess: async (result) => {
                setLoading(false);
                const token = result.getIdToken().getJwtToken();
                await SecureStore.setItemAsync('authToken', token);
                await SecureStore.setItemAsync('cognitoUsername', `+91${mobileNumber}`);
                setCognitoUser(user);
                setSession(result);
                navigation.reset({ index: 0, routes: [{ name: 'Home', params: { phoneNumber: `+91${mobileNumber}` } }] });
            },
            onFailure: (err) => {
                setLoading(false);
                Alert.alert('Error', err.message || 'Login failed');
            },
            newPasswordRequired: (userAttributes, requiredAttributes) => {
                setLoading(false);
                setCognitoUser(user);
                Alert.alert('Password Change Required', 'You need to set a new password.');
                navigation.navigate('ResetPassword');
            },
        });
    };

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <Text style={styles.title}>JewelPro</Text>

                <Text style={styles.label}>Mobile Number</Text>
                <View style={styles.inputContainer}>
                    <Text style={styles.prefix}>+91</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Mobile Number"
                        keyboardType="number-pad"
                        maxLength={10}
                        value={mobileNumber}
                        onChangeText={setMobileNumber}
                    />
                </View>

                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Password"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity style={styles.showPasswordButton} onPress={() => setShowPassword(!showPassword)}>
                        <Icon name={showPassword ? 'eye' : 'eye-slash'} size={20} color="#333" />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.loginButton, (!mobileNumber || !password.trim()) && styles.disabledButton]}
                    onPress={handleLogin}
                    disabled={!mobileNumber || !password.trim() || loading}
                >
                    {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.loginButtonText}>LOGIN</Text>}
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f9f9f9', paddingHorizontal: 20, paddingBottom: 30 },
    scrollContainer: { flexGrow: 1, justifyContent: 'center' },
    title: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', color: '#075E54', marginBottom: 30 },
    label: { color: '#333', fontSize: 14, marginBottom: 5 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderColor: '#ccc', borderWidth: 1, borderRadius: 8, backgroundColor: '#fff', marginBottom: 15, paddingHorizontal: 10, height: 45 },
    prefix: { fontSize: 16, color: '#333', marginRight: 5 },
    input: { flex: 1, fontSize: 16, height: 45, paddingVertical: 0, paddingHorizontal: 10 },
    passwordContainer: { flexDirection: 'row', alignItems: 'center', borderColor: '#ccc', borderWidth: 1, borderRadius: 8, backgroundColor: '#fff', marginBottom: 15 },
    showPasswordButton: { paddingHorizontal: 10, justifyContent: 'center', alignItems: 'center', height: 45 },
    loginButton: { backgroundColor: '#075E54', padding: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    disabledButton: { backgroundColor: '#aaa' },
    loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});

export default LoginScreen;
