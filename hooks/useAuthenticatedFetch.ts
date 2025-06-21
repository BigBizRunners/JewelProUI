import { useState, useEffect, useRef } from 'react';
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

let isNavigatingToLogin = false;

const useAuthenticatedFetch = (navigation: any, options?: FetchOptions) => {
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(options?.autoFetch ? true : false);
    const [hasCheckedSession, setHasCheckedSession] = useState(false);
    const { isAuthenticated, refreshSession } = useAuth();

    // Use a ref to ensure we don't cause re-renders with this flag.
    const componentIsMounted = useRef(true);


    const isTokenExpired = (token: string): boolean => {
        try {
            const decoded: { exp: number } = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            console.error('Error decoding token:', error);
            return true;
        }
    };

    const handleLogoutNavigation = () => {
        // Only trigger navigation if another hook instance hasn't already.
        if (!isNavigatingToLogin) {
            isNavigatingToLogin = true;
            Alert.alert("Session Expired", "Please login again", [
                { text: "OK", onPress: () => {
                        navigation.replace("Login");
                        // Reset the flag after navigation to allow for future logins.
                        setTimeout(() => isNavigatingToLogin = false, 500);
                    }},
            ]);
        }
    };

    const fetchData = async (fetchOptions: FetchOptions) => {
        // If a logout navigation is already in progress, stop immediately.
        if (isNavigatingToLogin) return null;

        setLoading(true);
        try {
            console.log("Fetching data for fetch options " + JSON.stringify(fetchOptions));
            let token = await AsyncStorage.getItem("authToken");

            // Check if the session is valid, if not, try to refresh it.
            if (!token || isTokenExpired(token)) {
                console.log("Token missing or expired, attempting refresh...");
                try {
                    await refreshSession();
                    token = await AsyncStorage.getItem("authToken");
                } catch (refreshError) {
                    console.error("Session refresh failed:", refreshError);
                    setError("Session expired, please log in again");
                    handleLogoutNavigation();
                    return null;
                }
            }

            // If after a potential refresh, we still have no token, the session is invalid.
            if (!token) {
                console.log("No token available after refresh attempt.");
                setError("No token available, please log in");
                handleLogoutNavigation();
                return null;
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

            if (componentIsMounted.current) {
                console.log("API response:", JSON.stringify(response.data));
                setData(response.data);
            }
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 401) {
                // Handle cases where the token became invalid between checks.
                console.error("Unauthorized (401) error during fetch:", err);
                handleLogoutNavigation();
            } else {
                console.error("Fetch error:", err);
                if (componentIsMounted.current) {
                    // @ts-ignore
                    setError("Failed to fetch: " + (err.message || "Unknown error"));
                }
            }
            return null;
        } finally {
            if (componentIsMounted.current) {
                setLoading(false);
                setHasCheckedSession(true);
            }
        }
    };

    useEffect(() => {
        componentIsMounted.current = true;

        if (options?.autoFetch && !hasCheckedSession) {
            fetchData(options);
        }

        // Cleanup function to set the mounted ref to false when the component unmounts.
        return () => {
            componentIsMounted.current = false;
        };
    }, [navigation, hasCheckedSession, options?.url]); // Simplified dependencies

    return { data, error, loading, fetchData };
};

export default useAuthenticatedFetch;
