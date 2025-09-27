import React, {useState, useEffect} from 'react';
// TODO: Notification features will be developed in future
// import notificationApi from './api/notificationApi';

const AdminNotificationManager = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingNotification, setEditingNotification] = useState(null);
    const [stats, setStats] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        notification_type: 'general',
        target_type: 'all',
        target_users: [],
        is_active: true,
        show_until: '',
        priority: 1
    });

    useEffect(() => {
        loadNotifications();
        loadStats();
    }, []);

    const loadNotifications = async () => {
        // TODO: Notification features will be developed in future
        // All notification API calls commented out
        setLoading(false);
    };

    const loadStats = async () => {
        // TODO: Notification features will be developed in future
        // All notification API calls commented out
    };

    const handleCreateNotification = async (e) => {
        // TODO: Notification features will be developed in future
        // All notification API calls commented out
        e.preventDefault();
    };

    const handleToggleActive = async (id) => {
        // TODO: Notification features will be developed in future
        // All notification API calls commented out
    };

    const handleDelete = async (id) => {
        // TODO: Notification features will be developed in future
        // All notification API calls commented out
    };

    const resetForm = () => {
        setFormData({
            title: '',
            message: '',
            notification_type: 'general',
            target_type: 'all',
            target_users: [],
            is_active: true,
            show_until: '',
            priority: 1
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

    if(loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2">Loading notifications...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header with Create Button */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-1">Notification Management</h4>
                    <p className="text-muted mb-0">Manage push notifications for all visitors</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateForm(true)}
                >
                    <i className="fa fa-plus mr-2"></i>
                    Create Notification
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="row mb-4">
                    <div className="col-md-3">
                        <div className="card bg-primary text-white">
                            <div className="card-body">
                                <h5>Total Notifications</h5>
                                <h2>{stats.total_notifications}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-success text-white">
                            <div className="card-body">
                                <h5>Active</h5>
                                <h2>{stats.active_notifications}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-info text-white">
                            <div className="card-body">
                                <h5>Total Views</h5>
                                <h2>{stats.total_views}</h2>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-3">
                        <div className="card bg-warning text-white">
                            <div className="card-body">
                                <h5>Unique Views</h5>
                                <h2>{stats.unique_views}</h2>
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
                                <h5 className="modal-title">Create New Notification</h5>
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
                            <form onSubmit={handleCreateNotification}>
                                <div className="modal-body">
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Title *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={formData.title}
                                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Type</label>
                                                <select
                                                    className="form-control"
                                                    value={formData.notification_type}
                                                    onChange={(e) => setFormData({...formData, notification_type: e.target.value})}
                                                >
                                                    <option value="general">General</option>
                                                    <option value="promotion">Promotion</option>
                                                    <option value="announcement">Announcement</option>
                                                    <option value="maintenance">Maintenance</option>
                                                    <option value="custom">Custom</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Message *</label>
                                        <textarea
                                            className="form-control"
                                            rows="4"
                                            value={formData.message}
                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                            required
                                        />
                                    </div>

                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Target</label>
                                                <select
                                                    className="form-control"
                                                    value={formData.target_type}
                                                    onChange={(e) => setFormData({...formData, target_type: e.target.value})}
                                                >
                                                    <option value="all">All Visitors</option>
                                                    <option value="users">Registered Users Only</option>
                                                    <option value="specific">Specific Users</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label>Priority</label>
                                                <select
                                                    className="form-control"
                                                    value={formData.priority}
                                                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                                                >
                                                    <option value="1">Low</option>
                                                    <option value="2">Medium</option>
                                                    <option value="3">High</option>
                                                    <option value="4">Critical</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Show Until (Optional)</label>
                                        <input
                                            type="datetime-local"
                                            className="form-control"
                                            value={formData.show_until}
                                            onChange={(e) => setFormData({...formData, show_until: e.target.value})}
                                        />
                                    </div>

                                    <div className="form-check">
                                        <input
                                            type="checkbox"
                                            className="form-check-input"
                                            id="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                        />
                                        <label className="form-check-label" htmlFor="is_active">
                                            Active (show to visitors)
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
                                        Create Notification
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

            {/* Notifications List */}
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">All Notifications</h5>
                </div>
                <div className="card-body">
                    {notifications.length === 0 ? (
                        <div className="text-center py-4">
                            <i className="fa fa-bell fa-3x text-muted mb-3"></i>
                            <h5>No notifications yet</h5>
                            <p className="text-muted">Create your first notification to get started.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>Target</th>
                                        <th>Status</th>
                                        <th>Views</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {notifications.map((notification) => (
                                        <tr key={notification.id}>
                                            <td>
                                                <strong>{notification.title}</strong>
                                                <br />
                                                <small className="text-muted">
                                                    {notification.message.length > 50
                                                        ? notification.message.substring(0, 50) + '...'
                                                        : notification.message
                                                    }
                                                </small>
                                            </td>
                                            <td>
                                                <span className={`badge badge-${getTypeColor(notification.notification_type)}`}>
                                                    {notification.notification_type}
                                                </span>
                                            </td>
                                            <td>{notification.target_type}</td>
                                            <td>
                                                <span className={`badge badge-${notification.is_active ? 'success' : 'secondary'}`}>
                                                    {notification.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <small>
                                                    {notification.total_views} total<br />
                                                    {notification.unique_views} unique
                                                </small>
                                            </td>
                                            <td>
                                                <small>{formatDate(notification.created_at)}</small>
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-outline-primary"
                                                        onClick={() => handleToggleActive(notification.id)}
                                                        title={notification.is_active ? 'Deactivate' : 'Activate'}
                                                    >
                                                        <i className={`fa fa-${notification.is_active ? 'pause' : 'play'}`}></i>
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger"
                                                        onClick={() => handleDelete(notification.id)}
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

const getTypeColor = (type) => {
    const colors = {
        'general': 'secondary',
        'promotion': 'success',
        'announcement': 'info',
        'maintenance': 'warning',
        'custom': 'primary'
    };
    return colors[type] || 'secondary';
};

export default AdminNotificationManager;
