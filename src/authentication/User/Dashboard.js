import React, {useState, useEffect} from 'react';
import {useAuth} from '../../context/AuthContext';
import {Link} from 'react-router-dom';

const Dashboard = () => {
    const {user, logout} = useAuth();
    const [activeTab, setActiveTab] = useState('order-history');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fetch user orders
    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
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
                console.log('Orders fetched:', data);
                setOrders(data.results || data); // Handle both paginated and non-paginated responses
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch orders:', errorData);
                setError('Failed to fetch orders');
            }
        } catch(error) {
            console.error('Error fetching orders:', error);
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Fetch orders when component mounts
    useEffect(() => {
        if(user && activeTab === 'order-history') {
            fetchOrders();
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
                    return `http://localhost:8000${imageUrl}`;
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
                    return `http://localhost:8000${imageUrl}`;
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

    return (
        <section className="section-conten padding-y bg">
            <div className="container">
                <div className="row">
                    <aside className="col-md-3">
                        {/* SIDEBAR */}
                        <ul className="list-group">
                            <a
                                className={`list-group-item ${activeTab === 'order-history' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('order-history');
                                }}
                            >
                                My order history
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'transactions' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('transactions');
                                }}
                            >
                                Transactions
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'returns' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('returns');
                                }}
                            >
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
                                Settings
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'selling' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('selling');
                                }}
                            >
                                My Selling Items
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'received' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('received');
                                }}
                            >
                                Received orders
                            </a>
                        </ul>
                        <br />
                        <a className="btn btn-light btn-block" href="#" onClick={(e) => {
                            e.preventDefault();
                            logout();
                        }}>
                            <i className="fa fa-power-off"></i>
                            <span className="text">Log out</span>
                        </a>
                        {/* SIDEBAR .//END */}
                    </aside>

                    <main className="col-md-9">
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
                                            <i className="fa fa-shopping-bag fa-3x text-muted mb-3"></i>
                                            <h5>No orders found</h5>
                                            <p className="text-muted">You haven't placed any orders yet.</p>
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
                                                                Subtotal: ${order.subtotal} <br />
                                                                Shipping: ${order.shipping_cost} <br />
                                                                <strong>Total: ${order.total_amount}</strong>
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
                                                                {order.items && order.items.map((item) => (
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
                                                                            <var className="price text-muted">${item.unit_price}</var>
                                                                        </td>
                                                                        <td>
                                                                            <span className="badge badge-secondary">{item.quantity}</span>
                                                                        </td>
                                                                        <td>
                                                                            <strong>${item.total_price}</strong>
                                                                        </td>
                                                                        <td>
                                                                            <button className="btn btn-sm btn-outline-primary mr-1">Track</button>
                                                                            <button className="btn btn-sm btn-light">Details</button>
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

                        {activeTab === 'transactions' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Transactions</strong>
                                </header>
                                <div className="card-body">
                                    <p>No transactions found.</p>
                                </div>
                            </article>
                        )}

                        {activeTab === 'returns' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Return and refunds</strong>
                                </header>
                                <div className="card-body">
                                    <p>No returns or refunds found.</p>
                                </div>
                            </article>
                        )}

                        {activeTab === 'settings' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Settings</strong>
                                </header>
                                <div className="card-body">
                                    <p>Account settings will be here.</p>
                                </div>
                            </article>
                        )}

                        {activeTab === 'selling' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">My Selling Items</strong>
                                </header>
                                <div className="card-body">
                                    <p>No selling items found.</p>
                                </div>
                            </article>
                        )}

                        {activeTab === 'received' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Received orders</strong>
                                </header>
                                <div className="card-body">
                                    <p>No received orders found.</p>
                                </div>
                            </article>
                        )}
                    </main>
                </div>
            </div>
        </section>
    );
};

export default Dashboard;