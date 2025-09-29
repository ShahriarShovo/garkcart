import React, {createContext, useContext, useReducer, useState, useEffect} from 'react';
import API_CONFIG from '../config/apiConfig';

const CartContext = createContext();

const cartReducer = (state, action) => {
    switch(action.type) {
        case 'ADD_TO_CART':
            const existingItem = state.items.find(item => item.id === action.payload.id);
            if(existingItem) {
                return {
                    ...state,
                    items: state.items.map(item =>
                        item.id === action.payload.id
                            ? {...item, quantity: item.quantity + 1}
                            : item
                    )
                };
            }
            return {
                ...state,
                items: [...state.items, {...action.payload, quantity: 1}]
            };

        case 'REMOVE_FROM_CART':
            return {
                ...state,
                items: state.items.filter(item => item.id !== action.payload)
            };

        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(item =>
                    item.id === action.payload.id
                        ? {...item, quantity: action.payload.quantity}
                        : item
                )
            };

        case 'CLEAR_CART':
            return {
                ...state,
                items: []
            };

        case 'SET_CART':
            return {
                ...state,
                items: action.payload || []
            };

        default:
            return state;
    }
};

export const CartProvider = ({children}) => {
    const [state, dispatch] = useReducer(cartReducer, {
        items: []
    });
    const [loading, setLoading] = useState(false);
    const [cartFetched, setCartFetched] = useState(false);

    // Fetch cart from API
    const fetchCart = async () => {
        if (cartFetched) {
            return;
        }
        
        try {
            setCartFetched(true);
            
            const token = localStorage.getItem('token');
            const headers = {};

            if(token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(API_CONFIG.getFullUrl('CART', 'GET'), {
                headers: headers,
                credentials: 'include'  // Include cookies in requests
            });

            if(response.ok) {
                const data = await response.json();
                console.log('🔍 FRONTEND CART: Cart API response data:', data);
                if(data.success && data.cart) {
                    console.log('🔍 FRONTEND CART: Setting cart items:', data.cart.items?.length || 0);
                    if(data.cart.items && data.cart.items.length > 0) {
                        console.log('🔍 FRONTEND CART: WARNING - Cart has items:', data.cart.items);
                    }
                    dispatch({type: 'SET_CART', payload: data.cart.items || []});
                }
            }
        } catch(error) {
            console.error('Failed to fetch cart:', error);
            setCartFetched(false); // Reset on error
        }
    };

    // Add to cart API call
    const addToCart = async (product) => {
        // Check if user is authenticated
        const token = localStorage.getItem('token');
        if (!token) {
            return {
                success: false, 
                message: 'Please login or sign up to add items to cart',
                requiresAuth: true
            };
        }

        setLoading(true);
        try {
            const requestData = {
                product_id: product.id,
                quantity: product.quantity || 1,
                variant_id: product.selectedVariant?.id || null
            };

            console.log('🔍 DEBUG: Request data:', requestData);

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            };

            console.log('🔍 DEBUG: Using authenticated add to cart API');

            console.log('🔍 DEBUG: Making API call to add to cart');
            const response = await fetch(API_CONFIG.getFullUrl('CART', 'ADD'), {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(requestData),
                credentials: 'include'  // Include cookies in requests
            });

            console.log('🔍 DEBUG: Add to cart API response status:', response.status);

            if(response.ok) {
                const data = await response.json();
                if(data.success) {
                    // Update cart with API response
                    dispatch({type: 'SET_CART', payload: data.cart.items || []});
                    return {success: true, message: data.message};
                } else {
                    return {success: false, error: data.error};
                }
            } else {
                const errorData = await response.json();
                return {success: false, error: errorData.error || 'Failed to add to cart'};
            }
        } catch(error) {
            console.error('Add to cart error:', error);
            return {success: false, error: 'Network error occurred'};
        } finally {
            setLoading(false);
        }
    };

    // Remove item from cart API call
    const removeFromCart = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            const headers = {};

            if(token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_CONFIG.BASE_URL}/api/cart/items/${itemId}/remove/`, {
                method: 'DELETE',
                headers: headers
            });

            if(response.ok) {
                const data = await response.json();
                if(data.success) {
                    // Handle different response scenarios
                    if(data.cart && data.cart.items) {
                        // Item removed, update cart
                        dispatch({type: 'SET_CART', payload: data.cart.items});
                        return {success: true, message: data.message};
                    } else if(data.cart === null) {
                        // Item removed, cart cleared
                        dispatch({type: 'SET_CART', payload: []});
                        return {success: true, message: data.message};
                    } else {
                        // Fallback: fetch updated cart
                        await fetchCart();
                        return {success: true, message: data.message || 'Item removed successfully'};
                    }
                } else {
                    return {success: false, error: data.error};
                }
            } else {
                const errorData = await response.json();
                return {success: false, error: errorData.error || 'Failed to remove item'};
            }
        } catch(error) {
            console.error('Remove from cart error:', error);
            return {success: false, error: 'Network error occurred'};
        }
    };

    // Increase quantity API call
    const increaseQuantity = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            const headers = {};

            if(token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_CONFIG.BASE_URL}/api/cart/items/${itemId}/increase/`, {
                method: 'POST',
                headers: headers
            });

            if(response.ok) {
                const data = await response.json();
                if(data.success) {
                    // Update cart with API response
                    dispatch({type: 'SET_CART', payload: data.cart.items || []});
                    return {success: true, message: data.message};
                } else {
                    return {success: false, error: data.error};
                }
            } else {
                const errorData = await response.json();
                return {success: false, error: errorData.error || 'Failed to increase quantity'};
            }
        } catch(error) {
            console.error('Increase quantity error:', error);
            return {success: false, error: 'Network error occurred'};
        }
    };

    // Decrease quantity API call
    const decreaseQuantity = async (itemId) => {
        try {
            const token = localStorage.getItem('token');
            const headers = {};

            if(token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(`${API_CONFIG.BASE_URL}/api/cart/items/${itemId}/decrease/`, {
                method: 'POST',
                headers: headers
            });

            if(response.ok) {
                const data = await response.json();
                if(data.success) {
                    // Handle different response scenarios
                    if(data.cart && data.cart.items) {
                        // Item quantity decreased, update cart
                        dispatch({type: 'SET_CART', payload: data.cart.items});
                        return {success: true, message: 'Quantity decreased successfully'};
                    } else if(data.cart === null) {
                        // Item removed (quantity reached 0), clear cart
                        dispatch({type: 'SET_CART', payload: []});
                        return {success: true, message: 'Item removed from cart'};
                    } else {
                        // Fallback: fetch updated cart
                        await fetchCart();
                        return {success: true, message: data.message || 'Quantity updated'};
                    }
                } else {
                    return {success: false, error: data.error};
                }
            } else {
                const errorData = await response.json();
                return {success: false, error: errorData.error || 'Failed to decrease quantity'};
            }
        } catch(error) {
            console.error('Decrease quantity error:', error);
            return {success: false, error: 'Network error occurred'};
        }
    };

    const updateQuantity = (productId, quantity) => {
        dispatch({type: 'UPDATE_QUANTITY', payload: {id: productId, quantity}});
    };

    // Clear cart API call
    const clearCart = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = {};

            if(token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await fetch(API_CONFIG.getFullUrl('CART', 'CLEAR'), {
                method: 'DELETE',
                headers: headers
            });

            if(response.ok) {
                const data = await response.json();
                if(data.success) {
                    // Clear local cart state
                    dispatch({type: 'SET_CART', payload: []});
                    return {success: true, message: data.message};
                } else {
                    return {success: false, error: data.error};
                }
            } else {
                const errorData = await response.json();
                return {success: false, error: errorData.error || 'Failed to clear cart'};
            }
        } catch(error) {
            console.error('Clear cart error:', error);
            return {success: false, error: 'Network error occurred'};
        }
    };

    const getTotalItems = () => {
        return state.items.length; // Return count of unique items, not total quantity
    };

    const getTotalQuantity = () => {
        return state.items.reduce((total, item) => total + item.quantity, 0); // Total quantity of all items
    };

    const getTotalPrice = () => {
        return state.items.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
    };

    // Only fetch cart when user is authenticated
    useEffect(() => {
        let isMounted = true;
        
        const fetchCartOnce = async () => {
            if (isMounted) {
                const token = localStorage.getItem('token');
                if (token) {
                    // Only fetch cart for authenticated users
                    await fetchCart();
                } else {
                    // For anonymous users, set empty cart
                    dispatch({type: 'SET_CART', payload: []});
                }
            }
        };
        
        fetchCartOnce();
        
        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array to run only once

    const value = {
        items: state.items,
        loading,
        addToCart,
        removeFromCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        clearCart,
        fetchCart,
        getTotalItems,
        getTotalQuantity,
        getTotalPrice
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if(!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
