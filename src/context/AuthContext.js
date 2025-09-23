import React, {createContext, useContext, useState} from 'react';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

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
                    is_superuser: data.is_superuser
                };

                setUser(userInfo);
                setIsAuthenticated(true);
                localStorage.setItem('user', JSON.stringify(userInfo));
                localStorage.setItem('token', data.token.access);

                return {success: true, message: data.message};
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

                return {success: true, message: data.message};
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

    // Check for existing user on app load
    React.useEffect(() => {
        const savedUser = localStorage.getItem('user');
        if(savedUser) {
            setUser(JSON.parse(savedUser));
            setIsAuthenticated(true);
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
