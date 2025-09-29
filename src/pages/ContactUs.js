import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ContactUs = () => {
    const [footerData, setFooterData] = useState({
        description: 'One of the biggest online shopping platform in Bangladesh.',
        email: 'info@greatkart.com',
        phone: '+880-123-456-789',
        business_hours: 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed',
        quick_response: 'We typically respond to all inquiries within 24 hours during business days.',
        social_links: []
    });
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ show: false, text: '', type: 'success' });

    // Fetch footer settings
    const fetchFooterSettings = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/settings/footer-settings/active/');
            if(response.ok) {
                const data = await response.json();
                if(data.success && data.data) {
                    setFooterData({
                        description: data.data.description || 'One of the biggest online shopping platform in Bangladesh.',
                        email: data.data.email || 'info@greatkart.com',
                        phone: data.data.phone || '+880-123-456-789',
                        business_hours: data.data.business_hours || 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed',
                        quick_response: data.data.quick_response || 'We typically respond to all inquiries within 24 hours during business days.',
                        social_links: data.data.social_links || []
                    });
                }
            }
        } catch(error) {
            console.error('ContactUs: Error fetching footer settings:', error);
            // Keep default values if API fails
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (text, type = 'success') => {
        setMessage({ show: true, text, type });
        setTimeout(() => setMessage({ show: false, text: '', type: 'success' }), 5000);
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        
        try {
            // TODO: Implement contact form API
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
            
            showMessage('Thank you for your message! We will get back to you soon.', 'success');
            setFormData({
                name: '',
                email: '',
                subject: '',
                message: ''
            });
        } catch (error) {
            showMessage('Failed to send message. Please try again.', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    useEffect(() => {
        fetchFooterSettings();
    }, []);

    if (loading) {
        return (
            <div className="container py-4">
                <div className="row justify-content-center">
                    <div className="col-md-8 text-center">
                        <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                        <p className="mt-3">Loading contact information...</p>
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
                        <h1 className="h2 mb-3">Contact Us</h1>
                        <p className="text-muted">{footerData.description}</p>
                    </div>

                    {/* Main Content */}
                    <div className="row">
                        {/* Contact Form */}
                        <div className="col-md-8">
                            <div className="card">
                                <div className="card-body p-4">
                                    <h3 className="h4 mb-3">Send us a Message</h3>
                                    
                                    {message.show && (
                                        <div className={`alert alert-${message.type === 'error' ? 'danger' : 'success'} alert-dismissible fade show`}>
                                            <i className={`fa fa-${message.type === 'success' ? 'check-circle' : 'exclamation-triangle'} mr-2`}></i>
                                            {message.text}
                                            <button type="button" className="close" onClick={() => setMessage({ show: false, text: '', type: 'success' })}>
                                                <span>&times;</span>
                                            </button>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit}>
                                        <div className="row">
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="name">Name *</label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="name"
                                                        value={formData.name}
                                                        onChange={(e) => handleInputChange('name', e.target.value)}
                                                        placeholder="Your full name"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="form-group">
                                                    <label htmlFor="email">Email *</label>
                                                    <input
                                                        type="email"
                                                        className="form-control"
                                                        id="email"
                                                        value={formData.email}
                                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                                        placeholder="your.email@example.com"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="subject">Subject *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="subject"
                                                value={formData.subject}
                                                onChange={(e) => handleInputChange('subject', e.target.value)}
                                                placeholder="What is this about?"
                                                required
                                            />
                                        </div>
                                        
                                        <div className="form-group">
                                            <label htmlFor="message">Message *</label>
                                            <textarea
                                                className="form-control"
                                                id="message"
                                                rows="5"
                                                value={formData.message}
                                                onChange={(e) => handleInputChange('message', e.target.value)}
                                                placeholder="Tell us more about your inquiry..."
                                                required
                                            ></textarea>
                                        </div>
                                        
                                        <div className="form-group">
                                            <button
                                                type="submit"
                                                className="btn btn-primary"
                                                disabled={submitting}
                                            >
                                                {submitting ? (
                                                    <>
                                                        <i className="fa fa-spinner fa-spin mr-2"></i>
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa fa-paper-plane mr-2"></i>
                                                        Send Message
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="col-md-4">
                            <div className="card">
                                <div className="card-body p-4">
                                    <h4 className="h5 mb-3">Get in Touch</h4>
                                    
                                    <div className="mb-3">
                                        <h6 className="mb-2">
                                            <i className="fa fa-envelope mr-2 text-primary"></i>
                                            Email
                                        </h6>
                                        <p className="mb-0">
                                            <a href={`mailto:${footerData.email}`} className="text-decoration-none">
                                                {footerData.email}
                                            </a>
                                        </p>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <h6 className="mb-2">
                                            <i className="fa fa-phone mr-2 text-primary"></i>
                                            Phone
                                        </h6>
                                        <p className="mb-0">
                                            <a href={`tel:${footerData.phone}`} className="text-decoration-none">
                                                {footerData.phone}
                                            </a>
                                        </p>
                                    </div>

                                    {/* Social Media Links */}
                                    {footerData.social_links.length > 0 && (
                                        <div className="mb-3">
                                            <h6 className="mb-2">
                                                <i className="fa fa-share-alt mr-2 text-primary"></i>
                                                Follow Us
                                            </h6>
                                            <div className="d-flex flex-wrap">
                                                {footerData.social_links.map((link, index) => (
                                                    <a 
                                                        key={index}
                                                        href={link.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="btn btn-outline-primary btn-sm mr-2 mb-2"
                                                        title={link.platform}
                                                    >
                                                        <i className={link.icon}></i>
                                                        <span className="ml-1">{link.platform}</span>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <h6 className="mb-2">Business Hours</h6>
                                        <div className="small">
                                            {footerData.business_hours.split('\n').map((line, index) => (
                                                <p key={index} className="mb-1">{line}</p>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Response */}
                            <div className="card mt-3">
                                <div className="card-body p-3">
                                    <h6 className="card-title">Quick Response</h6>
                                    <p className="small mb-0">
                                        {footerData.quick_response}
                                    </p>
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

export default ContactUs;
