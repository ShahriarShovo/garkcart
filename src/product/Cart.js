import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import Toast from '../components/Toast';

const Cart = () => {
    const {items, removeFromCart, increaseQuantity, decreaseQuantity, clearCart, getTotalPrice, loading} = useCart();
    const [toast, setToast] = useState({show: false, message: '', type: 'success'});

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

    const handleRemoveItem = async (itemId) => {
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

    const handleClearCart = async () => {
        if(window.confirm('Are you sure you want to clear all items from your cart?')) {
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
        }
    };

    // Helper function to get product image
    const getProductImage = (item) => {
        if(item.product && item.product.primary_image) {
            const imageUrl = item.product.primary_image.image_url;
            return imageUrl.startsWith('http') ? imageUrl : `http://localhost:8000${imageUrl}`;
        }
        return '/images/items/1.jpg'; // Default fallback image
    };

    const tax = getTotalPrice() * 0.1; // 10% tax
    const total = getTotalPrice() + tax;

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
                                                        <var className="price">${item.total_price?.toFixed(2) || (item.unit_price * item.quantity).toFixed(2)}</var>
                                                        <small className="text-muted">${item.unit_price} each</small>
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
                                        <dt>Total price:</dt>
                                        <dd className="text-right">${getTotalPrice().toFixed(2)}</dd>
                                    </dl>
                                    <dl className="dlist-align">
                                        <dt>Tax:</dt>
                                        <dd className="text-right">${tax.toFixed(2)}</dd>
                                    </dl>
                                    <dl className="dlist-align">
                                        <dt>Total:</dt>
                                        <dd className="text-right text-dark b">
                                            <strong>${total.toFixed(2)}</strong>
                                        </dd>
                                    </dl>
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
        </>
    );
};

export default Cart;
