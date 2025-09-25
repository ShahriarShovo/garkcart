import React, {createContext, useContext, useState} from 'react';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [refreshTimer, setRefreshTimer] = useState(null);
    const [isAuthReady, setIsAuthReady] = useState(false);

    const login = async (userData) => {
        try {
            console.log('AuthContext: Starting login process for:', userData.email);

            const response = await fetch('http://localhost:8000/api/accounts/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            console.log('AuthContext: Login response status:', response.status);

            if(response.ok) {
                const data = await response.json();
                console.log('AuthContext: Login successful, full response:', data);
                console.log('AuthContext: Login response structure:', {
                    hasToken: !!data.token,
                    hasUserType: !!data.user_type,
                    hasIsAdmin: !!data.is_admin,
                    hasIsSuperuser: !!data.is_superuser,
                    hasIsStaff: !!data.is_staff
                });

                // Set user data from response
                const userInfo = {
                    email: userData.email,
                    token: data.token,
                    user_type: data.user_type || 'customer',
                    is_admin: data.is_admin || false,
                    is_superuser: data.is_superuser || false,
                    is_staff: data.is_staff || false
                };

                console.log('AuthContext: Prepared user info:', userInfo);
                console.log('AuthContext: Setting user state...');
                setUser(userInfo);
                setIsAuthenticated(true);

                console.log('AuthContext: Saving to localStorage...');
                localStorage.setItem('user', JSON.stringify(userInfo));
                localStorage.setItem('token', data.token.access);
                localStorage.setItem('refresh_token', data.token.refresh);

                console.log('AuthContext: User data saved successfully');
                console.log('AuthContext: localStorage verification:', {
                    user: localStorage.getItem('user'),
                    token: localStorage.getItem('token'),
                    refresh: localStorage.getItem('refresh_token')
                });

                // schedule token refresh ~5 minutes before expiry
                scheduleTokenRefresh();

                return {success: true, message: data.message, user: userInfo};
            } else {
                const errorData = await response.json();
                console.error('AuthContext: Login failed:', errorData);
                return {success: false, message: errorData.message || 'Login failed'};
            }
        } catch(error) {
            console.error('AuthContext: Login error:', error);
            return {success: false, message: 'Network error occurred'};
        }
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
        if(refreshTimer) {
            clearTimeout(refreshTimer);
            setRefreshTimer(null);
        }
    };

    const register = async (userData) => {
        try {
            const response = await fetch('http://localhost:8000/api/accounts/signup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if(response.ok) {
                const data = await response.json();
                console.log('Registration successful:', data);

                // Set user data from response
                const userInfo = {
                    email: userData.email,
                    full_name: userData.full_name,
                    token: data.token
                };

                setUser(userInfo);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(userInfo));
                localStorage.setItem('token', data.token.access);
                localStorage.setItem('refresh_token', data.token.refresh);
                scheduleTokenRefresh();

                return {success: true, message: data.message, user: userInfo};
            } else {
                const errorData = await response.json();
                console.error('Registration failed:', errorData);
                return {success: false, message: errorData.message || 'Registration failed'};
            }
        } catch(error) {
            console.error('Registration error:', error);
            return {success: false, message: 'Network error occurred'};
        }
    };

    const refreshAccessToken = async () => {
        const refresh = localStorage.getItem('refresh_token');
        if(!refresh) return false;
        try {
            const response = await fetch('http://localhost:8000/api/accounts/token/refresh/', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({refresh})
            });
            if(response.ok) {
                const data = await response.json();
                if(data.access) {
                    localStorage.setItem('token', data.access);
                    // re-schedule next refresh
                    scheduleTokenRefresh();
                    return true;
                }
            } else {
                // refresh failed; force logout
                logout();
            }
        } catch(e) {
            console.error('Token refresh failed', e);
        }
        return false;
    };

    const scheduleTokenRefresh = () => {
        if(refreshTimer) {
            clearTimeout(refreshTimer);
        }
        // Access token lifetime is 90 minutes; refresh 5 minutes before expiry
        const ms = (90 - 5) * 60 * 1000;
        const timer = setTimeout(() => {
            refreshAccessToken();
        }, ms);
        setRefreshTimer(timer);
    };

    // Check for existing user on app load
    React.useEffect(() => {
        console.log('AuthContext: App starting, checking localStorage...');

        const checkAuth = () => {
            const savedUser = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            const refresh = localStorage.getItem('refresh_token');

            console.log('AuthContext: localStorage contents:', {
                savedUser: savedUser,
                token: token,
                refresh: refresh
            });

            if(savedUser && token && refresh) {
                try {
                    const userData = JSON.parse(savedUser);
                    console.log('AuthContext: Successfully parsed user data:', userData);
                    console.log('AuthContext: Setting user state from localStorage...');
                    setUser(userData);
                    setIsAuthenticated(true);
                    console.log('AuthContext: User state set, scheduling token refresh...');
                    scheduleTokenRefresh();
                    console.log('AuthContext: Authentication restored from localStorage');
                } catch(error) {
                    console.error('AuthContext: Error parsing saved user data:', error);
                    console.log('AuthContext: Clearing invalid localStorage data...');
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                    localStorage.removeItem('refresh_token');
                }
            } else {
                console.log('AuthContext: No valid user data found in localStorage');
                console.log('AuthContext: User will need to login');
            }

            // Mark auth as initialized after the first check
            if(!isAuthReady) {
                setIsAuthReady(true);
                console.log('AuthContext: Initialization complete (isAuthReady = true)');
            }
        };

        // Check immediately
        checkAuth();

        // Also check after a small delay to handle React StrictMode
        const timeoutId = setTimeout(checkAuth, 100);

        return () => clearTimeout(timeoutId);
    }, []);

    const value = {
        user,
        isAuthenticated,
        isAuthReady,
        login,
        logout,
        register
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if(!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
