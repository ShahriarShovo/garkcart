import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import {useAuth} from '../context/AuthContext';
import formatBDT from '../utils/currency';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';
import API_CONFIG from '../config/apiConfig';
// TODO: Discount features will be developed in future
// import DiscountCalculator from '../chat_and_notification/DiscountCalculator';

const Cart = () => {
    const {items, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, getTotalPrice, loading} = useCart();
    const {user, isAuthenticated} = useAuth();
    const [toast, setToast] = useState({show: false, message: '', type: 'success'});
    const [confirmDialog, setConfirmDialog] = useState({show: false, title: '', message: '', onConfirm: null, itemId: null});
    const [appliedDiscount, setAppliedDiscount] = useState(null);

    // Show login message for anonymous users
    if (!isAuthenticated) {
        return (
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card">
                            <div className="card-body text-center py-5">
                                <i className="fa fa-shopping-cart fa-3x text-muted mb-3"></i>
                                <h4 className="text-muted">Your Cart is Empty</h4>
                                <p className="text-muted mb-4">
                                    Please login or sign up to add items to your cart and start shopping!
                                </p>
                                <div className="d-flex justify-content-center gap-4 p-3">
                                    <Link to="/login" className="btn btn-primary px-4 py-2">
                                        <i className="fa fa-sign-in mr-2"></i>
                                        Login
                                    </Link>
                                    <Link to="/register" className="btn btn-outline-primary px-4 py-2">
                                        <i className="fa fa-user-plus mr-2"></i>
                                        Sign Up
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleIncreaseQuantity = async (itemId) => {
        const result = await increaseQuantity(itemId);
        if(result.success) {
            setToast({
                show: true,
                message: 'Quantity increased successfully!',
                type: 'success'
            });
        } else {
            setToast({
                show: true,
                message: `Failed to increase quantity: ${result.error}`,
                type: 'error'
            });
        }
    };

    const handleDecreaseQuantity = async (itemId) => {
        const result = await decreaseQuantity(itemId);
        if(result.success) {
            setToast({
                show: true,
                message: result.message || 'Quantity decreased successfully!',
                type: 'success'
            });
        } else {
            setToast({
                show: true,
                message: `Failed to decrease quantity: ${result.error}`,
                type: 'error'
            });
        }
    };

    const handleRemoveItem = (itemId) => {
        setConfirmDialog({
            show: true,
            title: 'Remove Item',
            message: 'Are you sure you want to remove this item from your cart?',
            onConfirm: () => confirmRemoveItem(itemId),
            itemId: itemId
        });
    };

    const confirmRemoveItem = async (itemId) => {
        setConfirmDialog({show: false, title: '', message: '', onConfirm: null, itemId: null});

        const result = await removeFromCart(itemId);
        if(result.success) {
            setToast({
                show: true,
                message: result.message || 'Item removed from cart!',
                type: 'success'
            });
        } else {
            setToast({
                show: true,
                message: `Failed to remove item: ${result.error}`,
                type: 'error'
            });
        }
    };

    const handleClearCart = () => {
        setConfirmDialog({
            show: true,
            title: 'Clear Cart',
            message: 'Are you sure you want to clear all items from your cart?',
            onConfirm: () => confirmClearCart(),
            itemId: null
        });
    };

    const confirmClearCart = async () => {
        setConfirmDialog({show: false, title: '', message: '', onConfirm: null, itemId: null});

        const result = await clearCart();
        if(result.success) {
            setToast({
                show: true,
                message: result.message || 'Cart cleared successfully!',
                type: 'success'
            });
        } else {
            setToast({
                show: true,
                message: `Failed to clear cart: ${result.error}`,
                type: 'error'
            });
        }
    };

    // Helper function to get product image
    const getProductImage = (item) => {
        if(item.product && item.product.primary_image) {
            const imageUrl = item.product.primary_image.image_url;
            return imageUrl.startsWith('http') ? imageUrl : `${API_CONFIG.BASE_URL}${imageUrl}`;
        }
        return '/images/items/1.jpg'; // Default fallback image
    };

    const subtotal = getTotalPrice();
    const discountAmount = appliedDiscount ? appliedDiscount.discount_amount : 0;
    const discountedSubtotal = subtotal - discountAmount;
    const tax = discountedSubtotal * 0.1; // 10% tax
    const total = discountedSubtotal + tax;

    if(items.length === 0) {
        return (
            <section className="section-content padding-y bg">
                <div className="container">
                    <div className="text-center">
                        <h2>Your cart is empty</h2>
                        <p>Add some products to your cart to continue shopping.</p>
                        <Link to="/store" className="btn btn-primary">Continue Shopping</Link>
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
                        <aside className="col-lg-9">
                            <div className="card">
                                <table className="table table-borderless table-shopping-cart">
                                    <thead className="text-muted">
                                        <tr className="small text-uppercase">
                                            <th scope="col">Product</th>
                                            <th scope="col" width="120">Quantity</th>
                                            <th scope="col" width="120">Price</th>
                                            <th scope="col" className="text-right" width="200"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(item => (
                                            <tr key={item.id}>
                                                <td>
                                                    <figure className="itemside align-items-center">
                                                        <div className="aside">
                                                            <img
                                                                src={getProductImage(item)}
                                                                className="img-sm"
                                                                alt={item.product?.title || 'Product'}
                                                                style={{width: '80px', height: '80px', objectFit: 'cover'}}
                                                            />
                                                        </div>
                                                        <figcaption className="info">
                                                            <Link to={`/product/${item.product?.slug || item.product?.id}`} className="title text-dark">
                                                                {item.product?.title || 'Product Name'}
                                                            </Link>
                                                            <p className="text-muted small">
                                                                Category: {item.product?.category_name || 'General'} <br />
                                                                {item.variant && (
                                                                    <span>Variant: {item.variant.title}</span>
                                                                )}
                                                            </p>
                                                        </figcaption>
                                                    </figure>
                                                </td>
                                                <td>
                                                    <div className="col">
                                                        <div className="input-group input-spinner">
                                                            <div className="input-group-prepend">
                                                                <button
                                                                    className="btn btn-light"
                                                                    type="button"
                                                                    onClick={() => handleDecreaseQuantity(item.id)}
                                                                    disabled={loading || item.quantity <= 1}
                                                                    title={item.quantity <= 1 ? "Cannot decrease below 1" : "Decrease quantity"}
                                                                >
                                                                    <i className="fa fa-minus"></i>
                                                                </button>
                                                            </div>
                                                            <input
                                                                type="text"
                                                                className="form-control"
                                                                value={item.quantity}
                                                                readOnly
                                                                style={{textAlign: 'center'}}
                                                            />
                                                            <div className="input-group-append">
                                                                <button
                                                                    className="btn btn-light"
                                                                    type="button"
                                                                    onClick={() => handleIncreaseQuantity(item.id)}
                                                                    disabled={loading}
                                                                >
                                                                    <i className="fa fa-plus"></i>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="price-wrap">
                                                        <var className="price">{formatBDT(item.total_price ?? (item.unit_price * item.quantity))}</var>
                                                        <small className="text-muted">{formatBDT(item.unit_price)} each</small>
                                                    </div>
                                                </td>
                                                <td className="text-right">
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => handleRemoveItem(item.id)}
                                                        disabled={loading}
                                                    >
                                                        {loading ? '...' : 'Remove'}
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </aside>
                        <aside className="col-lg-3">
                            <div className="card">
                                <div className="card-body">
                                    <dl className="dlist-align">
                                        <dt>Subtotal:</dt>
                                        <dd className="text-right">{formatBDT(subtotal)}</dd>
                                    </dl>

                                    {/* Discount Section */}
                                    {appliedDiscount && (
                                        <dl className="dlist-align">
                                            <dt className="text-success">
                                                <i className="fa fa-tag mr-1"></i>
                                                Discount ({appliedDiscount.discount.name}):
                                            </dt>
                                            <dd className="text-right text-success">
                                                -{formatBDT(discountAmount)}
                                            </dd>
                                        </dl>
                                    )}

                                    <dl className="dlist-align">
                                        <dt>Tax:</dt>
                                        <dd className="text-right">{formatBDT(tax)}</dd>
                                    </dl>
                                    <dl className="dlist-align">
                                        <dt>Total:</dt>
                                        <dd className="text-right text-dark b">
                                            <strong>{formatBDT(total)}</strong>
                                        </dd>
                                    </dl>

                                    {/* TODO: Discount features will be developed in future */}
                                    {/* <DiscountCalculator
                                        cartItems={items}
                                        userId={user?.id}
                                        onDiscountCalculated={setAppliedDiscount}
                                    /> */}

                                    <hr />
                                    <p className="text-center mb-3">
                                        <img src="/images/misc/payments.png" height="26" alt="Payment methods" />
                                    </p>
                                    <Link to="/place-order" className="btn btn-primary btn-block">
                                        Checkout
                                    </Link>
                                    <button
                                        className="btn btn-danger btn-block"
                                        onClick={handleClearCart}
                                        disabled={loading}
                                    >
                                        {loading ? 'Clearing...' : 'Clear Cart'}
                                    </button>
                                    <Link to="/store" className="btn btn-light btn-block">
                                        Continue Shopping
                                    </Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* Toast Notification */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({show: false, message: '', type: 'success'})}
                />
            )}

            {/* Confirm Dialog */}
            <ConfirmDialog
                show={confirmDialog.show}
                title={confirmDialog.title}
                message={confirmDialog.message}
                onConfirm={confirmDialog.onConfirm}
                onCancel={() => setConfirmDialog({show: false, title: '', message: '', onConfirm: null, itemId: null})}
                confirmText="Remove"
                cancelText="Cancel"
            />
        </>
    );
};

export default Cart;
