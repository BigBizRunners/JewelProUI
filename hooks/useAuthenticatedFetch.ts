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
    autoFetch?: boolean;
}

const useAuthenticatedFetch = (navigation: any, options?: FetchOptions) => {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(options?.autoFetch ? true : false);
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

    const fetchData = async (fetchOptions: FetchOptions) => {
        setLoading(true);
        try {
            console.log("Fetching data for fetch options " + JSON.stringify(fetchOptions));
            const storedToken = await AsyncStorage.getItem("authToken");
            let token = storedToken;

            const authenticated = await isAuthenticated();
            if (!authenticated || !token) {
                console.log("Not authenticated or no token, attempting refresh...");
                try {
                    await refreshSession();
                    token = await AsyncStorage.getItem("authToken");
                    console.log("Token after refresh attempt:", token);
                } catch (refreshError) {
                    setError("Session expired, please log in again");
                    Alert.alert("Session Expired", "Please login again", [
                        { text: "OK", onPress: () => navigation.replace("Login") },
                    ]);
                    return null;
                }
            }

            if (!token) {
                console.log("No token available after refresh");
                setError("No token available, please log in");
                Alert.alert("Session Expired", "Please login again", [
                    { text: "OK", onPress: () => navigation.replace("Login") },
                ]);
                return null;
            }

            if (isTokenExpired(token)) {
                console.log("Token expired, refreshing...");
                await refreshSession();
                token = await AsyncStorage.getItem("authToken");
                console.log("New token:", token);
            }

            const response = await axios({
                method: fetchOptions.method || 'POST',
                url: fetchOptions.url,
                data: fetchOptions.data,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...fetchOptions.headers,
                },
            });
            console.log("API response:", response.data);

            setData(response.data);
            return response.data;
        } catch (error) {
            console.error("Fetch error:", error);
            // @ts-ignore
            setError("Failed to fetch: " + (error.message || "Unknown error"));
            return null;
        } finally {
            setLoading(false);
            setHasCheckedSession(true);
        }
    };

    useEffect(() => {
        if (!options?.autoFetch || hasCheckedSession) return;

        const checkSessionAndFetch = async () => {
            await fetchData(options);
        };

        checkSessionAndFetch();
    }, [navigation, hasCheckedSession, options?.url, options?.method, options?.data, options?.autoFetch]);

    return { data, error, loading, fetchData };
};

export default useAuthenticatedFetch;
