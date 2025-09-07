import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useMemo,
    useRef,
} from 'react';
import {
    CognitoUser,
    CognitoUserSession,
} from 'amazon-cognito-identity-js';
import * as SecureStore from 'expo-secure-store';
import { jwtDecode } from 'jwt-decode';
import userPool from '../cognitoConfig';

interface AuthContextType {
    cognitoUser: CognitoUser | null;
    session: CognitoUserSession | null;
    isAuthLoading: boolean; // Added for loading state
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
    const [isAuthLoading, setIsAuthLoading] = useState(true); // Added state for auth loading

    const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const isTokenExpired = (token: string): boolean => {
        try {
            const decoded: { exp: number } = jwtDecode(token);
            return decoded.exp * 1000 < Date.now();
        } catch (error) {
            console.error('Error decoding token:', (error as Error).message);
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
        await SecureStore.deleteItemAsync('authToken');
        await SecureStore.deleteItemAsync('cognitoUsername');

        if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
            refreshTimeoutRef.current = null;
        }
    }, []);

    const scheduleTokenRefresh = useCallback((token: string) => {
        try {
            const decoded: { exp: number } = jwtDecode(token);
            const expiresAt = decoded.exp * 1000;
            const now = Date.now();

            // Refresh 5 minutes before expiry
            const refreshInMs = expiresAt - now - 5 * 60 * 1000;
            if (refreshInMs <= 0) {
                // If expired or close to expiry, refresh immediately in the background
                (async () => {
                    try {
                        await refreshSession();
                    } catch (error) {
                        console.error('Immediate token refresh failed:', (error as Error).message);
                        await logout();
                    }
                })();
                return;
            }

            if (refreshTimeoutRef.current) {
                clearTimeout(refreshTimeoutRef.current);
            }

            refreshTimeoutRef.current = setTimeout(async () => {
                try {
                    await refreshSession();
                } catch (error) {
                    console.error('Scheduled token refresh failed:', (error as Error).message);
                    await logout();
                }
            }, refreshInMs);

            console.log(`Scheduled token refresh in ${Math.floor(refreshInMs / 1000)} seconds`);
        } catch (error) {
            console.error('Failed to schedule token refresh:', (error as Error).message);
        }
    }, [logout]); // Removed refreshSession and added logout

    const refreshSession = useCallback(async () => {
        return new Promise<void>((resolve, reject) => {
            const currentUser = cognitoUser || userPool.getCurrentUser();
            if (!currentUser) {
                return reject(new Error('No user to refresh'));
            }

            currentUser.getSession((err: Error, sessionData: CognitoUserSession) => {
                if (err || !sessionData) {
                    // There is no valid session. Try to use a refresh token.
                    const refreshTokenString = sessionData?.getRefreshToken()?.getToken();
                    if (!refreshTokenString) {
                        return reject(new Error('No refresh token available.'));
                    }
                    currentUser.refreshSession(sessionData.getRefreshToken(), (refreshErr, newSession) => {
                        if (refreshErr) {
                            return reject(refreshErr);
                        }
                        setSession(newSession);
                        const newToken = newSession.getIdToken().getJwtToken();
                        SecureStore.setItemAsync('authToken', newToken);
                        scheduleTokenRefresh(newToken);
                        resolve();
                    });
                } else {
                    setSession(sessionData);
                    const token = sessionData.getIdToken().getJwtToken();
                    SecureStore.setItemAsync('authToken', token);
                    scheduleTokenRefresh(token);
                    resolve();
                }
            });
        });
    }, [cognitoUser, scheduleTokenRefresh]);

    const isAuthenticated = useCallback(async (): Promise<boolean> => {
        const token = await SecureStore.getItemAsync('authToken');
        if (!token) return false;

        if (isTokenExpired(token)) {
            try {
                await refreshSession();
                const newToken = await SecureStore.getItemAsync('authToken');
                return !!newToken && !isTokenExpired(newToken);
            } catch (error) {
                console.warn('Session refresh failed during auth check:', (error as Error).message);
                await logout();
                return false;
            }
        }
        return true;
    }, [refreshSession, logout]);

    useEffect(() => {
        const loadSession = async () => {
            setIsAuthLoading(true);
            try {
                const storedUsername = await SecureStore.getItemAsync('cognitoUsername');
                if (storedUsername) {
                    const user = new CognitoUser({
                        Username: storedUsername,
                        Pool: userPool,
                    });
                    setCognitoUser(user);
                    // The isAuthenticated check will handle the refresh
                }
            } catch (error) {
                console.error('Error loading initial session:', (error as Error).message);
                await logout();
            } finally {
                setIsAuthLoading(false);
            }
        };
        loadSession();
    }, [logout]); // Removed refreshSession from dependencies

    useEffect(() => {
        if (session && typeof session.getIdToken === 'function') {
            const token = session.getIdToken().getJwtToken();
            if(token) {
                SecureStore.setItemAsync('authToken', token);
                scheduleTokenRefresh(token);
            }
        }
    }, [session, scheduleTokenRefresh]);


    const authContextValue = useMemo(
        () => ({
            cognitoUser,
            session,
            isAuthLoading, // Expose loading state
            setCognitoUser,
            setSession,
            logout,
            isAuthenticated,
            refreshSession,
        }),
        [cognitoUser, session, isAuthLoading, logout, isAuthenticated, refreshSession]
    );

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
