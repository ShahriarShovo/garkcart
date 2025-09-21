import React from 'react';

const Footer = () => {
    return (
        <footer className="section-footer border-top bg-light" style={{marginTop: 'auto'}}>
            <div className="container">
                <section className="footer-top" style={{padding: '20px 0'}}>
                    <div className="row">
                        <aside className="col-md-6">
                            <article className="mr-3">
                                <img src="/images/logo.png" className="logo-footer" alt="GreatKart" style={{height: '30px'}} />
                                <p className="mt-2 mb-2" style={{fontSize: '14px'}}>One of the biggest online shopping platform in Bangladesh.</p>
                                <div>
                                    <a className="btn btn-icon btn-light" title="Facebook" target="_blank" href="#"><i className="fab fa-facebook-f"></i></a>
                                    <a className="btn btn-icon btn-light" title="Instagram" target="_blank" href="#"><i className="fab fa-instagram"></i></a>
                                    <a className="btn btn-icon btn-light" title="Youtube" target="_blank" href="#"><i className="fab fa-youtube"></i></a>
                                    <a className="btn btn-icon btn-light" title="Twitter" target="_blank" href="#"><i className="fab fa-twitter"></i></a>
                                </div>
                            </article>
                        </aside>
                        <aside className="col-md-3">
                            <h6 className="title" style={{fontSize: '16px', marginBottom: '10px'}}>Quick Links</h6>
                            <ul className="list-unstyled" style={{fontSize: '14px'}}>
                                <li><a href="#">About us</a></li>
                                <li><a href="#">Contact us</a></li>
                                <li><a href="#">Order tracking</a></li>
                                <li><a href="#">Returns</a></li>
                            </ul>
                        </aside>
                        <aside className="col-md-3">
                            <h6 className="title" style={{fontSize: '16px', marginBottom: '10px'}}>Download app</h6>
                            <a href="#" className="d-block mb-1"><img src="/images/misc/appstore.png" height="30" alt="App Store" /></a>
                            <a href="#" className="d-block mb-1"><img src="/images/misc/playmarket.png" height="30" alt="Play Market" /></a>
                        </aside>
                    </div>
                </section>

                <section className="footer-bottom border-top row" style={{padding: '15px 0'}}>
                    <div className="col-md-4">
                        <p className="text-muted" style={{fontSize: '14px', margin: 0}}>&copy 2024 GreatKart. All rights reserved</p>
                    </div>
                    <div className="col-md-4 text-md-center">
                        <span className="px-2" style={{fontSize: '14px'}}>info@greatkart.com</span>
                        <span className="px-2" style={{fontSize: '14px'}}>+880-123-456-789</span>
                    </div>
                    <div className="col-md-4 text-md-right text-muted">
                        <i className="fab fa-lg fa-cc-visa"></i>
                        <i className="fab fa-lg fa-cc-paypal"></i>
                        <i className="fab fa-lg fa-cc-mastercard"></i>
                    </div>
                </section>
            </div>
        </footer>
    );
};

export default Footer;
