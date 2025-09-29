import React, {useState, useEffect} from 'react';
import logoApi from '../settings/api/logoApi';
import API_CONFIG from '../config/apiConfig';

const Footer = () => {
    const [logoUrl, setLogoUrl] = useState('/images/logo.png'); // Default logo
    const [footerData, setFooterData] = useState({
        description: 'One of the biggest online shopping platform in Bangladesh.',
        copyright: '© 2024 GreatKart. All rights reserved',
        email: 'info@greatkart.com',
        phone: '+880-123-456-789',
        social_links: []
    });

    // Fetch active logo
    const fetchActiveLogo = async () => {
        try {
            const logoData = await logoApi.getActiveLogo();
            if(logoData && logoData.logo_url) {
                // Convert relative URL to full URL if needed
                let finalUrl = logoData.logo_url;
                if(finalUrl.startsWith('/media/')) {
                    finalUrl = `${API_CONFIG.BASE_URL}${finalUrl}`;
                }
                setLogoUrl(finalUrl);
            } else {
            }
        } catch(error) {
            console.error('Footer: Error fetching active logo:', error);
            // Keep default logo if API fails
        }
    };

    // Fetch footer settings
    const fetchFooterSettings = async () => {
        try {
            const response = await fetch(API_CONFIG.getFullUrl('SETTINGS', 'FOOTER'));
            if(response.ok) {
                const data = await response.json();
                if(data.success && data.data) {
                    setFooterData({
                        description: data.data.description || 'One of the biggest online shopping platform in Bangladesh.',
                        copyright: data.data.copyright || '© 2024 GreatKart. All rights reserved',
                        email: data.data.email || 'info@greatkart.com',
                        phone: data.data.phone || '+880-123-456-789',
                        social_links: data.data.social_links || []
                    });
                }
            }
        } catch(error) {
            console.error('Footer: Error fetching footer settings:', error);
            // Keep default values if API fails
        }
    };

    useEffect(() => {
        fetchActiveLogo();
        fetchFooterSettings();
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
                                    onLoad={() => {}}
                                    onError={(e) => console.error('Footer: Image failed to load:', logoUrl, e)}
                                />
                                <p className="mt-2 mb-2" style={{fontSize: '14px'}}>{footerData.description}</p>
                                <div>
                                    {footerData.social_links.map((link, index) => (
                                        <a 
                                            key={index}
                                            className="btn btn-icon btn-light" 
                                            title={link.platform} 
                                            target="_blank" 
                                            href={link.url}
                                        >
                                            <i className={link.icon}></i>
                                        </a>
                                    ))}
                                </div>
                            </article>
                        </aside>
                        <aside className="col-md-3">
                            <h6 className="title" style={{fontSize: '16px', marginBottom: '10px'}}>Quick Links</h6>
                            <ul className="list-unstyled" style={{fontSize: '14px'}}>
                                <li><a href="/about-us">About us</a></li>
                                <li><a href="/contact-us">Contact us</a></li>
                                <li><a href="/order-tracking">Order tracking</a></li>
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
                        <p className="text-muted" style={{fontSize: '14px', margin: 0}}>{footerData.copyright}</p>
                    </div>
                    <div className="col-md-4 text-md-center">
                        <span className="px-2" style={{fontSize: '14px'}}>{footerData.email}</span>
                        <span className="px-2" style={{fontSize: '14px'}}>{footerData.phone}</span>
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
