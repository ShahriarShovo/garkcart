import React, {useState, useEffect} from 'react';
import discountApi from './api/discountApi';

const AdminDiscountManager = () => {
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingDiscount, setEditingDiscount] = useState(null);
    const [stats, setStats] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        discount_type: 'general',
        percentage: 0,
        minimum_amount: 0,
        maximum_discount_amount: '',
        minimum_quantity: 1,
        valid_from: new Date().toISOString().slice(0, 16),
        valid_until: '',
        target_products: [],
        target_categories: [],
        usage_limit: '',
        show_in_notifications: true,
        notification_message: '',
        status: 'active',
        display_type: 'modal',
        discount_image: null,
        image_alt_text: '',
        modal_title: '',
        modal_button_text: 'Shop Now'
    });

    useEffect(() => {
        loadDiscounts();
        loadStats();
    }, []);

    const loadDiscounts = async () => {
        try {
            setLoading(true);
            const data = await discountApi.getDiscounts();
            setDiscounts(data);
        } catch(error) {
            console.error('AdminDiscountManager: Error loading discounts:', error);
            setError('Failed to load discounts');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const data = await discountApi.getDiscountStats();
            setStats(data);
        } catch(error) {
            console.error('Error loading stats:', error);
        }
    };

    const handleCreateDiscount = async (e) => {
        e.preventDefault();
        try {
            console.log('AdminDiscountManager: Creating discount with data:', formData);

            // Prepare form data for file upload
            const formDataToSend = new FormData();

            // Add all text fields
            formDataToSend.append('name', formData.name);
            formDataToSend.append('discount_type', formData.discount_type);
            formDataToSend.append('percentage', formData.percentage);
            formDataToSend.append('minimum_amount', formData.minimum_amount);
            formDataToSend.append('minimum_quantity', formData.minimum_quantity);
            formDataToSend.append('valid_from', formData.valid_from);
            formDataToSend.append('status', formData.status);
            formDataToSend.append('show_in_notifications', formData.show_in_notifications);
            formDataToSend.append('display_type', formData.display_type);
            formDataToSend.append('image_alt_text', formData.image_alt_text);
            formDataToSend.append('modal_title', formData.modal_title);
            formDataToSend.append('modal_button_text', formData.modal_button_text);
            formDataToSend.append('notification_message', formData.notification_message);

            // Add optional fields
            if(formData.maximum_discount_amount) {
                formDataToSend.append('maximum_discount_amount', formData.maximum_discount_amount);
            }
            if(formData.usage_limit) {
                formDataToSend.append('usage_limit', formData.usage_limit);
            }
            if(formData.valid_until) {
                formDataToSend.append('valid_until', formData.valid_until);
            }

            // Add image file if exists
            if(formData.discount_image && formData.discount_image instanceof File) {
                formDataToSend.append('discount_image', formData.discount_image);
                console.log('AdminDiscountManager: Added image file:', formData.discount_image.name);
            } else {
                console.log('AdminDiscountManager: No image file to upload');
            }

            console.log('AdminDiscountManager: Prepared form data for upload');

            const result = await discountApi.createDiscount(formDataToSend);
            console.log('AdminDiscountManager: Discount created successfully:', result);

            setShowCreateForm(false);
            resetForm();
            loadDiscounts();
            loadStats();
        } catch(error) {
            console.error('AdminDiscountManager: Error creating discount:', error);
            setError('Failed to create discount: ' + (error.message || 'Unknown error'));
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            await discountApi.toggleDiscountStatus(id);
            loadDiscounts();
            loadStats();
        } catch(error) {
            console.error('Error toggling discount:', error);
        }
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this discount?')) {
            try {
                await discountApi.deleteDiscount(id);
                loadDiscounts();
                loadStats();
            } catch(error) {
                console.error('Error deleting discount:', error);
                setError('Failed to delete discount');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            discount_type: 'general',
            percentage: 0,
            minimum_amount: 0,
            maximum_discount_amount: '',
            minimum_quantity: 1,
            valid_from: new Date().toISOString().slice(0, 16),
            valid_until: '',
            target_products: [],
            target_categories: [],
            usage_limit: '',
            show_in_notifications: true,
            notification_message: '',
            status: 'active',
            display_type: 'modal',
            discount_image: null,
            image_alt_text: '',
            modal_title: '',
            modal_button_text: 'Shop Now'
        });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDiscountTypeLabel = (type) => {
        const labels = {
            'general': 'General',
            'quantity': 'Quantity-based',
            'product_specific': 'Product-specific',
            'category': 'Category'
        };
        return labels[type] || type;
    };

    const getStatusColor = (status) => {
        const colors = {
            'active': 'success',
            'inactive': 'secondary',
            'expired': 'danger'
        };
        return colors[status] || 'secondary';
    };

    if(loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2">Loading discounts...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header with Create Button */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Discount Management</h4>
                    <p className="text-muted mb-0">Create and manage discount offers for customers</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateForm(true)}
                >
                    <i className="fa fa-plus mr-2"></i>
                    Create Discount
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card bg-primary text-white">
                            <div className="card-body">
                                <h5>Total Discounts</h5>
                                <h2>{stats.total_discounts}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-success text-white">
                            <div className="card-body">
                                <h5>Active</h5>
                                <h2>{stats.active_discounts}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-info text-white">
                            <div className="card-body">
                                <h5>Total Usage</h5>
                                <h2>{stats.total_usage}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-warning text-white">
                            <div className="card-body">
                                <h5>Total Saved</h5>
                                <h2>${stats.total_discount_amount}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit Form Modal */}
            {showCreateForm && (
                <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Create New Discount</h5>
                                <button
                                    type="button"
                                    className="close"
                                    onClick={() => {
                                        setShowCreateForm(false);
                                        resetForm();
                                    }}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <form onSubmit={handleCreateDiscount}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Discount Name *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Discount Type</label>
                                                <select
                                                    className="form-control"
                                                    value={formData.discount_type}
                                                    onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                                                >
                                                    <option value="general">General (All Products)</option>
                                                    <option value="quantity">Quantity-based</option>
                                                    <option value="product_specific">Product-specific</option>
                                                    <option value="category">Category</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="row">
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Discount Percentage *</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    min="0"
                                                    max="100"
                                                    step="0.01"
                                                    value={formData.percentage || ''}
                                                    onChange={(e) => setFormData({...formData, percentage: parseFloat(e.target.value) || 0})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Minimum Amount</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.minimum_amount || ''}
                                                    onChange={(e) => setFormData({...formData, minimum_amount: parseFloat(e.target.value) || 0})}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="form-group">
                                                <label>Max Discount Amount</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    min="0"
                                                    step="0.01"
                                                    value={formData.maximum_discount_amount}
                                                    onChange={(e) => setFormData({...formData, maximum_discount_amount: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {formData.discount_type === 'quantity' && (
                                        <div className="form-group">
                                            <label>Minimum Quantity</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                min="1"
                                                value={formData.minimum_quantity}
                                                onChange={(e) => setFormData({...formData, minimum_quantity: parseInt(e.target.value)})}
                                            />
                                        </div>
                                    )}

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Valid From</label>
                                                <input
                                                    type="datetime-local"
                                                    className="form-control"
                                                    value={formData.valid_from}
                                                    onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Valid Until (Optional)</label>
                                                <input
                                                    type="datetime-local"
                                                    className="form-control"
                                                    value={formData.valid_until}
                                                    onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Usage Limit (Optional)</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            min="1"
                                            value={formData.usage_limit}
                                            onChange={(e) => setFormData({...formData, usage_limit: e.target.value})}
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label>Notification Message</label>
                                        <textarea
                                            className="form-control"
                                            rows="3"
                                            value={formData.notification_message}
                                            onChange={(e) => setFormData({...formData, notification_message: e.target.value})}
                                            placeholder="Custom message to show in notifications"
                                        />
                                    </div>

                                    {/* Display Options */}
                                    <div className="form-group">
                                        <label>Display Type</label>
                                        <select
                                            className="form-control"
                                            value={formData.display_type}
                                            onChange={(e) => setFormData({...formData, display_type: e.target.value})}
                                        >
                                            <option value="modal">Modal Popup</option>
                                            <option value="image">Image Banner</option>
                                            <option value="both">Both Modal and Image</option>
                                        </select>
                                    </div>

                                    {/* Image Settings */}
                                    {(formData.display_type === 'image' || formData.display_type === 'both') && (
                                        <>
                                            <div className="form-group">
                                                <label>Discount Image</label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    accept="image/*"
                                                    onChange={(e) => setFormData({...formData, discount_image: e.target.files[0]})}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Image Alt Text</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.image_alt_text}
                                                    onChange={(e) => setFormData({...formData, image_alt_text: e.target.value})}
                                                    placeholder="Alt text for the image"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* Modal Settings */}
                                    {(formData.display_type === 'modal' || formData.display_type === 'both') && (
                                        <>
                                            <div className="form-group">
                                                <label>Modal Title</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.modal_title}
                                                    onChange={(e) => setFormData({...formData, modal_title: e.target.value})}
                                                    placeholder="Modal title (optional)"
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Modal Button Text</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.modal_button_text}
                                                    onChange={(e) => setFormData({...formData, modal_button_text: e.target.value})}
                                                    placeholder="Button text in modal"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="show_in_notifications"
                                            checked={formData.show_in_notifications}
                                            onChange={(e) => setFormData({...formData, show_in_notifications: e.target.checked})}
                                        />
                                        <label className="form-check-label" htmlFor="show_in_notifications">
                                            Show in notifications
                                        </label>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowCreateForm(false);
                                            resetForm();
                                        }}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        Create Discount
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="alert alert-danger" role="alert">
                    {error}
                    <button
                        type="button"
                        className="close"
                        onClick={() => setError(null)}
                    >
                        <span>&times;</span>
                    </button>
                </div>
            )}

            {/* Discounts List */}
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">All Discounts</h5>
                </div>
                <div className="card-body">
                    {discounts.length === 0 ? (
                        <div className="text-center py-4">
                            <i className="fa fa-tag fa-3x text-muted mb-3"></i>
                            <h5>No discounts yet</h5>
                            <p className="text-muted">Create your first discount to get started.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Percentage</th>
                                        <th>Status</th>
                                        <th>Usage</th>
                                        <th>Valid Period</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {discounts.map((discount) => (
                                        <tr key={discount.id}>
                                            <td>
                                                <strong>{discount.name}</strong>
                                                <br />
                                                <small className="text-muted">
                                                    {discount.notification_message || 'No message'}
                                                </small>
                                            </td>
                                            <td>
                                                <span className="badge badge-info">
                                                    {getDiscountTypeLabel(discount.discount_type)}
                                                </span>
                                            </td>
                                            <td>
                                                <strong>{discount.percentage}%</strong>
                                                {discount.minimum_amount > 0 && (
                                                    <>
                                                        <br />
                                                        <small className="text-muted">
                                                            Min: ${discount.minimum_amount}
                                                        </small>
                                                    </>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge badge-${getStatusColor(discount.status)}`}>
                                                    {discount.status}
                                                </span>
                                            </td>
                                            <td>
                                                <small>
                                                    {discount.usage_count} used
                                                    {discount.usage_limit && (
                                                        <>
                                                            <br />
                                                            <span className="text-muted">
                                                                / {discount.usage_limit} limit
                                                            </span>
                                                        </>
                                                    )}
                                                </small>
                                            </td>
                                            <td>
                                                <small>
                                                    From: {formatDate(discount.valid_from)}
                                                    {discount.valid_until && (
                                                        <>
                                                            <br />
                                                            Until: {formatDate(discount.valid_until)}
                                                        </>
                                                    )}
                                                </small>
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => handleToggleStatus(discount.id)}
                                                        title={discount.status === 'active' ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <i className={`fa fa-${discount.status === 'active' ? 'pause' : 'play'}`}></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={() => handleDelete(discount.id)}
                                                        title="Delete"
                                                    >
                                                        <i className="fa fa-trash"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDiscountManager;
