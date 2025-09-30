import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_CONFIG from '../config/apiConfig';

const OrderTracking = () => {
    const [trackingNumber, setTrackingNumber] = useState('');
    const [orderDetails, setOrderDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState({ show: false, text: '', type: 'success' });
    const [imageLoadStates, setImageLoadStates] = useState({});
    const [footerData, setFooterData] = useState({
        email: 'support@greatkart.com',
        phone: '+880-123-456-789',
        business_hours: 'Monday - Friday: 9:00 AM - 6:00 PM',
        quick_response: 'Saturday: 10:00 AM - 4:00 PM'
    });

    const showMessage = (text, type = 'success') => {
        setMessage({ show: true, text, type });
        setTimeout(() => setMessage({ show: false, text: '', type: 'success' }), 5000);
    };

    const fetchFooterSettings = async () => {
        try {
            const response = await fetch(API_CONFIG.getFullUrl('SETTINGS', 'FOOTER'));
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.data) {
                    setFooterData({
                        email: data.data.email || 'support@greatkart.com',
                        phone: data.data.phone || '+880-123-456-789',
                        business_hours: data.data.business_hours || 'Monday - Friday: 9:00 AM - 6:00 PM',
                        quick_response: data.data.quick_response || 'Saturday: 10:00 AM - 4:00 PM'
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching footer settings:', error);
        }
    };

    useEffect(() => {
        fetchFooterSettings();
    }, []);

    const handleTrackingSubmit = async (e) => {
        e.preventDefault();
        if (!trackingNumber.trim()) {
            showMessage('Please enter a tracking number', 'error');
            return;
        }

        setLoading(true);
        setError('');
        setOrderDetails(null);

        try {
            console.log('Tracking order:', trackingNumber);
            console.log('API URL:', `${API_CONFIG.getFullUrl('ORDERS', 'TRACKING')}${trackingNumber}/`);
            
            const response = await fetch(`${API_CONFIG.getFullUrl('ORDERS', 'TRACKING')}${trackingNumber}/`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            const data = await response.json();
            console.log('Response data:', data);

            if (response.ok && data.success) {
                setOrderDetails(data.data);
                showMessage('Order found successfully!', 'success');
            } else {
                setError(data.message || 'Order not found');
                showMessage(data.message || 'Order not found', 'error');
            }
        } catch (error) {
            console.error('Error tracking order:', error);
            setError('Failed to track order. Please try again.');
            showMessage('Failed to track order. Please try again.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'warning';
            case 'processing':
                return 'info';
            case 'shipped':
                return 'primary';
            case 'delivered':
                return 'success';
            case 'cancelled':
                return 'danger';
            default:
                return 'secondary';
        }
    };

    const getStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'fa-clock';
            case 'processing':
                return 'fa-cog fa-spin';
            case 'shipped':
                return 'fa-shipping-fast';
            case 'delivered':
                return 'fa-check-circle';
            case 'cancelled':
                return 'fa-times-circle';
            default:
                return 'fa-question-circle';
        }
    };

    const getPaymentStatusColor = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'warning';
            case 'processing':
                return 'info';
            case 'completed':
                return 'success';
            case 'failed':
                return 'danger';
            case 'cancelled':
                return 'secondary';
            case 'refunded':
                return 'primary';
            default:
                return 'secondary';
        }
    };

    const getPaymentStatusIcon = (status) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'fa-clock';
            case 'processing':
                return 'fa-cog fa-spin';
            case 'completed':
                return 'fa-check-circle';
            case 'failed':
                return 'fa-times-circle';
            case 'cancelled':
                return 'fa-ban';
            case 'refunded':
                return 'fa-undo';
            default:
                return 'fa-question-circle';
        }
    };

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-lg-8 mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-4">
                        <h1 className="h2 mb-3">Order Tracking</h1>
                        <p className="text-muted">Track your order status and delivery information</p>
                    </div>

                    {/* Tracking Form */}
                    <div className="card mb-4">
                        <div className="card-body">
                            <h3 className="h4 mb-3">Enter Tracking Number</h3>
                            
                            {message.show && (
                                <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`}>
                                    <i className={`fa fa-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'} mr-2`}></i>
                                    {message.text}
                                    <button type="button" className="close" onClick={() => setMessage({ show: false, text: '', type: 'success' })}>
                                        <span>&times;</span>
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleTrackingSubmit}>
                                <div className="form-group">
                                    <label htmlFor="trackingNumber">Tracking Number</label>
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            className="form-control"
                                            id="trackingNumber"
                                            value={trackingNumber}
                                            onChange={(e) => setTrackingNumber(e.target.value)}
                                            placeholder="Enter your order tracking number (e.g., ORD-20241201-ABCD)"
                                            required
                                        />
                                        <div className="input-group-append">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={loading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <i className="fa fa-spinner fa-spin mr-2"></i>
                                                        Tracking...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa fa-search mr-2"></i>
                                                        Track Order
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <small className="form-text text-muted">
                                        Order number format: ORD-YYYYMMDD-XXXX (e.g., ORD-20241201-ABCD)
                                    </small>
                                </div>
                            </form>

                            {error && (
                                <div className="alert alert-danger">
                                    <i className="fa fa-exclamation-triangle mr-2"></i>
                                    {error}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Order Details */}
                    {orderDetails && (
                        <div className="card">
                            <div className="card-header">
                                <h4 className="mb-0">
                                    <i className="fa fa-box mr-2"></i>
                                    Order Details
                                </h4>
                            </div>
                            <div className="card-body">
                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <h6 className="text-muted">Order Number</h6>
                                        <p className="font-weight-bold">{orderDetails.order_number}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="text-muted">Order Date</h6>
                                        <p>{new Date(orderDetails.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                {/* Payment Status in Order Information */}
                                {orderDetails.payment && (
                                    <div className="row mb-4">
                                        <div className="col-md-6">
                                            <h6 className="text-muted">Payment Method</h6>
                                            <p className="font-weight-bold">{orderDetails.payment.payment_method_name}</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="text-muted">Payment Status</h6>
                                            <p>
                                                <span className={`badge badge-${getPaymentStatusColor(orderDetails.payment.status)}`}>
                                                    <i className={`fa ${getPaymentStatusIcon(orderDetails.payment.status)} mr-1`}></i>
                                                    {orderDetails.payment.status_display}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="row mb-4">
                                    <div className="col-md-6">
                                        <h6 className="text-muted">Total Amount</h6>
                                        <p className="font-weight-bold text-primary">৳{orderDetails.total_amount}</p>
                                    </div>
                                </div>

                                {/* Order Status */}
                                <div className="mb-4">
                                    <h6 className="text-muted mb-3">Order Status</h6>
                                    <div className="d-flex align-items-center">
                                        <span className={`badge badge-${getStatusColor(orderDetails.status)} badge-lg mr-3`}>
                                            <i className={`fa ${getStatusIcon(orderDetails.status)} mr-1`}></i>
                                            {orderDetails.status}
                                        </span>
                                        <small className="text-muted">
                                            Last updated: {new Date(orderDetails.updated_at).toLocaleString()}
                                        </small>
                                    </div>
                                </div>


                                {/* Shipping Information */}
                                {orderDetails.shipping_address && (
                                    <div className="mb-4">
                                        <h6 className="text-muted mb-3">Shipping Address</h6>
                                        <div className="p-3 bg-light rounded">
                                            <p className="mb-1"><strong>{orderDetails.shipping_address.full_name}</strong></p>
                                            <p className="mb-1">{orderDetails.shipping_address.address_line_1}</p>
                                            {orderDetails.shipping_address.address_line_2 && (
                                                <p className="mb-1">{orderDetails.shipping_address.address_line_2}</p>
                                            )}
                                            <p className="mb-1">
                                                {orderDetails.shipping_address.city} {orderDetails.shipping_address.postal_code}
                                            </p>
                                            <p className="mb-0">{orderDetails.shipping_address.country}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Order Items */}
                                {orderDetails.items && orderDetails.items.length > 0 && (
                                    <div className="mb-4">
                                        <h6 className="text-muted mb-3">Order Items</h6>
                                        <div className="table-responsive">
                                            <table className="table table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Product</th>
                                                        <th>Quantity</th>
                                                        <th>Price</th>
                                                        <th>Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {orderDetails.items.map((item, index) => {
                                                        console.log(`Item ${index}:`, item);
                                                        console.log(`Product image for ${item.product_name}:`, item.product_image);
                                                        return (
                                                            <tr key={index}>
                                                                <td>
                                                                    <div className="d-flex align-items-center">
                                                                        {item.product_image && imageLoadStates[`${item.product_name}-${index}`] !== 'error' ? (
                                                                            <img 
                                                                                src={item.product_image} 
                                                                                alt={item.product_name}
                                                                                className="mr-2"
                                                                                style={{width: '40px', height: '40px', objectFit: 'cover'}}
                                                                                onLoad={() => {
                                                                                    console.log(`Image loaded for ${item.product_name}: ${item.product_image}`);
                                                                                    setImageLoadStates(prev => ({
                                                                                        ...prev,
                                                                                        [`${item.product_name}-${index}`]: 'loaded'
                                                                                    }));
                                                                                }}
                                                                                onError={(e) => {
                                                                                    console.error(`Image failed to load for ${item.product_name}: ${item.product_image}`, e);
                                                                                    setImageLoadStates(prev => ({
                                                                                        ...prev,
                                                                                        [`${item.product_name}-${index}`]: 'error'
                                                                                    }));
                                                                                }}
                                                                            />
                                                                        ) : null}
                                                                        {(!item.product_image || imageLoadStates[`${item.product_name}-${index}`] === 'error') && (
                                                                            <div 
                                                                                className="mr-2 d-flex align-items-center justify-content-center bg-light"
                                                                                style={{width: '40px', height: '40px', fontSize: '12px'}}
                                                                            >
                                                                                <i className="fa fa-image text-muted"></i>
                                                                            </div>
                                                                        )}
                                                                        <div>
                                                                            <p className="mb-0 font-weight-bold">{item.product_name}</p>
                                                                            {item.variation && (
                                                                                <small className="text-muted">{item.variation}</small>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </td>
                                                                <td>{item.quantity}</td>
                                                                <td>৳{item.unit_price}</td>
                                                                <td>৳{item.total_price}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}

                                {/* Tracking Information */}
                                {orderDetails.tracking_number && (
                                    <div className="mb-4">
                                        <h6 className="text-muted mb-3">Tracking Information</h6>
                                        <div className="p-3 bg-light rounded">
                                            <p className="mb-1"><strong>Tracking Number:</strong> {orderDetails.tracking_number}</p>
                                            {orderDetails.carrier && (
                                                <p className="mb-0"><strong>Carrier:</strong> {orderDetails.carrier}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="d-flex justify-content-between">
                                    <Link to="/" className="btn btn-outline-secondary">
                                        <i className="fa fa-home mr-2"></i>
                                        Back to Home
                                    </Link>
                                    <div>
                                        <button 
                                            className="btn btn-outline-primary mr-2"
                                            onClick={() => window.print()}
                                        >
                                            <i className="fa fa-print mr-2"></i>
                                            Print
                                        </button>
                                        <button 
                                            className="btn btn-primary"
                                            onClick={() => {
                                                setTrackingNumber('');
                                                setOrderDetails(null);
                                                setError('');
                                            }}
                                        >
                                            <i className="fa fa-search mr-2"></i>
                                            Track Another Order
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Help Section */}
                    <div className="card mt-4">
                        <div className="card-body">
                            <h5 className="card-title">
                                <i className="fa fa-question-circle mr-2"></i>
                                Need Help?
                            </h5>
                            <p className="card-text">
                                If you're having trouble tracking your order or have any questions, please contact our customer support team.
                            </p>
                            <div className="row">
                                <div className="col-md-6">
                                    <h6>Contact Information</h6>
                                    <p className="mb-1">
                                        <i className="fa fa-envelope mr-2"></i>
                                        {footerData.email}
                                    </p>
                                    <p className="mb-0">
                                        <i className="fa fa-phone mr-2"></i>
                                        {footerData.phone}
                                    </p>
                                </div>
                                <div className="col-md-6">
                                    <h6>Business Hours</h6>
                                    <p className="mb-1">{footerData.business_hours}</p>
                                    <p className="mb-0">{footerData.quick_response}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;
