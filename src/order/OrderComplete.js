import React, {useState, useEffect} from 'react';
import {Link, useLocation} from 'react-router-dom';
import logoApi from '../settings/api/logoApi';
import API_CONFIG from '../config/apiConfig';
import formatBDT from '../utils/currency';

const OrderComplete = () => {
    const location = useLocation();
    const orderData = location.state?.order;
    const orderNumber = location.state?.orderNumber;
    const [logoUrl, setLogoUrl] = useState('/images/logo.png'); // Default logo

    // Fetch active logo
    const fetchActiveLogo = async () => {
        try {
            console.log('Invoice: Fetching active logo...');
            const logoData = await logoApi.getActiveLogo();
            console.log('Invoice: Logo data received:', logoData);
            if(logoData && logoData.logo_url) {
                // Convert relative URL to full URL if needed
                let finalUrl = logoData.logo_url;
                if(finalUrl.startsWith('/media/')) {
                    finalUrl = `${API_CONFIG.BASE_URL}${finalUrl}`;
                    console.log('Invoice: Converted to full URL:', finalUrl);
                }
                console.log('Invoice: Setting logo URL:', finalUrl);
                setLogoUrl(finalUrl);
            } else {
                console.log('Invoice: No logo URL found, keeping default');
            }
        } catch(error) {
            console.error('Invoice: Error fetching active logo:', error);
            // Keep default logo if API fails
        }
    };

    useEffect(() => {
        fetchActiveLogo();
    }, []);
    return (
        <div>
            <div className="container" style={{marginTop: '50px'}}>
                <center>
                    <i className="fas fa-check-circle" style={{fontSize: '72px', marginBottom: '20px', color: '#28A745'}}></i>
                </center>
                <h2 className="text-center">Payment Successful</h2>
                <br />
                <div className="text-center">
                    <Link to="/" className="btn btn-success">Shop more</Link>
                </div>
            </div>

            <div className="container" style={{margin: '0 auto', width: '50%', padding: '50px', background: '#f1f1f1', marginTop: '50px', marginBottom: '50px'}}>
                <div className="row invoice row-printable">
                    <div className="col-md-12">
                        <div className="panel panel-default plain" id="dash_0">
                            <div className="panel-body p30">
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="invoice-logo">
                                            <img src={logoUrl} alt="Invoice logo" style={{maxHeight: '40px'}} />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="invoice-from">
                                            <ul className="list-unstyled text-right">
                                                <li><strong>Invoiced To</strong></li>
                                                <li>{orderData?.delivery_address?.full_name || 'Customer'}</li>
                                                <li>{orderData?.delivery_address?.address_line_1 || 'Address Line 1'}</li>
                                                <li>{orderData?.delivery_address?.address_line_2 || ''}</li>
                                                <li>{orderData?.delivery_address?.city || 'City'}, {orderData?.delivery_address?.country || 'Country'}</li>
                                                <li>{orderData?.delivery_address?.postal_code || ''}</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="invoice-details mt25">
                                            <div className="well">
                                                <ul className="list-unstyled mb0">
                                                    <li><strong>Order</strong> #{orderNumber || orderData?.order_number || 'N/A'}</li>
                                                    <li><strong>Status</strong> {orderData?.status || 'Pending'}</li>
                                                    <li><strong>Order Date:</strong> {orderData?.created_at ? new Date(orderData.created_at).toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    }) : new Date().toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</li>
                                                    <li><strong>Payment Method:</strong> {orderData?.payment_method || 'Cash on Delivery'}</li>
                                                </ul>
                                            </div>
                                        </div>

                                        <div className="invoice-items">
                                            <div className="table-responsive" style={{overflow: 'hidden', outline: 'none'}}>
                                                <table className="table table-bordered">
                                                    <thead>
                                                        <tr>
                                                            <th className="per70 text-center">Description</th>
                                                            <th className="per5 text-center">Qty</th>
                                                            <th className="per25 text-center">Total</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {orderData?.items?.map((item, index) => (
                                                            <tr key={index}>
                                                                <td>
                                                                    {item.product_name}
                                                                    {item.variant_title && (
                                                                        <>
                                                                            <br />
                                                                            <small className="text-muted">Variant: {item.variant_title}</small>
                                                                        </>
                                                                    )}
                                                                </td>
                                                                <td className="text-center">{item.quantity}</td>
                                                                <td className="text-center">{formatBDT(item.total_price)}</td>
                                                            </tr>
                                                        )) || (
                                                                <tr>
                                                                    <td colSpan="3" className="text-center">No items found</td>
                                                                </tr>
                                                            )}
                                                    </tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <th colSpan="2" className="text-right">Sub Total:</th>
                                                            <th className="text-center">{formatBDT(orderData?.subtotal)}</th>
                                                        </tr>
                                                        <tr>
                                                            <th colSpan="2" className="text-right">Shipping:</th>
                                                            <th className="text-center">{formatBDT(orderData?.shipping_cost)}</th>
                                                        </tr>
                                                        <tr>
                                                            <th colSpan="2" className="text-right">Tax:</th>
                                                            <th className="text-center">{formatBDT(orderData?.tax_amount)}</th>
                                                        </tr>
                                                        <tr>
                                                            <th colSpan="2" className="text-right">Grand Total:</th>
                                                            <th className="text-center">{formatBDT(orderData?.total_amount)}</th>
                                                        </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                        </div>
                                        <div className="invoice-footer mt25">
                                            <p className="text-center">Thank you for shopping with us!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderComplete;