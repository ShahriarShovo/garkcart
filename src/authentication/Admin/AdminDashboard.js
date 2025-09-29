import React, {useState, useEffect} from 'react';
import Pagination from '../../components/Pagination';
import {useAuth} from '../../context/AuthContext';
import {Link, useNavigate} from 'react-router-dom';
import AdminChatInbox from '../../chat_and_notification/AdminChatInbox';
import adminWebsocketService from '../../chat_and_notification/api/adminWebsocketService';
import AdminLogoManager from '../../settings/AdminLogoManager';
import AdminBannerManager from '../../settings/AdminBannerManager';
import FooterSettings from './FooterSettings';
// TODO: Future implementation - Notification and Discount management
// import AdminNotificationManager from '../../chat_and_notification/AdminNotificationManager';
// import AdminDiscountManager from '../../chat_and_notification/AdminDiscountManager';

const AdminDashboard = () => {
    const {user, logout, isAuthenticated, isAuthReady} = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard'); // Default active tab

    // Check authentication on component mount
    useEffect(() => {
        console.log('AdminDashboard: Component mounted');
        console.log('AdminDashboard: Current auth state - isAuthenticated:', isAuthenticated, 'user:', user);
        console.log('AdminDashboard: localStorage check:', {
            user: localStorage.getItem('user'),
            token: localStorage.getItem('token'),
            refresh: localStorage.getItem('refresh_token')
        });

        // Wait until AuthContext finishes initializing from localStorage
        if(!isAuthReady) {
            console.log('AdminDashboard: Waiting for auth initialization (isAuthReady=false)');
            return;
        }

        const checkAuth = () => {
            console.log('AdminDashboard: Checking authentication...');
            console.log('AdminDashboard: Current auth state - isAuthenticated:', isAuthenticated, 'user:', user);

            if(!isAuthenticated || !user) {
                console.log('AdminDashboard: User not authenticated, redirecting to login');
                navigate('/signin');
                return;
            }

            // Check if user is admin/staff
            const isAdmin = user.is_superuser || user.is_staff || user.is_admin;
            console.log('AdminDashboard: Admin check - isAdmin:', isAdmin, 'user flags:', {
                is_superuser: user.is_superuser,
                is_staff: user.is_staff,
                is_admin: user.is_admin
            });

            if(!isAdmin) {
                console.log('AdminDashboard: User is not admin, redirecting to home');
                navigate('/');
                return;
            }

            console.log('AdminDashboard: Admin authentication successful');
        };

        // Check immediately
        checkAuth();

        // Also check after delay to handle state updates
        const timeoutId = setTimeout(checkAuth, 1000);

        return () => clearTimeout(timeoutId);
    }, [isAuthenticated, user, navigate, isAuthReady]);

    // Order management states
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState(null);
    const [ordersPage, setOrdersPage] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [orderStatusFilter, setOrderStatusFilter] = useState('all');

    // User management states
    const [users, setUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [usersError, setUsersError] = useState(null);
    const [usersPage, setUsersPage] = useState(1);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [userStatusFilter, setUserStatusFilter] = useState('active');
    const [showInactiveUsers, setShowInactiveUsers] = useState(false);
    const [showUserOrdersModal, setShowUserOrdersModal] = useState(false);
    const [userOrders, setUserOrders] = useState([]);
    const [userOrdersLoading, setUserOrdersLoading] = useState(false);
    const [showUserStatusModal, setShowUserStatusModal] = useState(false);
    const [userStatusAction, setUserStatusAction] = useState(null);

    // Chat system states
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    // Contact messages states
    const [contacts, setContacts] = useState([]);
    const [selectedContact, setSelectedContact] = useState(null);
    const [contactLoading, setContactLoading] = useState(false);
    const [contactUnreadCount, setContactUnreadCount] = useState(0);
    const [showContactModal, setShowContactModal] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [inboxUnreadCount, setInboxUnreadCount] = useState(0);
    const [wsConnected, setWsConnected] = useState(false);

    // Fetch inbox unread count
    const fetchInboxUnreadCount = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/chat/inbox/unread_count/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            if(response.ok) {
                const data = await response.json();
                setInboxUnreadCount(data.unread_count || 0);
                console.log('AdminDashboard: Inbox unread count:', data.unread_count);
            }
        } catch(error) {
            console.error('Error fetching inbox unread count:', error);
        }
    };

    // Dashboard statistics states
    const [statistics, setStatistics] = useState({
        total_orders: 0,
        total_products: 0,
        total_users: 0,
        total_revenue: 0,
        recent_orders: 0,
        active_users: 0
    });

    // Fetch contact messages
    const fetchContacts = async () => {
        setContactLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/chat_and_notifications/contacts/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setContacts(data);
                // Count unread contacts
                const unreadCount = data.filter(contact => !contact.is_read).length;
                setContactUnreadCount(unreadCount);
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setContactLoading(false);
        }
    };

    // Mark contact as read
    const markContactAsRead = async (contactId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/chat_and_notifications/contacts/${contactId}/mark-read/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                // Update local state
                setContacts(prev => prev.map(contact => 
                    contact.id === contactId ? {...contact, is_read: true} : contact
                ));
                setContactUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Error marking contact as read:', error);
        }
    };

    // Fetch inbox unread count on component mount
    useEffect(() => {
        if(isAuthenticated && user) {
            fetchInboxUnreadCount();
            fetchContacts();
        }
    }, [isAuthenticated, user]);

    // Listen for inbox updates
    useEffect(() => {
        const handleInboxUpdate = () => {
            console.log('AdminDashboard: Inbox updated, refreshing counter');
            fetchInboxUnreadCount();
        };

        window.addEventListener('admin_inbox_updated', handleInboxUpdate);

        return () => {
            window.removeEventListener('admin_inbox_updated', handleInboxUpdate);
        };
    }, []);

    // Connect to admin WebSocket for real-time updates
    useEffect(() => {
        if(isAuthenticated && user && (user.is_staff || user.is_superuser)) {
            console.log('AdminDashboard: Connecting to admin WebSocket for real-time updates');

            if(!adminWebsocketService.isConnected()) {
                adminWebsocketService.connect();
            }

            const handleNewMessage = (payload) => {
                console.log('AdminDashboard: New message received via WebSocket:', payload);
                if(payload?.type === 'new_message' && payload.message?.conversation_id) {
                    console.log('AdminDashboard: Updating inbox counter due to new message');
                    fetchInboxUnreadCount();
                }
            };

            const handleConversationUpdated = (payload) => {
                console.log('AdminDashboard: Conversation updated via WebSocket:', payload);
                if(payload?.type === 'conversation_updated' && payload.conversation?.id) {
                    console.log('AdminDashboard: Updating inbox counter due to conversation update');
                    fetchInboxUnreadCount();
                }
            };

            // Add connection status listener
            const handleConnected = () => {
                console.log('AdminDashboard: Admin WebSocket connected');
                setWsConnected(true);
            };

            const handleDisconnected = () => {
                console.log('AdminDashboard: Admin WebSocket disconnected');
                setWsConnected(false);
            };

            adminWebsocketService.on('new_message', handleNewMessage);
            adminWebsocketService.on('conversation_updated', handleConversationUpdated);
            adminWebsocketService.on('connected', handleConnected);
            adminWebsocketService.on('disconnected', handleDisconnected);

            return () => {
                adminWebsocketService.off('new_message', handleNewMessage);
                adminWebsocketService.off('conversation_updated', handleConversationUpdated);
                adminWebsocketService.off('connected', handleConnected);
                adminWebsocketService.off('disconnected', handleDisconnected);
            };
        }
    }, [isAuthenticated, user]);
    const [statisticsLoading, setStatisticsLoading] = useState(false);

    // Sales analytics states
    const [salesAnalytics, setSalesAnalytics] = useState({
        daily_sales: {total_amount: 0, order_count: 0},
        weekly_sales: {total_amount: 0, order_count: 0},
        monthly_sales: {total_amount: 0, order_count: 0},
        chart_data: [],
        status_breakdown: []
    });
    const [salesAnalyticsLoading, setSalesAnalyticsLoading] = useState(false);

    // Excel report states
    const [reportType, setReportType] = useState('sales');
    const [reportPeriod, setReportPeriod] = useState('30');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    // Category management states
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [categoriesError, setCategoriesError] = useState(null);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [categoryForm, setCategoryForm] = useState({
        name: '',
        description: '',
        image: null,
        is_active: true
    });

    // Subcategory management states
    const [subcategories, setSubcategories] = useState([]);
    const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);
    const [subcategoriesError, setSubcategoriesError] = useState(null);
    const [categoriesPage, setCategoriesPage] = useState(1);
    const [subcategoriesPage, setSubcategoriesPage] = useState(1);
    const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
    const [editingSubcategory, setEditingSubcategory] = useState(null);
    const [subcategoryForm, setSubcategoryForm] = useState({
        category: '',
        name: '',
        description: '',
        image: null,
        is_active: true
    });

    const [toast, setToast] = useState({show: false, message: '', type: 'success', title: ''});
    const [authChecking, setAuthChecking] = useState(true);

    // Delete confirmation modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteItem, setDeleteItem] = useState(null);
    const [deleteType, setDeleteType] = useState(''); // 'category' or 'subcategory'

    // Product management states
    const [products, setProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);
    const [productsError, setProductsError] = useState(null);
    const [productsPage, setProductsPage] = useState(1);
    const [archivedProducts, setArchivedProducts] = useState([]);
    const [archivedProductsLoading, setArchivedProductsLoading] = useState(false);
    const [archivedProductsError, setArchivedProductsError] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [productForm, setProductForm] = useState({
        title: '',
        description: '',
        short_description: '',
        category: '',
        subcategory: '',
        product_type: 'simple',
        status: 'draft',
        price: '',
        old_price: '',
        quantity: '',
        track_quantity: true,
        allow_backorder: false,
        weight: '',
        weight_unit: 'kg',
        requires_shipping: true,
        taxable: true,
        featured: false,
        tags: ''
    });
    const [productOptions, setProductOptions] = useState([]);
    const [productImages, setProductImages] = useState([]);
    const [productVariants, setProductVariants] = useState([]);

    // Settings (Admin Profile) states
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileError, setProfileError] = useState(null);
    const [profileSuccess, setProfileSuccess] = useState(null);
    const [settingsForm, setSettingsForm] = useState({
        id: null,
        email: '',
        username: '',
        full_name: '',
        address: '',
        city: '',
        zipcode: '',
        country: '',
        phone: ''
    });
    // Change password states
    const [pwdForm, setPwdForm] = useState({password: '', confirm_password: ''});
    const [pwdLoading, setPwdLoading] = useState(false);
    const [pwdError, setPwdError] = useState(null);
    const [pwdSuccess, setPwdSuccess] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        feedback: '',
        color: 'danger'
    });

    // Password strength checker
    const checkPasswordStrength = (password) => {
        let score = 0;
        let feedback = [];
        
        if (password.length >= 8) score += 1;
        else feedback.push('At least 8 characters');
        
        if (/[a-z]/.test(password)) score += 1;
        else feedback.push('Lowercase letter');
        
        if (/[A-Z]/.test(password)) score += 1;
        else feedback.push('Uppercase letter');
        
        if (/[0-9]/.test(password)) score += 1;
        else feedback.push('Number');
        
        if (/[^A-Za-z0-9]/.test(password)) score += 1;
        else feedback.push('Special character');
        
        let color = 'danger';
        if (score >= 4) color = 'success';
        else if (score >= 3) color = 'warning';
        
        setPasswordStrength({
            score,
            feedback: feedback.length > 0 ? `Missing: ${feedback.join(', ')}` : 'Strong password!',
            color
        });
    };

    // Settings extended UI (frontend-only placeholders)
    const [settingsTab, setSettingsTab] = useState('profile');
    const [generalSettings, setGeneralSettings] = useState({
        site_name: 'GreatKart',
        currency: 'BDT',
        maintenance_mode: false
    });
    const [staffForm, setStaffForm] = useState({
        email: '',
        full_name: '',
        is_staff: true,
        is_superuser: false
    });
    const [roleForm, setRoleForm] = useState({
        user_email: '',
        role: 'staff'
    });
    const [featureToggles, setFeatureToggles] = useState({
        reviews_enabled: true,
        inventory_tracking: true,
        allow_guest_checkout: false
    });
    const [integrationSettings, setIntegrationSettings] = useState({
        email_provider: 'smtp',
        sms_gateway: '',
        payment_gateway: 'cod'
    });

    // Email Settings states
    const [emailSettings, setEmailSettings] = useState({
        admin_email: '',
        support_email: '',
        notification_email: '',
        email_signature: ''
    });
    const [emailSettingsLoading, setEmailSettingsLoading] = useState(false);
    const [emailSettingsSaving, setEmailSettingsSaving] = useState(false);
    const [emailSettingsError, setEmailSettingsError] = useState(null);
    const [emailSettingsSuccess, setEmailSettingsSuccess] = useState(null);
    
    // SMTP Settings states
    const [smtpSettings, setSmtpSettings] = useState({
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        smtp_username: '',
        smtp_password: '',
        smtp_use_tls: true,
        smtp_use_ssl: false,
        from_email: '',
        from_name: 'Your Store Name'
    });
    const [smtpTesting, setSmtpTesting] = useState(false);
    const [smtpTestResult, setSmtpTestResult] = useState(null);
    const [smtpSaving, setSmtpSaving] = useState(false);
    const [smtpError, setSmtpError] = useState(null);
    const [smtpSuccess, setSmtpSuccess] = useState(null);
    
    // Email Selection States
    const [savedEmailSettings, setSavedEmailSettings] = useState([]);
    const [selectedEmailSetting, setSelectedEmailSetting] = useState(null);
    
    // Load existing email settings on component mount
    useEffect(() => {
        console.log('🔍 DEBUG: useEffect triggered, calling loadExistingEmailSettings...');
        
        const loadExistingEmailSettings = async () => {
            console.log('🔍 DEBUG: Starting to load email settings...');
            try {
                const token = localStorage.getItem('token');
                console.log('🔍 DEBUG: Token found:', token ? 'Yes' : 'No');
                console.log('🔍 DEBUG: Token value:', token);
                
                const response = await fetch('http://localhost:8000/api/settings/email-settings/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('🔍 DEBUG: API Response status:', response.status);
                console.log('🔍 DEBUG: API Response ok:', response.ok);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log('🔍 DEBUG: Email settings API response:', data);
                    console.log('🔍 DEBUG: Data type:', Array.isArray(data) ? 'Array' : typeof data);
                    console.log('🔍 DEBUG: Data length:', Array.isArray(data) ? data.length : 'Not array');
                    
                    // Handle both array response and object with results property
                    const emailSettings = Array.isArray(data) ? data : (data.results || []);
                    console.log('🔍 DEBUG: Email settings array:', emailSettings);
                    console.log('🔍 DEBUG: Email settings length:', emailSettings.length);
                    
                    if (emailSettings && emailSettings.length > 0) {
                        console.log('🔍 DEBUG: Found email settings, storing...');
                        // Store all saved email settings
                        setSavedEmailSettings(emailSettings);
                        console.log('🔍 DEBUG: savedEmailSettings state updated with:', emailSettings);
                        
                        // Select the first one as default
                        const firstSetting = emailSettings[0];
                        setSelectedEmailSetting(firstSetting);
                        console.log('🔍 DEBUG: selectedEmailSetting state updated:', firstSetting);
                        
                        // Populate form with first setting
                        setEmailSettings({
                            admin_email: firstSetting.email_address || '',
                            support_email: firstSetting.reply_to_email || '',
                            notification_email: firstSetting.from_email || '',
                            email_signature: ''
                        });
                        console.log('🔍 DEBUG: emailSettings state updated');
                        
                        setSmtpSettings({
                            smtp_host: firstSetting.smtp_host || 'smtp.gmail.com',
                            smtp_port: firstSetting.smtp_port || 587,
                            smtp_username: firstSetting.smtp_username || '',
                            smtp_password: '', // Don't load password for security
                            smtp_use_tls: firstSetting.use_tls || true,
                            smtp_use_ssl: firstSetting.use_ssl || false,
                            from_email: firstSetting.from_email || '',
                            from_name: firstSetting.from_name || 'Your Store Name'
                        });
                        console.log('🔍 DEBUG: smtpSettings state updated');
                    } else {
                        console.log('🔍 DEBUG: No email settings found in API response');
                        console.log('🔍 DEBUG: emailSettings array is:', emailSettings);
                    }
                } else {
                    console.log('🔍 DEBUG: API response not ok:', response.status, response.statusText);
                    const errorText = await response.text();
                    console.log('🔍 DEBUG: Error response:', errorText);
                }
            } catch (err) {
                console.log('🔍 DEBUG: Error loading email settings:', err);
                console.log('🔍 DEBUG: Error details:', err.message);
            }
        };
        
        loadExistingEmailSettings();
    }, []);

    // Fetch all orders (admin can see all orders)
    const fetchAllOrders = async () => {
        setOrdersLoading(true);
        setOrdersError(null);
        try {
            const token = localStorage.getItem('token');
            console.log('Using token:', token);
            const response = await fetch('http://localhost:8000/api/orders/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                const data = await response.json();
                console.log('All orders fetched:', data);
                console.log('Orders count:', data.results ? data.results.length : data.length);
                setOrders(data.results || data);
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch orders:', errorData);
                console.error('Response status:', response.status);
                setOrdersError(`Failed to fetch orders: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }
        } catch(error) {
            console.error('Error fetching orders:', error);
            setOrdersError('Network error occurred');
        } finally {
            setOrdersLoading(false);
        }
    };

    // Update order status
    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/orders/${orderId}/update-status/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({status: newStatus})
            });

            if(response.ok) {
                const data = await response.json();
                console.log('Order status updated:', data);
                setToast({show: true, message: data.message, type: 'success'});

                // Refresh orders list
                fetchAllOrders();

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

    // View order details
    const viewOrderDetails = (order) => {
        setSelectedOrder(order);
        setShowOrderModal(true);
    };

    // Format order status for display
    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending': {class: 'badge-warning', text: 'Pending'},
            'processing': {class: 'badge-info', text: 'Processing'},
            'shipped': {class: 'badge-primary', text: 'Shipped'},
            'delivered': {class: 'badge-success', text: 'Delivered'},
            'cancelled': {class: 'badge-danger', text: 'Cancelled'},
            'refunded': {class: 'badge-secondary', text: 'Refunded'}
        };

        const config = statusConfig[status] || {class: 'badge-secondary', text: status};
        return <span className={`badge ${config.class}`}>{config.text}</span>;
    };

    // Get filtered orders
    const getFilteredOrders = () => {
        if(orderStatusFilter === 'all') {
            // Show only active orders (pending, processing, confirmed, shipped)
            return orders.filter(order =>
                ['pending', 'processing', 'confirmed', 'shipped'].includes(order.status)
            );
        }
        return orders.filter(order => order.status === orderStatusFilter);
    };

    // Fetch all users (admin can see all users)
    const fetchAllUsers = async () => {
        try {
            setUsersLoading(true);
            setUsersError(null);
            const token = localStorage.getItem('token');
            console.log('Fetching users with token:', token);
            console.log('API endpoint: http://localhost:8000/api/accounts/users/');
            const response = await fetch('http://localhost:8000/api/accounts/users/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                const data = await response.json();
                console.log('All users fetched:', data);
                console.log('Users count:', data.results ? data.results.length : data.length);
                setUsers(data.results || data);
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch users:', errorData);
                console.error('Response status:', response.status);
                setUsersError(`Failed to fetch users: ${response.status} - ${errorData.message || 'Unknown error'}`);
            }
        } catch(error) {
            console.error('Error fetching users:', error);
            setUsersError('Network error occurred');
        } finally {
            setUsersLoading(false);
        }
    };

    // View user details
    const viewUserDetails = (user) => {
        setSelectedUser(user);
        setShowUserModal(true);
    };

    // Show user status confirmation modal
    const showUserStatusConfirmation = (user, action) => {
        setSelectedUser(user);
        setUserStatusAction(action);
        setShowUserStatusModal(true);
    };

    // Toggle user active status (after confirmation)
    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const newStatus = !currentStatus;
            const response = await fetch(`http://localhost:8000/api/accounts/users/${userId}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({is_active: newStatus})
            });

            if(response.ok) {
                const data = await response.json();
                console.log('User status updated:', data);
                setToast({show: true, message: `User ${newStatus ? 'activated' : 'deactivated'} successfully`, type: 'success'});

                // Refresh users list
                fetchAllUsers();
                // Close modal
                setShowUserStatusModal(false);
            } else {
                const errorData = await response.json();
                console.error('Failed to update user status:', errorData);
                setToast({show: true, message: 'Failed to update user status', type: 'error'});
            }
        } catch(error) {
            console.error('Error updating user status:', error);
            setToast({show: true, message: 'Network error occurred', type: 'error'});
        }
    };

    // Get filtered users
    const getFilteredUsers = () => {
        if(userStatusFilter === 'all') {
            return users;
        } else if(userStatusFilter === 'active') {
            return users.filter(user => user.is_active);
        } else if(userStatusFilter === 'inactive') {
            return users.filter(user => !user.is_active);
        } else if(userStatusFilter === 'admin') {
            return users.filter(user => user.is_staff || user.is_superuser);
        }
        return users.filter(user => user.is_active); // Default to active users
    };

    const getInactiveUsers = () => {
        if(!users || users.length === 0) return [];
        return users.filter(user => !user.is_active);
    };

    // Format user role
    const getUserRole = (user) => {
        if(user.is_superuser) return 'Super Admin';
        if(user.is_staff) return 'Admin';
        return 'Customer';
    };

    // Get user role badge class
    const getUserRoleBadge = (user) => {
        if(user.is_superuser) return 'badge-danger';
        if(user.is_staff) return 'badge-warning';
        return 'badge-primary';
    };

    // Fetch user orders
    const fetchUserOrders = async (userId) => {
        setUserOrdersLoading(true);
        try {
            const token = localStorage.getItem('token');
            console.log(`🔍 Fetching orders for user ID: ${userId}`);
            const response = await fetch(`http://localhost:8000/api/orders/?user=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                const data = await response.json();
                console.log(`🔍 Orders response for user ${userId}:`, data);
                setUserOrders(data.results || data);
            } else {
                console.error('Failed to fetch user orders:', response.statusText);
                setUserOrders([]);
            }
        } catch(error) {
            console.error('Error fetching user orders:', error);
            setUserOrders([]);
        } finally {
            setUserOrdersLoading(false);
        }
    };

    // View user orders
    const viewUserOrders = (user) => {
        console.log(`🔍 Viewing orders for user:`, user);
        console.log(`🔍 User ID: ${user.id}, Email: ${user.email}, Name: ${user.full_name || user.username}`);
        setSelectedUser(user);
        setShowUserOrdersModal(true);
        fetchUserOrders(user.id);
    };

    // Fetch dashboard statistics
    const fetchStatistics = async () => {
        setStatisticsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/accounts/statistics/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                const data = await response.json();
                if(data.success) {
                    setStatistics(data.data);
                } else {
                    console.error('Failed to fetch statistics:', data.message);
                }
            } else {
                console.error('Failed to fetch statistics:', response.statusText);
            }
        } catch(error) {
            console.error('Error fetching statistics:', error);
        } finally {
            setStatisticsLoading(false);
        }
    };

    // Fetch sales analytics
    const fetchSalesAnalytics = async () => {
        setSalesAnalyticsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/analytics/sales-analytics/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                const data = await response.json();
                if(data.success) {
                    setSalesAnalytics(data.data);
                } else {
                    console.error('Failed to fetch sales analytics:', data.message);
                }
            } else {
                console.error('Failed to fetch sales analytics:', response.statusText);
            }
        } catch(error) {
            console.error('Error fetching sales analytics:', error);
        } finally {
            setSalesAnalyticsLoading(false);
        }
    };

    // Generate Excel report
    const generateExcelReport = async () => {
        setIsGeneratingReport(true);
        try {
            const token = localStorage.getItem('token');

            const params = new URLSearchParams({
                type: reportType,
                period: reportPeriod
            });
            if(reportPeriod === 'custom' && customStartDate && customEndDate) {
                params.append('start_date', customStartDate);
                params.append('end_date', customEndDate);
            }

            const response = await fetch(`http://localhost:8000/api/analytics/excel-report/?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if(response.ok) {
                const contentDisposition = response.headers.get('Content-Disposition');
                let filename = `${reportType}_report.xlsx`;
                if(contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
                    if(filenameMatch) {
                        filename = filenameMatch[1];
                    }
                }

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);

                setToast({show: true, title: 'Excel Generated', message: 'Your Excel report is downloading now.', type: 'success'});
            } else {
                const text = await response.text();
                setToast({show: true, title: 'Generation Failed', message: text || 'Failed to generate Excel report. Please try again.', type: 'error'});
            }
        } catch(error) {
            setToast({show: true, title: 'Network Error', message: 'Could not generate the Excel report. Please check your connection.', type: 'error'});
        } finally {
            setIsGeneratingReport(false);
        }
    };

    // Category management functions
    const fetchCategories = async () => {
        setCategoriesLoading(true);
        setCategoriesError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/products/category/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                const data = await response.json();
                console.log('Categories fetched:', data);
                console.log('First category image URL:', data.results?.[0]?.image || data?.[0]?.image);
                setCategories(data.results || data);
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch categories:', errorData);
                setCategoriesError('Failed to fetch categories');
            }
        } catch(error) {
            console.error('Error fetching categories:', error);
            setCategoriesError('Network error occurred');
        } finally {
            setCategoriesLoading(false);
        }
    };

    const handleCategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            formData.append('name', categoryForm.name);
            formData.append('description', categoryForm.description);
            formData.append('is_active', categoryForm.is_active);

            if(categoryForm.image) {
                formData.append('image', categoryForm.image);
            }

            const url = editingCategory
                ? `http://localhost:8000/api/products/category/${editingCategory.slug}/`
                : 'http://localhost:8000/api/products/category/';

            const method = editingCategory ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if(response.ok) {
                const data = await response.json();
                console.log('Category saved:', data);
                setToast({
                    show: true,
                    message: editingCategory ? 'Category updated successfully!' : 'Category created successfully!',
                    type: 'success'
                });

                // Reset form and close modal
                setCategoryForm({name: '', description: '', image: null, is_active: true});
                setEditingCategory(null);
                setShowCategoryModal(false);

                // Refresh categories list
                fetchCategories();
            } else {
                const errorData = await response.json();
                console.error('Failed to save category:', errorData);
                setToast({
                    show: true,
                    message: errorData.message || 'Failed to save category',
                    type: 'error'
                });
            }
        } catch(error) {
            console.error('Error saving category:', error);
            setToast({show: true, message: 'Network error occurred', type: 'error'});
        }
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
        setCategoryForm({
            name: category.name,
            description: category.description || '',
            image: null,
            is_active: category.is_active
        });
        setShowCategoryModal(true);
    };

    const handleDeleteCategory = (category) => {
        setDeleteItem(category);
        setDeleteType('category');
        setShowDeleteModal(true);
    };

    const confirmDeleteCategory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/products/category/${deleteItem.slug}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if(response.ok) {
                setToast({show: true, message: 'Category deleted successfully!', type: 'success'});
                fetchCategories();
            } else {
                const errorData = await response.json();
                console.error('Failed to delete category:', errorData);
                setToast({show: true, message: errorData.message || 'Failed to delete category', type: 'error'});
            }
        } catch(error) {
            console.error('Error deleting category:', error);
            setToast({show: true, message: 'Network error occurred', type: 'error'});
        } finally {
            setShowDeleteModal(false);
            setDeleteItem(null);
            setDeleteType('');
        }
    };

    const resetCategoryForm = () => {
        setCategoryForm({name: '', description: '', image: null, is_active: true});
        setEditingCategory(null);
        setShowCategoryModal(false);
    };

    // Subcategory management functions
    const fetchSubcategories = async () => {
        setSubcategoriesLoading(true);
        setSubcategoriesError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/products/subcategory/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                const data = await response.json();
                console.log('Subcategories fetched:', data);
                console.log('Subcategories count:', (data.results || data).length);
                setSubcategories(data.results || data);
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch subcategories:', errorData);
                console.error('Response status:', response.status);
                setSubcategoriesError('Failed to fetch subcategories');
            }
        } catch(error) {
            console.error('Error fetching subcategories:', error);
            setSubcategoriesError('Network error occurred');
        } finally {
            setSubcategoriesLoading(false);
        }
    };

    const handleSubcategorySubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();

            formData.append('category', subcategoryForm.category);
            formData.append('name', subcategoryForm.name);
            formData.append('description', subcategoryForm.description);
            formData.append('is_active', subcategoryForm.is_active);

            if(subcategoryForm.image) {
                formData.append('image', subcategoryForm.image);
            }

            const url = editingSubcategory
                ? `http://localhost:8000/api/products/subcategory/${editingSubcategory.slug}/`
                : 'http://localhost:8000/api/products/subcategory/';

            const method = editingSubcategory ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if(response.ok) {
                const data = await response.json();
                console.log('Subcategory saved:', data);
                setToast({
                    show: true,
                    message: editingSubcategory ? 'Subcategory updated successfully!' : 'Subcategory created successfully!',
                    type: 'success'
                });

                // Reset form and close modal
                setSubcategoryForm({category: '', name: '', description: '', image: null, is_active: true});
                setEditingSubcategory(null);
                setShowSubcategoryModal(false);

                // Refresh subcategories list
                fetchSubcategories();
            } else {
                const errorData = await response.json();
                console.error('Failed to save subcategory:', errorData);
                setToast({
                    show: true,
                    message: errorData.message || 'Failed to save subcategory',
                    type: 'error'
                });
            }
        } catch(error) {
            console.error('Error saving subcategory:', error);
            setToast({show: true, message: 'Network error occurred', type: 'error'});
        }
    };

    const handleEditSubcategory = (subcategory) => {
        setEditingSubcategory(subcategory);
        setSubcategoryForm({
            category: subcategory.category,
            name: subcategory.name,
            description: subcategory.description || '',
            image: null,
            is_active: subcategory.is_active
        });
        setShowSubcategoryModal(true);
    };

    const handleDeleteSubcategory = (subcategory) => {
        setDeleteItem(subcategory);
        setDeleteType('subcategory');
        setShowDeleteModal(true);
    };

    const confirmDeleteSubcategory = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/products/subcategory/${deleteItem.slug}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if(response.ok) {
                setToast({show: true, message: 'Subcategory deleted successfully!', type: 'success'});
                fetchSubcategories();
            } else {
                const errorData = await response.json();
                console.error('Failed to delete subcategory:', errorData);
                setToast({show: true, message: errorData.message || 'Failed to delete subcategory', type: 'error'});
            }
        } catch(error) {
            console.error('Error deleting subcategory:', error);
            setToast({show: true, message: 'Network error occurred', type: 'error'});
        } finally {
            setShowDeleteModal(false);
            setDeleteItem(null);
            setDeleteType('');
        }
    };

    const resetSubcategoryForm = () => {
        setSubcategoryForm({category: '', name: '', description: '', image: null, is_active: true});
        setEditingSubcategory(null);
        setShowSubcategoryModal(false);
    };

    // Product management functions
    const fetchProducts = async () => {
        setProductsLoading(true);
        setProductsError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/products/product/', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                const data = await response.json();
                console.log('Products fetched:', data);
                // Filter out archived products
                const allProducts = data.results || data;
                const activeProducts = allProducts.filter(product => product.status !== 'archived');
                setProducts(activeProducts);
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch products:', errorData);
                setProductsError('Failed to fetch products');
            }
        } catch(error) {
            console.error('Error fetching products:', error);
            setProductsError('Network error occurred');
        } finally {
            setProductsLoading(false);
        }
    };

    const fetchArchivedProducts = async () => {
        setArchivedProductsLoading(true);
        setArchivedProductsError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/products/product/?status=archived', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                const data = await response.json();
                console.log('Archived products fetched:', data);
                // Filter only archived products
                const allProducts = data.results || data;
                const archivedOnly = allProducts.filter(product => product.status === 'archived');
                console.log('Archived products with image data:', archivedOnly.map(p => ({
                    title: p.title,
                    primary_image: p.primary_image,
                    image_type: typeof p.primary_image
                })));
                setArchivedProducts(archivedOnly);
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch archived products:', errorData);
                setArchivedProductsError('Failed to fetch archived products');
            }
        } catch(error) {
            console.error('Error fetching archived products:', error);
            setArchivedProductsError('Network error occurred');
        } finally {
            setArchivedProductsLoading(false);
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Validate variants for variable products
            if(productForm.product_type === 'variable') {
                for(let i = 0; i < productVariants.length; i++) {
                    const variant = productVariants[i];
                    if(!variant.price || variant.price === '') {
                        setToast({show: true, message: `Variant ${i + 1} must have a price`, type: 'error'});
                        return;
                    }
                    if(parseFloat(variant.price) < 0) {
                        setToast({show: true, message: `Variant ${i + 1} price must be non-negative`, type: 'error'});
                        return;
                    }
                }
            }

            const token = localStorage.getItem('token');
            const formData = new FormData();

            // Add basic product fields
            Object.keys(productForm).forEach(key => {
                if(productForm[key] !== '' && productForm[key] !== null) {
                    formData.append(key, productForm[key]);
                }
            });

            // Add product options
            if(productOptions.length > 0) {
                productOptions.forEach((option, index) => {
                    formData.append(`options[${index}][name]`, option.name);
                    formData.append(`options[${index}][position]`, option.position);
                });
            }

            // Add images
            productImages.forEach((image, index) => {
                formData.append(`uploaded_images`, image);
            });

            // Add variants for variable products
            if(productForm.product_type === 'variable' && productVariants.length > 0) {
                productVariants.forEach((variant, index) => {
                    Object.keys(variant).forEach(key => {
                        if(variant[key] !== '' && variant[key] !== null) {
                            if(key === 'dynamic_options' && Array.isArray(variant[key])) {
                                // Handle dynamic_options array properly
                                variant[key].forEach((option, optionIndex) => {
                                    formData.append(`variants[${index}][dynamic_options][${optionIndex}][name]`, option.name);
                                    formData.append(`variants[${index}][dynamic_options][${optionIndex}][value]`, option.value);
                                    formData.append(`variants[${index}][dynamic_options][${optionIndex}][position]`, option.position);
                                });
                            } else {
                                formData.append(`variants[${index}][${key}]`, variant[key]);
                            }
                        }
                    });
                });
            }

            const url = editingProduct
                ? `http://localhost:8000/api/products/product/${editingProduct.slug}/`
                : 'http://localhost:8000/api/products/product/';

            const method = editingProduct ? 'PUT' : 'POST';

            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            if(response.ok) {
                const data = await response.json();
                console.log('Product saved:', data);
                setToast({
                    show: true,
                    message: editingProduct ? 'Product updated successfully!' : 'Product created successfully!',
                    type: 'success'
                });

                // Reset form and close modal
                resetProductForm();

                // Refresh products list
                fetchProducts();
            } else {
                const errorData = await response.json();
                console.error('Failed to save product:', errorData);
                setToast({
                    show: true,
                    message: errorData.message || 'Failed to save product',
                    type: 'error'
                });
            }
        } catch(error) {
            console.error('Error saving product:', error);
            setToast({show: true, message: 'Network error occurred', type: 'error'});
        }
    };

    const resetProductForm = () => {
        setProductForm({
            title: '',
            description: '',
            short_description: '',
            category: '',
            subcategory: '',
            product_type: 'simple',
            status: 'draft',
            price: '',
            old_price: '',
            quantity: '',
            track_quantity: true,
            allow_backorder: false,
            weight: '',
            weight_unit: 'kg',
            requires_shipping: true,
            taxable: true,
            featured: false,
            tags: ''
        });
        setProductOptions([]);
        setProductImages([]);
        setProductVariants([]);
        setEditingProduct(null);
        setShowProductModal(false);
    };

    const addVariant = () => {
        const newVariant = {
            title: '',
            price: '',
            old_price: '',
            quantity: '',
            track_quantity: true,
            allow_backorder: false,
            weight: '',
            weight_unit: 'kg',
            position: productVariants.length + 1,
            is_active: true,
            // Legacy options (for backend compatibility)
            option1_name: productOptions[0]?.name || '',
            option1_value: '',
            option2_name: productOptions[1]?.name || '',
            option2_value: '',
            option3_name: productOptions[2]?.name || '',
            option3_value: '',
            // Dynamic options (for unlimited options)
            dynamic_options: productOptions.map(option => ({
                name: option.name,
                value: '',
                position: option.position
            }))
        };
        setProductVariants([...productVariants, newVariant]);
    };

    const removeVariant = (index) => {
        setProductVariants(productVariants.filter((_, i) => i !== index));
    };

    const updateVariant = (index, field, value) => {
        const updatedVariants = [...productVariants];
        updatedVariants[index][field] = value;
        setProductVariants(updatedVariants);
    };

    const addOption = () => {
        const newOption = {
            id: Date.now(),
            name: '',
            position: productOptions.length + 1
        };
        
        const updatedOptions = [...productOptions, newOption];
        setProductOptions(updatedOptions);
    };

    const removeOption = (index) => {
        setProductOptions(productOptions.filter((_, i) => i !== index));
    };

    const updateOption = (index, field, value) => {
        const updatedOptions = [...productOptions];
        updatedOptions[index][field] = value;
        setProductOptions(updatedOptions);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setProductForm({
            title: product.title || '',
            description: product.description || '',
            short_description: product.short_description || '',
            category: product.category || '',
            subcategory: product.subcategory || '',
            product_type: product.product_type || 'simple',
            status: product.status || 'draft',
            price: product.price || '',
            old_price: product.old_price || '',
            quantity: product.quantity || '',
            track_quantity: product.track_quantity !== undefined ? product.track_quantity : true,
            allow_backorder: product.allow_backorder !== undefined ? product.allow_backorder : false,
            weight: product.weight || '',
            weight_unit: product.weight_unit || 'kg',
            requires_shipping: product.requires_shipping !== undefined ? product.requires_shipping : true,
            taxable: product.taxable !== undefined ? product.taxable : true,
            featured: product.featured !== undefined ? product.featured : false,
            tags: product.tags || '',
            option1_name: product.option1_name || '',
            option2_name: product.option2_name || '',
            option3_name: product.option3_name || ''
        });

        // Set existing images (if any)
        setProductImages([]);

        // Set existing variants (if any)
        if(product.variants && product.variants.length > 0) {
            setProductVariants(product.variants);
        } else {
            setProductVariants([]);
        }

        setShowProductModal(true);
    };

    const handleDeleteProduct = (product) => {
        setDeleteItem(product);
        setDeleteType('product');
        setShowDeleteModal(true);
    };

    const confirmDeleteProduct = async () => {
        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`http://localhost:8000/api/products/product/${deleteItem.slug}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if(response.ok) {
                const data = await response.json();

                if(data.archived) {
                    setToast({
                        show: true,
                        message: `Product archived successfully! (Referenced in ${data.order_count} orders)`,
                        type: 'warning'
                    });
                } else if(data.deleted) {
                    setToast({
                        show: true,
                        message: 'Product deleted successfully!',
                        type: 'success'
                    });
                } else {
                    setToast({
                        show: true,
                        message: data.message || 'Product processed successfully!',
                        type: 'success'
                    });
                }

                // Refresh products list
                fetchProducts();
            } else {
                const errorData = await response.json();
                console.error('Failed to delete product:', errorData);
                setToast({
                    show: true,
                    message: errorData.error || 'Failed to delete product',
                    type: 'error'
                });
            }
        } catch(error) {
            console.error('Error deleting product:', error);
            setToast({show: true, message: 'Network error occurred', type: 'error'});
        } finally {
            setShowDeleteModal(false);
            setDeleteItem(null);
            setDeleteType('');
        }
    };

    const handleRestoreProduct = async (product) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/products/product/${product.slug}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: 'active'
                })
            });

            if(response.ok) {
                setToast({
                    show: true,
                    message: 'Product restored successfully!',
                    type: 'success'
                });

                // Refresh archived products list
                fetchArchivedProducts();
            } else {
                const errorData = await response.json();
                console.error('Failed to restore product:', errorData);
                setToast({
                    show: true,
                    message: errorData.error || 'Failed to restore product',
                    type: 'error'
                });
            }
        } catch(error) {
            console.error('Error restoring product:', error);
            setToast({show: true, message: 'Network error occurred', type: 'error'});
        }
    };

    // Mark auth checking done once context is ready (no clearing or redirect here)
    useEffect(() => {
        if(!isAuthReady) return;
        setAuthChecking(false);
    }, [isAuthReady]);

    // Additional check for localStorage changes (logout from other tabs)
    useEffect(() => {
        if(!isAuthReady) return;
        const handleStorageChange = () => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if(!token || !savedUser) {
                navigate('/signin');
            }
        };

        window.addEventListener('storage', handleStorageChange);

        // Also check periodically for token validity
        const interval = setInterval(() => {
            const token = localStorage.getItem('token');
            const savedUser = localStorage.getItem('user');

            if(!token || !savedUser) {
                navigate('/signin');
            }
        }, 1000); // Check every second

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            clearInterval(interval);
        };
    }, [navigate, isAuthReady]);

    // Fetch data when tabs are active
    useEffect(() => {
        // Always fetch statistics and sales analytics when component mounts
        fetchStatistics();
        fetchSalesAnalytics();

        if(activeTab === 'orders') {
            fetchAllOrders();
        } else if(activeTab === 'users') {
            fetchAllUsers();
        } else if(activeTab === 'categories') {
            fetchCategories();
        } else if(activeTab === 'subcategories') {
            fetchSubcategories();
            // Also fetch categories for subcategory form dropdown
            if(categories.length === 0) {
                fetchCategories();
            }
        } else if(activeTab === 'products') {
            fetchProducts();
            // Fetch categories and subcategories for product form
            if(categories.length === 0) {
                fetchCategories();
            }
            if(subcategories.length === 0) {
                fetchSubcategories();
            }
        } else if(activeTab === 'settings') {
            // Load current admin profile
            const loadProfile = async () => {
                try {
                    setProfileLoading(true);
                    setProfileError(null);
                    const token = localStorage.getItem('token');
                    const res = await fetch('http://localhost:8000/api/accounts/profile/', {
                        headers: {'Authorization': `Bearer ${token}`}
                    });
                    if(res.ok) {
                        const data = await res.json();
                        setSettingsForm({
                            id: data.id || null,
                            email: data.email || '',
                            username: data.username || '',
                            full_name: data.full_name || '',
                            address: data.address || '',
                            city: data.city || '',
                            zipcode: data.zipcode || '',
                            country: data.country || '',
                            phone: data.phone || ''
                        });
                    } else {
                        setProfileError('Failed to load profile');
                    }
                } catch(err) {
                    setProfileError('Network error while loading profile');
                } finally {
                    setProfileLoading(false);
                }
            };
            loadProfile();
        } else if(activeTab === 'archived-products') {
            fetchArchivedProducts();
        }
    }, [activeTab]);

    useEffect(() => {
        if(activeTab === 'inbox') {
            console.debug('[AdminDashboard] activeTab switched to inbox');
        }
    }, [activeTab]);

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
                                    <h5>Checking Admin Access...</h5>
                                    <p className="text-muted">Please wait while we verify your admin privileges.</p>
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
            {/* Toast Renderer */}
            {toast.show && (
                <div className={`toast-notification ${toast.show ? 'toast-show' : ''} ${toast.type === 'success' ? 'toast-success' : 'toast-error'}`}>
                    <div className="toast-content">
                        <div className="toast-icon">
                            <i className={`fa ${toast.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                        </div>
                        <div className="toast-message">
                            {toast.title && <strong>{toast.title}</strong>}
                            <p>{toast.message}</p>
                        </div>
                        <button className="toast-close" onClick={() => setToast({...toast, show: false})}>×</button>
                    </div>
                    <div className="toast-progress">
                        <div className="toast-progress-bar"></div>
                    </div>
                </div>
            )}
            <div className="container">
                <div className="row">
                    <aside className="col-md-3">
                        {/* ADMIN SIDEBAR */}
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
                                className={`list-group-item ${activeTab === 'products' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('products');
                                }}
                            >
                                <i className="fa fa-box mr-2"></i>
                                Manage Products
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'orders' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('orders');
                                }}
                            >
                                <i className="fa fa-shopping-cart mr-2"></i>
                                Manage Orders
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'archived-products' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('archived-products');
                                }}
                            >
                                <i className="fa fa-archive mr-2"></i>
                                Archived Products
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'users' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('users');
                                }}
                            >
                                <i className="fa fa-users mr-2"></i>
                                Manage Users
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'categories' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('categories');
                                }}
                            >
                                <i className="fa fa-tags mr-2"></i>
                                Manage Categories
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'subcategories' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('subcategories');
                                }}
                            >
                                <i className="fa fa-list mr-2"></i>
                                Manage Subcategories
                            </a>
                            <a
                                className={`list-group-item d-flex justify-content-between align-items-center ${activeTab === 'inbox' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    console.debug('[AdminDashboard] Inbox sidebar item clicked');
                                    setActiveTab('inbox');
                                }}
                            >
                                <div className="d-flex align-items-center">
                                    <i className="fa fa-inbox mr-2"></i>
                                    Inbox
                                </div>
                                <div className="d-flex align-items-center">
                                    {inboxUnreadCount > 0 && (
                                        <span className="badge bg-danger mr-2">{inboxUnreadCount}</span>
                                    )}
                                    <small className={`${wsConnected ? 'text-success' : 'text-warning'}`}>
                                        <i className={`fa fa-circle ${wsConnected ? 'text-success' : 'text-warning'}`}></i>
                                        {wsConnected ? 'Live' : 'Offline'}
                                    </small>
                                </div>
                            </a>

                            <a
                                className={`list-group-item ${activeTab === 'contacts' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('contacts');
                                }}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <i className="fa fa-envelope mr-2"></i>
                                        Contact Messages
                                    </div>
                                    {contactUnreadCount > 0 && (
                                        <span className="badge bg-danger">{contactUnreadCount}</span>
                                    )}
                                </div>
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'reports' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('reports');
                                }}
                            >
                                <i className="fa fa-chart-bar mr-2"></i>
                                Reports
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
                        </ul>
                        <br />
                        <a className="btn btn-light btn-block" href="#" onClick={(e) => {
                            e.preventDefault();
                            logout();
                            // Force immediate redirect
                            window.location.href = '/';
                        }}>
                            <i className="fa fa-power-off"></i>
                            <span className="text">Log out</span>
                        </a>
                        
                    </aside>

                    <main className="col-md-9">
                        {activeTab === 'dashboard' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Admin Dashboard</strong>
                                    <span>Welcome, {user?.full_name || user?.email || 'Admin'}</span>
                                </header>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="card bg-primary text-white">
                                                <div className="card-body">
                                                    <h5>Total Orders</h5>
                                                    <h2>
                                                        {statisticsLoading ? (
                                                            <i className="fa fa-spinner fa-spin"></i>
                                                        ) : (
                                                            statistics.total_orders.toLocaleString()
                                                        )}
                                                    </h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-success text-white">
                                                <div className="card-body">
                                                    <h5>Total Products</h5>
                                                    <h2>
                                                        {statisticsLoading ? (
                                                            <i className="fa fa-spinner fa-spin"></i>
                                                        ) : (
                                                            statistics.total_products.toLocaleString()
                                                        )}
                                                    </h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-warning text-white">
                                                <div className="card-body">
                                                    <h5>Total Users</h5>
                                                    <h2>
                                                        {statisticsLoading ? (
                                                            <i className="fa fa-spinner fa-spin"></i>
                                                        ) : (
                                                            statistics.total_users.toLocaleString()
                                                        )}
                                                    </h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-info text-white">
                                                <div className="card-body">
                                                    <h5>Revenue</h5>
                                                    <h2>
                                                        {statisticsLoading ? (
                                                            <i className="fa fa-spinner fa-spin"></i>
                                                        ) : (
                                                            `$${statistics.total_revenue.toLocaleString()}`
                                                        )}
                                                    </h2>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sales Analytics Section */}
                                    <div className="row mt-4">
                                        <div className="col-12">
                                            <h5 className="mb-3">
                                                <i className="fa fa-chart-line mr-2"></i>
                                                Sales Analytics
                                            </h5>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card bg-info text-white">
                                                <div className="card-body">
                                                    <h6>Today's Sales</h6>
                                                    <h4>
                                                        {salesAnalyticsLoading ? (
                                                            <i className="fa fa-spinner fa-spin"></i>
                                                        ) : (
                                                            `$${salesAnalytics.daily_sales.total_amount.toLocaleString()}`
                                                        )}
                                                    </h4>
                                                    <small>
                                                        {salesAnalytics.daily_sales.order_count} orders
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card bg-warning text-white">
                                                <div className="card-body">
                                                    <h6>7 Days Sales</h6>
                                                    <h4>
                                                        {salesAnalyticsLoading ? (
                                                            <i className="fa fa-spinner fa-spin"></i>
                                                        ) : (
                                                            `$${salesAnalytics.weekly_sales.total_amount.toLocaleString()}`
                                                        )}
                                                    </h4>
                                                    <small>
                                                        {salesAnalytics.weekly_sales.order_count} orders
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card bg-success text-white">
                                                <div className="card-body">
                                                    <h6>30 Days Sales</h6>
                                                    <h4>
                                                        {salesAnalyticsLoading ? (
                                                            <i className="fa fa-spinner fa-spin"></i>
                                                        ) : (
                                                            `$${salesAnalytics.monthly_sales.total_amount.toLocaleString()}`
                                                        )}
                                                    </h4>
                                                    <small>
                                                        {salesAnalytics.monthly_sales.order_count} orders
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Sales Chart Section */}
                                    <div className="row mt-4">
                                        <div className="col-12">
                                            <div className="card">
                                                <div className="card-header">
                                                    <h6 className="mb-0">
                                                        <i className="fa fa-chart-bar mr-2"></i>
                                                        Sales Trend (Last 7 Days)
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    {salesAnalyticsLoading ? (
                                                        <div className="text-center py-4">
                                                            <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                                                            <p className="mt-2">Loading chart data...</p>
                                                        </div>
                                                    ) : salesAnalytics.chart_data.length > 0 ? (
                                                        <div className="table-responsive">
                                                            <table className="table table-sm">
                                                                <thead>
                                                                    <tr>
                                                                        <th>Date</th>
                                                                        <th>Day</th>
                                                                        <th>Orders</th>
                                                                        <th>Amount</th>
                                                                        <th>Chart</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {salesAnalytics.chart_data.map((day, index) => (
                                                                        <tr key={index}>
                                                                            <td>{day.date}</td>
                                                                            <td>{day.day_name}</td>
                                                                            <td>
                                                                                <span className="badge badge-primary">
                                                                                    {day.order_count}
                                                                                </span>
                                                                            </td>
                                                                            <td>
                                                                                <strong>${day.total_amount.toLocaleString()}</strong>
                                                                            </td>
                                                                            <td>
                                                                                <div className="progress" style={{height: '20px'}}>
                                                                                    <div
                                                                                        className="progress-bar bg-primary"
                                                                                        role="progressbar"
                                                                                        style={{
                                                                                            width: `${Math.max(5, (day.total_amount / Math.max(...salesAnalytics.chart_data.map(d => d.total_amount))) * 100)}%`
                                                                                        }}
                                                                                        aria-valuenow={day.total_amount}
                                                                                        aria-valuemin="0"
                                                                                        aria-valuemax={Math.max(...salesAnalytics.chart_data.map(d => d.total_amount))}
                                                                                    >
                                                                                        ${day.total_amount.toLocaleString()}
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    ) : (
                                                        <div className="text-center py-4">
                                                            <i className="fa fa-chart-line fa-3x text-muted mb-3"></i>
                                                            <h6 className="text-muted">No Sales Data Available</h6>
                                                            <p className="text-muted">Sales data will appear here once orders are placed.</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </article>
                        )}


                        {activeTab === 'products' && (
                            <article className="card" style={{overflow: 'hidden'}}>
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Manage Products</strong>
                                    <button
                                        className="btn btn-sm btn-primary float-right"
                                        onClick={() => setShowProductModal(true)}
                                    >
                                        <i className="fa fa-plus mr-1"></i>Add Product
                                    </button>
                                </header>
                                <div className="card-body" style={{overflow: 'hidden', padding: '1rem'}}>
                                    {productsLoading ? (
                                        <div className="text-center py-4">
                                            <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                                            <p className="mt-2">Loading products...</p>
                                        </div>
                                    ) : productsError ? (
                                        <div className="alert alert-danger">
                                            <i className="fa fa-exclamation-triangle mr-2"></i>
                                            {productsError}
                                        </div>
                                    ) : products && products.length > 0 ? (
                                        <div className="table-responsive" style={{overflow: 'hidden', width: '100%'}}>
                                            <table className="table table-hover" style={{width: '100%', tableLayout: 'fixed'}}>
                                                <thead>
                                                    <tr>
                                                        <th style={{width: '7%', whiteSpace: 'nowrap'}}>Image</th>
                                                        <th style={{width: '22%', whiteSpace: 'nowrap'}}>Product</th>
                                                        <th style={{width: '13%', whiteSpace: 'nowrap'}}>Category</th>
                                                        <th style={{width: '9%', whiteSpace: 'nowrap'}}>Type</th>
                                                        <th style={{width: '11%', whiteSpace: 'nowrap'}}>Price</th>
                                                        <th style={{width: '9%', whiteSpace: 'nowrap'}}>Stock</th>
                                                        <th style={{width: '9%', whiteSpace: 'nowrap'}}>Status</th>
                                                        <th style={{width: '9%', whiteSpace: 'nowrap'}}>Created</th>
                                                        <th style={{width: '11%', whiteSpace: 'nowrap'}}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {products
                                                        .slice((productsPage - 1) * 10, (productsPage - 1) * 10 + 10)
                                                        .map((product) => (
                                                            <tr key={product.id}>
                                                                <td>
                                                                    {product.primary_image && (
                                                                        <img
                                                                            src={typeof product.primary_image.image === 'string' && product.primary_image.image.startsWith('http') ? product.primary_image.image : `http://localhost:8000${product.primary_image.image}`}
                                                                            className="img-xs border"
                                                                            alt={product.title}
                                                                            style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                                                        />
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <strong>{product.title}</strong>
                                                                    <br />
                                                                    <small className="text-muted">/{product.slug}</small>
                                                                    {product.short_description && (
                                                                        <>
                                                                            <br />
                                                                            <small className="text-muted">
                                                                                {product.short_description.length > 50 ?
                                                                                    `${product.short_description.substring(0, 50)}...` :
                                                                                    product.short_description
                                                                                }
                                                                            </small>
                                                                        </>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        {product.category_name && (
                                                                            <span className="badge badge-light">{product.category_name}</span>
                                                                        )}
                                                                        {product.subcategory_name && (
                                                                            <>
                                                                                <br />
                                                                                <small className="text-muted">{product.subcategory_name}</small>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${product.product_type === 'variable' ? 'badge-info' : 'badge-secondary'}`}>
                                                                        {product.product_type}
                                                                    </span>
                                                                    {product.is_variable && (
                                                                        <>
                                                                            <br />
                                                                            <small className="text-muted">{product.variant_count} variants</small>
                                                                        </>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {product.is_variable ? (
                                                                        <div>
                                                                            <strong>${product.min_price} - ${product.max_price}</strong>
                                                                            <br />
                                                                            <small className="text-muted">Variable pricing</small>
                                                                        </div>
                                                                    ) : (
                                                                        <strong>${product.price}</strong>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    {product.is_variable ? (
                                                                        <span className="badge badge-light">{product.total_inventory} total</span>
                                                                    ) : (
                                                                        <span className={`badge ${product.quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                                                                            {product.quantity}
                                                                        </span>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${product.status === 'active' ? 'badge-success' :
                                                                        product.status === 'draft' ? 'badge-warning' :
                                                                            'badge-secondary'
                                                                        }`}>
                                                                        {product.status}
                                                                    </span>
                                                                    {product.featured && (
                                                                        <>
                                                                            <br />
                                                                            <small className="badge badge-primary">Featured</small>
                                                                        </>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <small className="text-muted">
                                                                        {new Date(product.created_at).toLocaleDateString()}
                                                                    </small>
                                                                </td>
                                                                <td>
                                                                    <div className="btn-group" role="group">
                                                                        <button
                                                                            className="btn btn-sm btn-outline-primary"
                                                                            onClick={() => handleEditProduct(product)}
                                                                            title="Edit Product"
                                                                        >
                                                                            <i className="fa fa-edit"></i>
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            onClick={() => handleDeleteProduct(product)}
                                                                            title="Delete Product"
                                                                        >
                                                                            <i className="fa fa-trash"></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                            <Pagination
                                                totalItems={products.length}
                                                currentPage={productsPage}
                                                pageSize={10}
                                                onPageChange={(p) => setProductsPage(p)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fa fa-box fa-3x text-muted mb-3"></i>
                                            <h5 className="text-muted">No Products Found</h5>
                                            <p className="text-muted">Start by creating your first product.</p>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => setShowProductModal(true)}
                                            >
                                                <i className="fa fa-plus mr-1"></i>Create Product
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        )}

                        {activeTab === 'archived-products' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Archived Products</strong>
                                    <span className="badge badge-warning">
                                        {archivedProducts.length} Archived
                                    </span>
                                </header>
                                <div className="card-body">
                                    {archivedProductsLoading ? (
                                        <div className="text-center py-4">
                                            <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                                            <p className="mt-2">Loading archived products...</p>
                                        </div>
                                    ) : archivedProductsError ? (
                                        <div className="alert alert-danger">
                                            <i className="fa fa-exclamation-triangle mr-2"></i>
                                            {archivedProductsError}
                                        </div>
                                    ) : archivedProducts && archivedProducts.length > 0 ? (
                                        <div className="table-responsive" style={{overflow: 'hidden', width: '100%'}}>
                                            <table className="table table-hover" style={{width: '100%', tableLayout: 'fixed'}}>
                                                <thead>
                                                    <tr>
                                                        <th style={{width: '7%', whiteSpace: 'nowrap'}}>Image</th>
                                                        <th style={{width: '22%', whiteSpace: 'nowrap'}}>Product</th>
                                                        <th style={{width: '13%', whiteSpace: 'nowrap'}}>Category</th>
                                                        <th style={{width: '9%', whiteSpace: 'nowrap'}}>Type</th>
                                                        <th style={{width: '11%', whiteSpace: 'nowrap'}}>Price</th>
                                                        <th style={{width: '9%', whiteSpace: 'nowrap'}}>Stock</th>
                                                        <th style={{width: '9%', whiteSpace: 'nowrap'}}>Status</th>
                                                        <th style={{width: '9%', whiteSpace: 'nowrap'}}>Archived</th>
                                                        <th style={{width: '11%', whiteSpace: 'nowrap'}}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {archivedProducts.map((product) => (
                                                        <tr key={product.id}>
                                                            <td>
                                                                {product.primary_image && (
                                                                    <img
                                                                        src={
                                                                            typeof product.primary_image === 'string'
                                                                                ? (product.primary_image.startsWith('http') ? product.primary_image : `http://localhost:8000${product.primary_image}`)
                                                                                : product.primary_image.image
                                                                                    ? (typeof product.primary_image.image === 'string' && product.primary_image.image.startsWith('http') ? product.primary_image.image : `http://localhost:8000${product.primary_image.image}`)
                                                                                    : '#'
                                                                        }
                                                                        className="img-xs border"
                                                                        alt={product.title}
                                                                        style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                                                        onError={(e) => {
                                                                            e.target.style.display = 'none';
                                                                        }}
                                                                    />
                                                                )}
                                                            </td>
                                                            <td>
                                                                <strong>{product.title}</strong>
                                                                <br />
                                                                <small className="text-muted">/{product.slug}</small>
                                                                {product.short_description && (
                                                                    <>
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            {product.short_description.length > 50 ?
                                                                                `${product.short_description.substring(0, 50)}...` :
                                                                                product.short_description
                                                                            }
                                                                        </small>
                                                                    </>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <div>
                                                                    {product.category_name && (
                                                                        <span className="badge badge-light">{product.category_name}</span>
                                                                    )}
                                                                    {product.subcategory_name && (
                                                                        <>
                                                                            <br />
                                                                            <small className="text-muted">{product.subcategory_name}</small>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${product.product_type === 'variable' ? 'badge-info' : 'badge-secondary'}`}>
                                                                    {product.product_type}
                                                                </span>
                                                                {product.is_variable && (
                                                                    <>
                                                                        <br />
                                                                        <small className="text-muted">{product.variant_count} variants</small>
                                                                    </>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {product.is_variable ? (
                                                                    <div>
                                                                        <strong>${product.min_price} - ${product.max_price}</strong>
                                                                        <br />
                                                                        <small className="text-muted">Variable pricing</small>
                                                                    </div>
                                                                ) : (
                                                                    <strong>${product.price}</strong>
                                                                )}
                                                            </td>
                                                            <td>
                                                                {product.is_variable ? (
                                                                    <span className="text-muted">{product.total_inventory} total</span>
                                                                ) : (
                                                                    <span>{product.quantity}</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${product.status === 'active' ? 'badge-success' :
                                                                    product.status === 'draft' ? 'badge-warning' :
                                                                        'badge-secondary'
                                                                    }`}>
                                                                    {product.status}
                                                                </span>
                                                                {product.featured && (
                                                                    <>
                                                                        <br />
                                                                        <small className="badge badge-primary">Featured</small>
                                                                    </>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <small className="text-muted">
                                                                    {new Date(product.updated_at).toLocaleDateString()}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                <div className="btn-group" role="group">
                                                                    <button
                                                                        className="btn btn-sm btn-outline-success"
                                                                        onClick={() => handleRestoreProduct(product)}
                                                                        title="Restore Product"
                                                                    >
                                                                        <i className="fa fa-undo"></i>
                                                                    </button>
                                                                    <button
                                                                        className="btn btn-sm btn-outline-danger"
                                                                        onClick={() => handleDeleteProduct(product)}
                                                                        title="Delete Product"
                                                                    >
                                                                        <i className="fa fa-trash"></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fa fa-archive fa-3x text-muted mb-3"></i>
                                            <h5 className="text-muted">No Archived Products</h5>
                                            <p className="text-muted">No products have been archived yet.</p>
                                        </div>
                                    )}
                                </div>
                            </article>
                        )}

                        {activeTab === 'orders' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Manage Orders</strong>
                                    <div className="float-right">
                                        <select
                                            className="form-control form-control-sm d-inline-block mr-2"
                                            style={{width: 'auto'}}
                                            value={orderStatusFilter}
                                            onChange={(e) => setOrderStatusFilter(e.target.value)}
                                        >
                                            <option value="all">All Orders</option>
                                            <option value="pending">Pending</option>
                                            <option value="processing">Processing</option>
                                            <option value="shipped">Shipped</option>
                                            <option value="delivered">Delivered</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="refunded">Refunded</option>
                                        </select>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={fetchAllOrders}
                                            disabled={ordersLoading}
                                        >
                                            {ordersLoading ? 'Refreshing...' : 'Refresh'}
                                        </button>
                                    </div>
                                </header>
                                <div className="card-body">
                                    {ordersLoading ? (
                                        <div className="text-center py-4">
                                            <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                                            <p className="mt-2">Loading orders...</p>
                                        </div>
                                    ) : ordersError ? (
                                        <div className="alert alert-danger">
                                            <i className="fa fa-exclamation-triangle mr-2"></i>
                                            {ordersError}
                                        </div>
                                    ) : getFilteredOrders().length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Order #</th>
                                                        <th>Customer</th>
                                                        <th>Date</th>
                                                        <th>Status</th>
                                                        <th>Total</th>
                                                        <th>Items</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {getFilteredOrders()
                                                        .slice((ordersPage - 1) * 10, (ordersPage - 1) * 10 + 10)
                                                        .map((order) => (
                                                            <tr key={order.id}>
                                                                <td>
                                                                    <strong>#{order.order_number}</strong>
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        <strong>{order.user?.email || 'N/A'}</strong>
                                                                        {order.delivery_address && (
                                                                            <>
                                                                                <br />
                                                                                <small className="text-muted">
                                                                                    {order.delivery_address.full_name}
                                                                                </small>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    {new Date(order.created_at).toLocaleDateString()}
                                                                </td>
                                                                <td>
                                                                    <span
                                                                        className={`badge ${order.status === 'delivered' ? 'badge-success' :
                                                                            order.status === 'pending' ? 'badge-warning' :
                                                                                order.status === 'confirmed' ? 'badge-info' :
                                                                                    order.status === 'processing' ? 'badge-primary' :
                                                                                        order.status === 'shipped' ? 'badge-secondary' :
                                                                                            order.status === 'cancelled' ? 'badge-danger' :
                                                                                                'badge-light'
                                                                            }`}
                                                                    >
                                                                        {order.status_display || order.status}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <strong>${parseFloat(order.total_amount || 0).toFixed(2)}</strong>
                                                                </td>
                                                                <td>
                                                                    <span className="badge badge-light">
                                                                        {order.items ? order.items.length : 0} items
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className="btn-group" role="group">
                                                                        <button
                                                                            className="btn btn-sm btn-outline-info"
                                                                            onClick={() => viewOrderDetails(order)}
                                                                            title="View Details"
                                                                        >
                                                                            <i className="fa fa-eye"></i>
                                                                        </button>
                                                                        {order.status !== 'delivered' && (
                                                                            <button
                                                                                className="btn btn-sm btn-success"
                                                                                onClick={() => updateOrderStatus(order.id, 'delivered')}
                                                                                title="Mark as Delivered"
                                                                            >
                                                                                <i className="fa fa-check mr-1"></i>Delivered
                                                                            </button>
                                                                        )}
                                                                        {order.status !== 'processing' && order.status !== 'delivered' && (
                                                                            <button
                                                                                className="btn btn-sm btn-primary"
                                                                                onClick={() => updateOrderStatus(order.id, 'processing')}
                                                                                title="Mark as Processing"
                                                                            >
                                                                                <i className="fa fa-cog mr-1"></i>Processing
                                                                            </button>
                                                                        )}
                                                                        {order.status !== 'shipped' && order.status !== 'delivered' && (
                                                                            <button
                                                                                className="btn btn-sm btn-secondary"
                                                                                onClick={() => updateOrderStatus(order.id, 'shipped')}
                                                                                title="Mark as Shipped"
                                                                            >
                                                                                <i className="fa fa-truck mr-1"></i>Shipped
                                                                            </button>
                                                                        )}
                                                                        {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                                                            <button
                                                                                className="btn btn-sm btn-danger"
                                                                                onClick={() => updateOrderStatus(order.id, 'cancelled')}
                                                                                title="Cancel Order"
                                                                            >
                                                                                <i className="fa fa-times mr-1"></i>Cancel
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                            <Pagination
                                                totalItems={getFilteredOrders().length}
                                                currentPage={ordersPage}
                                                pageSize={10}
                                                onPageChange={(p) => setOrdersPage(p)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fa fa-shopping-cart fa-3x text-muted mb-3"></i>
                                            <h5 className="text-muted">No Orders Found</h5>
                                            <p className="text-muted">There are no orders to manage at the moment.</p>
                                        </div>
                                    )}
                                </div>
                            </article>
                        )}

                        {activeTab === 'users' && (
                            <article className="card" style={{overflow: 'hidden'}}>
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">
                                        {showInactiveUsers ? 'Inactive Users' : 'Active Users'}
                                    </strong>
                                    <div className="float-right">
                                        <button
                                            className="btn btn-sm btn-outline-secondary mr-2"
                                            onClick={() => setShowInactiveUsers(!showInactiveUsers)}
                                        >
                                            <i className={`fa ${showInactiveUsers ? 'fa-user-check' : 'fa-user-slash'} mr-1`}></i>
                                            {showInactiveUsers ? 'Show Active Users' : 'Show Inactive Users'}
                                        </button>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={fetchAllUsers}
                                            disabled={usersLoading}
                                        >
                                            {usersLoading ? 'Refreshing...' : 'Refresh'}
                                        </button>
                                    </div>
                                </header>
                                <div className="card-body" style={{overflow: 'hidden'}}>
                                    {usersLoading ? (
                                        <div className="text-center py-4">
                                            <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                                            <p className="mt-2">Loading users...</p>
                                        </div>
                                    ) : usersError ? (
                                        <div className="alert alert-danger">
                                            <i className="fa fa-exclamation-triangle mr-2"></i>
                                            {usersError}
                                        </div>
                                    ) : (showInactiveUsers ? getInactiveUsers() : users.filter(user => user.is_active)).length > 0 ? (
                                        <div className="table-responsive" style={{overflow: 'hidden', width: '100%'}}>
                                            <table className="table table-hover" style={{width: '100%', tableLayout: 'fixed'}}>
                                                <thead>
                                                    <tr>
                                                        <th style={{width: '8%', whiteSpace: 'nowrap'}}>User ID</th>
                                                        <th style={{width: '20%', whiteSpace: 'nowrap'}}>Email</th>
                                                        <th style={{width: '15%', whiteSpace: 'nowrap'}}>Name</th>
                                                        <th style={{width: '10%', whiteSpace: 'nowrap'}}>Role</th>
                                                        <th style={{width: '10%', whiteSpace: 'nowrap'}}>Status</th>
                                                        <th style={{width: '12%', whiteSpace: 'nowrap'}}>Joined</th>
                                                        <th style={{width: '12%', whiteSpace: 'nowrap'}}>Last Login</th>
                                                        <th style={{width: '13%', whiteSpace: 'nowrap'}}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(showInactiveUsers ? getInactiveUsers() : users.filter(user => user.is_active))
                                                        .slice((usersPage - 1) * 10, (usersPage - 1) * 10 + 10)
                                                        .map((user) => (
                                                            <tr key={user.id} className={showInactiveUsers ? 'table-secondary' : ''}>
                                                                <td>
                                                                    <strong>#{user.id}</strong>
                                                                </td>
                                                                <td>
                                                                    <div>
                                                                        <strong className={showInactiveUsers ? 'text-muted' : ''}>{user.email}</strong>
                                                                        {user.profile?.phone && (
                                                                            <>
                                                                                <br />
                                                                                <small className="text-muted">
                                                                                    {user.profile.phone}
                                                                                </small>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span className={showInactiveUsers ? 'text-muted' : ''}>
                                                                        {user.profile?.full_name || 'N/A'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${getUserRoleBadge(user)}`}>
                                                                        {getUserRole(user)}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${user.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                                        {user.is_active ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className={showInactiveUsers ? 'text-muted' : ''}>
                                                                        {new Date(user.date_joined).toLocaleDateString()}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className={showInactiveUsers ? 'text-muted' : ''}>
                                                                        {user.last_login ?
                                                                            new Date(user.last_login).toLocaleDateString() :
                                                                            'Never'
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className="btn-group" role="group">
                                                                        <button
                                                                            className="btn btn-sm btn-outline-info"
                                                                            onClick={() => viewUserDetails(user)}
                                                                            title="View Details"
                                                                        >
                                                                            <i className="fa fa-eye"></i>
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-warning"
                                                                            onClick={() => viewUserOrders(user)}
                                                                            title="View Orders"
                                                                        >
                                                                            <i className="fa fa-shopping-cart"></i>
                                                                        </button>
                                                                        <button
                                                                            className={`btn btn-sm ${user.is_active ? 'btn-outline-danger' : 'btn-outline-success'}`}
                                                                            onClick={() => showUserStatusConfirmation(user, user.is_active ? 'deactivate' : 'activate')}
                                                                            title={user.is_active ? 'Deactivate User' : 'Activate User'}
                                                                        >
                                                                            <i className={`fa ${user.is_active ? 'fa-ban' : 'fa-check'}`}></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                            <Pagination
                                                totalItems={(showInactiveUsers ? getInactiveUsers() : users.filter(user => user.is_active)).length}
                                                currentPage={usersPage}
                                                pageSize={10}
                                                onPageChange={(p) => setUsersPage(p)}
                                            />
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className={`fa ${showInactiveUsers ? 'fa-user-slash' : 'fa-users'} fa-3x text-muted mb-3`}></i>
                                            <h5 className="text-muted">
                                                {showInactiveUsers ? 'No Inactive Users Found' : 'No Active Users Found'}
                                            </h5>
                                            <p className="text-muted">
                                                {showInactiveUsers ?
                                                    'There are no inactive users at the moment.' :
                                                    'There are no active users to manage at the moment.'
                                                }
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </article>
                        )}


                        {activeTab === 'categories' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Manage Categories</strong>
                                    <button
                                        className="btn btn-sm btn-primary float-right"
                                        onClick={() => setShowCategoryModal(true)}
                                    >
                                        <i className="fa fa-plus mr-1"></i>Add Category
                                    </button>
                                </header>
                                <div className="card-body">
                                    {categoriesLoading ? (
                                        <div className="text-center py-4">
                                            <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                                            <p className="mt-2">Loading categories...</p>
                                        </div>
                                    ) : categoriesError ? (
                                        <div className="alert alert-danger">
                                            <i className="fa fa-exclamation-triangle mr-2"></i>
                                            {categoriesError}
                                        </div>
                                    ) : categories && categories.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Image</th>
                                                        <th>Name</th>
                                                        <th>Description</th>
                                                        <th>Status</th>
                                                        <th>Subcategories</th>
                                                        <th>Created</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {categories
                                                        .slice((categoriesPage - 1) * 10, (categoriesPage - 1) * 10 + 10)
                                                        .map((category) => (
                                                            <tr key={category.id}>
                                                                <td>
                                                                    {category.image && (
                                                                        <img
                                                                            src={category.image.startsWith('http') ? category.image : `http://localhost:8000${category.image}`}
                                                                            className="img-xs border"
                                                                            alt={category.name}
                                                                            style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                                                        />
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <strong>{category.name}</strong>
                                                                    <br />
                                                                    <small className="text-muted">/{category.slug}</small>
                                                                </td>
                                                                <td>
                                                                    <span className="text-muted">
                                                                        {category.description ?
                                                                            (category.description.length > 50 ?
                                                                                `${category.description.substring(0, 50)}...` :
                                                                                category.description
                                                                            ) :
                                                                            'No description'
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${category.is_active ? 'badge-success' : 'badge-secondary'}`}>
                                                                        {category.is_active ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className="badge badge-light">
                                                                        {category.subcategories_count || 0} subcategories
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <small className="text-muted">
                                                                        {new Date(category.created_at).toLocaleDateString()}
                                                                    </small>
                                                                </td>
                                                                <td>
                                                                    <div className="btn-group" role="group">
                                                                        <button
                                                                            className="btn btn-sm btn-outline-primary"
                                                                            onClick={() => handleEditCategory(category)}
                                                                            title="Edit Category"
                                                                        >
                                                                            <i className="fa fa-edit"></i>
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            onClick={() => handleDeleteCategory(category)}
                                                                            title="Delete Category"
                                                                        >
                                                                            <i className="fa fa-trash"></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                            <Pagination totalItems={categories.length} currentPage={categoriesPage} pageSize={10} onPageChange={(p) => setCategoriesPage(p)} />
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fa fa-tags fa-3x text-muted mb-3"></i>
                                            <h5 className="text-muted">No Categories Found</h5>
                                            <p className="text-muted">Start by creating your first category.</p>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => setShowCategoryModal(true)}
                                            >
                                                <i className="fa fa-plus mr-1"></i>Create Category
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        )}

                        {activeTab === 'subcategories' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Manage Subcategories</strong>
                                    <button
                                        className="btn btn-sm btn-primary float-right"
                                        onClick={() => setShowSubcategoryModal(true)}
                                    >
                                        <i className="fa fa-plus mr-1"></i>Add Subcategory
                                    </button>
                                </header>
                                <div className="card-body">
                                    {subcategoriesLoading ? (
                                        <div className="text-center py-4">
                                            <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                                            <p className="mt-2">Loading subcategories...</p>
                                        </div>
                                    ) : subcategoriesError ? (
                                        <div className="alert alert-danger">
                                            <i className="fa fa-exclamation-triangle mr-2"></i>
                                            {subcategoriesError}
                                        </div>
                                    ) : subcategories && subcategories.length > 0 ? (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead>
                                                    <tr>
                                                        <th>Image</th>
                                                        <th>Category</th>
                                                        <th>Name</th>
                                                        <th>Description</th>
                                                        <th>Status</th>
                                                        <th>Created</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {subcategories
                                                        .slice((subcategoriesPage - 1) * 10, (subcategoriesPage - 1) * 10 + 10)
                                                        .map((subcategory) => (
                                                            <tr key={subcategory.id}>
                                                                <td>
                                                                    {subcategory.image && (
                                                                        <img
                                                                            src={subcategory.image.startsWith('http') ? subcategory.image : `http://localhost:8000${subcategory.image}`}
                                                                            className="img-xs border"
                                                                            alt={subcategory.name}
                                                                            style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                                                        />
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <strong>{subcategory.category_name}</strong>
                                                                    <br />
                                                                    <small className="text-muted">/{subcategory.category_slug}</small>
                                                                </td>
                                                                <td>
                                                                    <strong>{subcategory.name}</strong>
                                                                    <br />
                                                                    <small className="text-muted">/{subcategory.slug}</small>
                                                                </td>
                                                                <td>
                                                                    <span className="text-muted">
                                                                        {subcategory.description ?
                                                                            (subcategory.description.length > 50 ?
                                                                                `${subcategory.description.substring(0, 50)}...` :
                                                                                subcategory.description
                                                                            ) :
                                                                            'No description'
                                                                        }
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className={`badge ${subcategory.is_active ? 'badge-success' : 'badge-secondary'}`}>
                                                                        {subcategory.is_active ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <small className="text-muted">
                                                                        {new Date(subcategory.created_at).toLocaleDateString()}
                                                                    </small>
                                                                </td>
                                                                <td>
                                                                    <div className="btn-group" role="group">
                                                                        <button
                                                                            className="btn btn-sm btn-outline-primary"
                                                                            onClick={() => handleEditSubcategory(subcategory)}
                                                                            title="Edit Subcategory"
                                                                        >
                                                                            <i className="fa fa-edit"></i>
                                                                        </button>
                                                                        <button
                                                                            className="btn btn-sm btn-outline-danger"
                                                                            onClick={() => handleDeleteSubcategory(subcategory)}
                                                                            title="Delete Subcategory"
                                                                        >
                                                                            <i className="fa fa-trash"></i>
                                                                        </button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                </tbody>
                                            </table>
                                            <Pagination totalItems={subcategories.length} currentPage={subcategoriesPage} pageSize={10} onPageChange={(p) => setSubcategoriesPage(p)} />
                                        </div>
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fa fa-tags fa-3x text-muted mb-3"></i>
                                            <h5 className="text-muted">No Subcategories Found</h5>
                                            <p className="text-muted">Start by creating your first subcategory.</p>
                                            <button
                                                className="btn btn-primary"
                                                onClick={() => setShowSubcategoryModal(true)}
                                            >
                                                <i className="fa fa-plus mr-1"></i>Create Subcategory
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </article>
                        )}

                        {activeTab === 'inbox' && (
                            <AdminChatInbox />
                        )}

                        {/* TODO: Future implementation - Notification and Discount management
                        {/* TODO: Notification and discount features will be developed in future */}
                        {/* {activeTab === 'notifications' && (
                            <AdminNotificationManager />
                        )}

                        {activeTab === 'discounts' && (
                            <AdminDiscountManager />
                        )} */}
                        

                        {activeTab === 'reports' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Reports</strong>
                                </header>
                                <div className="card-body">
                                    {/* Excel Report Generation Section */}
                                    <div className="row">
                                        <div className="col-12">
                                            <div className="card">
                                                <div className="card-header">
                                                    <h6 className="mb-0">
                                                        <i className="fa fa-file-excel mr-2 text-success"></i>
                                                        Generate Excel Reports
                                                    </h6>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-3">
                                                            <label className="form-label">Report Type</label>
                                                            <select
                                                                className="form-control"
                                                                value={reportType}
                                                                onChange={(e) => setReportType(e.target.value)}
                                                            >
                                                                <option value="sales">Sales Report</option>
                                                                <option value="orders">Orders Report</option>
                                                                <option value="users">Users Report</option>
                                                                <option value="products">Products Report</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <label className="form-label">Time Period</label>
                                                            <select
                                                                className="form-control"
                                                                value={reportPeriod}
                                                                onChange={(e) => setReportPeriod(e.target.value)}
                                                            >
                                                                <option value="7">Last 7 Days</option>
                                                                <option value="30">Last 30 Days</option>
                                                                <option value="365">Last 1 Year</option>
                                                                <option value="custom">Custom Date Range</option>
                                                            </select>
                                                        </div>
                                                        {reportPeriod === 'custom' && (
                                                            <>
                                                                <div className="col-md-2">
                                                                    <label className="form-label">Start Date</label>
                                                                    <input
                                                                        type="date"
                                                                        className="form-control"
                                                                        value={customStartDate}
                                                                        onChange={(e) => setCustomStartDate(e.target.value)}
                                                                    />
                                                                </div>
                                                                <div className="col-md-2">
                                                                    <label className="form-label">End Date</label>
                                                                    <input
                                                                        type="date"
                                                                        className="form-control"
                                                                        value={customEndDate}
                                                                        onChange={(e) => setCustomEndDate(e.target.value)}
                                                                    />
                                                                </div>
                                                            </>
                                                        )}
                                                        <div className="col-md-2">
                                                            <label className="form-label">&nbsp;</label>
                                                            <button
                                                                className="btn btn-success btn-block btn-sm"
                                                                onClick={generateExcelReport}
                                                                disabled={isGeneratingReport || (reportPeriod === 'custom' && (!customStartDate || !customEndDate))}
                                                            >
                                                                {isGeneratingReport ? (
                                                                    <>
                                                                        <i className="fa fa-spinner fa-spin mr-1"></i>
                                                                        Generating...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="fa fa-download mr-1"></i>
                                                                        Generate Excel
                                                                    </>
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Report Type Descriptions */}
                                                    <div className="row mt-3">
                                                        <div className="col-12">
                                                            <div className="alert alert-info">
                                                                <h6 className="mb-2">Report Types:</h6>
                                                                <div className="row">
                                                                    <div className="col-md-3">
                                                                        <strong>Sales Report:</strong> Daily sales breakdown with totals and averages
                                                                    </div>
                                                                    <div className="col-md-3">
                                                                        <strong>Orders Report:</strong> Detailed order information with customer and item details
                                                                    </div>
                                                                    <div className="col-md-3">
                                                                        <strong>Users Report:</strong> User registration data with activity and spending statistics
                                                                    </div>
                                                                    <div className="col-md-3">
                                                                        <strong>Products Report:</strong> Product performance with sales and inventory data
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        )}

                        {activeTab === 'contacts' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Contact Messages</strong>
                                </header>
                                <div className="card-body">
                                    {contactLoading ? (
                                        <div className="text-center py-4">
                                            <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                                            <p className="mt-3">Loading contact messages...</p>
                                        </div>
                                    ) : (
                                        <div className="row">
                                            <div className="col-md-4">
                                                <div className="list-group">
                                                    {contacts.map(contact => (
                                                        <div
                                                            key={contact.id}
                                                            className={`list-group-item list-group-item-action ${selectedContact?.id === contact.id ? 'active' : ''} ${!contact.is_read ? 'font-weight-bold' : ''}`}
                                                            onClick={() => {
                                                                setSelectedContact(contact);
                                                                if (!contact.is_read) {
                                                                    markContactAsRead(contact.id);
                                                                }
                                                            }}
                                                            style={{ cursor: 'pointer' }}
                                                        >
                                                            <div className="d-flex w-100 justify-content-between">
                                                                <h6 className="mb-1">{contact.name}</h6>
                                                                <small>{new Date(contact.created_at).toLocaleDateString()}</small>
                                                            </div>
                                                            <p className="mb-1 text-truncate">{contact.subject}</p>
                                                            <small>{contact.email}</small>
                                                            {!contact.is_read && (
                                                                <span className="badge badge-primary ml-2">New</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                    {contacts.length === 0 && (
                                                        <div className="text-center py-4">
                                                            <i className="fa fa-envelope fa-3x text-muted mb-3"></i>
                                                            <p className="text-muted">No contact messages yet</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-md-8">
                                                {selectedContact ? (
                                                    <div className="card">
                                                        <div className="card-header">
                                                            <h6 className="mb-0">
                                                                <i className="fa fa-user mr-2"></i>
                                                                {selectedContact.name}
                                                            </h6>
                                                        </div>
                                                        <div className="card-body">
                                                            <div className="row mb-3">
                                                                <div className="col-md-6">
                                                                    <strong>Email:</strong> {selectedContact.email}
                                                                </div>
                                                                <div className="col-md-6">
                                                                    <strong>Date:</strong> {new Date(selectedContact.created_at).toLocaleString()}
                                                                </div>
                                                            </div>
                                                            <div className="mb-3">
                                                                <strong>Subject:</strong>
                                                                <p className="mt-1">{selectedContact.subject}</p>
                                                            </div>
                                                            <div>
                                                                <strong>Message:</strong>
                                                                <div className="mt-2 p-3 bg-light rounded">
                                                                    {selectedContact.message}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="card-footer">
                                                            <div className="d-flex justify-content-between">
                                                                <div>
                                                                    <span className={`badge ${selectedContact.is_replied ? 'badge-success' : 'badge-warning'}`}>
                                                                        {selectedContact.is_replied ? 'Replied' : 'Pending'}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <button 
                                                                        className="btn btn-sm btn-outline-primary mr-2"
                                                                        onClick={() => window.open(`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject}`)}
                                                                    >
                                                                        <i className="fa fa-reply mr-1"></i> Reply
                                                                    </button>
                                                                    <button 
                                                                        className="btn btn-sm btn-outline-success"
                                                                        onClick={async () => {
                                                                            try {
                                                                                const token = localStorage.getItem('token');
                                                                                const response = await fetch(`http://localhost:8000/api/chat_and_notifications/contacts/${selectedContact.id}/mark-replied/`, {
                                                                                    method: 'POST',
                                                                                    headers: {
                                                                                        'Authorization': `Bearer ${token}`,
                                                                                        'Content-Type': 'application/json'
                                                                                    }
                                                                                });
                                                                                if (response.ok) {
                                                                                    setContacts(prev => prev.map(contact => 
                                                                                        contact.id === selectedContact.id ? {...contact, is_replied: true} : contact
                                                                                    ));
                                                                                    setSelectedContact({...selectedContact, is_replied: true});
                                                                                }
                                                                            } catch (error) {
                                                                                console.error('Error marking as replied:', error);
                                                                            }
                                                                        }}
                                                                    >
                                                                        <i className="fa fa-check mr-1"></i> Mark as Replied
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center py-5">
                                                        <i className="fa fa-envelope fa-3x text-muted mb-3"></i>
                                                        <p className="text-muted">Select a contact message to view details</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </article>
                        )}

                        {activeTab === 'settings' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Settings</strong>
                                </header>
                                <div className="card-body">
                                    <ul className="nav nav-tabs mb-3">
                                        <li className="nav-item">
                                            <a href="#" className={`nav-link ${settingsTab === 'profile' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setSettingsTab('profile')}}>Admin Profile</a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="#" className={`nav-link ${settingsTab === 'logo' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setSettingsTab('logo')}}>Logo Management</a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="#" className={`nav-link ${settingsTab === 'banner' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setSettingsTab('banner')}}>Banner Management</a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="#" className={`nav-link ${settingsTab === 'email' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setSettingsTab('email')}}>Email Settings</a>
                                        </li>
                                        <li className="nav-item">
                                            <a href="#" className={`nav-link ${settingsTab === 'footer' ? 'active' : ''}`} onClick={(e) => {e.preventDefault(); setSettingsTab('footer')}}>Footer Settings</a>
                                        </li>
                                    </ul>

                                    {settingsTab === 'profile' && (
                                        profileLoading ? (
                                            <div className="text-center py-4">
                                                <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                                                <p className="mt-2">Loading profile...</p>
                                            </div>
                                        ) : (
                                            <div>
                                            {console.log('🔍 DEBUG: Rendering profile form section')}
                                            <form onSubmit={async (e) => {
                                                e.preventDefault();
                                                try {
                                                    setProfileSaving(true);
                                                    setProfileError(null);
                                                    setProfileSuccess(null);
                                                    const token = localStorage.getItem('token');
                                                    const res = await fetch(`http://localhost:8000/api/accounts/update-profile/${settingsForm.id || 0}/`, {
                                                        method: 'POST',
                                                        headers: {
                                                            'Authorization': `Bearer ${token}`,
                                                            'Content-Type': 'application/json'
                                                        },
                                                        body: JSON.stringify({
                                                            username: settingsForm.username,
                                                            full_name: settingsForm.full_name,
                                                            address: settingsForm.address,
                                                            city: settingsForm.city,
                                                            zipcode: settingsForm.zipcode,
                                                            country: settingsForm.country,
                                                            phone: settingsForm.phone
                                                        })
                                                    });
                                                    if(res.ok) {
                                                        const data = await res.json();
                                                        setProfileSuccess('Profile updated successfully');
                                                        setSettingsForm({
                                                            id: data.id || settingsForm.id,
                                                            email: data.email || settingsForm.email,
                                                            username: data.username || '',
                                                            full_name: data.full_name || '',
                                                            address: data.address || '',
                                                            city: data.city || '',
                                                            zipcode: data.zipcode || '',
                                                            country: data.country || '',
                                                            phone: data.phone || ''
                                                        });
                                                    } else {
                                                        setProfileError('Failed to update profile');
                                                    }
                                                } catch(err) {
                                                    setProfileError('Network error while saving');
                                                } finally {
                                                    setProfileSaving(false);
                                                }
                                            }}>
                                                {profileError && (
                                                    <div className="alert alert-danger">
                                                        <i className="fa fa-exclamation-triangle mr-2"></i>
                                                        {profileError}
                                                    </div>
                                                )}
                                                {profileSuccess && (
                                                    <div className="alert alert-success">
                                                        <i className="fa fa-check-circle mr-2"></i>
                                                        {profileSuccess}
                                                    </div>
                                                )}
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Email (read-only)</label>
                                                            <input type="email" className="form-control" value={settingsForm.email} readOnly />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Username</label>
                                                            <input type="text" className="form-control" value={settingsForm.username} onChange={(e) => setSettingsForm({...settingsForm, username: e.target.value})} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Full Name</label>
                                                            <input type="text" className="form-control" value={settingsForm.full_name} onChange={(e) => setSettingsForm({...settingsForm, full_name: e.target.value})} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Phone</label>
                                                            <input type="text" className="form-control" value={settingsForm.phone} onChange={(e) => setSettingsForm({...settingsForm, phone: e.target.value})} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Address</label>
                                                            <input type="text" className="form-control" value={settingsForm.address} onChange={(e) => setSettingsForm({...settingsForm, address: e.target.value})} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>City</label>
                                                            <input type="text" className="form-control" value={settingsForm.city} onChange={(e) => setSettingsForm({...settingsForm, city: e.target.value})} />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <div className="form-group">
                                                            <label>Zip Code</label>
                                                            <input type="text" className="form-control" value={settingsForm.zipcode} onChange={(e) => setSettingsForm({...settingsForm, zipcode: e.target.value})} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label>Country</label>
                                                            <input type="text" className="form-control" value={settingsForm.country} onChange={(e) => setSettingsForm({...settingsForm, country: e.target.value})} />
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                                                        {profileSaving ? 'Saving...' : 'Save Changes'}
                                                    </button>
                                                </div>
                                            </form>
                                            
                                            {console.log('🔍 DEBUG: Profile form closed, starting change password section')}
                                            {/* Change Password Section */}
                                            <hr className="my-4" />
                                            <div className="mt-4">
                                                <h5 className="mb-3">
                                                    <i className="fa fa-lock mr-2"></i>
                                                    Change Password
                                                </h5>
                                                <form onSubmit={async (e) => {
                                                    e.preventDefault();
                                                    
                                                    // Validation
                                                    if (!pwdForm.password || !pwdForm.confirm_password) {
                                                        setPwdError('Please fill in all fields');
                                                        return;
                                                    }
                                                    
                                                    if (pwdForm.password !== pwdForm.confirm_password) {
                                                        setPwdError('Passwords do not match');
                                                        return;
                                                    }
                                                    
                                                    if (pwdForm.password.length < 6) {
                                                        setPwdError('Password must be at least 6 characters long');
                                                        return;
                                                    }
                                                    
                                                    try {
                                                        setPwdLoading(true);
                                                        setPwdError(null);
                                                        setPwdSuccess(null);
                                                        
                                                        const token = localStorage.getItem('token');
                                                        if (!token) {
                                                            setPwdError('Authentication required. Please login again.');
                                                            return;
                                                        }
                                                        
                                                        console.log('🔍 DEBUG: Sending change password request');
                                                        const res = await fetch('http://localhost:8000/api/accounts/change-password/', {
                                                            method: 'POST',
                                                            headers: {
                                                                'Authorization': `Bearer ${token}`,
                                                                'Content-Type': 'application/json'
                                                            },
                                                            body: JSON.stringify({
                                                                password: pwdForm.password,
                                                                confirm_password: pwdForm.confirm_password
                                                            })
                                                        });
                                                        
                                                        console.log('🔍 DEBUG: Change password response status:', res.status);
                                                        
                                                        if(res.ok) {
                                                            const data = await res.json();
                                                            console.log('🔍 DEBUG: Change password success:', data);
                                                            setPwdSuccess('Password changed successfully!');
                                                            setPwdForm({
                                                                password: '',
                                                                confirm_password: ''
                                                            });
                                                        } else {
                                                            const errorData = await res.json();
                                                            console.log('🔍 DEBUG: Change password error:', errorData);
                                                            setPwdError(errorData.message || 'Failed to change password');
                                                        }
                                                    } catch(err) {
                                                        console.error('🔍 DEBUG: Change password network error:', err);
                                                        setPwdError('Network error while changing password');
                                                    } finally {
                                                        setPwdLoading(false);
                                                    }
                                                }}>
                                                    {pwdError && (
                                                        <div className="alert alert-danger">
                                                            <i className="fa fa-exclamation-triangle mr-2"></i>
                                                            {pwdError}
                                                        </div>
                                                    )}
                                                    {pwdSuccess && (
                                                        <div className="alert alert-success">
                                                            <i className="fa fa-check-circle mr-2"></i>
                                                            {pwdSuccess}
                                                        </div>
                                                    )}
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <label>New Password</label>
                                                                <div className="input-group">
                                                                    <input 
                                                                        type={showPassword ? "text" : "password"} 
                                                                        className="form-control" 
                                                                        value={pwdForm.password || ''} 
                                                                        onChange={(e) => {
                                                                            setPwdForm({...pwdForm, password: e.target.value});
                                                                            checkPasswordStrength(e.target.value);
                                                                        }}
                                                                        required
                                                                    />
                                                                    <div className="input-group-append">
                                                                        <button 
                                                                            type="button" 
                                                                            className="btn btn-outline-secondary"
                                                                            onClick={() => setShowPassword(!showPassword)}
                                                                        >
                                                                            <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Password Strength Indicator */}
                                                                {pwdForm.password && (
                                                                    <div className="mt-2">
                                                                        <div className="progress" style={{height: '5px'}}>
                                                                            <div 
                                                                                className={`progress-bar bg-${passwordStrength.color}`}
                                                                                style={{width: `${(passwordStrength.score / 5) * 100}%`}}
                                                                            ></div>
                                                                        </div>
                                                                        <small className={`text-${passwordStrength.color}`}>
                                                                            {passwordStrength.feedback}
                                                                        </small>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <label>Confirm Password</label>
                                                                <div className="input-group">
                                                                    <input 
                                                                        type={showConfirmPassword ? "text" : "password"} 
                                                                        className="form-control" 
                                                                        value={pwdForm.confirm_password || ''} 
                                                                        onChange={(e) => setPwdForm({...pwdForm, confirm_password: e.target.value})}
                                                                        required
                                                                    />
                                                                    <div className="input-group-append">
                                                                        <button 
                                                                            type="button" 
                                                                            className="btn btn-outline-secondary"
                                                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                                        >
                                                                            <i className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Password Match Indicator */}
                                                                {pwdForm.confirm_password && (
                                                                    <div className="mt-2">
                                                                        {pwdForm.password === pwdForm.confirm_password ? (
                                                                            <small className="text-success">
                                                                                <i className="fa fa-check mr-1"></i>
                                                                                Passwords match
                                                                            </small>
                                                                        ) : (
                                                                            <small className="text-danger">
                                                                                <i className="fa fa-times mr-1"></i>
                                                                                Passwords do not match
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="row">
                                                        <div className="col-12">
                                                            <div className="form-group">
                                                                <button type="submit" className="btn btn-warning" disabled={pwdLoading || passwordStrength.score < 3}>
                                                                    {pwdLoading ? (
                                                                        <>
                                                                            <i className="fa fa-spinner fa-spin mr-2"></i>
                                                                            Changing...
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <i className="fa fa-key mr-2"></i>
                                                                            Change Password
                                                                        </>
                                                                    )}
                                                                </button>
                                                                {passwordStrength.score < 3 && pwdForm.password && (
                                                                    <small className="text-muted ml-2">
                                                                        Password must be stronger to continue
                                                                    </small>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                            {console.log('🔍 DEBUG: Change password section closed, closing profile div')}
                                            </div>
                                        )
                                    )}
                                    {/* TODO: Future implementation - General Settings
                                    {settingsTab === 'general' && (
                                        <form onSubmit={(e) => {e.preventDefault(); setToast({show: true, type: 'success', message: 'Saved (placeholder)'})}}>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>Site Name</label>
                                                        <input className="form-control" value={generalSettings.site_name} onChange={(e) => setGeneralSettings({...generalSettings, site_name: e.target.value})} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group">
                                                        <label>Currency</label>
                                                        <input className="form-control" value={generalSettings.currency} onChange={(e) => setGeneralSettings({...generalSettings, currency: e.target.value})} />
                                                    </div>
                                                </div>
                                                <div className="col-md-3">
                                                    <div className="form-group form-check mt-4">
                                                        <input type="checkbox" className="form-check-input" id="maintMode" checked={generalSettings.maintenance_mode} onChange={(e) => setGeneralSettings({...generalSettings, maintenance_mode: e.target.checked})} />
                                                        <label className="form-check-label" htmlFor="maintMode">Maintenance Mode</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="btn btn-primary">Save</button>
                                        </form>
                                    )}
                                    */}
                                    {/* TODO: Future implementation - Staff Users
                                    {settingsTab === 'staff' && (
                                        <form onSubmit={(e) => {e.preventDefault(); setToast({show: true, type: 'success', message: 'Staff created (placeholder)'})}}>
                                            <div className="row">
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Email</label>
                                                        <input className="form-control" value={staffForm.email} onChange={(e) => setStaffForm({...staffForm, email: e.target.value})} />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Full Name</label>
                                                        <input className="form-control" value={staffForm.full_name} onChange={(e) => setStaffForm({...staffForm, full_name: e.target.value})} />
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group form-check mt-4">
                                                        <input type="checkbox" className="form-check-input" id="isStaff" checked={staffForm.is_staff} onChange={(e) => setStaffForm({...staffForm, is_staff: e.target.checked})} />
                                                        <label className="form-check-label" htmlFor="isStaff">Is Staff</label>
                                                    </div>
                                                </div>
                                                <div className="col-md-2">
                                                    <div className="form-group form-check mt-4">
                                                        <input type="checkbox" className="form-check-input" id="isSuper" checked={staffForm.is_superuser} onChange={(e) => setStaffForm({...staffForm, is_superuser: e.target.checked})} />
                                                        <label className="form-check-label" htmlFor="isSuper">Superuser</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="btn btn-primary">Create Staff (UI only)</button>
                                        </form>
                                    )}
                                    */}
                                    {/* TODO: Future implementation - Roles & Permissions
                                    {settingsTab === 'roles' && (
                                        <form onSubmit={(e) => {e.preventDefault(); setToast({show: true, type: 'success', message: 'Role updated (placeholder)'})}}>
                                            <div className="row">
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>User Email</label>
                                                        <input className="form-control" value={roleForm.user_email} onChange={(e) => setRoleForm({...roleForm, user_email: e.target.value})} />
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="form-group">
                                                        <label>Role</label>
                                                        <select className="form-control" value={roleForm.role} onChange={(e) => setRoleForm({...roleForm, role: e.target.value})}>
                                                            <option value="staff">Staff</option>
                                                            <option value="manager">Manager</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="btn btn-primary">Assign Role (UI only)</button>
                                        </form>
                                    )}
                                    */}
                                    {/* TODO: Future implementation - Features
                                    {settingsTab === 'features' && (
                                        <form onSubmit={(e) => {e.preventDefault(); setToast({show: true, type: 'success', message: 'Features saved (placeholder)'})}}>
                                            <div className="row">
                                                <div className="col-md-4">
                                                    <div className="form-group form-check">
                                                        <input type="checkbox" className="form-check-input" id="featReviews" checked={featureToggles.reviews_enabled} onChange={(e) => setFeatureToggles({...featureToggles, reviews_enabled: e.target.checked})} />
                                                        <label className="form-check-label" htmlFor="featReviews">Enable Reviews</label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group form-check">
                                                        <input type="checkbox" className="form-check-input" id="featInventory" checked={featureToggles.inventory_tracking} onChange={(e) => setFeatureToggles({...featureToggles, inventory_tracking: e.target.checked})} />
                                                        <label className="form-check-label" htmlFor="featInventory">Inventory Tracking</label>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group form-check">
                                                        <input type="checkbox" className="form-check-input" id="featGuest" checked={featureToggles.allow_guest_checkout} onChange={(e) => setFeatureToggles({...featureToggles, allow_guest_checkout: e.target.checked})} />
                                                        <label className="form-check-label" htmlFor="featGuest">Allow Guest Checkout</label>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="btn btn-primary">Save (UI only)</button>
                                        </form>
                                    )}
                                    */}
                                    {/* TODO: Future implementation - Integrations
                                    {settingsTab === 'integrations' && (
                                        <form onSubmit={(e) => {e.preventDefault(); setToast({show: true, type: 'success', message: 'Integrations saved (placeholder)'})}}>
                                            <div className="row">
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Email Provider</label>
                                                        <select className="form-control" value={integrationSettings.email_provider} onChange={(e) => setIntegrationSettings({...integrationSettings, email_provider: e.target.value})}>
                                                            <option value="smtp">SMTP</option>
                                                            <option value="sendgrid">SendGrid</option>
                                                            <option value="mailgun">Mailgun</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>SMS Gateway</label>
                                                        <input className="form-control" value={integrationSettings.sms_gateway} onChange={(e) => setIntegrationSettings({...integrationSettings, sms_gateway: e.target.value})} />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label>Payment Gateway</label>
                                                        <select className="form-control" value={integrationSettings.payment_gateway} onChange={(e) => setIntegrationSettings({...integrationSettings, payment_gateway: e.target.value})}>
                                                            <option value="cod">Cash on Delivery</option>
                                                            <option value="sslcommerz">SSLCommerz</option>
                                                            <option value="stripe">Stripe</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="btn btn-primary">Save (UI only)</button>
                                        </form>
                                    )}
                                    */}
                                    {settingsTab === 'logo' && (
                                        <AdminLogoManager />
                                    )}
                                    {settingsTab === 'banner' && (
                                        <AdminBannerManager />
                                    )}
                                    
                                    {settingsTab === 'email' && (
                                        <div>
                                            {emailSettingsError && (
                                                <div className="alert alert-danger">
                                                    <i className="fa fa-exclamation-triangle mr-2"></i>
                                                    {emailSettingsError}
                                </div>
                                            )}
                                            {emailSettingsSuccess && (
                                                <div className="alert alert-success">
                                                    <i className="fa fa-check-circle mr-2"></i>
                                                    {emailSettingsSuccess}
                                                </div>
                                            )}
                                            
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                                try {
                                                    setEmailSettingsSaving(true);
                                                    setEmailSettingsError(null);
                                                    setEmailSettingsSuccess(null);
                                                    
                                                    // Validate required fields
                                                    if (!emailSettings.admin_email || !smtpSettings.smtp_host || !smtpSettings.smtp_username || !smtpSettings.smtp_password) {
                                                        setEmailSettingsError('Please fill in all required fields (Admin Email, SMTP Host, Username, Password)');
                                            return;
                                        }
                                                    
                                            const token = localStorage.getItem('token');
                                                    
                                                    // First, try to get existing email settings
                                                    let existingSettings = null;
                                                    try {
                                                        const getResponse = await fetch('http://localhost:8000/api/settings/email-settings/', {
                                                            method: 'GET',
                                                            headers: {
                                                                'Authorization': `Bearer ${token}`,
                                                                'Content-Type': 'application/json'
                                                            }
                                                        });
                                                        
                                                        if (getResponse.ok) {
                                                            const data = await getResponse.json();
                                                            if (data.results && data.results.length > 0) {
                                                                existingSettings = data.results[0]; // Get the first existing setting
                                                                console.log('Found existing email settings:', existingSettings);
                                                            }
                                                        }
                                                    } catch (err) {
                                                        console.log('No existing email settings found');
                                                    }
                                                    
                                                    // Use PUT if exists, POST if new
                                                    const method = existingSettings ? 'PUT' : 'POST';
                                                    const url = existingSettings ? 
                                                        `http://localhost:8000/api/settings/email-settings/${existingSettings.id}/` : 
                                                        'http://localhost:8000/api/settings/email-settings/';
                                                    
                                                    const response = await fetch(url, {
                                                        method: method,
                                                headers: {
                                                    'Authorization': `Bearer ${token}`,
                                                    'Content-Type': 'application/json'
                                                },
                                                body: JSON.stringify({
                                                            name: 'Admin Email Configuration',
                                                            email_address: emailSettings.admin_email,
                                                            email_password: smtpSettings.smtp_password, // Add this required field
                                                            smtp_host: smtpSettings.smtp_host,
                                                            smtp_port: smtpSettings.smtp_port,
                                                            smtp_username: smtpSettings.smtp_username,
                                                            smtp_password: smtpSettings.smtp_password,
                                                            use_tls: smtpSettings.smtp_use_tls,
                                                            use_ssl: smtpSettings.smtp_use_ssl,
                                                            from_name: smtpSettings.from_name,
                                                            from_email: smtpSettings.from_email,
                                                            reply_to_email: emailSettings.support_email,
                                                            email_provider: 'smtp',
                                                            is_primary: true,
                                                            is_active: true,
                                                            use_for_registration: true,
                                                            use_for_password_reset: true,
                                                            use_for_order_notifications: true,
                                                            use_for_admin_notifications: true,
                                                            use_for_support: true
                                                })
                                            });
                                                    
                                                    if (response.ok) {
                                                        const data = await response.json();
                                                        setEmailSettingsSuccess('Email settings saved successfully!');
                                                        console.log('Email settings saved:', data);
                                            } else {
                                                        const errorData = await response.json();
                                                        setEmailSettingsError(errorData.message || 'Failed to save email settings');
                                            }
                                        } catch(err) {
                                                    console.error('Email settings save error:', err);
                                                    setEmailSettingsError('Network error while saving email settings');
                                        } finally {
                                                    setEmailSettingsSaving(false);
                                                }
                                            }}>
                                                
                                                {/* SMTP Configuration Section */}
                                                <hr className="my-4" />
                                                <h5 className="mb-3">
                                                    <i className="fa fa-server mr-2"></i>
                                                    SMTP Configuration
                                                </h5>
                                                
                                                {smtpError && (
                                            <div className="alert alert-danger">
                                                <i className="fa fa-exclamation-triangle mr-2"></i>
                                                        {smtpError}
                                            </div>
                                        )}
                                                {smtpSuccess && (
                                            <div className="alert alert-success">
                                                <i className="fa fa-check-circle mr-2"></i>
                                                        {smtpSuccess}
                                            </div>
                                        )}
                                                {smtpTestResult && (
                                                    <div className={`alert ${smtpTestResult.success ? 'alert-success' : 'alert-danger'}`}>
                                                        <i className={`fa ${smtpTestResult.success ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                                                        {smtpTestResult.message}
                                                    </div>
                                                )}
                                                
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                            <label htmlFor="smtp_host">
                                                                <i className="fa fa-globe mr-2"></i>
                                                                SMTP Host
                                                            </label>
                                                            <input 
                                                                type="text" 
                                                                className="form-control" 
                                                                id="smtp_host"
                                                                placeholder="smtp.gmail.com"
                                                                value={smtpSettings.smtp_host} 
                                                                onChange={(e) => setSmtpSettings({...smtpSettings, smtp_host: e.target.value})}
                                                            />
                                                            <small className="form-text text-muted">
                                                                SMTP server address (e.g., smtp.gmail.com, smtp.outlook.com)
                                                            </small>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                            <label htmlFor="smtp_port">
                                                                <i className="fa fa-plug mr-2"></i>
                                                                SMTP Port
                                                            </label>
                                                            <input 
                                                                type="number" 
                                                                className="form-control" 
                                                                id="smtp_port"
                                                                placeholder="587"
                                                                value={smtpSettings.smtp_port} 
                                                                onChange={(e) => setSmtpSettings({...smtpSettings, smtp_port: parseInt(e.target.value) || 587})}
                                                            />
                                                            <small className="form-text text-muted">
                                                                Common ports: 587 (TLS), 465 (SSL), 25 (unencrypted)
                                                            </small>
                                                </div>
                                            </div>
                                        </div>
                                                
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label htmlFor="smtp_username">
                                                                <i className="fa fa-user mr-2"></i>
                                                                SMTP Username
                                                            </label>
                                                            <input 
                                                                type="text" 
                                                                className="form-control" 
                                                                id="smtp_username"
                                                                placeholder="your-email@gmail.com"
                                                                value={smtpSettings.smtp_username} 
                                                                onChange={(e) => setSmtpSettings({...smtpSettings, smtp_username: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label htmlFor="smtp_password">
                                                                <i className="fa fa-lock mr-2"></i>
                                                                SMTP Password
                                                            </label>
                                                            <input 
                                                                type="password" 
                                                                className="form-control" 
                                                                id="smtp_password"
                                                                placeholder="Your email password or app password"
                                                                value={smtpSettings.smtp_password} 
                                                                onChange={(e) => setSmtpSettings({...smtpSettings, smtp_password: e.target.value})}
                                                            />
                                                            <small className="form-text text-muted">
                                                                For Gmail, use App Password instead of regular password
                                                            </small>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label htmlFor="from_email">
                                                                <i className="fa fa-envelope mr-2"></i>
                                                                From Email Address
                                                            </label>
                                                            <input 
                                                                type="email" 
                                                                className="form-control" 
                                                                id="from_email"
                                                                placeholder="noreply@yourstore.com"
                                                                value={smtpSettings.from_email} 
                                                                onChange={(e) => setSmtpSettings({...smtpSettings, from_email: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <label htmlFor="from_name">
                                                                <i className="fa fa-tag mr-2"></i>
                                                                From Name
                                                            </label>
                                                            <input 
                                                                type="text" 
                                                                className="form-control" 
                                                                id="from_name"
                                                                placeholder="Your Store Name"
                                                                value={smtpSettings.from_name} 
                                                                onChange={(e) => setSmtpSettings({...smtpSettings, from_name: e.target.value})}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="row">
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <div className="form-check">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="form-check-input" 
                                                                    id="smtp_use_tls"
                                                                    checked={smtpSettings.smtp_use_tls} 
                                                                    onChange={(e) => setSmtpSettings({...smtpSettings, smtp_use_tls: e.target.checked, smtp_use_ssl: e.target.checked ? false : smtpSettings.smtp_use_ssl})}
                                                                />
                                                                <label className="form-check-label" htmlFor="smtp_use_tls">
                                                                    Use TLS (Recommended)
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                        <div className="form-group">
                                                            <div className="form-check">
                                                                <input 
                                                                    type="checkbox" 
                                                                    className="form-check-input" 
                                                                    id="smtp_use_ssl"
                                                                    checked={smtpSettings.smtp_use_ssl} 
                                                                    onChange={(e) => setSmtpSettings({...smtpSettings, smtp_use_ssl: e.target.checked, smtp_use_tls: e.target.checked ? false : smtpSettings.smtp_use_tls})}
                                                                />
                                                                <label className="form-check-label" htmlFor="smtp_use_ssl">
                                                                    Use SSL
                                                                </label>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="alert alert-info">
                                                            <i className="fa fa-info-circle mr-2"></i>
                                                            <strong>Gmail Setup Instructions:</strong>
                                                            <ul className="mb-0 mt-2">
                                                                <li>For Gmail: Use <code>smtp.gmail.com</code> with port <code>587</code> and TLS enabled</li>
                                                                <li>Enable 2-Factor Authentication on your Gmail account</li>
                                                                <li>Generate an <strong>App Password</strong> (not your regular password)</li>
                                                                <li>Go to Google Account → Security → App passwords → Generate password</li>
                                                                <li>Use the generated App Password in the SMTP Password field</li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="alert alert-warning">
                                                            <i className="fa fa-exclamation-triangle mr-2"></i>
                                                            <strong>Security Note:</strong> Make sure to use secure connections (TLS/SSL) for production environments. 
                                                            Never use unencrypted connections for sending emails.
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="row">
                                                    <div className="col-12">
                                                        <div className="d-flex justify-content-between">
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-info" 
                                                                onClick={async () => {
                                                                    try {
                                                                        setSmtpTesting(true);
                                                                        setSmtpTestResult(null);
                                                                        setSmtpError(null);
                                                                        
                                                                        const token = localStorage.getItem('token');
                                                                        
                                                                        const testData = {
                                                                            smtp_host: smtpSettings.smtp_host,
                                                                            smtp_port: smtpSettings.smtp_port,
                                                                            smtp_username: smtpSettings.smtp_username,
                                                                            smtp_password: smtpSettings.smtp_password,
                                                                            use_tls: smtpSettings.smtp_use_tls,
                                                                            use_ssl: smtpSettings.smtp_use_ssl
                                                                        };
                                                                        
                                                                        // Only add test_email if it's not empty
                                                                        const testEmail = emailSettings.admin_email || smtpSettings.from_email;
                                                                        if (testEmail && testEmail.trim() !== '') {
                                                                            testData.test_email = testEmail;
                                                                        }
                                                                        
                                                                        console.log('SMTP Test Data:', testData);
                                                                        
                                                                        const response = await fetch('http://localhost:8000/api/settings/smtp/test/', {
                                                                            method: 'POST',
                                                                            headers: {
                                                                                'Authorization': `Bearer ${token}`,
                                                                                'Content-Type': 'application/json'
                                                                            },
                                                                            body: JSON.stringify(testData)
                                                                        });
                                                                        
                                                                        if (response.ok) {
                                                                            const data = await response.json();
                                                                            setSmtpTestResult({
                                                                                success: data.success,
                                                                                message: data.message
                                                                            });
                                                                        } else {
                                                                            const errorData = await response.json();
                                                                            console.error('SMTP test error response:', errorData);
                                                                            console.error('Response status:', response.status);
                                                                            setSmtpTestResult({
                                                                                success: false,
                                                                                message: errorData.message || 'SMTP test failed'
                                                                            });
                                                                        }
                                                                    } catch(err) {
                                                                        console.error('SMTP test error:', err);
                                                                        setSmtpTestResult({
                                                                            success: false,
                                                                            message: 'Network error during SMTP test'
                                                                        });
                                                                    } finally {
                                                                        setSmtpTesting(false);
                                                                    }
                                                                }}
                                                                disabled={smtpTesting}
                                                            >
                                                                {smtpTesting ? (
                                                                    <>
                                                                        <i className="fa fa-spinner fa-spin mr-2"></i>
                                                                        Testing Connection...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="fa fa-flask mr-2"></i>
                                                                        Test SMTP Connection
                                                                    </>
                                                                )}
                                                            </button>
                                                            
                                                            <button 
                                                                type="button" 
                                                                className="btn btn-success" 
                                                                onClick={async () => {
                                                                    try {
                                                                        setSmtpSaving(true);
                                                                        setSmtpError(null);
                                                                        setSmtpSuccess(null);
                                                                        
                                                                        // Validate required fields
                                                                        if (!smtpSettings.smtp_host || !smtpSettings.smtp_username || !smtpSettings.smtp_password || !smtpSettings.from_email) {
                                                                            setSmtpError('Please fill in all required fields (SMTP Host, Username, Password, From Email)');
                                                                            return;
                                                                        }
                                                                        
                                                                        const token = localStorage.getItem('token');
                                                                        
                                                                        // First, try to get existing email settings
                                                                        let existingSettings = null;
                                                                        try {
                                                                            const getResponse = await fetch('http://localhost:8000/api/settings/email-settings/', {
                                                                                method: 'GET',
                                                                                headers: {
                                                                                    'Authorization': `Bearer ${token}`,
                                                                                    'Content-Type': 'application/json'
                                                                                }
                                                                            });
                                                                            
                                                                            if (getResponse.ok) {
                                                                                const data = await getResponse.json();
                                                                                if (data.results && data.results.length > 0) {
                                                                                    existingSettings = data.results[0]; // Get the first existing setting
                                                                                    console.log('Found existing email settings for SMTP:', existingSettings);
                                                                                }
                                                                            }
                                                                        } catch (err) {
                                                                            console.log('No existing email settings found for SMTP');
                                                                        }
                                                                        
                                                                        // Use PUT if exists, POST if new
                                                                        const method = existingSettings ? 'PUT' : 'POST';
                                                                        const url = existingSettings ? 
                                                                            `http://localhost:8000/api/settings/email-settings/${existingSettings.id}/` : 
                                                                            'http://localhost:8000/api/settings/email-settings/';
                                                                        
                                                                        const response = await fetch(url, {
                                                                            method: method,
                                                                            headers: {
                                                                                'Authorization': `Bearer ${token}`,
                                                                                'Content-Type': 'application/json'
                                                                            },
                                                        body: JSON.stringify({
                                                            name: 'SMTP Configuration',
                                                            email_address: smtpSettings.from_email,
                                                            email_password: smtpSettings.smtp_password, // Add this required field
                                                            smtp_host: smtpSettings.smtp_host,
                                                            smtp_port: smtpSettings.smtp_port,
                                                            smtp_username: smtpSettings.smtp_username,
                                                            smtp_password: smtpSettings.smtp_password,
                                                            use_tls: smtpSettings.smtp_use_tls,
                                                            use_ssl: smtpSettings.smtp_use_ssl,
                                                            from_name: smtpSettings.from_name,
                                                            from_email: smtpSettings.from_email,
                                                            email_provider: 'smtp',
                                                            is_primary: true,
                                                            is_active: true,
                                                            use_for_registration: true,
                                                            use_for_password_reset: true,
                                                            use_for_order_notifications: true,
                                                            use_for_admin_notifications: true,
                                                            use_for_support: true
                                                        })
                                                                        });
                                                                        
                                                    if (response.ok) {
                                                        const data = await response.json();
                                                        setSmtpSuccess('SMTP settings saved successfully!');
                                                        console.log('SMTP settings saved:', data);
                                                    } else {
                                                        const errorData = await response.json();
                                                        console.error('SMTP save error response:', errorData);
                                                        console.error('Response status:', response.status);
                                                        setSmtpError(errorData.message || 'Failed to save SMTP settings');
                                                    }
                                                                    } catch(err) {
                                                                        console.error('SMTP save error:', err);
                                                                        setSmtpError('Network error while saving SMTP settings');
                                                                    } finally {
                                                                        setSmtpSaving(false);
                                                                    }
                                                                }}
                                                                disabled={smtpSaving}
                                                            >
                                                                {smtpSaving ? (
                                                                    <>
                                                                        <i className="fa fa-spinner fa-spin mr-2"></i>
                                                                        Saving...
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <i className="fa fa-save mr-2"></i>
                                                                        Save SMTP Settings
                                                                    </>
                                                                )}
                                            </button>
                                        </div>
                                                    </div>
                                                </div>
                                                
                                    </form>
                                        </div>
                                    )}
                                    
                                    {/* Email Selection Section - Show Saved Email Settings - Only in Email Settings Tab */}
                                    {settingsTab === 'email' && (
                                        <>
                                            <style>
                                                {`
                                                    .email-setting-card {
                                                        border: 2px solid #e9ecef;
                                                        transition: all 0.3s ease;
                                                        background: #fff;
                                                    }
                                                    
                                                    .email-setting-card:hover {
                                                        border-color: #007bff;
                                                        box-shadow: 0 4px 8px rgba(0,123,255,0.1);
                                                        transform: translateY(-2px);
                                                    }
                                                    
                                                    .email-setting-selected {
                                                        border-color: #28a745 !important;
                                                        background: #f8fff9 !important;
                                                        box-shadow: 0 4px 12px rgba(40,167,69,0.2) !important;
                                                    }
                                                    
                                                    .email-setting-selected .card-title {
                                                        color: #28a745 !important;
                                                        font-weight: bold;
                                                    }
                                                    
                                                    .email-selection-section {
                                                        margin-top: 20px;
                                                    }
                                                `}
                                            </style>
                                            
                                            <hr className="my-4" />
                                            <div className="row">
                                                <div className="col-12">
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <h5 className="mb-0">
                                                            <i className="fa fa-database mr-2"></i>
                                                            Saved Email Settings
                                                        </h5>
                                                        <button 
                                                            type="button" 
                                                            className="btn btn-outline-primary btn-sm mr-2"
                                                            onClick={async () => {
                                                                console.log('🔍 DEBUG: Refresh button clicked');
                                                                try {
                                                                    const token = localStorage.getItem('token');
                                                                    console.log('🔍 DEBUG: Refresh - Token found:', token ? 'Yes' : 'No');
                                                                    console.log('🔍 DEBUG: Refresh - Token value:', token);
                                                                    
                                                                    const response = await fetch('http://localhost:8000/api/settings/email-settings/', {
                                                                        method: 'GET',
                                                                        headers: {
                                                                            'Authorization': `Bearer ${token}`,
                                                                            'Content-Type': 'application/json'
                                                                        }
                                                                    });
                                                                    
                                                                    console.log('🔍 DEBUG: Refresh - API Response status:', response.status);
                                                                    console.log('🔍 DEBUG: Refresh - API Response ok:', response.ok);
                                                                    
                                                                    if (response.ok) {
                                                                        const data = await response.json();
                                                                        console.log('🔍 DEBUG: Refresh - Email settings API response:', data);
                                                                        console.log('🔍 DEBUG: Refresh - Data type:', Array.isArray(data) ? 'Array' : typeof data);
                                                                        console.log('🔍 DEBUG: Refresh - Data length:', Array.isArray(data) ? data.length : 'Not array');
                                                                        
                                                                        // Handle both array response and object with results property
                                                                        const emailSettings = Array.isArray(data) ? data : (data.results || []);
                                                                        console.log('🔍 DEBUG: Refresh - Email settings array:', emailSettings);
                                                                        console.log('🔍 DEBUG: Refresh - Email settings length:', emailSettings.length);
                                                                        
                                                                        if (emailSettings && emailSettings.length > 0) {
                                                                            setSavedEmailSettings(emailSettings);
                                                                            setSelectedEmailSetting(emailSettings[0]);
                                                                            
                                                                            // Update form with first setting
                                                                            const firstSetting = emailSettings[0];
                                                                            setEmailSettings({
                                                                                admin_email: firstSetting.email_address || '',
                                                                                support_email: firstSetting.reply_to_email || '',
                                                                                notification_email: firstSetting.from_email || '',
                                                                                email_signature: ''
                                                                            });
                                                                            
                                                                            setSmtpSettings({
                                                                                smtp_host: firstSetting.smtp_host || 'smtp.gmail.com',
                                                                                smtp_port: firstSetting.smtp_port || 587,
                                                                                smtp_username: firstSetting.smtp_username || '',
                                                                                smtp_password: '',
                                                                                smtp_use_tls: firstSetting.use_tls || true,
                                                                                smtp_use_ssl: firstSetting.use_ssl || false,
                                                                                from_email: firstSetting.from_email || '',
                                                                                from_name: firstSetting.from_name || 'Your Store Name'
                                                                            });
                                                                        } else {
                                                                            setSavedEmailSettings([]);
                                                                            setSelectedEmailSetting(null);
                                                                        }
                                                                    }
                                                                } catch (err) {
                                                                    console.error('Error refreshing email settings:', err);
                                                                }
                                                            }}
                                                        >
                                                            <i className="fa fa-refresh mr-1"></i>
                                                            Refresh
                                                        </button>
                                                    </div>
                                                    
                                                    {(() => {
                                                        console.log('🔍 DEBUG: Rendering email settings section');
                                                        console.log('🔍 DEBUG: savedEmailSettings length:', savedEmailSettings.length);
                                                        console.log('🔍 DEBUG: savedEmailSettings:', savedEmailSettings);
                                                        return null;
                                                    })()}
                                                    
                                                    {savedEmailSettings.length > 0 ? (
                                                        <div className="email-selection-section">
                                                            <div className="row">
                                                                {savedEmailSettings.map((emailSetting, index) => (
                                                                    <div key={emailSetting.id} className="col-md-6 mb-3">
                                                                        <div
                                                                            className={`card email-setting-card ${selectedEmailSetting && selectedEmailSetting.id === emailSetting.id ? 'email-setting-selected' : ''}`}
                                                                            onClick={() => {
                                                                                console.log('Email setting selected:', emailSetting);
                                                                                setSelectedEmailSetting(emailSetting);
                                                                                
                                                                                // Populate form with selected email setting
                                                                                setEmailSettings({
                                                                                    admin_email: emailSetting.email_address || '',
                                                                                    support_email: emailSetting.reply_to_email || '',
                                                                                    notification_email: emailSetting.from_email || '',
                                                                                    email_signature: ''
                                                                                });
                                                                                
                                                                                setSmtpSettings({
                                                                                    smtp_host: emailSetting.smtp_host || 'smtp.gmail.com',
                                                                                    smtp_port: emailSetting.smtp_port || 587,
                                                                                    smtp_username: emailSetting.smtp_username || '',
                                                                                    smtp_password: '', // Don't load password for security
                                                                                    smtp_use_tls: emailSetting.use_tls || true,
                                                                                    smtp_use_ssl: emailSetting.use_ssl || false,
                                                                                    from_email: emailSetting.from_email || '',
                                                                                    from_name: emailSetting.from_name || 'Your Store Name'
                                                                                });
                                                                            }}
                                                                            style={{cursor: 'pointer'}}
                                                                        >
                                                                            <div className="card-body">
                                                                                {(() => {
                                                                                    console.log('🔍 DEBUG: Rendering email setting card:', emailSetting);
                                                                                    console.log('🔍 DEBUG: SMTP Host:', emailSetting.smtp_host);
                                                                                    console.log('🔍 DEBUG: SMTP Port:', emailSetting.smtp_port);
                                                                                    console.log('🔍 DEBUG: SMTP Username:', emailSetting.smtp_username);
                                                                                    return null;
                                                                                })()}
                                                                                
                                                                                <div className="d-flex justify-content-between align-items-start">
                                                                                    <div>
                                                                                        <h6 className="card-title mb-1">
                                                                                            <i className="fa fa-envelope mr-2"></i>
                                                                                            {emailSetting.name}
                                                                                        </h6>
                                                                                        <p className="card-text text-muted mb-1">
                                                                                            <strong>Email:</strong> {emailSetting.email_address}
                                                                                        </p>
                                                                                        <p className="card-text text-muted mb-1">
                                                                                            <strong>SMTP Host:</strong> {emailSetting.smtp_host || 'Not set'}
                                                                                        </p>
                                                                                        <p className="card-text text-muted mb-1">
                                                                                            <strong>Port:</strong> {emailSetting.smtp_port || 'Not set'}
                                                                                        </p>
                                                                                        <p className="card-text text-muted mb-1">
                                                                                            <strong>Username:</strong> {emailSetting.smtp_username || 'Not set'}
                                                                                        </p>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        {emailSetting.is_primary && (
                                                            <span className="badge badge-primary mb-1">Primary</span>
                                                                                        )}
                                                                                        {emailSetting.is_active && (
                                                            <span className="badge badge-success mb-1">Active</span>
                                                                                        )}
                                                                                        {!emailSetting.is_active && (
                                                            <span className="badge badge-secondary mb-1">Inactive</span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                                
                                                                                <div className="mt-2">
                                                                                    <small className="text-muted">
                                                                                        <i className="fa fa-clock mr-1"></i>
                                                                                        Created: {new Date(emailSetting.created_at).toLocaleDateString()}
                                                                                    </small>
                                                                                </div>
                                                                                
                                                                                <div className="mt-3">
                                                                                    <button 
                                                                                        type="button" 
                                                                                        className="btn btn-sm btn-outline-info"
                                                                                        onClick={async (e) => {
                                                                                            e.stopPropagation(); // Prevent card selection
                                                                                            console.log('🔍 DEBUG: Testing connection for email setting:', emailSetting);
                                                                                            
                                                                                            try {
                                                                                                const token = localStorage.getItem('token');
                                                                                                const response = await fetch('http://localhost:8000/api/settings/smtp/test/', {
                                                                                                    method: 'POST',
                                                                                                    headers: {
                                                                                                        'Authorization': `Bearer ${token}`,
                                                                                                        'Content-Type': 'application/json'
                                                                                                    },
                                                                                                    body: JSON.stringify({
                                                                                                        smtp_host: emailSetting.smtp_host,
                                                                                                        smtp_port: emailSetting.smtp_port,
                                                                                                        smtp_username: emailSetting.smtp_username,
                                                                                                        smtp_password: 'tcrb umgr tyir rxuv', // Use your Gmail app password
                                                                                                        use_tls: emailSetting.use_tls,
                                                                                                        use_ssl: emailSetting.use_ssl,
                                                                                                        test_email: emailSetting.email_address
                                                                                                    })
                                                                                                });
                                                                                                
                                                                                                if (response.ok) {
                                                                                                    const result = await response.json();
                                                                                                    if (result.success) {
                                                                                                        alert(`✅ SMTP Connection Successful!\n\nEmail: ${emailSetting.email_address}\nHost: ${emailSetting.smtp_host}\nPort: ${emailSetting.smtp_port}`);
                                                                                                    } else {
                                                                                                        alert(`❌ SMTP Connection Failed!\n\nError: ${result.message}\n\nPlease check your SMTP settings.`);
                                                                                                    }
                                                                                                } else {
                                                                                                    const error = await response.text();
                                                                                                    alert(`❌ SMTP Test Failed!\n\nStatus: ${response.status}\nError: ${error}`);
                                                                                                }
                                                                                            } catch (err) {
                                                                                                console.error('SMTP test error:', err);
                                                                                                alert(`❌ SMTP Test Error!\n\nError: ${err.message}`);
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        <i className="fa fa-plug mr-1"></i>
                                                                                        Test Connection
                                                                                    </button>
                                                                                    {!emailSetting.is_primary && (
                                                                                        <button 
                                                                                            type="button" 
                                                                                            className="btn btn-sm btn-outline-warning ml-2"
                                                                                            onClick={async (e) => {
                                                                                                e.stopPropagation(); // Prevent card selection
                                                                                                
                                                                                                if (window.confirm(`Set this email as Primary?\n\nEmail: ${emailSetting.email_address}\nName: ${emailSetting.name}\n\nThis will make it the default email for all communications.`)) {
                                                                                                    try {
                                                                                                        const token = localStorage.getItem('token');
                                                                                                        
                                                                                                        // First, remove primary status from all other emails
                                                                                                        const allEmailsResponse = await fetch('http://localhost:8000/api/settings/email-settings/', {
                                                                                                            method: 'GET',
                                                                                                            headers: {
                                                                                                                'Authorization': `Bearer ${token}`,
                                                                                                                'Content-Type': 'application/json'
                                                                                                            }
                                                                                                        });
                                                                                                        
                                                                                                        if (allEmailsResponse.ok) {
                                                                                                            const allEmailsData = await allEmailsResponse.json();
                                                                                                            const allEmails = Array.isArray(allEmailsData) ? allEmailsData : (allEmailsData.results || []);
                                                                                                            
                                                                                                            // Remove primary status from all emails
                                                                                                            for (const email of allEmails) {
                                                                                                                if (email.is_primary) {
                                                                                                                    await fetch(`http://localhost:8000/api/settings/email-settings/${email.id}/`, {
                                                                                                                        method: 'PATCH',
                                                                                                                        headers: {
                                                                                                                            'Authorization': `Bearer ${token}`,
                                                                                                                            'Content-Type': 'application/json'
                                                                                                                        },
                                                                                                                        body: JSON.stringify({
                                                                                                                            is_primary: false
                                                                                                                        })
                                                                                                                    });
                                                                                                                }
                                                                                                            }
                                                                                                            
                                                                                                            // Set this email as primary
                                                                                                            const response = await fetch(`http://localhost:8000/api/settings/email-settings/${emailSetting.id}/`, {
                                                                                                                method: 'PATCH',
                                                                                                                headers: {
                                                                                                                    'Authorization': `Bearer ${token}`,
                                                                                                                    'Content-Type': 'application/json'
                                                                                                                },
                                                                                                                body: JSON.stringify({
                                                                                                                    is_primary: true
                                                                                                                })
                                                                                                            });
                                                                                                            
                                                                                                            if (response.ok) {
                                                                                                                alert(`✅ Email set as Primary successfully!\n\nEmail: ${emailSetting.email_address}\nThis is now the default email for all communications.`);
                                                                                                                
                                                                                                                // Refresh the email settings list
                                                                                                                try {
                                                                                                                    const refreshResponse = await fetch('http://localhost:8000/api/settings/email-settings/', {
                                                                                                                        method: 'GET',
                                                                                                                        headers: {
                                                                                                                            'Authorization': `Bearer ${token}`,
                                                                                                                            'Content-Type': 'application/json'
                                                                                                                        }
                                                                                                                    });
                                                                                                                    
                                                                                                                    if (refreshResponse.ok) {
                                                                                                                        const data = await refreshResponse.json();
                                                                                                                        const emailSettings = Array.isArray(data) ? data : (data.results || []);
                                                                                                                        setSavedEmailSettings(emailSettings);
                                                                                                                        
                                                                                                                        // Update selected email setting
                                                                                                                        const updatedEmail = emailSettings.find(e => e.id === emailSetting.id);
                                                                                                                        if (updatedEmail) {
                                                                                                                            setSelectedEmailSetting(updatedEmail);
                                                                                                                        }
                                                                                                                    }
                                                                                                                } catch (refreshErr) {
                                                                                                                    console.error('Error refreshing email settings:', refreshErr);
                                                                                                                }
                                                                                                            } else {
                                                                                                                const error = await response.text();
                                                                                                                alert(`❌ Failed to set as Primary!\n\nStatus: ${response.status}\nError: ${error}`);
                                                                                                            }
                                                                                                        } else {
                                                                                                            alert(`❌ Failed to fetch existing emails!\n\nStatus: ${allEmailsResponse.status}`);
                                                                                                        }
                                                                                                    } catch (err) {
                                                                                                        console.error('Set primary email error:', err);
                                                                                                        alert(`❌ Set Primary Error!\n\nError: ${err.message}`);
                                                                                                    }
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            <i className="fa fa-star mr-1"></i>
                                                                                            Set Primary
                                                                                        </button>
                                                                                    )}
                                                                                    {emailSetting.is_primary && (
                                                                                        <button 
                                                                                            type="button" 
                                                                                            className="btn btn-sm btn-outline-secondary ml-2"
                                                                                            onClick={async (e) => {
                                                                                                e.stopPropagation(); // Prevent card selection
                                                                                                
                                                                                                if (window.confirm(`Remove Primary status from this email?\n\nEmail: ${emailSetting.email_address}\nName: ${emailSetting.name}\n\nThis will remove its default status.`)) {
                                                                                                    try {
                                                                                                        const token = localStorage.getItem('token');
                                                                                                        const response = await fetch(`http://localhost:8000/api/settings/email-settings/${emailSetting.id}/`, {
                                                                                                            method: 'PATCH',
                                                                                                            headers: {
                                                                                                                'Authorization': `Bearer ${token}`,
                                                                                                                'Content-Type': 'application/json'
                                                                                                            },
                                                                                                            body: JSON.stringify({
                                                                                                                is_primary: false
                                                                                                            })
                                                                                                        });
                                                                                                        
                                                                                                        if (response.ok) {
                                                                                                            alert(`✅ Primary status removed successfully!\n\nEmail: ${emailSetting.email_address}\nThis email is no longer the default.`);
                                                                                                            
                                                                                                            // Refresh the email settings list
                                                                                                            try {
                                                                                                                const refreshResponse = await fetch('http://localhost:8000/api/settings/email-settings/', {
                                                                                                                    method: 'GET',
                                                                                                                    headers: {
                                                                                                                        'Authorization': `Bearer ${token}`,
                                                                                                                        'Content-Type': 'application/json'
                                                                                                                    }
                                                                                                                });
                                                                                                                
                                                                                                                if (refreshResponse.ok) {
                                                                                                                    const data = await refreshResponse.json();
                                                                                                                    const emailSettings = Array.isArray(data) ? data : (data.results || []);
                                                                                                                    setSavedEmailSettings(emailSettings);
                                                                                                                    
                                                                                                                    // Update selected email setting
                                                                                                                    const updatedEmail = emailSettings.find(e => e.id === emailSetting.id);
                                                                                                                    if (updatedEmail) {
                                                                                                                        setSelectedEmailSetting(updatedEmail);
                                                                                                                    }
                                                                                                                }
                                                                                                            } catch (refreshErr) {
                                                                                                                console.error('Error refreshing email settings:', refreshErr);
                                                                                                            }
                                                                                                        } else {
                                                                                                            const error = await response.text();
                                                                                                            alert(`❌ Failed to remove Primary status!\n\nStatus: ${response.status}\nError: ${error}`);
                                                                                                        }
                                                                                                    } catch (err) {
                                                                                                        console.error('Remove primary email error:', err);
                                                                                                        alert(`❌ Remove Primary Error!\n\nError: ${err.message}`);
                                                                                                    }
                                                                                                }
                                                                                            }}
                                                                                        >
                                                                                            <i className="fa fa-star-o mr-1"></i>
                                                                                            Remove Primary
                                                                                        </button>
                                                                                    )}
                                                                                    <button 
                                                                                        type="button" 
                                                                                        className="btn btn-sm btn-outline-danger ml-2"
                                                                                        onClick={async (e) => {
                                                                                            e.stopPropagation(); // Prevent card selection
                                                                                            
                                                                                            if (window.confirm(`Are you sure you want to delete this email setting?\n\nEmail: ${emailSetting.email_address}\nName: ${emailSetting.name}\n\nThis action cannot be undone.`)) {
                                                                                                try {
                                                                                                    const token = localStorage.getItem('token');
                                                                                                    const response = await fetch(`http://localhost:8000/api/settings/email-settings/${emailSetting.id}/`, {
                                                                                                        method: 'DELETE',
                                                                                                        headers: {
                                                                                                            'Authorization': `Bearer ${token}`,
                                                                                                            'Content-Type': 'application/json'
                                                                                                        }
                                                                                                    });
                                                                                                    
                                                                                                    if (response.ok) {
                                                                                                        alert(`✅ Email setting deleted successfully!\n\nEmail: ${emailSetting.email_address}`);
                                                                                                        
                                                                                                        // Refresh the email settings list
                                                                                                        try {
                                                                                                            const refreshResponse = await fetch('http://localhost:8000/api/settings/email-settings/', {
                                                                                                                method: 'GET',
                                                                                                                headers: {
                                                                                                                    'Authorization': `Bearer ${token}`,
                                                                                                                    'Content-Type': 'application/json'
                                                                                                                }
                                                                                                            });
                                                                                                            
                                                                                                            if (refreshResponse.ok) {
                                                                                                                const data = await refreshResponse.json();
                                                                                                                const emailSettings = Array.isArray(data) ? data : (data.results || []);
                                                                                                                setSavedEmailSettings(emailSettings);
                                                                                                                
                                                                                                                if (emailSettings.length > 0) {
                                                                                                                    setSelectedEmailSetting(emailSettings[0]);
                                                                                                                } else {
                                                                                                                    setSelectedEmailSetting(null);
                                                                                                                }
                                                                                                            }
                                                                                                        } catch (refreshErr) {
                                                                                                            console.error('Error refreshing email settings:', refreshErr);
                                                                                                        }
                                                                                                    } else {
                                                                                                        const error = await response.text();
                                                                                                        alert(`❌ Failed to delete email setting!\n\nStatus: ${response.status}\nError: ${error}`);
                                                                                                    }
                                                                                                } catch (err) {
                                                                                                    console.error('Delete email setting error:', err);
                                                                                                    alert(`❌ Delete Error!\n\nError: ${err.message}`);
                                                                                                }
                                                                                            }
                                                                                        }}
                                                                                    >
                                                                                        <i className="fa fa-trash mr-1"></i>
                                                                                        Delete
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            
                                                            {selectedEmailSetting && (
                                                                <div className="alert alert-info">
                                                                    <i className="fa fa-info-circle mr-2"></i>
                                                                    <strong>Selected Email Setting:</strong> {selectedEmailSetting.name} ({selectedEmailSetting.email_address})
                                                                    <br />
                                                                    <small>Form has been populated with this email setting. You can now test or modify the settings above.</small>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="alert alert-warning">
                                                            <i className="fa fa-exclamation-triangle mr-2"></i>
                                                            <strong>No Email Settings Found</strong>
                                                            <br />
                                                            <small>No saved email settings found in database. Create a new email configuration above.</small>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {settingsTab === 'footer' && (
                                        <FooterSettings />
                                    )}
                                </div>
                            </article>
                        )}

                    </main>
                </div>
            </div>

            {/* Category Modal */}
            {
                showCategoryModal && (
                    <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {editingCategory ? 'Edit Category' : 'Create New Category'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={resetCategoryForm}
                                    >
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <form onSubmit={handleCategorySubmit}>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="categoryName">Category Name *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="categoryName"
                                                        value={categoryForm.name}
                                                        onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                                                        required
                                                        placeholder="Enter category name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="categoryStatus">Status</label>
                                                    <select
                                                        className="form-control"
                                                        id="categoryStatus"
                                                        value={categoryForm.is_active}
                                                        onChange={(e) => setCategoryForm({...categoryForm, is_active: e.target.value === 'true'})}
                                                    >
                                                        <option value={true}>Active</option>
                                                        <option value={false}>Inactive</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="categoryDescription">Description</label>
                                            <textarea
                                                className="form-control"
                                                id="categoryDescription"
                                                rows="3"
                                                value={categoryForm.description}
                                                onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                                                placeholder="Enter category description (optional)"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="categoryImage">Category Image</label>
                                            <input
                                                type="file"
                                                className="form-control-file"
                                                id="categoryImage"
                                                accept="image/*"
                                                onChange={(e) => setCategoryForm({...categoryForm, image: e.target.files[0]})}
                                            />
                                            <small className="form-text text-muted">
                                                Upload an image for this category (optional)
                                            </small>
                                            {editingCategory && editingCategory.image && (
                                                <div className="mt-2">
                                                    <small className="text-muted">Current image:</small>
                                                    <br />
                                                    <img
                                                        src={editingCategory.image.startsWith('http') ? editingCategory.image : `http://localhost:8000${editingCategory.image}`}
                                                        alt="Current category"
                                                        style={{width: '100px', height: '100px', objectFit: 'cover'}}
                                                        className="border rounded"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={resetCategoryForm}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                        >
                                            {editingCategory ? 'Update Category' : 'Create Category'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Subcategory Modal */}
            {
                showSubcategoryModal && (
                    <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {editingSubcategory ? 'Edit Subcategory' : 'Create New Subcategory'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={resetSubcategoryForm}
                                    >
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <form onSubmit={handleSubcategorySubmit}>
                                    <div className="modal-body">
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="subcategoryCategory">Category *</label>
                                                    <select
                                                        className="form-control"
                                                        id="subcategoryCategory"
                                                        value={subcategoryForm.category}
                                                        onChange={(e) => setSubcategoryForm({...subcategoryForm, category: e.target.value})}
                                                        required
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categories.map((category) => (
                                                            <option key={category.id} value={category.id}>
                                                                {category.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="subcategoryName">Subcategory Name *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="subcategoryName"
                                                        value={subcategoryForm.name}
                                                        onChange={(e) => setSubcategoryForm({...subcategoryForm, name: e.target.value})}
                                                        required
                                                        placeholder="Enter subcategory name"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="subcategoryStatus">Status</label>
                                                    <select
                                                        className="form-control"
                                                        id="subcategoryStatus"
                                                        value={subcategoryForm.is_active}
                                                        onChange={(e) => setSubcategoryForm({...subcategoryForm, is_active: e.target.value === 'true'})}
                                                    >
                                                        <option value={true}>Active</option>
                                                        <option value={false}>Inactive</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="subcategoryDescription">Description</label>
                                            <textarea
                                                className="form-control"
                                                id="subcategoryDescription"
                                                rows="3"
                                                value={subcategoryForm.description}
                                                onChange={(e) => setSubcategoryForm({...subcategoryForm, description: e.target.value})}
                                                placeholder="Enter subcategory description (optional)"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="subcategoryImage">Subcategory Image</label>
                                            <input
                                                type="file"
                                                className="form-control-file"
                                                id="subcategoryImage"
                                                accept="image/*"
                                                onChange={(e) => setSubcategoryForm({...subcategoryForm, image: e.target.files[0]})}
                                            />
                                            <small className="form-text text-muted">
                                                Upload an image for this subcategory (optional)
                                            </small>
                                            {editingSubcategory && editingSubcategory.image && (
                                                <div className="mt-2">
                                                    <small className="text-muted">Current image:</small>
                                                    <br />
                                                    <img
                                                        src={editingSubcategory.image.startsWith('http') ? editingSubcategory.image : `http://localhost:8000${editingSubcategory.image}`}
                                                        alt="Current subcategory"
                                                        style={{width: '100px', height: '100px', objectFit: 'cover'}}
                                                        className="border rounded"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={resetSubcategoryForm}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                        >
                                            {editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Delete Confirmation Modal */}
            {
                showDeleteModal && (
                    <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title text-danger">
                                        <i className="fa fa-exclamation-triangle mr-2"></i>
                                        Confirm Delete
                                    </h5>
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setDeleteItem(null);
                                            setDeleteType('');
                                        }}
                                    >
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body pt-0">
                                    <div className="text-center">
                                        <div className="mb-3">
                                            <i className="fa fa-trash fa-3x text-danger"></i>
                                        </div>
                                        <h6 className="mb-3">
                                            Are you sure you want to delete this {deleteType}?
                                        </h6>
                                        <div className="alert alert-warning">
                                            <strong>{deleteItem?.name || deleteItem?.title}</strong>
                                            {deleteType === 'subcategory' && (
                                                <div>
                                                    <small className="text-muted">
                                                        Category: {deleteItem?.category_name}
                                                    </small>
                                                </div>
                                            )}
                                            {deleteType === 'product' && (
                                                <div>
                                                    <small className="text-muted">
                                                        Type: {deleteItem?.product_type} | Status: {deleteItem?.status}
                                                    </small>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-muted mb-0">
                                            {deleteType === 'product' ?
                                                'If the product is referenced in orders, it will be archived instead of deleted.' :
                                                'This action cannot be undone.'
                                            }
                                        </p>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowDeleteModal(false);
                                            setDeleteItem(null);
                                            setDeleteType('');
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        onClick={() => {
                                            if(deleteType === 'category') {
                                                confirmDeleteCategory();
                                            } else if(deleteType === 'subcategory') {
                                                confirmDeleteSubcategory();
                                            } else if(deleteType === 'product') {
                                                confirmDeleteProduct();
                                            }
                                        }}
                                    >
                                        <i className="fa fa-trash mr-1"></i>
                                        Delete {deleteType === 'category' ? 'Category' : deleteType === 'subcategory' ? 'Subcategory' : 'Product'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Product Modal */}
            {
                showProductModal && (
                    <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <div className="modal-dialog modal-xl">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        {editingProduct ? 'Edit Product' : 'Create New Product'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={resetProductForm}
                                    >
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <form onSubmit={handleProductSubmit}>
                                    <div className="modal-body" style={{maxHeight: '80vh', overflowY: 'auto'}}>
                                        {/* Basic Information */}
                                        <div className="row mb-4">
                                            <div className="col-12">
                                                <h6 className="text-primary border-bottom pb-2">Basic Information</h6>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-8">
                                                <div className="form-group">
                                                    <label htmlFor="productTitle">Product Title *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="productTitle"
                                                        value={productForm.title}
                                                        onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                                                        required
                                                        placeholder="Enter product title"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="form-group">
                                                    <label htmlFor="productType">Product Type *</label>
                                                    <select
                                                        className="form-control"
                                                        id="productType"
                                                        value={productForm.product_type}
                                                        onChange={(e) => setProductForm({...productForm, product_type: e.target.value})}
                                                        required
                                                    >
                                                        <option value="simple">Simple Product</option>
                                                        <option value="variable">Variable Product</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="productCategory">Category</label>
                                                    <select
                                                        className="form-control"
                                                        id="productCategory"
                                                        value={productForm.category}
                                                        onChange={(e) => {
                                                            const newCategory = e.target.value;
                                                            setProductForm({
                                                                ...productForm,
                                                                category: newCategory,
                                                                subcategory: '' // Reset subcategory when category changes
                                                            });
                                                        }}
                                                    >
                                                        <option value="">Select Category</option>
                                                        {categoriesLoading ? (
                                                            <option disabled>Loading categories...</option>
                                                        ) : (
                                                            categories.map((category) => (
                                                                <option key={category.id} value={category.id}>
                                                                    {category.name}
                                                                </option>
                                                            ))
                                                        )}
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="productSubcategory">Subcategory</label>
                                                    <select
                                                        className="form-control"
                                                        id="productSubcategory"
                                                        value={productForm.subcategory}
                                                        onChange={(e) => setProductForm({...productForm, subcategory: e.target.value})}
                                                    >
                                                        <option value="">Select Subcategory</option>
                                                        {subcategoriesLoading ? (
                                                            <option disabled>Loading subcategories...</option>
                                                        ) : subcategories.length === 0 ? (
                                                            <option disabled>No subcategories found</option>
                                                        ) : (
                                                            subcategories
                                                                .filter(sub => sub.category == productForm.category)
                                                                .map((subcategory) => (
                                                                    <option key={subcategory.id} value={subcategory.id}>
                                                                        {subcategory.name}
                                                                    </option>
                                                                ))
                                                        )}
                                                    </select>
                                                    <small className="form-text text-muted">
                                                        Total subcategories: {subcategories.length} |
                                                        Filtered for category {productForm.category}: {subcategories.filter(sub => sub.category == productForm.category).length}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="productShortDescription">Short Description</label>
                                            <textarea
                                                className="form-control"
                                                id="productShortDescription"
                                                rows="2"
                                                value={productForm.short_description}
                                                onChange={(e) => setProductForm({...productForm, short_description: e.target.value})}
                                                placeholder="Brief product description"
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="productDescription">Description</label>
                                            <textarea
                                                className="form-control"
                                                id="productDescription"
                                                rows="4"
                                                value={productForm.description}
                                                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                                                placeholder="Detailed product description"
                                            />
                                        </div>

                                        {/* Pricing & Inventory */}
                                        <div className="row mb-4 mt-4">
                                            <div className="col-12">
                                                <h6 className="text-primary border-bottom pb-2">Pricing & Inventory</h6>
                                            </div>
                                        </div>

                                        {productForm.product_type === 'simple' ? (
                                            <div className="row">
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="productPrice">Price *</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            className="form-control"
                                                            id="productPrice"
                                                            value={productForm.price}
                                                            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                                                            required
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="productOldPrice">Old Price</label>
                                                        <input
                                                            type="number"
                                                            step="0.01"
                                                            className="form-control"
                                                            id="productOldPrice"
                                                            value={productForm.old_price}
                                                            onChange={(e) => setProductForm({...productForm, old_price: e.target.value})}
                                                            placeholder="0.00"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="form-group">
                                                        <label htmlFor="productQuantity">Quantity</label>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            id="productQuantity"
                                                            value={productForm.quantity}
                                                            onChange={(e) => setProductForm({...productForm, quantity: e.target.value})}
                                                            placeholder="0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="row">
                                                <div className="col-12">
                                                    <div className="alert alert-info mb-3">
                                                        <i className="fa fa-info-circle mr-2"></i>
                                                        <strong>Variable Product:</strong> Pricing and inventory will be managed through product variants below.
                                                        The main product will show the default variant's price on the product detail page.
                                                    </div>
                                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                                        <h6 className="mb-0">Product Options</h6>
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary"
                                                            onClick={addOption}
                                                        >
                                                            <i className="fa fa-plus mr-1"></i>Add Option
                                                        </button>
                                                    </div>

                                                    {productOptions.length === 0 ? (
                                                        <div className="text-center py-3 border border-dashed rounded">
                                                            <i className="fa fa-plus-circle fa-2x text-muted mb-2"></i>
                                                            <p className="text-muted mb-0">No options defined yet</p>
                                                            <small className="text-muted">Click "Add Option" to define product options like Size, Color, etc.</small>
                                                        </div>
                                                    ) : (
                                                        <div className="row">
                                                            {productOptions.map((option, index) => (
                                                                <div key={option.id} className="col-md-4 mb-3">
                                                                    <div className="card">
                                                                        <div className="card-body p-3">
                                                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                                                <small className="text-muted">Option {index + 1}</small>
                                                                                <button
                                                                                    type="button"
                                                                                    className="btn btn-sm btn-outline-danger"
                                                                                    onClick={() => removeOption(index)}
                                                                                >
                                                                                    <i className="fa fa-times"></i>
                                                                                </button>
                                                                            </div>
                                                                            <input
                                                                                type="text"
                                                                                className="form-control form-control-sm"
                                                                                value={option.name}
                                                                                onChange={(e) => updateOption(index, 'name', e.target.value)}
                                                                                placeholder={`Option ${index + 1} (e.g., Size)`}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}


                                        {/* Variants for Variable Products */}
                                        {productForm.product_type === 'variable' && (
                                            <div className="row mb-4 mt-4">
                                                <div className="col-12">
                                                    <h6 className="text-primary border-bottom pb-2">Product Variants</h6>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-primary mb-3"
                                                        onClick={addVariant}
                                                    >
                                                        <i className="fa fa-plus mr-1"></i>Add Variant
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {productForm.product_type === 'variable' && productVariants.map((variant, index) => (
                                            <div key={index} className="card mb-3">
                                                <div className="card-header d-flex justify-content-between align-items-center">
                                                    <h6 className="mb-0">Variant {index + 1}</h6>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => removeVariant(index)}
                                                    >
                                                        <i className="fa fa-trash"></i>
                                                    </button>
                                                </div>
                                                <div className="card-body">
                                                    <div className="row">
                                                        <div className="col-md-6">
                                                            <div className="form-group">
                                                                <label>Variant Title</label>
                                                                <input
                                                                    type="text"
                                                                    className="form-control"
                                                                    value={variant.title}
                                                                    onChange={(e) => updateVariant(index, 'title', e.target.value)}
                                                                    placeholder="e.g., Small - Red"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Price *</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="form-control"
                                                                    value={variant.price}
                                                                    onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                                                    required
                                                                    placeholder="0.00"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="col-md-3">
                                                            <div className="form-group">
                                                                <label>Quantity</label>
                                                                <input
                                                                    type="number"
                                                                    className="form-control"
                                                                    value={variant.quantity}
                                                                    onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                                                                    placeholder="0"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {productOptions.length > 0 && (
                                                        <div className="row">
                                                            {productOptions.map((option, optionIndex) => (
                                                                <div key={option.id} className="col-md-4">
                                                                    <div className="form-group">
                                                                        <label>{option.name}</label>
                                                                        <input
                                                                            type="text"
                                                                            className="form-control"
                                                                            value={variant.dynamic_options && variant.dynamic_options[optionIndex] ? variant.dynamic_options[optionIndex].value : ''}
                                                                            onChange={(e) => {
                                                                                const updatedVariants = [...productVariants];
                                                                                if(!updatedVariants[index].dynamic_options) {
                                                                                    updatedVariants[index].dynamic_options = [];
                                                                                }
                                                                                if(!updatedVariants[index].dynamic_options[optionIndex]) {
                                                                                    updatedVariants[index].dynamic_options[optionIndex] = {
                                                                                        name: option.name,
                                                                                        value: '',
                                                                                        position: option.position
                                                                                    };
                                                                                }
                                                                                updatedVariants[index].dynamic_options[optionIndex].value = e.target.value;

                                                                                // Also update legacy options for first 3 options
                                                                                if(optionIndex === 0) {
                                                                                    updatedVariants[index].option1_name = option.name;
                                                                                    updatedVariants[index].option1_value = e.target.value;
                                                                                } else if(optionIndex === 1) {
                                                                                    updatedVariants[index].option2_name = option.name;
                                                                                    updatedVariants[index].option2_value = e.target.value;
                                                                                } else if(optionIndex === 2) {
                                                                                    updatedVariants[index].option3_name = option.name;
                                                                                    updatedVariants[index].option3_value = e.target.value;
                                                                                }

                                                                                setProductVariants(updatedVariants);
                                                                            }}
                                                                            placeholder={`e.g., ${option.name === 'Size' ? 'Small' : option.name === 'Color' ? 'Red' : 'Value'}`}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Additional Settings */}
                                        <div className="row mb-4 mt-4">
                                            <div className="col-12">
                                                <h6 className="text-primary border-bottom pb-2">Additional Settings</h6>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="productStatus">Status</label>
                                                    <select
                                                        className="form-control"
                                                        id="productStatus"
                                                        value={productForm.status}
                                                        onChange={(e) => setProductForm({...productForm, status: e.target.value})}
                                                    >
                                                        <option value="draft">Draft</option>
                                                        <option value="active">Active</option>
                                                        <option value="archived">Archived</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="productWeight">Weight</label>
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        className="form-control"
                                                        id="productWeight"
                                                        value={productForm.weight}
                                                        onChange={(e) => setProductForm({...productForm, weight: e.target.value})}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="productWeightUnit">Weight Unit</label>
                                                    <select
                                                        className="form-control"
                                                        id="productWeightUnit"
                                                        value={productForm.weight_unit}
                                                        onChange={(e) => setProductForm({...productForm, weight_unit: e.target.value})}
                                                    >
                                                        <option value="kg">Kilogram</option>
                                                        <option value="lb">Pound</option>
                                                        <option value="g">Gram</option>
                                                        <option value="oz">Ounce</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="col-md-3">
                                                <div className="form-group">
                                                    <label htmlFor="productTags">Tags</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="productTags"
                                                        value={productForm.tags}
                                                        onChange={(e) => setProductForm({...productForm, tags: e.target.value})}
                                                        placeholder="tag1, tag2, tag3"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="row">
                                            <div className="col-md-12">
                                                <div className="form-check form-check-inline">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="productFeatured"
                                                        checked={productForm.featured}
                                                        onChange={(e) => setProductForm({...productForm, featured: e.target.checked})}
                                                    />
                                                    <label className="form-check-label" htmlFor="productFeatured">
                                                        Featured Product
                                                    </label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="productTrackQuantity"
                                                        checked={productForm.track_quantity}
                                                        onChange={(e) => setProductForm({...productForm, track_quantity: e.target.checked})}
                                                    />
                                                    <label className="form-check-label" htmlFor="productTrackQuantity">
                                                        Track Quantity
                                                    </label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="productRequiresShipping"
                                                        checked={productForm.requires_shipping}
                                                        onChange={(e) => setProductForm({...productForm, requires_shipping: e.target.checked})}
                                                    />
                                                    <label className="form-check-label" htmlFor="productRequiresShipping">
                                                        Requires Shipping
                                                    </label>
                                                </div>
                                                <div className="form-check form-check-inline">
                                                    <input
                                                        className="form-check-input"
                                                        type="checkbox"
                                                        id="productTaxable"
                                                        checked={productForm.taxable}
                                                        onChange={(e) => setProductForm({...productForm, taxable: e.target.checked})}
                                                    />
                                                    <label className="form-check-label" htmlFor="productTaxable">
                                                        Taxable
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Upload Images */}
                                        <div className="row mb-4 mt-4">
                                            <div className="col-12">
                                                <h6 className="text-primary border-bottom pb-2">Upload Images</h6>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="productImages">Upload Images</label>
                                            <input
                                                type="file"
                                                className="form-control-file"
                                                id="productImages"
                                                accept="image/*"
                                                multiple
            onChange={(e) => {
                const files = Array.from(e.target.files);
                
                if(files.length > 10) {
                    setToast({
                        show: true,
                        message: 'Maximum 10 images allowed',
                        type: 'error'
                    });
                    return;
                }
                
                setProductImages(files);
            }}
                                            />
                                            <small className="form-text text-muted">
                                                Upload multiple images for this product (Max 10 images)
                                            </small>

                                            {/* Image Preview */}
                                            {productImages.length > 0 && (
                                                <div className="mt-3">
                                                    <h6>Selected Images ({productImages.length}):</h6>
                                                    <div className="row">
                                                        {productImages.map((image, index) => (
                                                            <div key={index} className="col-md-3 mb-2">
                                                                <div className="position-relative">
                                                                    <img
                                                                        src={URL.createObjectURL(image)}
                                                                        alt={`Preview ${index + 1}`}
                                                                        className="img-thumbnail"
                                                                        style={{width: '100%', height: '100px', objectFit: 'cover'}}
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-sm btn-danger position-absolute"
                                                                        style={{top: '5px', right: '5px'}}
                                                                        onClick={() => {
                                                                            const newImages = productImages.filter((_, i) => i !== index);
                                                                            setProductImages(newImages);
                                                                        }}
                                                                    >
                                                                        <i className="fa fa-times"></i>
                                                                    </button>
                                                                </div>
                                                                <small className="text-muted d-block text-center">
                                                                    {image.name}
                                                                </small>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="modal-footer">
                                        <button
                                            type="button"
                                            className="btn btn-secondary"
                                            onClick={resetProductForm}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-primary"
                                        >
                                            {editingProduct ? 'Update Product' : 'Create Product'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Order Details Modal */}
            {
                showOrderModal && selectedOrder && (
                    <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Order Details - #{selectedOrder.order_number}
                                    </h5>
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={() => setShowOrderModal(false)}
                                    >
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <h6>Customer Information</h6>
                                            <p><strong>Email:</strong> {selectedOrder.user_email || selectedOrder.user?.email || 'N/A'}</p>
                                            {selectedOrder.delivery_address && (
                                                <>
                                                    <p><strong>Name:</strong> {selectedOrder.delivery_address.full_name}</p>
                                                    <p><strong>Phone:</strong> {selectedOrder.delivery_address.phone_number}</p>
                                                    <p><strong>Address:</strong> {selectedOrder.delivery_address.address_line_1}</p>
                                                    {selectedOrder.delivery_address.address_line_2 && (
                                                        <p>{selectedOrder.delivery_address.address_line_2}</p>
                                                    )}
                                                    <p>{selectedOrder.delivery_address.city} {selectedOrder.delivery_address.postal_code}</p>
                                                    <p>{selectedOrder.delivery_address.country}</p>
                                                </>
                                            )}
                                        </div>
                                        <div className="col-md-6">
                                            <h6>Order Information</h6>
                                            <p><strong>Order Date:</strong> {new Date(selectedOrder.created_at).toLocaleString()}</p>
                                            <p><strong>Status:</strong> {getStatusBadge(selectedOrder.status)}</p>
                                            <p><strong>Total Amount:</strong> ৳{parseFloat(selectedOrder.total_amount || 0).toFixed(2)}</p>
                                            <p><strong>Payment Status:</strong> {selectedOrder.payment_status || 'N/A'}</p>
                                        </div>
                                    </div>

                                    <hr />

                                    <h6>Order Items</h6>
                                    <div className="table-responsive">
                                        <table className="table table-sm">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Variant</th>
                                                    <th>Quantity</th>
                                                    <th>Price</th>
                                                    <th>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedOrder.items && selectedOrder.items.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                {item.product?.primary_image && (
                                                                    <img
                                                                        src={typeof item.product.primary_image === 'string'
                                                                            ? (item.product.primary_image.startsWith('http') ? item.product.primary_image : `http://localhost:8000${item.product.primary_image}`)
                                                                            : item.product.primary_image.image
                                                                                ? (typeof item.product.primary_image.image === 'string' && item.product.primary_image.image.startsWith('http') ? item.product.primary_image.image : `http://localhost:8000${item.product.primary_image.image}`)
                                                                                : '#'
                                                                        }
                                                                        alt={item.product?.title}
                                                                        className="img-thumbnail mr-2"
                                                                        style={{width: '40px', height: '40px', objectFit: 'cover'}}
                                                                    />
                                                                )}
                                                                <div>
                                                                    <strong>{item.product?.title || 'N/A'}</strong>
                                                                    <br />
                                                                    <small className="text-muted">SKU: {item.variant?.sku || 'N/A'}</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            {item.variant?.title || 'Default'}
                                                        </td>
                                                        <td>{item.quantity}</td>
                                                        <td>৳{parseFloat(item.unit_price || 0).toFixed(2)}</td>
                                                        <td>৳{parseFloat(item.total_price || 0).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowOrderModal(false)}
                                    >
                                        Close
                                    </button>
                                    {selectedOrder.status !== 'delivered' && (
                                        <button
                                            type="button"
                                            className="btn btn-success"
                                            onClick={() => {
                                                updateOrderStatus(selectedOrder.id, 'delivered');
                                                setShowOrderModal(false);
                                            }}
                                        >
                                            Mark as Delivered
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* User Details Modal */}
            {
                showUserModal && selectedUser && (
                    <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <div className="modal-dialog modal-lg">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        User Details - {selectedUser.email}
                                    </h5>
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={() => setShowUserModal(false)}
                                    >
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <h6>Basic Information</h6>
                                            <p><strong>User ID:</strong> #{selectedUser.id}</p>
                                            <p><strong>Email:</strong> {selectedUser.email}</p>
                                            <p><strong>Username:</strong> {selectedUser.username || 'N/A'}</p>
                                            <p><strong>Full Name:</strong> {selectedUser.full_name || 'N/A'}</p>
                                            <p><strong>Role:</strong> <span className={`badge ${getUserRoleBadge(selectedUser)}`}>{getUserRole(selectedUser)}</span></p>
                                            <p><strong>Status:</strong> <span className={`badge ${selectedUser.is_active ? 'badge-success' : 'badge-danger'}`}>{selectedUser.is_active ? 'Active' : 'Inactive'}</span></p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6>Account Information</h6>
                                            <p><strong>Date Joined:</strong> {new Date(selectedUser.date_joined).toLocaleString()}</p>
                                            <p><strong>Last Login:</strong> {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}</p>
                                            <p><strong>Email Verified:</strong> {selectedUser.is_active ? 'Yes' : 'No'}</p>
                                            <p><strong>Staff Status:</strong> {selectedUser.is_staff ? 'Yes' : 'No'}</p>
                                            <p><strong>Superuser:</strong> {selectedUser.is_superuser ? 'Yes' : 'No'}</p>
                                        </div>
                                    </div>

                                    <hr />

                                    <h6>User Addresses</h6>
                                    <div className="row">
                                        <div className="col-12">
                                            {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                                                <div className="table-responsive">
                                                    <table className="table table-sm">
                                                        <thead>
                                                            <tr>
                                                                <th>Type</th>
                                                                <th>Name</th>
                                                                <th>Phone</th>
                                                                <th>Address</th>
                                                                <th>City</th>
                                                                <th>Country</th>
                                                                <th>Default</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {selectedUser.addresses.map((address, index) => (
                                                                <tr key={index}>
                                                                    <td>
                                                                        <span className="badge badge-info">
                                                                            {address.address_type || 'Delivery'}
                                                                        </span>
                                                                    </td>
                                                                    <td>{address.full_name || 'N/A'}</td>
                                                                    <td>{address.phone_number || 'N/A'}</td>
                                                                    <td>
                                                                        <div>
                                                                            {address.address_line_1 || 'N/A'}
                                                                            {address.address_line_2 && (
                                                                                <><br /><small className="text-muted">{address.address_line_2}</small></>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td>{address.city || 'N/A'}</td>
                                                                    <td>{address.country || 'N/A'}</td>
                                                                    <td>
                                                                        {address.is_default ? (
                                                                            <span className="badge badge-success">Default</span>
                                                                        ) : (
                                                                            <span className="badge badge-light">No</span>
                                                                        )}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            ) : (
                                                <div className="alert alert-info">
                                                    <i className="fa fa-info-circle mr-2"></i>
                                                    No addresses found for this user.
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <hr />

                                    <h6>User Statistics</h6>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="card bg-light">
                                                <div className="card-body text-center">
                                                    <h5 className="card-title">Orders</h5>
                                                    <p className="card-text">{selectedUser.orders_count || 0}</p>
                                                    <small className="text-muted">Total orders placed</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card bg-light">
                                                <div className="card-body text-center">
                                                    <h5 className="card-title">Total Spent</h5>
                                                    <p className="card-text">${parseFloat(selectedUser.total_spent || 0).toFixed(2)}</p>
                                                    <small className="text-muted">Total amount spent</small>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="card bg-light">
                                                <div className="card-body text-center">
                                                    <h5 className="card-title">Last Activity</h5>
                                                    <p className="card-text">{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleDateString() : 'Never'}</p>
                                                    <small className="text-muted">Last login date</small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowUserModal(false)}
                                    >
                                        Close
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${selectedUser.is_active ? 'btn-danger' : 'btn-success'}`}
                                        onClick={() => {
                                            toggleUserStatus(selectedUser.id, selectedUser.is_active);
                                            setShowUserModal(false);
                                        }}
                                    >
                                        {selectedUser.is_active ? 'Deactivate User' : 'Activate User'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* User Orders Modal */}
            {
                showUserOrdersModal && selectedUser && (
                    <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <div className="modal-dialog modal-xl">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        <i className="fa fa-shopping-cart mr-2"></i>
                                        Orders for {selectedUser.full_name || selectedUser.username || selectedUser.email}
                                        <br />
                                        <small className="text-muted">User ID: {selectedUser.id} | Email: {selectedUser.email}</small>
                                    </h5>
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={() => setShowUserOrdersModal(false)}
                                    >
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body">
                                    {userOrdersLoading ? (
                                        <div className="text-center py-4">
                                            <div className="spinner-border text-primary" role="status">
                                                <span className="sr-only">Loading...</span>
                                            </div>
                                            <p className="mt-2">Loading orders...</p>
                                        </div>
                                    ) : userOrders.length === 0 ? (
                                        <div className="text-center py-4">
                                            <i className="fa fa-shopping-cart fa-3x text-muted mb-3"></i>
                                            <h5>No Orders Found</h5>
                                            <p className="text-muted">This user hasn't placed any orders yet.</p>
                                        </div>
                                    ) : (
                                        <div className="table-responsive">
                                            <table className="table table-hover">
                                                <thead className="thead-light">
                                                    <tr>
                                                        <th>Order #</th>
                                                        <th>Date</th>
                                                        <th>Status</th>
                                                        <th>Items</th>
                                                        <th>Total</th>
                                                        <th>Payment</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {userOrders.map((order) => (
                                                        <tr key={order.id}>
                                                            <td>
                                                                <strong>#{order.order_number}</strong>
                                                            </td>
                                                            <td>
                                                                {new Date(order.created_at).toLocaleDateString()}
                                                                <br />
                                                                <small className="text-muted">
                                                                    {new Date(order.created_at).toLocaleTimeString()}
                                                                </small>
                                                            </td>
                                                            <td>
                                                                {getStatusBadge(order.status)}
                                                            </td>
                                                            <td>
                                                                {order.items && order.items.length > 0 ? (
                                                                    <div>
                                                                        <strong>{order.items.length}</strong> item(s)
                                                                        <br />
                                                                        <small className="text-muted">
                                                                            {order.items.map((item, index) => (
                                                                                <span key={index}>
                                                                                    {item.product?.title || 'Unknown Product'}
                                                                                    {index < order.items.length - 1 ? ', ' : ''}
                                                                                </span>
                                                                            ))}
                                                                        </small>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted">No items</span>
                                                                )}
                                                            </td>
                                                            <td>
                                                                <strong>${parseFloat(order.total_amount || 0).toFixed(2)}</strong>
                                                            </td>
                                                            <td>
                                                                <span className={`badge ${order.payment_status === 'paid' ? 'badge-success' :
                                                                    order.payment_status === 'pending' ? 'badge-warning' :
                                                                        'badge-danger'
                                                                    }`}>
                                                                    {order.payment_status || 'Unknown'}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <button
                                                                    className="btn btn-sm btn-outline-info"
                                                                    onClick={() => {
                                                                        setShowUserOrdersModal(false);
                                                                        viewOrderDetails(order);
                                                                    }}
                                                                    title="View Order Details"
                                                                >
                                                                    <i className="fa fa-eye"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowUserOrdersModal(false)}
                                    >
                                        Close
                                    </button>
                                    <div className="ml-auto">
                                        <small className="text-muted">
                                            Total Orders: <strong>{userOrders.length}</strong> |
                                            Total Spent: <strong>${userOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0).toFixed(2)}</strong>
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* User Status Confirmation Modal */}
            {
                showUserStatusModal && selectedUser && userStatusAction && (
                    <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header border-0 pb-0">
                                    <h5 className="modal-title d-flex align-items-center">
                                        <i className={`fa ${userStatusAction === 'activate' ? 'fa-check-circle text-success' : 'fa-ban text-danger'} mr-2`}></i>
                                        {userStatusAction === 'activate' ? 'Activate User' : 'Deactivate User'}
                                    </h5>
                                    <button
                                        type="button"
                                        className="close"
                                        onClick={() => setShowUserStatusModal(false)}
                                    >
                                        <span>&times;</span>
                                    </button>
                                </div>
                                <div className="modal-body pt-0">
                                    <div className="text-center mb-4">
                                        <div className={`rounded-circle d-inline-flex align-items-center justify-content-center mb-3`}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                backgroundColor: userStatusAction === 'activate' ? '#d4edda' : '#f8d7da'
                                            }}>
                                            <i className={`fa ${userStatusAction === 'activate' ? 'fa-user-check text-success' : 'fa-user-slash text-danger'} fa-2x`}></i>
                                        </div>
                                        <h6 className="mb-2">
                                            Are you sure you want to {userStatusAction} this user?
                                        </h6>
                                        <p className="text-muted mb-0">
                                            This action will {userStatusAction === 'activate' ? 'restore access' : 'restrict access'} for the user.
                                        </p>
                                    </div>

                                    <div className="card bg-light">
                                        <div className="card-body py-3">
                                            <div className="row">
                                                <div className="col-6">
                                                    <small className="text-muted d-block">User ID</small>
                                                    <strong>#{selectedUser.id}</strong>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted d-block">Email</small>
                                                    <strong>{selectedUser.email}</strong>
                                                </div>
                                            </div>
                                            <div className="row mt-2">
                                                <div className="col-6">
                                                    <small className="text-muted d-block">Name</small>
                                                    <strong>{selectedUser.full_name || selectedUser.username || 'N/A'}</strong>
                                                </div>
                                                <div className="col-6">
                                                    <small className="text-muted d-block">Current Status</small>
                                                    <span className={`badge ${selectedUser.is_active ? 'badge-success' : 'badge-danger'}`}>
                                                        {selectedUser.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 pt-0">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowUserStatusModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${userStatusAction === 'activate' ? 'btn-success' : 'btn-danger'}`}
                                        onClick={() => toggleUserStatus(selectedUser.id, selectedUser.is_active)}
                                    >
                                        <i className={`fa ${userStatusAction === 'activate' ? 'fa-check' : 'fa-ban'} mr-1`}></i>
                                        {userStatusAction === 'activate' ? 'Activate User' : 'Deactivate User'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </section >
    );
};

export default AdminDashboard;
