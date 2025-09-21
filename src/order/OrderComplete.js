import React from 'react';
import {Link} from 'react-router-dom';

const OrderComplete = () => {
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
                                            <img src="/images/logo.png" alt="Invoice logo" style={{maxHeight: '40px'}} />
                                        </div>
                                    </div>
                                    <div className="col-lg-6">
                                        <div className="invoice-from">
                                            <ul className="list-unstyled text-right">
                                                <li><strong>Invoiced To</strong></li>
                                                <li>Jakob Smith</li>
                                                <li>Roupark 37</li>
                                                <li>New York, NY, 2014</li>
                                                <li>USA</li>
                                            </ul>
                                        </div>
                                    </div>
                                    <div className="col-lg-12">
                                        <div className="invoice-details mt25">
                                            <div className="well">
                                                <ul className="list-unstyled mb0">
                                                    <li><strong>Order</strong> #12345</li>
                                                    <li><strong>Transaction</strong> #TXN67890</li>
                                                    <li><strong>Order Date:</strong> {new Date().toLocaleDateString('en-US', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</li>
                                                    <li><strong>Status:</strong> PAID</li>
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
                                                        <tr>
                                                            <td>Camera Canon EOS M50 Kit</td>
                                                            <td className="text-center">1</td>
                                                            <td className="text-center">$1156.00 USD</td>
                                                        </tr>
                                                        <tr>
                                                            <td>ADATA Premier ONE microSDXC</td>
                                                            <td className="text-center">1</td>
                                                            <td className="text-center">$149.97 USD</td>
                                                        </tr>
                                                        <tr>
                                                            <td>Logitec headset for gaming</td>
                                                            <td className="text-center">1</td>
                                                            <td className="text-center">$98.00 USD</td>
                                                        </tr>
                                                    </tbody>
                                                    <tfoot>
                                                        <tr>
                                                            <th colSpan="2" className="text-right">Sub Total:</th>
                                                            <th className="text-center">$1403.97 USD</th>
                                                        </tr>
                                                        <tr>
                                                            <th colSpan="2" className="text-right">Tax:</th>
                                                            <th className="text-center">$140.40 USD</th>
                                                        </tr>
                                                        <tr>
                                                            <th colSpan="2" className="text-right">Grand Total:</th>
                                                            <th className="text-center">$1544.37 USD</th>
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