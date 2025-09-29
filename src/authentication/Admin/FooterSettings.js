import React, { useState, useEffect } from 'react';

const FooterSettings = () => {
    const [footerData, setFooterData] = useState({
        description: 'One of the biggest online shopping platform in Bangladesh.',
        copyright: '© 2024 GreatKart. All rights reserved',
        email: 'info@greatkart.com',
        phone: '+880-123-456-789',
        about_us: 'GreatKart is your one-stop destination for quality products at affordable prices. We are committed to providing excellent customer service and fast delivery across Bangladesh.',
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

    const showMessage = (text, type = 'success') => {
        setMessage({ show: true, text, type });
        setTimeout(() => setMessage({ show: false, text: '', type: 'success' }), 3000);
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
        setSaving(true);
        try {
            // TODO: Implement API call to save footer settings
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
            showMessage('Footer settings saved successfully!', 'success');
        } catch (error) {
            showMessage('Failed to save footer settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setFooterData({
            description: 'One of the biggest online shopping platform in Bangladesh.',
            copyright: '© 2024 GreatKart. All rights reserved',
            email: 'info@greatkart.com',
            phone: '+880-123-456-789',
            about_us: 'GreatKart is your one-stop destination for quality products at affordable prices. We are committed to providing excellent customer service and fast delivery across Bangladesh.',
            social_links: [
                { platform: 'Facebook', url: 'https://facebook.com/greatkart', icon: 'fab fa-facebook-f' },
                { platform: 'Instagram', url: 'https://instagram.com/greatkart', icon: 'fab fa-instagram' },
                { platform: 'YouTube', url: 'https://youtube.com/greatkart', icon: 'fab fa-youtube' },
                { platform: 'Twitter', url: 'https://twitter.com/greatkart', icon: 'fab fa-twitter' }
            ]
        });
        showMessage('Footer settings reset to default', 'info');
    };

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
                        <div className="d-flex justify-content-between">
                            <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={handleReset}
                            >
                                <i className="fa fa-undo mr-1"></i>
                                Reset to Default
                            </button>
                            <div>
                                <button
                                    type="button"
                                    className="btn btn-outline-info mr-2"
                                    onClick={() => console.log('Preview:', footerData)}
                                >
                                    <i className="fa fa-eye mr-1"></i>
                                    Preview
                                </button>
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
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FooterSettings;
