import React, { createContext, useContext, useEffect, useState } from 'react';
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
    cognitoUser: CognitoUser | null;
    session: CognitoUserSession | null;
    setCognitoUser: (user: CognitoUser | null) => void;
    setSession: (session: CognitoUserSession | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [cognitoUser, setCognitoUser] = useState<CognitoUser | null>(null);
    const [session, setSession] = useState<CognitoUserSession | null>(null);

    // Load session from storage when the app starts
    useEffect(() => {
        const loadSession = async () => {
            try {
                const storedSession = await AsyncStorage.getItem('cognitoSession');
                if (storedSession) {
                    setSession(JSON.parse(storedSession));
                }
            } catch (error) {
                console.log('Failed to load session', error);
            }
        };
        loadSession();
    }, []);

    // Store session in AsyncStorage whenever it updates
    useEffect(() => {
        if (session) {
            AsyncStorage.setItem('cognitoSession', JSON.stringify(session));
        } else {
            AsyncStorage.removeItem('cognitoSession');
        }
    }, [session]);

    return (
        <AuthContext.Provider value={{ cognitoUser, session, setCognitoUser, setSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
