import React, { createContext, useContext, useEffect, useState } from 'react';
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';

interface AuthContextType {
    cognitoUser: CognitoUser | null;
    session: CognitoUserSession | null;
    jwtToken: string | null;
    setCognitoUser: (user: CognitoUser | null) => void;
    setSession: (session: CognitoUserSession | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [cognitoUser, setCognitoUser] = useState<CognitoUser | null>(null);
    const [session, setSession] = useState<CognitoUserSession | null>(null);
    const [jwtToken, setJwtToken] = useState<string | null>(null);

    // Load session and token from storage when the app starts
    useEffect(() => {
        const loadSession = async () => {
            try {
                const storedSession = await AsyncStorage.getItem('cognitoSession');
                const storedToken = await AsyncStorage.getItem('jwtToken');

                if (storedSession) {
                    const parsedSession: CognitoUserSession = JSON.parse(storedSession);

                    if (storedToken && !isTokenExpired(storedToken)) {
                        setSession(parsedSession);
                        setJwtToken(storedToken);
                    } else {
                        console.log('Stored token is expired, clearing session.');
                        logout();
                    }
                }
            } catch (error) {
                console.log('Failed to load session', error);
            }
        };

        loadSession();
    }, []);

    // Store session and token in AsyncStorage whenever they update
    useEffect(() => {
        if (session) {
            AsyncStorage.setItem('cognitoSession', JSON.stringify(session));
            const newToken = session.getIdToken().getJwtToken();
            setJwtToken(newToken);
            AsyncStorage.setItem('jwtToken', newToken);
        } else {
            AsyncStorage.removeItem('cognitoSession');
            AsyncStorage.removeItem('jwtToken');
        }
    }, [session]);

    // Function to check token expiry
    const isTokenExpired = (token: string): boolean => {
        try {
            const decoded: { exp: number } = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            console.error('Error decoding token:', error);
            return true;
        }
    };

    const logout = async () => {
        setCognitoUser(null);
        setSession(null);
        setJwtToken(null);
        await AsyncStorage.removeItem('cognitoSession');
        await AsyncStorage.removeItem('jwtToken');
    };

    return (
        <AuthContext.Provider value={{ cognitoUser, session, jwtToken, setCognitoUser, setSession, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
