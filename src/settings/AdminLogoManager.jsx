import React, {useState, useEffect} from 'react';
import logoApi from './api/logoApi';

const AdminLogoManager = () => {
    const [logos, setLogos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingLogo, setEditingLogo] = useState(null);
    const [stats, setStats] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        logo_image: null,
        is_active: false
    });

    // Load logos and stats
    const loadLogos = async () => {
        try {
            setLoading(true);
            const [logosData, statsData] = await Promise.all([
                logoApi.getAllLogos(),
                logoApi.getLogoStats()
            ]);
            setLogos(logosData);
            setStats(statsData);
        } catch(error) {
            setError('Failed to load logos: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadLogos();
    }, []);

    const resetForm = () => {
        setFormData({
            name: '',
            logo_image: null,
            is_active: false
        });
        setEditingLogo(null);
        setShowForm(false);
    };

    const handleInputChange = (e) => {
        const {name, value, type, files} = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'file' ? files[0] : value
        }));
    };

    const handleCreateLogo = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            if(!formData.logo_image) {
                setError('Please select a logo image');
                return;
            }

            await logoApi.createLogo(formData);
            setSuccess('Logo created successfully!');
            resetForm();
            loadLogos();
        } catch(error) {
            setError('Failed to create logo: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateLogo = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            await logoApi.updateLogo(editingLogo.id, formData);
            setSuccess('Logo updated successfully!');
            resetForm();
            loadLogos();
        } catch(error) {
            setError('Failed to update logo: ' + error.message);
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

    const handleDeleteLogo = async (logoId) => {
        if (!requestConfirm(`delete-logo-${logoId}`, 'Tap delete again to confirm')) {
            return;
        }

        try {
            setLoading(true);
            await logoApi.deleteLogo(logoId);
            setSuccess('Logo deleted successfully!');
            loadLogos();
        } catch(error) {
            setError('Failed to delete logo: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleActivateLogo = async (logoId) => {
        try {
            setLoading(true);
            await logoApi.activateLogo(logoId);
            setSuccess('Logo activated successfully!');
            loadLogos();
        } catch(error) {
            setError('Failed to activate logo: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditLogo = (logo) => {
        setEditingLogo(logo);
        setFormData({
            name: logo.name,
            logo_image: null, // Don't pre-fill file input
            is_active: logo.is_active
        });
        setShowForm(true);
    };

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">Logo Management</h4>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowForm(true)}
                            >
                                <i className="fa fa-plus mr-2"></i>Add New Logo
                            </button>
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
                                                <h5>{stats.total_logos}</h5>
                                                <small>Total Logos</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card bg-success text-white">
                                            <div className="card-body text-center">
                                                <h5>{stats.active_logos}</h5>
                                                <small>Active Logos</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="card bg-warning text-white">
                                            <div className="card-body text-center">
                                                <h5>{stats.inactive_logos}</h5>
                                                <small>Inactive Logos</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Logo Form */}
                            {showForm && (
                                <div className="card mb-4">
                                    <div className="card-header">
                                        <h5>{editingLogo ? 'Edit Logo' : 'Add New Logo'}</h5>
                                    </div>
                                    <div className="card-body">
                                        <form onSubmit={editingLogo ? handleUpdateLogo : handleCreateLogo}>
                                            <div className="form-group">
                                                <label>Logo Name</label>
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
                                                <label>Logo Image</label>
                                                <input
                                                    type="file"
                                                    className="form-control"
                                                    name="logo_image"
                                                    onChange={handleInputChange}
                                                    accept="image/*"
                                                    required={!editingLogo}
                                                />
                                                <small className="form-text text-muted">
                                                    {editingLogo ? 'Leave empty to keep current image' : 'Select a logo image file'}
                                                </small>
                                            </div>

                                            <div className="form-group">
                                                <div className="form-check">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input"
                                                        name="is_active"
                                                        checked={formData.is_active}
                                                        onChange={(e) => setFormData(prev => ({
                                                            ...prev,
                                                            is_active: e.target.checked
                                                        }))}
                                                    />
                                                    <label className="form-check-label">
                                                        Set as active logo
                                                    </label>
                                                </div>
                                            </div>

                                            <div className="form-group">
                                                <button
                                                    type="submit"
                                                    className="btn btn-primary mr-2"
                                                    disabled={loading}
                                                >
                                                    {loading ? 'Saving...' : (editingLogo ? 'Update Logo' : 'Create Logo')}
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

                            {/* Logos List */}
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th>Logo</th>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Created</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="5" className="text-center">
                                                    <i className="fa fa-spinner fa-spin mr-2"></i>
                                                    Loading...
                                                </td>
                                            </tr>
                                        ) : logos.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center text-muted">
                                                    No logos found
                                                </td>
                                            </tr>
                                        ) : (
                                            logos.map(logo => (
                                                <tr key={logo.id}>
                                                    <td>
                                                        {logo.logo_url ? (
                                                            <img
                                                                src={logo.logo_url}
                                                                alt={logo.name}
                                                                style={{width: '50px', height: '30px', objectFit: 'contain'}}
                                                            />
                                                        ) : (
                                                            <span className="text-muted">No image</span>
                                                        )}
                                                    </td>
                                                    <td>{logo.name}</td>
                                                    <td>
                                                        <span className={`badge ${logo.is_active ? 'badge-success' : 'badge-secondary'}`}>
                                                            {logo.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(logo.created_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="btn-group">
                                                            {!logo.is_active && (
                                                                <button
                                                                    className="btn btn-sm btn-success"
                                                                    onClick={() => handleActivateLogo(logo.id)}
                                                                    disabled={loading}
                                                                    title="Activate"
                                                                >
                                                                    <i className="fa fa-check"></i>
                                                                </button>
                                                            )}
                                                            <button
                                                                className="btn btn-sm btn-primary"
                                                                onClick={() => handleEditLogo(logo)}
                                                                title="Edit"
                                                            >
                                                                <i className="fa fa-edit"></i>
                                                            </button>
                                                            <button
                                                                className="btn btn-sm btn-danger"
                                                                onClick={() => handleDeleteLogo(logo.id)}
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

export default AdminLogoManager;
