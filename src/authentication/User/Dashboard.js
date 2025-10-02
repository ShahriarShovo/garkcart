import React, {useState, useEffect} from 'react';
import {useAuth} from '../../context/AuthContext';
import {Link, useNavigate} from 'react-router-dom';
import formatBDT from '../../utils/currency';
import API_CONFIG from '../../config/apiConfig';
import Pagination from '../../components/Pagination';

const Dashboard = () => {
    const {user, logout, isAuthenticated, isAuthReady} = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [orders, setOrders] = useState([]);
    const [receivedOrders, setReceivedOrders] = useState([]);
    const [cancelledRefundedOrders, setCancelledRefundedOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [receivedOrdersLoading, setReceivedOrdersLoading] = useState(false);
    const [cancelledRefundedLoading, setCancelledRefundedLoading] = useState(false);
    const [error, setError] = useState(null);

    // Pagination states for received orders
    const [receivedOrdersCurrentPage, setReceivedOrdersCurrentPage] = useState(1);
    const [receivedOrdersTotalPages, setReceivedOrdersTotalPages] = useState(1);
    const [receivedOrdersTotalCount, setReceivedOrdersTotalCount] = useState(0);
    const [receivedOrdersPageSize] = useState(10);

    // Pagination states for return and refunds
    const [returnsCurrentPage, setReturnsCurrentPage] = useState(1);
    const [returnsTotalPages, setReturnsTotalPages] = useState(1);
    const [returnsTotalCount, setReturnsTotalCount] = useState(0);
    const [returnsPageSize] = useState(10);

    // Address management states
    const [addresses, setAddresses] = useState([]);
    const [addressLoading, setAddressLoading] = useState(false);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [addressFormData, setAddressFormData] = useState({
        full_name: '',
        phone_number: '',
        city: '',
        address_line_1: '',
        address_line_2: '',
        postal_code: '',
        country: 'Bangladesh',
        address_type: 'home'
    });
    const [toast, setToast] = useState({show: false, message: '', type: 'success'});
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [addressToDelete, setAddressToDelete] = useState(null);

    // Cancel order states
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [orderToCancel, setOrderToCancel] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelling, setCancelling] = useState(false);

    // Profile states
    const [profile, setProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(false);

    // Dashboard statistics states
    const [dashboardStats, setDashboardStats] = useState({
        totalOrders: 0,
        totalPayments: 0,
        savedAddresses: 0
    });
    const [statsLoading, setStatsLoading] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);

    // Fetch dashboard statistics
    const fetchDashboardStats = async () => {
        setStatsLoading(true);
        try {
            const token = localStorage.getItem('token');

            // Fetch all orders count
            const ordersResponse = await fetch(`${API_CONFIG.BASE_URL}/api/orders/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Fetch addresses count
            const addressesResponse = await fetch(`${API_CONFIG.BASE_URL}/api/orders/addresses/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            let totalOrders = 0;
            let totalPayments = 0;
            let savedAddresses = 0;

            if(ordersResponse.ok) {
                const ordersData = await ordersResponse.json();
                
                // Handle paginated response
                const orders = ordersData.results || ordersData;
                totalOrders = ordersData.count || orders.length || 0;

                // Calculate total payments (sum of all order totals)
                if(Array.isArray(orders)) {
                    totalPayments = orders.reduce((sum, order) => {
                        return sum + parseFloat(order.total_amount || 0);
                    }, 0);
                } else {
                    totalPayments = 0;
                }
            }

            if(addressesResponse.ok) {
                const addressesData = await addressesResponse.json();
                
                // Handle paginated response for addresses
                const addresses = addressesData.results || addressesData;
                savedAddresses = addressesData.count || addresses.length || 0;
            }

            setDashboardStats({
                totalOrders,
                totalPayments: totalPayments.toFixed(2),
                savedAddresses
            });

        } catch(error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setStatsLoading(false);
        }
    };

    // Fetch active user orders
    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/orders/active/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                const data = await response.json();

                setOrders(data.results || data); // Handle both paginated and non-paginated responses
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch active orders:', errorData);
                setError('Failed to fetch active orders');
            }
        } catch(error) {
            console.error('Error fetching active orders:', error);
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Fetch received orders (delivered orders) with pagination
    const fetchReceivedOrders = async (page = 1) => {
        setReceivedOrdersLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/orders/delivered/?page=${page}&page_size=${receivedOrdersPageSize}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                const data = await response.json();

                // Handle both paginated and non-paginated responses
                if(data.results) {
                    // Paginated response
                    setReceivedOrders(data.results);
                    setReceivedOrdersTotalCount(data.count || 0);
                    setReceivedOrdersTotalPages(Math.ceil((data.count || 0) / receivedOrdersPageSize));
                    setReceivedOrdersCurrentPage(page);
                } else {
                    // Non-paginated response (fallback)
                    setReceivedOrders(data);
                    setReceivedOrdersTotalCount(data.length || 0);
                    setReceivedOrdersTotalPages(1);
                    setReceivedOrdersCurrentPage(1);
                }
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch received orders:', errorData);
                setError('Failed to fetch received orders');
            }
        } catch(error) {
            console.error('Error fetching received orders:', error);
            setError('Network error occurred');
        } finally {
            setReceivedOrdersLoading(false);
        }
    };

    // Handle received orders pagination
    const handleReceivedOrdersPageChange = (page) => {
        setReceivedOrdersCurrentPage(page);
        fetchReceivedOrders(page);
    };

    // Handle return and refunds pagination
    const handleReturnsPageChange = (page) => {
        setReturnsCurrentPage(page);
        fetchCancelledRefundedOrders(page);
    };

    // Fetch cancelled and refunded orders
    const fetchCancelledRefundedOrders = async (page = 1) => {
        setCancelledRefundedLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/orders/cancelled-refunded/?page=${page}&page_size=${returnsPageSize}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                const data = await response.json();
                
                if(data.results) {
                    setCancelledRefundedOrders(data.results);
                    setReturnsTotalCount(data.count || 0);
                    setReturnsTotalPages(Math.ceil((data.count || 0) / returnsPageSize));
                    setReturnsCurrentPage(page);
                } else {
                    setCancelledRefundedOrders(data);
                    setReturnsTotalCount(data.length || 0);
                    setReturnsTotalPages(1);
                    setReturnsCurrentPage(1);
                }
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch cancelled/refunded orders:', errorData);
                setError('Failed to fetch cancelled/refunded orders');
            }
        } catch(error) {
            console.error('Error fetching cancelled/refunded orders:', error);
            setError('Network error occurred');
        } finally {
            setCancelledRefundedLoading(false);
        }
    };

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/orders/${orderId}/update-status/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({status: newStatus})
            });

            if(response.ok) {
                const data = await response.json();

                setToast({show: true, message: data.message, type: 'success'});

                // Refresh both order lists
                fetchOrders();
                fetchReceivedOrders();

                return true;
            } else {
                const errorData = await response.json();
                console.error('Failed to update order status:', errorData);
                setToast({show: true, message: errorData.message || 'Failed to update order status', type: 'error'});
                return false;
            }
        } catch(error) {
            console.error('Error updating order status:', error);
            setToast({show: true, message: 'Network error occurred', type: 'error'});
            return false;
        }
    };

    // Fetch user profile
    const fetchProfile = async () => {
        setProfileLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_CONFIG.getFullUrl('AUTH', 'PROFILE'), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                const data = await response.json();
                setProfile(data);
            } else {
                console.error('Failed to fetch profile');
            }
        } catch(error) {
            console.error('Error fetching profile:', error);
        } finally {
            setProfileLoading(false);
        }
    };

    // Fetch user addresses
    const fetchAddresses = async () => {
        setAddressLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/orders/addresses/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                const data = await response.json();
                
                // Handle paginated response for addresses
                const addresses = data.results || data;
                setAddresses(addresses);
            } else {
                console.error('Failed to fetch addresses');
            }
        } catch(error) {
            console.error('Error fetching addresses:', error);
        } finally {
            setAddressLoading(false);
        }
    };

    // Create new address
    const createAddress = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/orders/addresses/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(addressFormData)
            });

            if(response.ok) {
                setToast({show: true, message: 'Address added successfully!', type: 'success'});
                setShowAddressForm(false);
                setAddressFormData({
                    full_name: '',
                    phone_number: '',
                    city: '',
                    address_line_1: '',
                    address_line_2: '',
                    postal_code: '',
                    country: 'Bangladesh',
                    address_type: 'home'
                });
                fetchAddresses();
            } else {
                const errorData = await response.json();
                setToast({show: true, message: `Failed to add address: ${errorData.message || 'Unknown error'}`, type: 'error'});
            }
        } catch(error) {
            setToast({show: true, message: 'Network error occurred', type: 'error'});
        }
    };

    // Update address
    const updateAddress = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/orders/addresses/${editingAddress.id}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(addressFormData)
            });

            if(response.ok) {
                setToast({show: true, message: 'Address updated successfully!', type: 'success'});
                setEditingAddress(null);
                setShowAddressForm(false);
                setAddressFormData({
                    full_name: '',
                    phone_number: '',
                    city: '',
                    address_line_1: '',
                    address_line_2: '',
                    postal_code: '',
                    country: 'Bangladesh',
                    address_type: 'home'
                });
                fetchAddresses();
            } else {
                const errorData = await response.json();
                setToast({show: true, message: `Failed to update address: ${errorData.message || 'Unknown error'}`, type: 'error'});
            }
        } catch(error) {
            setToast({show: true, message: 'Network error occurred', type: 'error'});
        }
    };

    // Show delete confirmation
    const showDeleteConfirmation = (address) => {
        setAddressToDelete(address);
        setShowDeleteConfirm(true);
    };

    // Delete address
    const deleteAddress = async () => {
        if(!addressToDelete) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/orders/addresses/${addressToDelete.id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                setToast({show: true, message: 'Address deleted successfully!', type: 'success'});
                fetchAddresses();
            } else {
                const errorData = await response.json();
                let errorMessage = 'Failed to delete address';

                // Check if address is connected to orders
                if(response.status === 400 && errorData) {
                    if(errorData.error === 'protected_foreign_key' ||
                        errorData.message?.includes('existing order') ||
                        errorData.detail?.includes('protected foreign keys') ||
                        errorData.detail?.includes('Order.delivery_address')) {
                        errorMessage = errorData.message || 'Cannot delete this address because it is connected to existing orders. Please contact support if you need to remove it.';
                    } else {
                        errorMessage = errorData.message || errorData.detail || 'Failed to delete address';
                    }
                }

                setToast({show: true, message: errorMessage, type: 'error'});
                console.error('Delete address error:', errorMessage);
            }
        } catch(error) {
            setToast({show: true, message: 'Network error occurred', type: 'error'});
        } finally {
            setShowDeleteConfirm(false);
            setAddressToDelete(null);
        }
    };

    // Cancel delete
    const cancelDelete = () => {
        setShowDeleteConfirm(false);
        setAddressToDelete(null);
    };

    // Show cancel order confirmation
    const showCancelConfirmation = (order) => {
        setOrderToCancel(order);
        setCancelReason('');
        setShowCancelModal(true);
    };

    // Cancel order confirmation
    const confirmCancelOrder = async () => {
        if(!orderToCancel) return;

        setCancelling(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/orders/${orderToCancel.id}/cancel/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    cancel_reason: cancelReason || 'Cancelled by customer'
                })
            });

            if(response.ok) {
                setToast({show: true, message: 'Order cancelled successfully!', type: 'success'});
                setShowCancelModal(false);
                setOrderToCancel(null);
                setCancelReason('');
                // Refresh orders to reflect the change
                fetchOrders();
            } else {
                const errorData = await response.json();
                setToast({show: true, message: `Failed to cancel order: ${errorData.message || 'Unknown error'}`, type: 'error'});
            }
        } catch(error) {
            console.error('Error cancelling order:', error);
            setToast({show: true, message: 'Network error occurred. Please try again.', type: 'error'});
        } finally {
            setCancelling(false);
        }
    };

    // Cancel order modal
    const cancelCancelOrder = () => {
        setShowCancelModal(false);
        setOrderToCancel(null);
        setCancelReason('');
    };

    // Set default address
    const setDefaultAddress = async (addressId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/orders/addresses/${addressId}/set-default/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                setToast({show: true, message: 'Default address updated successfully!', type: 'success'});
                fetchAddresses();
            } else {
                setToast({show: true, message: 'Failed to set default address', type: 'error'});
            }
        } catch(error) {
            setToast({show: true, message: 'Network error occurred', type: 'error'});
        }
    };

    // Edit address
    const editAddress = (address) => {
        setEditingAddress(address);
        setAddressFormData({
            full_name: address.full_name,
            phone_number: address.phone_number,
            city: address.city,
            address_line_1: address.address_line_1,
            address_line_2: address.address_line_2 || '',
            postal_code: address.postal_code || '',
            country: address.country,
            address_type: address.address_type
        });
        setShowAddressForm(true);
    };

    // Reset form
    const resetForm = () => {
        setShowAddressForm(false);
        setEditingAddress(null);
        setAddressFormData({
            full_name: '',
            phone_number: '',
            city: '',
            address_line_1: '',
            address_line_2: '',
            postal_code: '',
            country: 'Bangladesh',
            address_type: 'home'
        });
    };

    // Authentication check and auto redirect
    useEffect(() => {
        setAuthChecking(true);

        // Check localStorage for token as well
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if(!isAuthenticated || !user || !token || !savedUser) {
            // Clear any stale data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/');
            return;
        }

        // Check if user is admin, redirect to admin dashboard
        if(user.user_type === 'admin') {
            navigate('/admin/dashboard');
            return;
        }

        setAuthChecking(false);
    }, [isAuthenticated, user, navigate, isAuthReady]);

    // Additional check for localStorage changes (logout from other tabs)
    useEffect(() => {
        const handleStorageChange = () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if(!token || !savedUser) {
                navigate('/');
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Also check periodically for token validity
        const interval = setInterval(() => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if(!token || !savedUser) {
                navigate('/');
            }
        }, 1000); // Check every second

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [navigate]);

    // Fetch orders when component mounts
    useEffect(() => {
        if(user && activeTab === 'dashboard') {
            fetchDashboardStats();
        }
        if(user && activeTab === 'order-history') {
            fetchOrders();
        }
        if(user && activeTab === 'received-orders') {
            fetchReceivedOrders(1);
        }
        if(user && activeTab === 'returns') {
            fetchCancelledRefundedOrders(1);
        }
        if(user && activeTab === 'settings') {
            fetchProfile();
            fetchAddresses();
        }
    }, [user, activeTab]);

    // Helper function to get product image
    const getProductImage = (item) => {
        // Check for primary_image first (new API structure)
        if(item.product && item.product.primary_image) {
            const imageUrl = item.product.primary_image.image;

            // Check if imageUrl is valid
            if(imageUrl && imageUrl.trim() !== '') {
                // Handle both relative and absolute URLs
                if(imageUrl.startsWith('http')) {
                    return imageUrl;
                } else {
                    return `${API_CONFIG.BASE_URL}${imageUrl}`;
                }
            }
        }

        // Fallback to images array (old API structure)
        if(item.product && item.product.images && item.product.images.length > 0) {
            const imageUrl = item.product.images[0].image;

            // Check if imageUrl is valid
            if(imageUrl && imageUrl.trim() !== '') {
                // Handle both relative and absolute URLs
                if(imageUrl.startsWith('http')) {
                    return imageUrl;
                } else {
                    return `${API_CONFIG.BASE_URL}${imageUrl}`;
                }
            }
        }
        return null;
    };

    // Product Image Component
    const ProductImage = ({item}) => {
        const [imageError, setImageError] = useState(false);
        const [imageLoaded, setImageLoaded] = useState(false);
        const imageUrl = getProductImage(item);

        // Reset states when item changes
        React.useEffect(() => {
            setImageError(false);
            setImageLoaded(false);
        }, [item.id]);

        if(imageUrl && !imageError) {
            return (
                <div style={{position: 'relative', width: '50px', height: '50px'}}>
                    {!imageLoaded && (
                        <div className="img-xs border bg-light d-flex align-items-center justify-content-center"
                            style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>
                            <i className="fa fa-spinner fa-spin text-muted"></i>
                        </div>
                    )}
                    <img
                        src={imageUrl}
                        className="img-xs border"
                        alt={item.product_name}
                        style={{
                            width: '50px',
                            height: '50px',
                            objectFit: 'cover',
                            display: imageLoaded ? 'block' : 'none'
                        }}
                        onError={() => setImageError(true)}
                        onLoad={() => setImageLoaded(true)}
                    />
                </div>
            );
        }

        // Fallback to default image
        return (
            <img
                src="/images/items/1.jpg"
                className="img-xs border"
                alt="Default Product"
                style={{width: '50px', height: '50px', objectFit: 'cover'}}
            />
        );
    };

    // Show loading screen while checking authentication
    if(authChecking) {
        return (
            <section className="section-conten padding-y bg">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-md-6 text-center">
                            <div className="card">
                                <div className="card-body py-5">
                                    <i className="fa fa-spinner fa-spin fa-3x text-primary mb-3"></i>
                                    <h5>Checking Authentication...</h5>
                                    <p className="text-muted">Please wait while we verify your access.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="section-conten padding-y bg">
            <div className="container">
                <div className="row">
                    <aside className="col-md-3">
                        {/* SIDEBAR */}
                        <ul className="list-group">
                            <a
                                className={`list-group-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('dashboard');
                                }}
                            >
                                <i className="fa fa-tachometer mr-2"></i>
                                Dashboard
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'order-history' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('order-history');
                                }}
                            >
                                <i className="fa fa-history mr-2"></i>
                                My order history
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'received-orders' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('received-orders');
                                }}
                            >
                                <i className="fa fa-check-circle mr-2"></i>
                                Received orders
                            </a>
                            {/* <a
                                className={`list-group-item ${activeTab === 'transactions' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('transactions');
                                }}
                            >
                                Transactions
                            </a> */}
                            <a
                                className={`list-group-item ${activeTab === 'returns' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('returns');
                                }}
                            >
                                <i className="fa fa-undo mr-2"></i>
                                Return and refunds
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'settings' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('settings');
                                }}
                            >
                                <i className="fa fa-cog mr-2"></i>
                                Settings
                            </a>
                            {/* <a
                                className={`list-group-item ${activeTab === 'selling' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('selling');
                                }}
                            >
                                My Selling Items
                            </a> */}
                            {/* <a
                                className={`list-group-item ${activeTab === 'received' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('received');
                                }}
                            >
                                Received orders
                            </a> */}
                        </ul>
                        <br />
                        <a className="btn btn-light btn-block" href="#" onClick={(e) => {
                            e.preventDefault();
                            logout();
                            // Navigate to home page using React Router
                            navigate('/');
                            // Also force immediate redirect as fallback
                            window.location.href = '/';
                        }}>
                            <i className="fa fa-power-off"></i>
                            <span className="text">Log out</span>
                        </a>
                        {/* SIDEBAR .//END */}
                    </aside>

                    <main className="col-md-9">
                        {activeTab === 'dashboard' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Dashboard Overview</strong>
                                    <button
                                        className="btn btn-sm btn-outline-primary float-right"
                                        onClick={fetchDashboardStats}
                                        disabled={statsLoading}
                                    >
                                        {statsLoading ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </header>
                                <div className="card-body">
                                    {statsLoading ? (
                                        <div className="text-center py-4">
                                            <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                                            <p className="mt-2">Loading dashboard...</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="row">
                                                {/* Total Orders Card */}
                                                <div className="col-md-4 mb-4">
                                                    <div className="card border-primary">
                                                        <div className="card-body text-center">
                                                            <div className="icon-lg bg-primary text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
                                                                <i className="fa fa-shopping-bag fa-2x"></i>
                                                            </div>
                                                            <h4 className="card-title text-primary">{dashboardStats.totalOrders}</h4>
                                                            <p className="card-text text-muted">Total Orders</p>
                                                            <small className="text-muted">All time orders placed</small>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Total Payments Card */}
                                                <div className="col-md-4 mb-4">
                                                    <div className="card border-success">
                                                        <div className="card-body text-center">
                                                            <div className="icon-lg bg-success text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
                                                                <i className="fa fa-money-bill-wave fa-2x"></i>
                                                            </div>
                                                            <h4 className="card-title text-success">{formatBDT(dashboardStats.totalPayments)}</h4>
                                                            <p className="card-text text-muted">Total Payments</p>
                                                            <small className="text-muted">Total amount spent</small>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Saved Addresses Card */}
                                                <div className="col-md-4 mb-4">
                                                    <div className="card border-info">
                                                        <div className="card-body text-center">
                                                            <div className="icon-lg bg-info text-white rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center">
                                                                <i className="fa fa-map-marker-alt fa-2x"></i>
                                                            </div>
                                                            <h4 className="card-title text-info">{dashboardStats.savedAddresses}</h4>
                                                            <p className="card-text text-muted">Saved Addresses</p>
                                                            <small className="text-muted">Delivery addresses saved</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Quick Actions */}
                                            <div className="row mt-4">
                                                <div className="col-12">
                                                    <h5 className="mb-3">Quick Actions</h5>
                                                    <div className="row">
                                                        <div className="col-md-3 mb-2">
                                                            <button
                                                                className="btn btn-outline-primary btn-block"
                                                                onClick={() => setActiveTab('order-history')}
                                                            >
                                                                <i className="fa fa-list mr-2"></i>
                                                                View Orders
                                                            </button>
                                                        </div>
                                                        <div className="col-md-3 mb-2">
                                                            <button
                                                                className="btn btn-outline-info btn-block"
                                                                onClick={() => setActiveTab('settings')}
                                                            >
                                                                <i className="fa fa-cog mr-2"></i>
                                                                Manage Addresses
                                                            </button>
                                                        </div>
                                                        <div className="col-md-3 mb-2">
                                                            <Link to="/" className="btn btn-outline-success btn-block">
                                                                <i className="fa fa-shopping-cart mr-2"></i>
                                                                Continue Shopping
                                                            </Link>
                                                        </div>
                                                        <div className="col-md-3 mb-2">
                                                            <button
                                                                className="btn btn-outline-warning btn-block"
                                                                onClick={() => setActiveTab('returns')}
                                                            >
                                                                <i className="fa fa-undo mr-2"></i>
                                                                Returns & Refunds
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </article>
                        )}

                        {activeTab === 'order-history' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">My Order History</strong>
                                    <button
                                        className="btn btn-sm btn-outline-primary float-right"
                                        onClick={fetchOrders}
                                        disabled={loading}
                                    >
                                        {loading ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </header>
                                <div className="card-body">
                                    {loading && (
                                        <div className="text-center py-4">
                                            <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                                            <p className="mt-2">Loading orders...</p>
                                        </div>
                                    )}

                                    {error && (
                                        <div className="alert alert-danger">
                                            <i className="fa fa-exclamation-triangle mr-2"></i>
                                            {error}
                                        </div>
                                    )}

                                    {!loading && !error && orders.length === 0 && (
                                        <div className="text-center py-4">
                                            <i className="fa fa-clock fa-3x text-muted mb-3"></i>
                                            <h5>No Active Orders</h5>
                                            <p className="text-muted">You don't have any active orders at the moment.</p>
                                            <p className="text-muted small">Check "Received orders" for delivered items or "Return and refunds" for cancelled/refunded orders.</p>
                                            <Link to="/" className="btn btn-primary">Start Shopping</Link>
                                        </div>
                                    )}

                                    {!loading && !error && orders.length > 0 && (
                                        <div className="orders-list">
                                            {orders.map((order) => (
                                                <div key={order.id} className="order-item mb-4 border rounded p-3">
                                                    <div className="row">
                                                        <div className="col-md-8">
                                                            <h6 className="text-muted">Order #{order.order_number}</h6>
                                                            <p className="mb-1">
                                                                <strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()} <br />
                                                                <strong>Status:</strong>
                                                                <span className={`badge badge-${order.status === 'delivered' ? 'success' : order.status === 'pending' ? 'warning' : 'info'} ml-2`}>
                                                                    {order.status_display}
                                                                </span>
                                                            </p>
                                                            {order.delivery_address && (
                                                                <p className="mb-1">
                                                                    <strong>Delivery to:</strong> {order.delivery_address.full_name} <br />
                                                                    {order.delivery_address.address_line_1}, {order.delivery_address.city}, {order.delivery_address.postal_code}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="col-md-4">
                                                            <h6 className="text-muted">Order Summary</h6>
                                                            <p className="mb-1">
                                                                Subtotal: {formatBDT(order.subtotal)} <br />
                                                                Shipping: {formatBDT(order.shipping_cost)} <br />
                                                                <strong>Total: {formatBDT(order.total_amount)}</strong>
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <div className="table-responsive mt-3">
                                                        <table className="table table-sm table-hover">
                                                            <thead>
                                                                <tr>
                                                                    <th width="65"></th>
                                                                    <th>Product</th>
                                                                    <th>Price</th>
                                                                    <th>Qty</th>
                                                                    <th>Total</th>
                                                                    <th width="200">Actions</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {order.items && order.items.map((item, index) => (
                                                                    <tr key={item.id}>
                                                                        <td>
                                                                            <ProductImage item={item} />
                                                                        </td>
                                                                        <td>
                                                                            <p className="title mb-0">{item.product_name}</p>
                                                                            {item.variant_title && (
                                                                                <small className="text-muted">{item.variant_title}</small>
                                                                            )}
                                                                        </td>
                                                                        <td>
                                                                            <var className="price text-muted">{formatBDT(item.unit_price)}</var>
                                                                        </td>
                                                                        <td>
                                                                            <span className="badge badge-secondary">{item.quantity}</span>
                                                                        </td>
                                                                        <td>
                                                                            <strong>{formatBDT(item.total_price)}</strong>
                                                                        </td>
                                                                        <td>
                                                                            {/* Show Cancel Order button only for first item and pending orders */}
                                                                            {index === 0 && order.status === 'pending' ? (
                                                                                <button
                                                                                    className="btn btn-sm btn-danger"
                                                                                    onClick={() => showCancelConfirmation(order)}
                                                                                    title="Cancel this order"
                                                                                >
                                                                                    <i className="fa fa-times mr-1"></i>
                                                                                    Cancel Order
                                                                                </button>
                                                                            ) : (
                                                                                <button className="btn btn-sm btn-light">Details</button>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </article>
                        )}

                        {activeTab === 'received-orders' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Received Orders</strong>
                                    <button
                                        className="btn btn-sm btn-outline-primary float-right"
                                        onClick={() => {
                                            setReceivedOrdersCurrentPage(1);
                                            fetchReceivedOrders(1);
                                        }}
                                        disabled={receivedOrdersLoading}
                                    >
                                        {receivedOrdersLoading ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </header>
                                <div className="card-body">
                                    {receivedOrdersLoading ? (
                                        <div className="text-center">
                                            <i className="fa fa-spinner fa-spin fa-2x"></i>
                                            <p className="mt-2">Loading received orders...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="alert alert-danger">
                                            <i className="fa fa-exclamation-triangle mr-2"></i>
                                            {error}
                                        </div>
                                    ) : receivedOrders && receivedOrders.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Order #</th>
                                                        <th>Date</th>
                                                        <th>Status</th>
                                                        <th>Total</th>
                                                        <th>Items</th>
                                                        <th>Delivered At</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {receivedOrders.map((order) => (
                                                        <tr key={order.id}>
                                                            <td>
                                                                <strong>#{order.order_number}</strong>
                                                            </td>
                                                            <td>
                                                                {new Date(order.created_at).toLocaleDateString()}
                                                            </td>
                                                            <td>
                                                                <span
                                                                    className="badge badge-success"
                                                                    style={{backgroundColor: '#10b981'}}
                                                                >
                                                                    <i className="fa fa-check-circle mr-1"></i>
                                                                    {order.status_display || 'Delivered'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <strong>{formatBDT(order.total_amount)}</strong>
                                                            </td>
                                                            <td>
                                                                <div className="d-flex flex-wrap">
                                                                    {order.items && order.items.slice(0, 3).map((item, index) => (
                                                                        <div key={index} className="mr-2 mb-1">
                                                                            <img
                                                                                src={getProductImage(item)}
                                                                                alt={item.product_name}
                                                                                className="rounded"
                                                                                style={{width: '30px', height: '30px', objectFit: 'cover'}}
                                                                                onError={(e) => {
                                                                                    e.target.src = '/images/items/1.jpg';
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    ))}
                                                                    {order.items && order.items.length > 3 && (
                                                                        <span className="badge badge-light">
                                                                            +{order.items.length - 3} more
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                {order.delivered_at ? (
                                                                    <span className="text-success">
                                                                        <i className="fa fa-calendar-check mr-1"></i>
                                                                        {new Date(order.delivered_at).toLocaleDateString()}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted">
                                                                        <i className="fa fa-clock mr-1"></i>
                                                                        Not recorded
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fa fa-inbox fa-3x text-muted mb-3"></i>
                                            <h5 className="text-muted">No Received Orders</h5>
                                            <p className="text-muted">You haven't received any orders yet.</p>
                                            <Link to="/" className="btn btn-primary">
                                                <i className="fa fa-shopping-bag mr-2"></i>
                                                Start Shopping
                                            </Link>
                                        </div>
                                    )}

                                    {/* Pagination for Received Orders */}
                                    {receivedOrders && receivedOrders.length > 0 && receivedOrdersTotalPages > 1 && (
                                        <Pagination
                                            totalItems={receivedOrdersTotalCount}
                                            currentPage={receivedOrdersCurrentPage}
                                            pageSize={receivedOrdersPageSize}
                                            onPageChange={handleReceivedOrdersPageChange}
                                            maxPagesToShow={5}
                                        />
                                    )}
                                </div>
                            </article>
                        )}

                        {/* {activeTab === 'transactions' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Transactions</strong>
                                </header>
                                <div className="card-body">
                                    <p>No transactions found.</p>
                                </div>
                            </article>
                        )} */}

                        {activeTab === 'returns' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Return and Refunds</strong>
                                    <button
                                        className="btn btn-sm btn-outline-primary float-right"
                                        onClick={() => {
                                            setReturnsCurrentPage(1);
                                            fetchCancelledRefundedOrders(1);
                                        }}
                                        disabled={cancelledRefundedLoading}
                                    >
                                        {cancelledRefundedLoading ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </header>
                                <div className="card-body">
                                    {cancelledRefundedLoading ? (
                                        <div className="text-center">
                                            <i className="fa fa-spinner fa-spin fa-2x"></i>
                                            <p className="mt-2">Loading cancelled/refunded orders...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="alert alert-danger">
                                            <i className="fa fa-exclamation-triangle mr-2"></i>
                                            {error}
                                        </div>
                                    ) : cancelledRefundedOrders && cancelledRefundedOrders.length > 0 ? (
                                        <>
                                            <div className="table-responsive">
                                                <table className="table table-hover">
                                                    <thead>
                                                        <tr>
                                                            <th>Order #</th>
                                                            <th>Date</th>
                                                            <th>Status</th>
                                                            <th>Total</th>
                                                            <th>Items</th>
                                                            <th>Updated At</th>
                                                            <th>Reason</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {cancelledRefundedOrders.map((order) => (
                                                            <tr key={order.id}>
                                                                <td>
                                                                    <strong>#{order.order_number}</strong>
                                                                </td>
                                                                <td>
                                                                    {new Date(order.created_at).toLocaleDateString()}
                                                                </td>
                                                                <td>
                                                                    <span
                                                                        className={`badge ${order.status === 'cancelled' ? 'badge-danger' :
                                                                            order.status === 'refunded' ? 'badge-warning' :
                                                                                'badge-light'
                                                                            }`}
                                                                    >
                                                                        {order.status === 'cancelled' && <i className="fa fa-times mr-1"></i>}
                                                                        {order.status === 'refunded' && <i className="fa fa-undo mr-1"></i>}
                                                                        {order.status_display || order.status}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <strong>{formatBDT(order.total_amount)}</strong>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-wrap">
                                                                        {order.items && order.items.slice(0, 3).map((item, index) => (
                                                                            <div key={index} className="mr-2 mb-1">
                                                                                <img
                                                                                    src={getProductImage(item)}
                                                                                    alt={item.product_name}
                                                                                    className="rounded"
                                                                                    style={{width: '30px', height: '30px', objectFit: 'cover'}}
                                                                                    onError={(e) => {
                                                                                        e.target.src = '/images/items/1.jpg';
                                                                                    }}
                                                                                />
                                                                            </div>
                                                                        ))}
                                                                        {order.items && order.items.length > 3 && (
                                                                            <span className="badge badge-light">
                                                                                +{order.items.length - 3} more
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span className="text-muted">
                                                                        <i className="fa fa-clock mr-1"></i>
                                                                        {new Date(order.updated_at).toLocaleDateString()}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    {order.status === 'cancelled' ? (
                                                                        <span className="text-danger">
                                                                            <i className="fa fa-ban mr-1"></i>
                                                                            Order Cancelled
                                                                        </span>
                                                                    ) : order.status === 'refunded' ? (
                                                                        <span className="text-warning">
                                                                            <i className="fa fa-money-bill-wave mr-1"></i>
                                                                            Refund Processed
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-muted">-</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            
                                            {/* Pagination for Return and Refunds */}
                                            {returnsTotalPages > 1 && (
                                                <Pagination
                                                    totalItems={returnsTotalCount}
                                                    currentPage={returnsCurrentPage}
                                                    pageSize={returnsPageSize}
                                                    onPageChange={handleReturnsPageChange}
                                                    maxPagesToShow={5}
                                                />
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fa fa-check-circle fa-3x text-success mb-3"></i>
                                            <h5 className="text-muted">No Cancelled or Refunded Orders</h5>
                                            <p className="text-muted">All your orders are in good standing.</p>
                                            <Link to="/" className="btn btn-primary">
                                                <i className="fa fa-shopping-bag mr-2"></i>
                                                Continue Shopping
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </article>
                        )}

                        {activeTab === 'settings' && (
                            <>
                                {/* User Profile Information */}
                                <article className="card mb-4">
                                    <header className="card-header">
                                        <strong className="d-inline-block mr-3">Profile Information</strong>
                                    </header>
                                    <div className="card-body">
                                        {profileLoading ? (
                                            <div className="text-center">
                                                <i className="fa fa-spinner fa-spin"></i> Loading profile...
                                            </div>
                                        ) : (
                                            <div className="row">
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label className="font-weight-bold">Username</label>
                                                        <p className="form-control-plaintext">{profile?.username || user?.username || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label className="font-weight-bold">Full Name</label>
                                                        <p className="form-control-plaintext">{profile?.full_name || user?.full_name || user?.first_name + ' ' + user?.last_name || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label className="font-weight-bold">Email</label>
                                                        <p className="form-control-plaintext">{user?.email || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </article>

                                {/* Address Management */}
                                <article className="card">
                                    <header className="card-header">
                                        <strong className="d-inline-block mr-3">Address Management</strong>
                                        <button
                                            className="btn btn-primary btn-sm float-right"
                                            onClick={() => setShowAddressForm(true)}
                                        >
                                            <i className="fa fa-plus"></i> Add New Address
                                        </button>
                                    </header>
                                    <div className="card-body">
                                        {addressLoading ? (
                                            <div className="text-center">
                                                <i className="fa fa-spinner fa-spin"></i> Loading addresses...
                                            </div>
                                        ) : (
                                            <>
                                                {!addresses || !Array.isArray(addresses) || addresses.length === 0 ? (
                                                    <div className="text-center py-4">
                                                        <i className="fa fa-map-marker-alt fa-3x text-muted mb-3"></i>
                                                        <p className="text-muted">No addresses found. Add your first address to get started.</p>
                                                        <button
                                                            className="btn btn-primary"
                                                            onClick={() => setShowAddressForm(true)}
                                                        >
                                                            <i className="fa fa-plus"></i> Add Address
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="row">
                                                        {addresses && Array.isArray(addresses) && addresses.map((address) => (
                                                            <div key={address.id} className="col-md-6 mb-3">
                                                                <div className={`card address-card ${address.is_default ? 'border-primary' : ''}`}>
                                                                    <div className="card-body">
                                                                        {address.is_default && (
                                                                            <span className="badge badge-primary mb-2">Default Address</span>
                                                                        )}
                                                                        <h6 className="card-title">{address.full_name}</h6>
                                                                        <p className="card-text">
                                                                            {address.address_line_1}<br />
                                                                            {address.address_line_2 && (
                                                                                <>{address.address_line_2}<br /></>
                                                                            )}
                                                                            {address.city}, {address.country}<br />
                                                                            {address.postal_code && (
                                                                                <>{address.postal_code}<br /></>
                                                                            )}
                                                                            <strong>Phone:</strong> {address.phone_number}<br />
                                                                            <strong>Type:</strong> {address.address_type}
                                                                        </p>
                                                                        <div className="btn-group btn-group-sm">
                                                                            {!address.is_default && (
                                                                                <button
                                                                                    className="btn btn-outline-primary"
                                                                                    onClick={() => setDefaultAddress(address.id)}
                                                                                >
                                                                                    <i className="fa fa-star"></i> Set Default
                                                                                </button>
                                                                            )}
                                                                            <button
                                                                                className="btn btn-outline-secondary"
                                                                                onClick={() => editAddress(address)}
                                                                            >
                                                                                <i className="fa fa-edit"></i> Edit
                                                                            </button>
                                                                            <button
                                                                                className="btn btn-outline-danger"
                                                                                onClick={() => showDeleteConfirmation(address)}
                                                                            >
                                                                                <i className="fa fa-trash"></i> Delete
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </article>
                            </>
                        )}

                        {/* {activeTab === 'selling' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">My Selling Items</strong>
                                </header>
                                <div className="card-body">
                                    <p>No selling items found.</p>
                                </div>
                            </article>
                        )} */}

                        {/* {activeTab === 'received' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Received orders</strong>
                                </header>
                                <div className="card-body">
                                    <p>No received orders found.</p>
                                </div>
                            </article>
                        )} */}
                    </main>
                </div>
            </div>

            {/* Address Form Modal */}
            {showAddressForm && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                                </h5>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={resetForm}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={editingAddress ? updateAddress : createAddress}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Full Name *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="full_name"
                                                    value={addressFormData.full_name}
                                                    onChange={(e) => setAddressFormData({...addressFormData, [e.target.name]: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Phone Number *</label>
                                                <input
                                                    type="tel"
                                                    className="form-control"
                                                    name="phone_number"
                                                    value={addressFormData.phone_number}
                                                    onChange={(e) => setAddressFormData({...addressFormData, [e.target.name]: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>City *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="city"
                                                    value={addressFormData.city}
                                                    onChange={(e) => setAddressFormData({...addressFormData, [e.target.name]: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Address Type</label>
                                                <select
                                                    className="form-control"
                                                    name="address_type"
                                                    value={addressFormData.address_type}
                                                    onChange={(e) => setAddressFormData({...addressFormData, [e.target.name]: e.target.value})}
                                                >
                                                    <option value="home">Home</option>
                                                    <option value="office">Office</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Address Line 1 *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="address_line_1"
                                            value={addressFormData.address_line_1}
                                            onChange={(e) => setAddressFormData({...addressFormData, [e.target.name]: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Address Line 2</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="address_line_2"
                                            value={addressFormData.address_line_2}
                                            onChange={(e) => setAddressFormData({...addressFormData, [e.target.name]: e.target.value})}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Postal Code</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="postal_code"
                                                    value={addressFormData.postal_code}
                                                    onChange={(e) => setAddressFormData({...addressFormData, [e.target.name]: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Country</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="country"
                                                    value={addressFormData.country}
                                                    onChange={(e) => setAddressFormData({...addressFormData, [e.target.name]: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={resetForm}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                    >
                                        {editingAddress ? 'Update Address' : 'Add Address'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-0">
                                <h5 className="modal-title text-danger">
                                    <i className="fa fa-exclamation-triangle mr-2"></i>
                                    Delete Address
                                </h5>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={cancelDelete}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body text-center py-4">
                                <div className="mb-3">
                                    <i className="fa fa-trash fa-3x text-danger"></i>
                                </div>
                                <h6 className="mb-3">Are you sure you want to delete this address?</h6>
                                {addressToDelete && (
                                    <div className="text-center">
                                        <strong>{addressToDelete.full_name}</strong><br />
                                        {addressToDelete.address_line_1}<br />
                                        {addressToDelete.address_line_2 && (
                                            <>{addressToDelete.address_line_2}<br /></>
                                        )}
                                        {addressToDelete.city}, {addressToDelete.country}
                                    </div>
                                )}
                                <p className="text-muted small">
                                    This action cannot be undone.
                                </p>
                                <div className="alert alert-warning mt-3">
                                    <i className="fa fa-info-circle mr-2"></i>
                                    <strong>Note:</strong> If this address is connected to any existing orders, it cannot be deleted.
                                </div>
                            </div>
                            <div className="modal-footer border-0 justify-content-center">
                                <button
                                    type="button"
                                    className="btn btn-secondary mr-3"
                                    onClick={cancelDelete}
                                >
                                    <i className="fa fa-times mr-1"></i> Cancel
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={deleteAddress}
                                >
                                    <i className="fa fa-trash mr-1"></i> Delete Address
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Order Confirmation Modal */}
            {showCancelModal && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header border-0">
                                <h5 className="modal-title">
                                    <i className="fa fa-exclamation-triangle text-warning mr-2"></i>
                                    Cancel Order
                                </h5>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={cancelCancelOrder}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body text-center">
                                <p className="mb-3">
                                    Are you sure you want to cancel this order?
                                </p>
                                {orderToCancel && (
                                    <div className="bg-light p-3 rounded mb-3">
                                        <strong>Order #{orderToCancel.order_number}</strong><br />
                                        <small className="text-muted">
                                            Total: {formatBDT(orderToCancel.total_amount)} |
                                            Items: {orderToCancel.items?.length || 0}
                                        </small>
                                    </div>
                                )}
                                <div className="form-group text-left">
                                    <label htmlFor="cancelReason" className="form-label">
                                        <strong>Reason for cancellation (optional):</strong>
                                    </label>
                                    <textarea
                                        id="cancelReason"
                                        className="form-control"
                                        rows="3"
                                        placeholder="Please let us know why you're cancelling this order..."
                                        value={cancelReason}
                                        onChange={(e) => setCancelReason(e.target.value)}
                                    />
                                </div>
                                <div className="alert alert-warning mt-3">
                                    <i className="fa fa-info-circle mr-2"></i>
                                    <strong>Note:</strong> This action cannot be undone. The order will be moved to "Return and Refunds" section.
                                </div>
                            </div>
                            <div className="modal-footer border-0 justify-content-center">
                                <button
                                    type="button"
                                    className="btn btn-secondary mr-3"
                                    onClick={cancelCancelOrder}
                                    disabled={cancelling}
                                >
                                    <i className="fa fa-times mr-1"></i> Keep Order
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={confirmCancelOrder}
                                    disabled={cancelling}
                                >
                                    {cancelling ? (
                                        <>
                                            <i className="fa fa-spinner fa-spin mr-1"></i>
                                            Cancelling...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-times mr-1"></i>
                                            Cancel Order
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notification */}
            {toast.show && (
                <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`}
                    style={{position: 'fixed', top: '20px', right: '20px', zIndex: 9999, minWidth: '300px'}}>
                    {toast.message}
                    <button
                        type="button"
                        className="close"
                        onClick={() => setToast({show: false, message: '', type: 'success'})}
                    >
                        <span>&times;</span>
                    </button>
                </div>
            )}
        </section>
    );
};

export default Dashboard;