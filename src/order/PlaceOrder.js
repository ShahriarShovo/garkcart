import React, {useState} from 'react';
import {useCart} from '../context/CartContext';
import {useNavigate} from 'react-router-dom';

const PlaceOrder = () => {
    const {items, getTotalPrice, clearCart} = useCart();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '+998',
        email: '',
        country: 'India',
        state: '',
        street: '',
        building: '',
        house: '',
        postalCode: '',
        zip: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('paypal');

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Process order
        clearCart();
        navigate('/order-complete');
    };

    const getTax = () => {
        return getTotalPrice() * 0.1; // 10% tax
    };

    const getFinalTotal = () => {
        return getTotalPrice() + getTax();
    };

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
                                                    <img src={item.image} className="border img-sm" alt={item.name} />
                                                </div>
                                                <figcaption className="info">
                                                    <p>{item.name}</p>
                                                    <span className="text-muted">{item.quantity}x = ${(item.price * item.quantity).toFixed(2)}</span>
                                                </figcaption>
                                            </figure>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </article>

                        {/* Contact Info */}
                        <article className="card mb-4">
                            <div className="card-body">
                                <h4 className="card-title mb-4">Contact info</h4>
                                <form>
                                    <div className="row">
                                        <div className="form-group col-sm-6">
                                            <label>First name</label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                placeholder="Type here"
                                                className="form-control"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label>Last name</label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                placeholder="Type here"
                                                className="form-control"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label>Phone</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                className="form-control"
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="example@gmail.com"
                                                className="form-control"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </article>

                        {/* Delivery Info */}
                        <article className="card mb-4">
                            <div className="card-body">
                                <h4 className="card-title mb-4">Delivery info</h4>
                                <form>
                                    <div className="row">
                                        <div className="form-group col-sm-6">
                                            <label>Country*</label>
                                            <select
                                                name="country"
                                                className="form-control"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                            >
                                                <option value="India">India</option>
                                                <option value="United States">United States</option>
                                                <option value="France">France</option>
                                                <option value="Italy">Italy</option>
                                            </select>
                                        </div>
                                        <div className="form-group col-sm-6">
                                            <label>State*</label>
                                            <input
                                                type="text"
                                                name="state"
                                                placeholder="Type here"
                                                className="form-control"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group col-sm-8">
                                            <label>Street*</label>
                                            <input
                                                type="text"
                                                name="street"
                                                placeholder="Type here"
                                                className="form-control"
                                                value={formData.street}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group col-sm-4">
                                            <label>Building</label>
                                            <input
                                                type="text"
                                                name="building"
                                                placeholder=""
                                                className="form-control"
                                                value={formData.building}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group col-sm-4">
                                            <label>House</label>
                                            <input
                                                type="text"
                                                name="house"
                                                placeholder="Type here"
                                                className="form-control"
                                                value={formData.house}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group col-sm-4">
                                            <label>Postal code</label>
                                            <input
                                                type="text"
                                                name="postalCode"
                                                placeholder=""
                                                className="form-control"
                                                value={formData.postalCode}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group col-sm-4">
                                            <label>Zip</label>
                                            <input
                                                type="text"
                                                name="zip"
                                                placeholder=""
                                                className="form-control"
                                                value={formData.zip}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </article>

                        {/* Payment Methods */}
                        <article className="accordion" id="accordion_pay">
                            <div className="card">
                                <header className="card-header">
                                    <img src="/images/misc/payment-paypal.png" className="float-right" height="24" alt="PayPal" />
                                    <label className="form-check collapsed" data-toggle="collapse" data-target="#pay_paynet">
                                        <input
                                            className="form-check-input"
                                            name="payment-option"
                                            checked={paymentMethod === 'paypal'}
                                            type="radio"
                                            value="paypal"
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <h6 className="form-check-label">Paypal</h6>
                                    </label>
                                </header>
                                <div id="pay_paynet" className={`collapse ${paymentMethod === 'paypal' ? 'show' : ''}`} data-parent="#accordion_pay">
                                    <div className="card-body">
                                        <p className="text-center text-muted">Connect your PayPal account and use it to pay your bills. You'll be redirected to PayPal to add your billing information.</p>
                                        <p className="text-center">
                                            <a href="#"><img src="/images/misc/btn-paypal.png" height="32" alt="PayPal" /></a>
                                            <br /><br />
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <header className="card-header">
                                    <img src="/images/misc/payment-card.png" className="float-right" height="24" alt="Credit Card" />
                                    <label className="form-check" data-toggle="collapse" data-target="#pay_payme">
                                        <input
                                            className="form-check-input"
                                            name="payment-option"
                                            type="radio"
                                            value="creditcard"
                                            checked={paymentMethod === 'creditcard'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <h6 className="form-check-label">Credit Card</h6>
                                    </label>
                                </header>
                                <div id="pay_payme" className={`collapse ${paymentMethod === 'creditcard' ? 'show' : ''}`} data-parent="#accordion_pay">
                                    <div className="card-body">
                                        <p className="alert alert-success">Some information or instruction</p>
                                        <form className="form-inline">
                                            <input type="text" className="form-control mr-2" placeholder="xxxx-xxxx-xxxx-xxxx" name="" />
                                            <input type="text" className="form-control mr-2" style={{width: '100px'}} placeholder="dd/yy" name="" />
                                            <input type="number" maxLength="3" className="form-control mr-2" style={{width: '100px'}} placeholder="cvc" name="" />
                                            <button className="btn btn btn-success">Button</button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </article>
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
                                <p className="text-center mb-3">
                                    <img src="/images/misc/payments.png" height="26" alt="Payment methods" />
                                </p>
                                <button
                                    className="btn btn-primary btn-block"
                                    onClick={handleSubmit}
                                >
                                    Place Order
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>
    );
};

export default PlaceOrder;