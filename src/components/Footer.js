import React, {useState, useEffect} from 'react';
import logoApi from '../settings/api/logoApi';

const Footer = () => {
    const [logoUrl, setLogoUrl] = useState('/images/logo.png'); // Default logo

    // Fetch active logo
    const fetchActiveLogo = async () => {
        try {
            console.log('Footer: Fetching active logo...');
            const logoData = await logoApi.getActiveLogo();
            console.log('Footer: Logo data received:', logoData);
            if(logoData && logoData.logo_url) {
                // Convert relative URL to full URL if needed
                let finalUrl = logoData.logo_url;
                if(finalUrl.startsWith('/media/')) {
                    finalUrl = `http://localhost:8000${finalUrl}`;
                    console.log('Footer: Converted to full URL:', finalUrl);
                }
                console.log('Footer: Setting logo URL:', finalUrl);
                setLogoUrl(finalUrl);
            } else {
                console.log('Footer: No logo URL found, keeping default');
            }
        } catch(error) {
            console.error('Footer: Error fetching active logo:', error);
            // Keep default logo if API fails
        }
    };

    useEffect(() => {
        fetchActiveLogo();
    }, []);

    return (
        <footer className="section-footer border-top bg-light" style={{marginTop: 'auto'}}>
            <div className="container">
                <section className="footer-top" style={{padding: '20px 0'}}>
                    <div className="row">
                        <aside className="col-md-6">
                            <article className="mr-3">
                                <img
                                    src={logoUrl}
                                    className="logo-footer"
                                    alt="GreatKart"
                                    style={{height: '30px'}}
                                    onLoad={() => console.log('Footer: Image loaded successfully:', logoUrl)}
                                    onError={(e) => console.error('Footer: Image failed to load:', logoUrl, e)}
                                />
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
