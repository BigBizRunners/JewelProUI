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

    const scheduleTokenRefresh = useCallback((token: string) => {
        try {
            const decoded: { exp: number } = jwtDecode(token);
            const expiresAt = decoded.exp * 1000;
            const now = Date.now();

            const refreshInMs = expiresAt - now - 5 * 60 * 1000; // 5 minutes before expiry
            if (refreshInMs <= 0) return;

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
    }, [refreshSession, logout]);

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

    const refreshSession = useCallback(async () => {
        const currentUser = userPool.getCurrentUser();
        if (!currentUser) {
            throw new Error('No Cognito user available for session refresh.');
        }

        return new Promise<void>((resolve, reject) => {
            currentUser.getSession((err: any, session: CognitoUserSession) => {
                if (err || !session || !session.isValid()) {
                    const refreshToken = session?.getRefreshToken?.();
                    if (!refreshToken) {
                        return reject(new Error('No refresh token available'));
                    }

                    currentUser.refreshSession(refreshToken, (refreshErr, newSession) => {
                        if (refreshErr || !newSession) {
                            return reject(refreshErr || new Error('Failed to refresh session'));
                        }
                        setSession(newSession);
                        const newToken = newSession.getIdToken().getJwtToken();
                        SecureStore.setItemAsync('authToken', newToken);
                        scheduleTokenRefresh(newToken);
                        resolve();
                    });
                } else {
                    setSession(session);
                    const token = session.getIdToken().getJwtToken();
                    SecureStore.setItemAsync('authToken', token);
                    scheduleTokenRefresh(token);
                    resolve();
                }
            });
        });
    }, [scheduleTokenRefresh]);

    const isAuthenticated = useCallback(async (): Promise<boolean> => {
        const token = await SecureStore.getItemAsync('authToken');
        if (!token) return false;

        if (isTokenExpired(token)) {
            try {
                await refreshSession();
                return true;
            } catch (error) {
                console.warn('Session refresh failed during authentication check:', (error as Error).message);
                return false;
            }
        }
        return true;
    }, [refreshSession]);

    useEffect(() => {
        const loadSession = async () => {
            try {
                const storedUsername = await SecureStore.getItemAsync('cognitoUsername');
                if (storedUsername) {
                    const user = new CognitoUser({
                        Username: storedUsername,
                        Pool: userPool,
                    });
                    setCognitoUser(user);
                    await refreshSession();
                }
            } catch (error) {
                console.error('Error loading initial session:', (error as Error).message);
                await logout();
            }
        };
        loadSession();
    }, [logout, refreshSession]);

    useEffect(() => {
        if (session && typeof session.getIdToken === 'function') {
            const token = session.getIdToken().getJwtToken();
            SecureStore.setItemAsync('authToken', token);
            scheduleTokenRefresh(token);
        }
    }, [session, scheduleTokenRefresh]);

    const authContextValue = useMemo(
        () => ({
            cognitoUser,
            session,
            setCognitoUser,
            setSession,
            logout,
            isAuthenticated,
            refreshSession,
        }),
        [cognitoUser, session, logout, isAuthenticated, refreshSession]
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
