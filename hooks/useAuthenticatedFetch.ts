// ../hooks/useAuthenticatedFetch.ts
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../components/AuthContext';
import jwtDecode from 'jwt-decode';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

interface FetchOptions {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: any;
    headers?: Record<string, string>;
}

const useAuthenticatedFetch = (navigation: any, options: FetchOptions) => {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [hasCheckedSession, setHasCheckedSession] = useState(false);
    const { isAuthenticated, refreshSession } = useAuth();

    const isTokenExpired = (token: string): boolean => {
        try {
            const decoded: { exp: number } = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            console.error('Error decoding token:', error);
            return true;
        }
    };

    const fetchData = async () => {
        const token = await AsyncStorage.getItem("authToken");
        if (!token) {
            throw new Error("No token available");
        }

        const response = await axios({
            method: options.method || 'POST',
            url: options.url,
            data: options.data,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        setData(response.data);
    };

    useEffect(() => {
        const checkSessionAndFetch = async () => {
            if (hasCheckedSession) return;

            try {
                const authenticated = await isAuthenticated();
                if (!authenticated) {
                    setError("User not authenticated");
                    Alert.alert("Session Expired", "Please login again", [
                        { text: "OK", onPress: () => navigation.replace("Login") },
                    ]);
                    setHasCheckedSession(true);
                    return;
                }

                let token = await AsyncStorage.getItem("authToken");
                if (token && isTokenExpired(token)) {
                    console.log("Token expired, refreshing...");
                    await refreshSession();
                    token = await AsyncStorage.getItem("authToken");
                    console.log("New token:", token);
                }

                await fetchData();
                setHasCheckedSession(true);
            } catch (error) {
                console.error("Session check error:", error);
                setError("Session error: " + (error.message || "Unknown error"));
                Alert.alert("Session Error", "Please login again", [
                    { text: "OK", onPress: () => navigation.replace("Login") },
                ]);
                setHasCheckedSession(true);
            } finally {
                setLoading(false);
            }
        };

        checkSessionAndFetch();
    }, [navigation, hasCheckedSession, options.url, options.method, options.data]);

    return { data, error, loading, refetch: fetchData };
};

export default useAuthenticatedFetch;
