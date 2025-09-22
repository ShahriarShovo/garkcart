import React, {useState, useEffect} from 'react';
import {useCart} from '../context/CartContext';
import {useAuth} from '../context/AuthContext';
import {useNavigate} from 'react-router-dom';
import Toast from '../components/Toast';

const PlaceOrder = () => {
    const {items, getTotalPrice, clearCart} = useCart();
    const {user} = useAuth();
    const navigate = useNavigate();

    // Helper function to get product image URL
    const getProductImage = (item) => {
        if(item.product?.primary_image?.image_url) {
            // If image_url is already a full URL, use it
            if(item.product.primary_image.image_url.startsWith('http')) {
                return item.product.primary_image.image_url;
            }
            // If it's a relative URL, add the domain
            return `http://localhost:8000${item.product.primary_image.image_url}`;
        }
        if(item.product?.primary_image?.image) {
            // If image field exists, use it
            if(item.product.primary_image.image.startsWith('http')) {
                return item.product.primary_image.image;
            }
            return `http://localhost:8000${item.product.primary_image.image}`;
        }
        // Fallback to default image
        return '/images/items/1.jpg';
    };
    // Address states
    const [addresses, setAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showNewAddressForm, setShowNewAddressForm] = useState(false);
    const [addressLoading, setAddressLoading] = useState(false);
    const [toast, setToast] = useState({show: false, message: '', type: 'success'});

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '+880',
        city: '',
        address_line_1: '',
        address_line_2: '',
        postal_code: '',
        country: 'Bangladesh',
        address_type: 'home'
    });
    const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');

    // Fetch user addresses
    const fetchAddresses = async () => {
        if(!user) return;

        setAddressLoading(true);
        try {
            const tokenData = localStorage.getItem('token');
            let accessToken = tokenData;

            // Handle JWT token format
            if(tokenData && typeof tokenData === 'string') {
                try {
                    const parsedToken = JSON.parse(tokenData);
                    accessToken = parsedToken.access || parsedToken;
                } catch(e) {
                    // If not JSON, use as is
                    accessToken = tokenData;
                }
            }

            const response = await fetch('http://localhost:8000/api/orders/addresses/', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if(response.ok) {
                const data = await response.json();
                setAddresses(data);

                // Set default address as selected if available
                const defaultAddress = data.find(addr => addr.is_default);
                if(defaultAddress) {
                    setSelectedAddress(defaultAddress);
                }
            }
        } catch(error) {
            console.error('Failed to fetch addresses:', error);
        } finally {
            setAddressLoading(false);
        }
    };

    // Create new address
    const createAddress = async (addressData) => {
        try {
            const tokenData = localStorage.getItem('token');
            let accessToken = tokenData;

            // Handle JWT token format
            if(tokenData && typeof tokenData === 'string') {
                try {
                    const parsedToken = JSON.parse(tokenData);
                    accessToken = parsedToken.access || parsedToken;
                } catch(e) {
                    // If not JSON, use as is
                    accessToken = tokenData;
                }
            }

            const response = await fetch('http://localhost:8000/api/orders/addresses/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(addressData)
            });

            if(response.ok) {
                const newAddress = await response.json();
                setAddresses([...addresses, newAddress]);
                setSelectedAddress(newAddress);
                setShowNewAddressForm(false);
                return {success: true, address: newAddress};
            } else {
                const error = await response.json();
                return {success: false, error: error.message || 'Failed to create address'};
            }
        } catch(error) {
            return {success: false, error: 'Network error occurred'};
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate address selection
        if(!selectedAddress) {
            setToast({
                show: true,
                message: 'Please select a delivery address',
                type: 'error'
            });
            return;
        }

        // Validate payment method
        if(!paymentMethod) {
            setToast({
                show: true,
                message: 'Please select a payment method',
                type: 'error'
            });
            return;
        }

        // Create order
        try {
            const tokenData = localStorage.getItem('token');
            let accessToken = tokenData;

            // Handle JWT token format
            if(tokenData && typeof tokenData === 'string') {
                try {
                    const parsedToken = JSON.parse(tokenData);
                    accessToken = parsedToken.access || parsedToken;
                } catch(e) {
                    // If not JSON, use as is
                    accessToken = tokenData;
                }
            }

            const orderData = {
                address_id: selectedAddress.id,
                payment_method: paymentMethod,
                notes: 'Order placed from website'
            };

            const response = await fetch('http://localhost:8000/api/orders/create/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            if(response.ok) {
                const result = await response.json();
                console.log('Order created successfully:', result);

                setToast({
                    show: true,
                    message: 'Order placed successfully!',
                    type: 'success'
                });

                // Clear cart and navigate to order complete
                clearCart();
                navigate('/order-complete', {
                    state: {
                        order: result.order,
                        orderNumber: result.order.order_number
                    }
                });
            } else {
                const error = await response.json();
                console.error('Order creation failed:', error);

                setToast({
                    show: true,
                    message: `Failed to place order: ${error.message || 'Unknown error'}`,
                    type: 'error'
                });
            }
        } catch(error) {
            console.error('Order creation error:', error);

            setToast({
                show: true,
                message: 'Network error occurred. Please try again.',
                type: 'error'
            });
        }
    };

    const getTax = () => {
        return getTotalPrice() * 0.1; // 10% tax
    };

    const getFinalTotal = () => {
        return getTotalPrice() + getTax();
    };

    // Fetch addresses on component mount
    useEffect(() => {
        fetchAddresses();
    }, [user]);

    if(items.length === 0) {
        return (
            <section className="section-content padding-y bg">
                <div className="container">
                    <div className="text-center">
                        <h2>Your cart is empty</h2>
                        <p>Add some products to your cart to continue shopping.</p>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <>
            <section className="section-content padding-y bg">
                <div className="container">
                    <div className="row">
                        <main className="col-md-8">
                            {/* Review Cart */}
                            <article className="card mb-4">
                                <div className="card-body">
                                    <h4 className="card-title mb-4">Review cart</h4>
                                    <div className="row">
                                        {items.map((item, index) => (
                                            <div key={item.id} className="col-md-6">
                                                <figure className="itemside mb-4">
                                                    <div className="aside">
                                                        <img
                                                            src={getProductImage(item)}
                                                            className="border img-sm"
                                                            alt={item.product?.title || 'Product'}
                                                            style={{width: '80px', height: '80px', objectFit: 'cover'}}
                                                            onError={(e) => {
                                                                e.target.src = '/images/items/1.jpg';
                                                            }}
                                                        />
                                                    </div>
                                                    <figcaption className="info">
                                                        <p>{item.product?.title || 'Product Name'}</p>
                                                        <p className="text-muted small">
                                                            Category: {item.product?.category_name || 'General'}
                                                            {item.variant && (
                                                                <>
                                                                    <br />
                                                                    Variant: {item.variant.title}
                                                                </>
                                                            )}
                                                        </p>
                                                        <span className="text-muted">
                                                            {item.quantity}x = ${item.total_price?.toFixed(2) || (item.unit_price * item.quantity).toFixed(2)}
                                                        </span>
                                                    </figcaption>
                                                </figure>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </article>

                            {/* Address Selection */}
                            <article className="card mb-4">
                                <div className="card-body">
                                    <h4 className="card-title mb-4">Delivery Address</h4>

                                    {addressLoading ? (
                                        <div className="text-center">
                                            <div className="spinner-border" role="status">
                                                <span className="sr-only">Loading addresses...</span>
                                            </div>
                                        </div>
                                    ) : addresses.length > 0 ? (
                                        <div>
                                            <div className="row">
                                                {addresses.map((address) => (
                                                    <div key={address.id} className="col-md-6 mb-3">
                                                        <div
                                                            className={`card address-card ${selectedAddress?.id === address.id ? 'border-primary' : ''}`}
                                                            style={{cursor: 'pointer', border: selectedAddress?.id === address.id ? '2px solid #007bff' : '1px solid #ddd'}}
                                                            onClick={() => setSelectedAddress(address)}
                                                        >
                                                            <div className="card-body">
                                                                <div className="d-flex justify-content-between align-items-start">
                                                                    <div>
                                                                        <h6 className="card-title">
                                                                            {address.full_name}
                                                                            {address.is_default && (
                                                                                <span className="badge badge-primary ml-2">Default</span>
                                                                            )}
                                                                        </h6>
                                                                        <p className="card-text small text-muted">
                                                                            {address.address_line_1}
                                                                            {address.address_line_2 && <><br />{address.address_line_2}</>}
                                                                            <br />
                                                                            {address.city}, {address.country}
                                                                            {address.postal_code && <><br />{address.postal_code}</>}
                                                                        </p>
                                                                        <p className="card-text small">
                                                                            <strong>Phone:</strong> {address.phone_number}
                                                                        </p>
                                                                        <p className="card-text small text-muted">
                                                                            <strong>Type:</strong> {address.address_type}
                                                                        </p>
                                                                    </div>
                                                                    <div className="form-check">
                                                                        <input
                                                                            className="form-check-input"
                                                                            type="radio"
                                                                            name="selectedAddress"
                                                                            checked={selectedAddress?.id === address.id}
                                                                            onChange={() => setSelectedAddress(address)}
                                                                        />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="text-center mt-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-primary"
                                                    onClick={() => setShowNewAddressForm(true)}
                                                >
                                                    <i className="fa fa-plus"></i> Add New Address
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-muted">No addresses found. Please add a delivery address.</p>
                                            <button
                                                type="button"
                                                className="btn btn-primary"
                                                onClick={() => setShowNewAddressForm(true)}
                                            >
                                                <i className="fa fa-plus"></i> Add Address
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </article>

                            {/* New Address Form */}
                            {showNewAddressForm && (
                                <article className="card mb-4">
                                    <div className="card-body">
                                        <h4 className="card-title mb-4">Add New Address</h4>
                                        <form onSubmit={async (e) => {
                                            e.preventDefault();
                                            const addressData = {
                                                full_name: formData.firstName + ' ' + formData.lastName,
                                                phone_number: formData.phone,
                                                city: formData.city,
                                                address_line_1: formData.address_line_1,
                                                address_line_2: formData.address_line_2 || '',
                                                postal_code: formData.postal_code || '',
                                                country: formData.country,
                                                address_type: formData.address_type || 'home'
                                            };

                                            const result = await createAddress(addressData);
                                            if(result.success) {
                                                // Reset form
                                                setFormData({
                                                    firstName: '',
                                                    lastName: '',
                                                    phone: '+880',
                                                    city: '',
                                                    address_line_1: '',
                                                    address_line_2: '',
                                                    postal_code: '',
                                                    country: 'Bangladesh',
                                                    address_type: 'home'
                                                });
                                            }
                                        }}>
                                            <div className="row">
                                                <div className="form-group col-sm-6">
                                                    <label>First name *</label>
                                                    <input
                                                        type="text"
                                                        name="firstName"
                                                        placeholder="Type here"
                                                        className="form-control"
                                                        value={formData.firstName}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group col-sm-6">
                                                    <label>Last name *</label>
                                                    <input
                                                        type="text"
                                                        name="lastName"
                                                        placeholder="Type here"
                                                        className="form-control"
                                                        value={formData.lastName}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="form-group col-sm-6">
                                                    <label>Phone number *</label>
                                                    <input
                                                        type="text"
                                                        name="phone"
                                                        placeholder="+8801234567890"
                                                        className="form-control"
                                                        value={formData.phone}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group col-sm-6">
                                                    <label>Country *</label>
                                                    <select
                                                        name="country"
                                                        className="form-control"
                                                        value={formData.country}
                                                        onChange={handleInputChange}
                                                        required
                                                    >
                                                        <option value="Bangladesh">Bangladesh</option>
                                                        <option value="India">India</option>
                                                        <option value="USA">USA</option>
                                                        <option value="UK">UK</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="form-group col-sm-6">
                                                    <label>City *</label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        placeholder="Type here"
                                                        className="form-control"
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group col-sm-6">
                                                    <label>Postal Code</label>
                                                    <input
                                                        type="text"
                                                        name="postal_code"
                                                        placeholder="Type here"
                                                        className="form-control"
                                                        value={formData.postal_code}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="form-group col-sm-6">
                                                    <label>Address Line 1 *</label>
                                                    <input
                                                        type="text"
                                                        name="address_line_1"
                                                        placeholder="Type here"
                                                        className="form-control"
                                                        value={formData.address_line_1}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                </div>
                                                <div className="form-group col-sm-6">
                                                    <label>Address Line 2</label>
                                                    <input
                                                        type="text"
                                                        name="address_line_2"
                                                        placeholder="Type here (optional)"
                                                        className="form-control"
                                                        value={formData.address_line_2}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="form-group col-sm-6">
                                                    <label>Address Type</label>
                                                    <select
                                                        name="address_type"
                                                        className="form-control"
                                                        value={formData.address_type}
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="home">Home</option>
                                                        <option value="office">Office</option>
                                                        <option value="other">Other</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <button type="submit" className="btn btn-primary mr-2">
                                                    Save Address
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={() => setShowNewAddressForm(false)}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </article>
                            )}

                        </main>

                        <aside className="col-md-4">
                            <div className="card">
                                <div className="card-body">
                                    <dl className="dlist-align">
                                        <dt>Total price:</dt>
                                        <dd className="text-right">${getTotalPrice().toFixed(2)}</dd>
                                    </dl>
                                    <dl className="dlist-align">
                                        <dt>Tax:</dt>
                                        <dd className="text-right">${getTax().toFixed(2)}</dd>
                                    </dl>
                                    <dl className="dlist-align">
                                        <dt>Total:</dt>
                                        <dd className="text-right text-dark b">
                                            <strong>${getFinalTotal().toFixed(2)}</strong>
                                        </dd>
                                    </dl>
                                    <hr />

                                    {/* Payment Method Selection */}
                                    <div className="payment-method-section">
                                        <h6>Payment Method</h6>
                                        <div className="form-check mb-2">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="paymentMethod"
                                                id="cashOnDelivery"
                                                value="cash_on_delivery"
                                                checked={paymentMethod === 'cash_on_delivery'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            />
                                            <label className="form-check-label" htmlFor="cashOnDelivery">
                                                <i className="fa fa-money mr-2"></i>
                                                Cash on Delivery
                                            </label>
                                        </div>
                                        <div className="form-check mb-2">
                                            <input
                                                className="form-check-input"
                                                type="radio"
                                                name="paymentMethod"
                                                id="onlinePayment"
                                                value="online_payment"
                                                checked={paymentMethod === 'online_payment'}
                                                onChange={(e) => setPaymentMethod(e.target.value)}
                                            />
                                            <label className="form-check-label" htmlFor="onlinePayment">
                                                <i className="fa fa-credit-card mr-2"></i>
                                                Online Payment
                                            </label>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary btn-block"
                                        onClick={handleSubmit}
                                        disabled={!selectedAddress}
                                    >
                                        {!selectedAddress ? 'Please select an address' : 'Place Order'}
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* Toast Notification */}
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={() => setToast({show: false, message: '', type: 'success'})}
            />
        </>
    );
};

export default PlaceOrder;