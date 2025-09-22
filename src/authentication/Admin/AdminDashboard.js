import React, {useState, useEffect} from 'react';
import {useAuth} from '../../context/AuthContext';
import {Link, useNavigate} from 'react-router-dom';

const AdminDashboard = () => {
    const {user, logout, isAuthenticated} = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard'); // Default active tab

    // Order management states
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);
    const [ordersError, setOrdersError] = useState(null);
    const [toast, setToast] = useState({show: false, message: '', type: 'success'});
    const [authChecking, setAuthChecking] = useState(true);

    // Fetch all orders (admin can see all orders)
    const fetchAllOrders = async () => {
        setOrdersLoading(true);
        setOrdersError(null);
        try {
            const token = localStorage.getItem('token');
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
                setOrders(data.results || data);
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch orders:', errorData);
                setOrdersError('Failed to fetch orders');
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

        // Check if user is not admin, redirect to user dashboard
        if(user.user_type !== 'admin') {
            navigate('/dashboard');
            return;
        }

        setAuthChecking(false);
    }, [isAuthenticated, user, navigate]);

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

    // Fetch orders when orders tab is active
    useEffect(() => {
        if(activeTab === 'orders') {
            fetchAllOrders();
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
                                Manage Orders
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'users' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('users');
                                }}
                            >
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
                                Manage Categories
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'reports' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('reports');
                                }}
                            >
                                Reports
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
                        {/* ADMIN SIDEBAR .//END */}
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
                                                    <h2>156</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-success text-white">
                                                <div className="card-body">
                                                    <h5>Total Products</h5>
                                                    <h2>89</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-warning text-white">
                                                <div className="card-body">
                                                    <h5>Total Users</h5>
                                                    <h2>1,234</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-info text-white">
                                                <div className="card-body">
                                                    <h5>Revenue</h5>
                                                    <h2>$12,456</h2>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        )}

                        {activeTab === 'products' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Manage Products</strong>
                                </header>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Price</th>
                                                    <th>Stock</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <img src="/images/items/1.jpg" className="img-xs border" alt="Product" />
                                                        <span className="ml-2">Camera Canon EOS M50 Kit</span>
                                                    </td>
                                                    <td>$1156.00</td>
                                                    <td>15</td>
                                                    <td>
                                                        <Link to="#" className="btn btn-sm btn-outline-primary">Edit</Link>
                                                        <Link to="#" className="btn btn-sm btn-outline-danger">Delete</Link>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <img src="/images/items/2.jpg" className="img-xs border" alt="Product" />
                                                        <span className="ml-2">ADATA Premier ONE microSDXC</span>
                                                    </td>
                                                    <td>$149.97</td>
                                                    <td>25</td>
                                                    <td>
                                                        <Link to="#" className="btn btn-sm btn-outline-primary">Edit</Link>
                                                        <Link to="#" className="btn btn-sm btn-outline-danger">Delete</Link>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </article>
                        )}

                        {activeTab === 'orders' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Manage Orders</strong>
                                    <button
                                        className="btn btn-sm btn-outline-primary float-right"
                                        onClick={fetchAllOrders}
                                        disabled={ordersLoading}
                                    >
                                        {ordersLoading ? 'Refreshing...' : 'Refresh'}
                                    </button>
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
                                    ) : orders && orders.length > 0 ? (
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
                                                    {orders.map((order) => (
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
                                                                    {order.status !== 'delivered' && (
                                                                        <button
                                                                            className="btn btn-sm btn-success"
                                                                            onClick={() => updateOrderStatus(order.id, 'delivered')}
                                                                            title="Mark as Delivered"
                                                                        >
                                                                            <i className="fa fa-check mr-1"></i>Delivered
                                                                        </button>
                                                                    )}
                                                                    {order.status !== 'confirmed' && order.status !== 'delivered' && (
                                                                        <button
                                                                            className="btn btn-sm btn-info"
                                                                            onClick={() => updateOrderStatus(order.id, 'confirmed')}
                                                                            title="Confirm Order"
                                                                        >
                                                                            <i className="fa fa-check-circle mr-1"></i>Confirm
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
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Manage Users</strong>
                                </header>
                                <div className="card-body">
                                    <p>User management functionality will be here.</p>
                                </div>
                            </article>
                        )}

                        {activeTab === 'categories' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Manage Categories</strong>
                                </header>
                                <div className="card-body">
                                    <p>Category management functionality will be here.</p>
                                </div>
                            </article>
                        )}

                        {activeTab === 'reports' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Reports</strong>
                                </header>
                                <div className="card-body">
                                    <p>Reports and analytics will be here.</p>
                                </div>
                            </article>
                        )}
                    </main>
                </div>
            </div>

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

export default AdminDashboard;
