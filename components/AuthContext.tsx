import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { CognitoUser, CognitoUserSession } from 'amazon-cognito-identity-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import jwtDecode from 'jwt-decode';
import userPool from '../cognitoConfig';

interface AuthContextType {
    cognitoUser: CognitoUser | null;
    session: CognitoUserSession | null;
    setCognitoUser: (user: CognitoUser | null) => void;
    setSession: (session: CognitoUserSession | null) => void;
    logout: () => Promise<void>;
    isAuthenticated: () => Promise<boolean>;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [cognitoUser, setCognitoUser] = useState<CognitoUser | null>(null);
    const [session, setSession] = useState<CognitoUserSession | null>(null);

    const isTokenExpired = (token: string): boolean => {
        try {
            const decoded: { exp: number } = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            console.error('Error decoding token:', error);
            return true;
        }
    };

    const logout = useCallback(async () => {
        const currentUser = userPool.getCurrentUser();
        if (currentUser) {
            currentUser.signOut();
        }
        setCognitoUser(null);
        setSession(null);
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('cognitoUsername');
    }, []);

    const refreshSession = useCallback(async () => {
        const currentUser = userPool.getCurrentUser();
        if (!currentUser) {
            throw new Error('No Cognito user available for session refresh.');
        }

        return new Promise<void>((resolve, reject) => {
            currentUser.getSession((err: any, session: CognitoUserSession) => {
                if (err || !session || !session.isValid()) {
                    const refreshTokenString = session?.getRefreshToken()?.getToken();
                    if (!refreshTokenString) {
                        return reject(new Error('No refresh token available'));
                    }
                    const RefreshToken = session.getRefreshToken();
                    currentUser.refreshSession(RefreshToken, (refreshErr, newSession) => {
                        if (refreshErr || !newSession) {
                            return reject(refreshErr || new Error('Failed to refresh session'));
                        }
                        setSession(newSession);
                        AsyncStorage.setItem('authToken', newSession.getIdToken().getJwtToken());
                        resolve();
                    });
                } else {
                    setSession(session);
                    AsyncStorage.setItem('authToken', session.getIdToken().getJwtToken());
                    resolve();
                }
            });
        });
    }, []);

    const isAuthenticated = useCallback(async (): Promise<boolean> => {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return false;

        if (isTokenExpired(token)) {
            try {
                await refreshSession();
                return true;
            } catch (error) {
                return false;
            }
        }
        return true;
    }, [refreshSession]);

    useEffect(() => {
        const loadSession = async () => {
            try {
                const storedUsername = await AsyncStorage.getItem('cognitoUsername');
                if (storedUsername) {
                    const user = new CognitoUser({
                        Username: storedUsername,
                        Pool: userPool,
                    });
                    setCognitoUser(user);
                    await refreshSession();
                }
            } catch (error) {
                console.error('Error loading initial session:', error);
                await logout();
            }
        };
        loadSession();
    }, [logout, refreshSession]);

    useEffect(() => {
        if (session && typeof session.getIdToken === 'function') {
            const token = session.getIdToken().getJwtToken();
            AsyncStorage.setItem('authToken', token);
        }
    }, [session]);

    const authContextValue = useMemo(() => ({
        cognitoUser,
        session,
        setCognitoUser,
        setSession,
        logout,
        isAuthenticated,
        refreshSession
    }), [cognitoUser, session, logout, isAuthenticated, refreshSession]);

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};