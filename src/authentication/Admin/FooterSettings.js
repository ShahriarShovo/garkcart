import React, { useState, useEffect } from 'react';
import API_CONFIG from '../../config/apiConfig';

const FooterSettings = () => {
    const [footerData, setFooterData] = useState({
        description: 'One of the biggest online shopping platform in Bangladesh.',
        copyright: '© 2024 GreatKart. All rights reserved',
        email: 'info@greatkart.com',
        phone: '+880-123-456-789',
        about_us: 'GreatKart is your one-stop destination for quality products at affordable prices. We are committed to providing excellent customer service and fast delivery across Bangladesh.',
        mission: 'To provide the best online shopping experience with quality products, competitive prices, and excellent customer service.',
        vision: 'To become Bangladesh\'s leading e-commerce platform, connecting customers with quality products and services.',
        business_hours: 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: Closed',
        quick_response: 'We typically respond to all inquiries within 24 hours during business days.',
        social_links: [
            { platform: 'Facebook', url: 'https://facebook.com/greatkart', icon: 'fab fa-facebook-f' },
            { platform: 'Instagram', url: 'https://instagram.com/greatkart', icon: 'fab fa-instagram' },
            { platform: 'YouTube', url: 'https://youtube.com/greatkart', icon: 'fab fa-youtube' },
            { platform: 'Twitter', url: 'https://twitter.com/greatkart', icon: 'fab fa-twitter' }
        ]
    });

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ show: false, text: '', type: 'success' });
    const [footerId, setFooterId] = useState(null);

    const showMessage = (text, type = 'success') => {
        setMessage({ show: true, text, type });
        setTimeout(() => setMessage({ show: false, text: '', type: 'success' }), 3000);
    };

    // Load existing footer settings
    const loadFooterSettings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/settings/footer-settings/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.length > 0) {
                    const footerSetting = data[0]; // Get the first (most recent) footer setting
                    setFooterId(footerSetting.id);
                        setFooterData({
                            description: footerSetting.description || '',
                            copyright: footerSetting.copyright || '',
                            email: footerSetting.email || '',
                            phone: footerSetting.phone || '',
                            about_us: footerSetting.about_us || '',
                            mission: footerSetting.mission || '',
                            vision: footerSetting.vision || '',
                            business_hours: footerSetting.business_hours || '',
                            quick_response: footerSetting.quick_response || '',
                            social_links: footerSetting.social_links || []
                        });
                }
            }
        } catch (error) {
            console.error('Error loading footer settings:', error);
            showMessage('Failed to load footer settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Save footer settings
    const saveFooterSettings = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const url = footerId 
                ? `${API_CONFIG.BASE_URL}/api/settings/footer-settings/${footerId}/`
                : `${API_CONFIG.BASE_URL}/api/settings/footer-settings/`;
            
            const method = footerId ? 'PATCH' : 'POST';
            
            // Filter out incomplete social links
            const cleanedSocialLinks = footerData.social_links
                .filter(link => link && link.platform && link.url)
                .map((link, index) => ({
                    platform: link.platform,
                    url: link.url,
                    icon: link.icon || 'fab fa-link',
                    is_active: true,
                    order: index
                }));

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    description: footerData.description,
                    copyright: footerData.copyright,
                    email: footerData.email,
                    phone: footerData.phone,
                        about_us: footerData.about_us,
                        mission: footerData.mission,
                        vision: footerData.vision,
                        business_hours: footerData.business_hours,
                        quick_response: footerData.quick_response,
                        is_active: true,
                    social_links: cleanedSocialLinks
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    if (!footerId && data.data) {
                        setFooterId(data.data.id);
                    }
                    showMessage('Footer settings saved successfully!', 'success');
                } else {
                    showMessage(data.message || 'Failed to save footer settings', 'error');
                }
            } else {
                let errorText = 'Failed to save footer settings';
                try {
                    const errorData = await response.json();
                    if (errorData.errors) {
                        const flat = Object.entries(errorData.errors)
                            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
                            .join(' | ');
                        errorText = errorData.message ? `${errorData.message} - ${flat}` : flat;
                    } else if (errorData.message) {
                        errorText = errorData.message;
                    }
                } catch(e) {
                    // fallback to text
                    const txt = await response.text();
                    if (txt) errorText = txt;
                }
                showMessage(errorText, 'error');
            }
        } catch (error) {
            console.error('Error saving footer settings:', error);
            showMessage('Failed to save footer settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFooterData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSocialLinkChange = (index, field, value) => {
        setFooterData(prev => ({
            ...prev,
            social_links: prev.social_links.map((link, i) => 
                i === index ? { ...link, [field]: value } : link
            )
        }));
    };

    const addSocialLink = () => {
        setFooterData(prev => ({
            ...prev,
            social_links: [...prev.social_links, { platform: '', url: '', icon: 'fab fa-link' }]
        }));
    };

    const removeSocialLink = (index) => {
        setFooterData(prev => ({
            ...prev,
            social_links: prev.social_links.filter((_, i) => i !== index)
        }));
    };

    const handleSave = async () => {
        await saveFooterSettings();
    };

    // Load footer settings on component mount
    useEffect(() => {
        loadFooterSettings();
    }, []);

    if (loading) {
        return (
            <div className="card">
                <div className="card-header">
                    <h5 className="card-title mb-0">
                        <i className="fa fa-footer mr-2"></i>
                        Footer Settings
                    </h5>
                </div>
                <div className="card-body text-center py-5">
                    <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                    <p className="mt-3">Loading footer settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h5 className="card-title mb-0">
                    <i className="fa fa-footer mr-2"></i>
                    Footer Settings
                </h5>
            </div>
            <div className="card-body">
                {message.show && (
                    <div className={`alert alert-${message.type === 'error' ? 'danger' : message.type} alert-dismissible fade show`}>
                        <i className={`fa fa-${message.type === 'success' ? 'check-circle' : message.type === 'error' ? 'exclamation-triangle' : 'info-circle'} mr-2`}></i>
                        {message.text}
                        <button type="button" className="close" onClick={() => setMessage({ show: false, text: '', type: 'success' })}>
                            <span>&times;</span>
                        </button>
                    </div>
                )}

                <form>
                    {/* Company Description */}
                    <div className="form-group">
                        <label className="form-label">
                            <i className="fa fa-info-circle mr-1"></i>
                            Company Description
                        </label>
                        <textarea
                            className="form-control"
                            rows="3"
                            value={footerData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Enter company description for footer"
                        />
                        <small className="form-text text-muted">
                            This text appears below the logo in the footer
                        </small>
                    </div>

                    {/* Contact Information */}
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa fa-envelope mr-1"></i>
                                    Contact Email
                                </label>
                                <input
                                    type="email"
                                    className="form-control"
                                    value={footerData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    placeholder="admin@example.com"
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa fa-phone mr-1"></i>
                                    Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    className="form-control"
                                    value={footerData.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    placeholder="+880-123-456-789"
                                />
                            </div>
                        </div>
                    </div>

                    {/* About Us */}
                    <div className="form-group">
                        <label className="form-label">
                            <i className="fa fa-file-text mr-1"></i>
                            About Us
                        </label>
                        <textarea
                            className="form-control"
                            rows="4"
                            value={footerData.about_us}
                            onChange={(e) => handleInputChange('about_us', e.target.value)}
                            placeholder="Enter about us description"
                        />
                        <small className="form-text text-muted">
                            This text can be used in the footer or about page
                        </small>
                    </div>

                    {/* Mission & Vision */}
                    <div className="row">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa fa-bullseye mr-1"></i>
                                    Mission
                                </label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={footerData.mission}
                                    onChange={(e) => handleInputChange('mission', e.target.value)}
                                    placeholder="Enter company mission statement"
                                />
                                <small className="form-text text-muted">
                                    Company mission statement
                                </small>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fa fa-eye mr-1"></i>
                                    Vision
                                </label>
                                <textarea
                                    className="form-control"
                                    rows="3"
                                    value={footerData.vision}
                                    onChange={(e) => handleInputChange('vision', e.target.value)}
                                    placeholder="Enter company vision statement"
                                />
                                <small className="form-text text-muted">
                                    Company vision statement
                                </small>
                            </div>
                        </div>
                    </div>

                    {/* Business Hours */}
                    <div className="form-group">
                        <label className="form-label">
                            <i className="fa fa-clock mr-1"></i>
                            Business Hours
                        </label>
                        <textarea
                            className="form-control"
                            rows="4"
                            value={footerData.business_hours}
                            onChange={(e) => handleInputChange('business_hours', e.target.value)}
                            placeholder="Monday - Friday: 9:00 AM - 6:00 PM&#10;Saturday: 10:00 AM - 4:00 PM&#10;Sunday: Closed"
                        />
                        <small className="form-text text-muted">
                            Enter each business hour on a new line (e.g., Monday - Friday: 9:00 AM - 6:00 PM)
                        </small>
                    </div>

                    {/* Quick Response Info */}
                    <div className="form-group">
                        <label className="form-label">
                            <i className="fa fa-reply mr-1"></i>
                            Quick Response Info
                        </label>
                        <textarea
                            className="form-control"
                            rows="2"
                            value={footerData.quick_response}
                            onChange={(e) => handleInputChange('quick_response', e.target.value)}
                            placeholder="We typically respond to all inquiries within 24 hours during business days."
                        />
                        <small className="form-text text-muted">
                            Information about response time (e.g., We typically respond within 24 hours)
                        </small>
                    </div>

                    {/* Copyright */}
                    <div className="form-group">
                        <label className="form-label">
                            <i className="fa fa-copyright mr-1"></i>
                            Copyright Text
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            value={footerData.copyright}
                            onChange={(e) => handleInputChange('copyright', e.target.value)}
                            placeholder="© 2024 GreatKart. All rights reserved"
                        />
                    </div>

                    {/* Social Media Links */}
                    <div className="form-group">
                        <label className="form-label">
                            <i className="fa fa-share-alt mr-1"></i>
                            Social Media Links
                        </label>
                        {footerData.social_links.map((link, index) => (
                            <div key={index} className="row mb-3">
                                <div className="col-md-3">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={link.platform}
                                        onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                                        placeholder="Platform (e.g., Facebook)"
                                    />
                                </div>
                                <div className="col-md-6">
                                    <input
                                        type="url"
                                        className="form-control"
                                        value={link.url}
                                        onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                                        placeholder="https://facebook.com/yourpage"
                                    />
                                </div>
                                <div className="col-md-2">
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={link.icon}
                                        onChange={(e) => handleSocialLinkChange(index, 'icon', e.target.value)}
                                        placeholder="fab fa-facebook-f"
                                    />
                                </div>
                                <div className="col-md-1">
                                    <button
                                        type="button"
                                        className="btn btn-outline-danger btn-sm"
                                        onClick={() => removeSocialLink(index)}
                                        title="Remove this social link"
                                    >
                                        <i className="fa fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={addSocialLink}
                        >
                            <i className="fa fa-plus mr-1"></i>
                            Add Social Link
                        </button>
                        <small className="form-text text-muted d-block mt-2">
                            Add your social media profiles. Icon should be FontAwesome class (e.g., fab fa-facebook-f)
                        </small>
                    </div>

                    {/* Action Buttons */}
                    <div className="form-group">
                        <div className="d-flex justify-content-end">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <>
                                        <i className="fa fa-spinner fa-spin mr-1"></i>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa fa-save mr-1"></i>
                                        Save Settings
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FooterSettings;

