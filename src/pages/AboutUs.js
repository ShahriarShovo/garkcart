import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const AboutUs = () => {
    const [footerData, setFooterData] = useState({
        description: 'One of the biggest online shopping platform in Bangladesh.',
        about_us: 'GreatKart is your one-stop destination for quality products at affordable prices. We are committed to providing excellent customer service and fast delivery across Bangladesh.',
        mission: 'To provide the best online shopping experience with quality products, competitive prices, and excellent customer service.',
        vision: 'To become Bangladesh\'s leading e-commerce platform, connecting customers with quality products and services.',
        email: 'info@greatkart.com',
        phone: '+880-123-456-789',
        social_links: []
    });
    const [loading, setLoading] = useState(true);

    // Fetch footer settings
    const fetchFooterSettings = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/settings/footer-settings/active/');
            if(response.ok) {
                const data = await response.json();
                if(data.success && data.data) {
                    setFooterData({
                        description: data.data.description || 'One of the biggest online shopping platform in Bangladesh.',
                        about_us: data.data.about_us || 'GreatKart is your one-stop destination for quality products at affordable prices.',
                        mission: data.data.mission || 'To provide the best online shopping experience with quality products, competitive prices, and excellent customer service.',
                        vision: data.data.vision || 'To become Bangladesh\'s leading e-commerce platform, connecting customers with quality products and services.',
                        email: data.data.email || 'info@greatkart.com',
                        phone: data.data.phone || '+880-123-456-789',
                        social_links: data.data.social_links || []
                    });
                }
            }
        } catch(error) {
            console.error('AboutUs: Error fetching footer settings:', error);
            // Keep default values if API fails
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFooterSettings();
    }, []);

    if (loading) {
        return (
            <div className="container py-5">
                <div className="row justify-content-center">
                    <div className="col-md-8 text-center">
                        <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                        <p className="mt-3">Loading about us information...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <div className="row">
                <div className="col-lg-8 mx-auto">
                    {/* Header Section */}
                    <div className="text-center mb-4">
                        <h1 className="h2 mb-3">About GreatKart</h1>
                        <p className="text-muted">{footerData.description}</p>
                    </div>

                    {/* Main Content */}
                    <div className="card">
                        <div className="card-body p-4">
                            <div className="row">
                                <div className="col-md-8">
                                    <h3 className="h4 mb-3">Our Story</h3>
                                    <p className="text-justify mb-4">
                                        {footerData.about_us}
                                    </p>

                                    {/* Mission & Vision */}
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <div className="card bg-light">
                                                <div className="card-body p-3">
                                                    <h5 className="card-title">
                                                        <i className="fa fa-bullseye mr-2 text-primary"></i>
                                                        Our Mission
                                                    </h5>
                                                    <p className="card-text small">
                                                        {footerData.mission}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <div className="card bg-light">
                                                <div className="card-body p-3">
                                                    <h5 className="card-title">
                                                        <i className="fa fa-eye mr-2 text-primary"></i>
                                                        Our Vision
                                                    </h5>
                                                    <p className="card-text small">
                                                        {footerData.vision}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-4">
                                    {/* Contact Information */}
                                    <div className="card bg-primary text-white">
                                        <div className="card-body p-3">
                                            <h5 className="card-title">
                                                <i className="fa fa-phone mr-2"></i>
                                                Contact Us
                                            </h5>
                                            
                                            <div className="mb-2">
                                                <i className="fa fa-envelope mr-2"></i>
                                                <a href={`mailto:${footerData.email}`} className="text-white">
                                                    {footerData.email}
                                                </a>
                                            </div>
                                            
                                            <div className="mb-3">
                                                <i className="fa fa-phone mr-2"></i>
                                                <a href={`tel:${footerData.phone}`} className="text-white">
                                                    {footerData.phone}
                                                </a>
                                            </div>

                                            {/* Social Media Links */}
                                            {footerData.social_links.length > 0 && (
                                                <div>
                                                    <h6 className="mb-2">Follow Us</h6>
                                                    <div className="d-flex flex-wrap">
                                                        {footerData.social_links.map((link, index) => (
                                                            <a 
                                                                key={index}
                                                                href={link.url} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="btn btn-outline-light btn-sm mr-1 mb-1"
                                                                title={link.platform}
                                                            >
                                                                <i className={link.icon}></i>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Why Choose Us */}
                                    <div className="card mt-3">
                                        <div className="card-body p-3">
                                            <h6 className="card-title">Why Choose Us?</h6>
                                            <ul className="list-unstyled mb-0">
                                                <li className="mb-1">
                                                    <i className="fa fa-check text-success mr-2"></i>
                                                    Quality Products
                                                </li>
                                                <li className="mb-1">
                                                    <i className="fa fa-check text-success mr-2"></i>
                                                    Fast Delivery
                                                </li>
                                                <li className="mb-1">
                                                    <i className="fa fa-check text-success mr-2"></i>
                                                    24/7 Support
                                                </li>
                                                <li className="mb-1">
                                                    <i className="fa fa-check text-success mr-2"></i>
                                                    Secure Payment
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="text-center mt-4">
                        <Link to="/" className="btn btn-primary">
                            <i className="fa fa-home mr-2"></i>
                            Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
