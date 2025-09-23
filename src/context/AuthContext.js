import React, {createContext, useContext, useState} from 'react';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [refreshTimer, setRefreshTimer] = useState(null);

    const login = async (userData) => {
        try {
            const response = await fetch('http://localhost:8000/api/accounts/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if(response.ok) {
                const data = await response.json();
                console.log('Login successful:', data);

                // Set user data from response
                const userInfo = {
                    email: userData.email,
                    token: data.token,
                    user_type: data.user_type,
                    is_admin: data.is_admin,
                    is_superuser: data.is_superuser,
                    is_staff: data.is_staff
                };

                setUser(userInfo);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(userInfo));
                localStorage.setItem('token', data.token.access);
                localStorage.setItem('refresh_token', data.token.refresh);

                // schedule token refresh ~5 minutes before expiry
                scheduleTokenRefresh();

                return {success: true, message: data.message, user: userInfo};
            } else {
                const errorData = await response.json();
                console.error('Login failed:', errorData);
                return {success: false, message: errorData.message || 'Login failed'};
            }
        } catch(error) {
            console.error('Login error:', error);
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
        const savedUser = localStorage.getItem('user');
        if(savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
            // ensure refresh loop is scheduled if tokens exist
            const token = localStorage.getItem('token');
            const refresh = localStorage.getItem('refresh_token');
            if(token && refresh) {
                scheduleTokenRefresh();
            }
        }
    }, []);

    const value = {
        user,
        isAuthenticated,
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
