import React, { createContext, useContext, useEffect, useState } from 'react';
import { CognitoUser, CognitoUserSession, CognitoRefreshToken } from 'amazon-cognito-identity-js';
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

    useEffect(() => {
        const loadSession = async () => {
            try {
                const storedToken = await AsyncStorage.getItem('authToken');
                const storedUsername = await AsyncStorage.getItem('cognitoUsername');

                if (storedToken && storedUsername) {
                    const user = new CognitoUser({
                        Username: storedUsername,
                        Pool: userPool,
                    });
                    setCognitoUser(user);

                    if (!isTokenExpired(storedToken)) {
                        console.log("Token still valid, skipping getSession");
                        return;
                    }

                    // Wrap getSession in a Promise
                    const sessionPromise = new Promise<CognitoUserSession>((resolve, reject) => {
                        user.getSession((err: any, session: CognitoUserSession | PromiseLike<CognitoUserSession>) => {
                            if (err || !session) {
                                reject(err || new Error('No valid session'));
                            } else {
                                resolve(session);
                            }
                        });
                    });

                    try {
                        const session = await sessionPromise;
                        setSession(session);
                        AsyncStorage.setItem('authToken', session.getIdToken().getJwtToken());
                    } catch (err) {
                        console.error('Failed to load session on startup:', err);
                        await refreshSession().catch(async () => {
                            await logout();
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading session:', error);
                await logout();
            }
        };
        loadSession();
    }, []);

    const isTokenExpired = (token: string): boolean => {
        try {
            const decoded: { exp: number } = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            console.error('Error decoding token:', error);
            return true;
        }
    };

    const isAuthenticated = async (): Promise<boolean> => {
        const token = await AsyncStorage.getItem('authToken');
        if (!token) return false;

        if (isTokenExpired(token) && cognitoUser) {
            try {
                await refreshSession();
                return true;
            } catch (error) {
                console.error('Refresh failed:', error);
                return false;
            }
        }
        return true;
    };

    const refreshSession = async () => {
        if (!cognitoUser) {
            throw new Error('No Cognito user available');
        }

        return new Promise<void>((resolve, reject) => {
            cognitoUser.getSession((err: any, session) => {
                if (err || !session || !session.getIdToken) {
                    console.error('Get session failed:', err || 'Invalid session');
                    reject(err || new Error('No valid session'));
                    return;
                }

                const token = session.getIdToken().getJwtToken();
                if (isTokenExpired(token)) {
                    const refreshToken = session.getRefreshToken();
                    if (!refreshToken) {
                        console.error('No refresh token available');
                        reject(new Error('No refresh token available'));
                        return;
                    }

                    cognitoUser.refreshSession(refreshToken, (refreshErr, newSession) => {
                        if (refreshErr || !newSession || !newSession.getIdToken) {
                            console.error('Refresh session failed:', refreshErr);
                            reject(refreshErr || new Error('Failed to refresh session'));
                        } else {
                            setSession(newSession);
                            AsyncStorage.setItem('authToken', newSession.getIdToken().getJwtToken());
                            resolve();
                        }
                    });
                } else {
                    setSession(session);
                    AsyncStorage.setItem('authToken', token);
                    resolve();
                }
            });
        });
    };

    const logout = async () => {
        if (cognitoUser) {
            cognitoUser.signOut();
        }
        setCognitoUser(null);
        setSession(null);
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('cognitoUsername');
    };

    useEffect(() => {
        if (session && typeof session.getIdToken === 'function') {
            const token = session.getIdToken().getJwtToken();
            AsyncStorage.setItem('authToken', token);
        }
    }, [session]);

    return (
        <AuthContext.Provider value={{ cognitoUser, session, setCognitoUser, setSession, logout, isAuthenticated, refreshSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
