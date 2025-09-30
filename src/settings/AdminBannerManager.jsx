import React, {useState, useEffect} from 'react';
import bannerApi from './api/bannerApi';

const AdminBannerManager = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const [stats, setStats] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        banner_image: null,
        is_active: true,
        display_order: 0
    });

    

    // Load banners and stats
    const loadBanners = async () => {
        try {
            setLoading(true);
            const [bannersData, statsData] = await Promise.all([
                bannerApi.getAllBanners(),
                bannerApi.getBannerStats()
            ]);
            setBanners(bannersData);
            setStats(statsData);
        } catch(error) {
            setError('Failed to load banners: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBanners();
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            banner_image: null,
            is_active: true,
            display_order: 0
        });
        setEditingBanner(null);
        setShowForm(false);
        
    };

    const handleInputChange = (e) => {
        const {name, value, type, files, checked} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'file' ? files[0] : (type === 'checkbox' ? checked : value)
        }));
    };

    

    const handleCreateBanner = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            if(!formData.banner_image) {
                setError('Please select a banner image');
                return;
            }

            await bannerApi.createBanner(formData);
            setSuccess('Banner created successfully!');
            resetForm();
            loadBanners();
        } catch(error) {
            setError('Failed to create banner: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBanner = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            await bannerApi.updateBanner(editingBanner.id, formData);
            setSuccess('Banner updated successfully!');
            resetForm();
            loadBanners();
        } catch(error) {
            setError('Failed to update banner: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Inline confirm: double-click within 4s to confirm
    const [pendingConfirm, setPendingConfirm] = useState(null);
    const [pendingConfirmUntil, setPendingConfirmUntil] = useState(0);
    const requestConfirm = (key, message) => {
        const now = Date.now();
        if (pendingConfirm === key && now < pendingConfirmUntil) {
            setPendingConfirm(null);
            return true;
        }
        setPendingConfirm(key);
        setPendingConfirmUntil(now + 4000);
        setError(null);
        setSuccess(message || 'Tap delete again to confirm');
        setTimeout(() => setSuccess(null), 2500);
        return false;
    };

    const handleDeleteBanner = async (bannerId) => {
        if (!requestConfirm(`delete-banner-${bannerId}`, 'Tap delete again to confirm')) {
            return;
        }

        try {
            setLoading(true);
            await bannerApi.deleteBanner(bannerId);
            setSuccess('Banner deleted successfully!');
            loadBanners();
        } catch(error) {
            setError('Failed to delete banner: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleActivateBanner = async (bannerId) => {
        try {
            setLoading(true);
            await bannerApi.activateBanner(bannerId);
            setSuccess('Banner activated successfully!');
            loadBanners();
        } catch(error) {
            setError('Failed to activate banner: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivateBanner = async (bannerId) => {
        try {
            setLoading(true);
            await bannerApi.deactivateBanner(bannerId);
            setSuccess('Banner deactivated successfully!');
            loadBanners();
        } catch(error) {
            setError('Failed to deactivate banner: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditBanner = (banner) => {
        setEditingBanner(banner);
        setFormData({
            name: banner.name,
            banner_image: null, // Don't pre-fill file input
            is_active: banner.is_active,
            display_order: banner.display_order
        });
        setShowForm(true);
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">Banner Management</h4>
                            <div>
                                <button
                                    className="btn btn-primary mr-2"
                                    onClick={() => setShowForm(true)}
                                >
                                    <i className="fa fa-plus mr-2"></i>Upload Banner
                                </button>
                                <button
                                    className="btn btn-info"
                                    onClick={loadBanners}
                                >
                                    <i className="fa fa-refresh mr-2"></i>Refresh
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            {error && (
                                <div className="alert alert-danger">
                                    <i className="fa fa-exclamation-circle mr-2"></i>
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success">
                                    <i className="fa fa-check-circle mr-2"></i>
                                    {success}
                                </div>
                            )}

                            {/* Stats */}
                            {stats && (
                                <div className="row mb-4">
                                    <div className="col-md-3">
                                        <div className="card bg-primary text-white">
                                            <div className="card-body text-center">
                                                <h5>{stats.total_banners}</h5>
                                                <small>Total Banners</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card bg-success text-white">
                                            <div className="card-body text-center">
                                                <h5>{stats.active_banners}</h5>
                                                <small>Active Banners</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card bg-warning text-white">
                                            <div className="card-body text-center">
                                                <h5>{stats.inactive_banners}</h5>
                                                <small>Inactive Banners</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Multiple Upload Form removed */}

                            {/* Single Banner Form */}
                            {showForm && (
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <h5>{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h5>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={editingBanner ? handleUpdateBanner : handleCreateBanner}>
                                            <div className="form-group">
                                                <label>Banner Name</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleInputChange}
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>Banner Image</label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    name="banner_image"
                                                    onChange={handleInputChange}
                                                    accept="image/*"
                                                    required={!editingBanner}
                                                />
                                                <small className="form-text text-muted">
                                                    {editingBanner ? 'Leave empty to keep current image' : 'Select a banner image file (will be auto-resized to 1200x400)'}
                                                </small>
                                            </div>

                                            <div className="form-group">
                                                <label>Display Order</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    name="display_order"
                                                    value={formData.display_order}
                                                    onChange={handleInputChange}
                                                    min="0"
                                                />
                                                <small className="form-text text-muted">
                                                    Lower numbers appear first (0 = highest priority)
                                                </small>
                                            </div>

                                            <div className="form-group">
                                                <div className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        name="is_active"
                                                        checked={formData.is_active}
                                                        onChange={handleInputChange}
                                                    />
                                                    <label className="form-check-label">
                                                        Set as active banner
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary mr-2"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Saving...' : (editingBanner ? 'Update Banner' : 'Create Banner')}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-secondary"
                                                    onClick={resetForm}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}

                            {/* Banners List */}
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Preview</th>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Order</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="text-center">
                                                    <i className="fa fa-spinner fa-spin mr-2"></i>
                                                    Loading...
                                                </td>
                                            </tr>
                                        ) : banners.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="text-center text-muted">
                                                    No banners found
                                                </td>
                                            </tr>
                                        ) : (
                                            banners.map(banner => (
                                                <tr key={banner.id}>
                                                    <td>
                                                        {banner.banner_url ? (
                                                            <img
                                                                src={banner.banner_url}
                                                                alt={banner.name}
                                                                style={{width: '100px', height: '40px', objectFit: 'cover', borderRadius: '4px'}}
                                                            />
                                                        ) : (
                                                            <span className="text-muted">No image</span>
                                                        )}
                                                    </td>
                                                    <td>{banner.name}</td>
                                                    <td>
                                                        <span className={`badge ${banner.is_active ? 'badge-success' : 'badge-secondary'}`}>
                                                            {banner.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td>{banner.display_order}</td>
                                                    <td>{new Date(banner.created_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="btn-group">
                                                            {!banner.is_active ? (
                                                                <button
                                                                    className="btn btn-sm btn-success"
                                                                    onClick={() => handleActivateBanner(banner.id)}
                                                                    disabled={loading}
                                                                    title="Activate"
                                                                >
                                                                    <i className="fa fa-check"></i>
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-sm btn-warning"
                                                                    onClick={() => handleDeactivateBanner(banner.id)}
                                                                    disabled={loading}
                                                                    title="Deactivate"
                                                                >
                                                                    <i className="fa fa-pause"></i>
                                                                </button>
                                                            )}
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => handleEditBanner(banner)}
                                                                title="Edit"
                                                            >
                                                                <i className="fa fa-edit"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleDeleteBanner(banner.id)}
                                                                disabled={loading}
                                                                title="Delete"
                                                            >
                                                                <i className="fa fa-trash"></i>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminBannerManager;
