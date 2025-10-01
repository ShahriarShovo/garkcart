import React, { useState } from 'react';
import permissionApi from './api/permissionApi';

const DynamicPermissionTest = () => {
    const [testPermission, setTestPermission] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const testPermissionCheck = async () => {
        if (!testPermission.trim()) {
            showToast('Please enter a permission codename', 'error');
            return;
        }
        
        setLoading(true);
        try {
            const data = await permissionApi.checkPermission(testPermission);
            setTestResult({
                permission: testPermission,
                hasPermission: data.has_permission,
                timestamp: new Date().toLocaleString(),
                details: data
            });
            showToast('Permission test completed', 'success');
        } catch (error) {
            setTestResult({
                permission: testPermission,
                hasPermission: false,
                error: error.message,
                timestamp: new Date().toLocaleString()
            });
            showToast(`Test failed: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    const createTestPermission = async () => {
        if (!testPermission.trim()) {
            showToast('Please enter a permission codename', 'error');
            return;
        }
        
        setLoading(true);
        try {
            const permissionData = {
                name: `Test Permission ${testPermission}`,
                codename: testPermission,
                description: `Test permission for ${testPermission}`,
                category: 'test'
            };
            
            const data = await permissionApi.createPermission(permissionData);
            showToast('Test permission created successfully', 'success');
            setTestResult({
                permission: testPermission,
                created: true,
                timestamp: new Date().toLocaleString(),
                details: data
            });
        } catch (error) {
            showToast(`Failed to create permission: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card">
            <div className="card-header">
                <h5 className="mb-0">
                    <i className="fa fa-flask mr-2"></i>
                    Dynamic Permission Test
                </h5>
            </div>
            <div className="card-body">
                {toast.show && (
                    <div className={`alert alert-${toast.type === 'error' ? 'danger' : toast.type} alert-dismissible fade show`}>
                        {toast.message}
                        <button type="button" className="close" onClick={() => setToast({ show: false, message: '', type: 'success' })}>
                            <span>&times;</span>
                        </button>
                    </div>
                )}

                <div className="row">
                    <div className="col-md-8">
                        <div className="form-group">
                            <label htmlFor="testPermission">Permission Codename</label>
                            <input
                                type="text"
                                className="form-control"
                                id="testPermission"
                                placeholder="e.g., custom_feature_access, inventory_management, etc."
                                value={testPermission}
                                onChange={(e) => setTestPermission(e.target.value)}
                            />
                            <small className="form-text text-muted">
                                Enter any permission codename to test or create
                            </small>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="form-group">
                            <label>&nbsp;</label>
                            <div className="btn-group-vertical d-block">
                                <button 
                                    className="btn btn-primary btn-block mb-2"
                                    onClick={testPermissionCheck}
                                    disabled={loading || !testPermission.trim()}
                                >
                                    {loading ? (
                                        <i className="fa fa-spinner fa-spin mr-2"></i>
                                    ) : (
                                        <i className="fa fa-search mr-2"></i>
                                    )}
                                    Test Permission
                                </button>
                                <button 
                                    className="btn btn-success btn-block"
                                    onClick={createTestPermission}
                                    disabled={loading || !testPermission.trim()}
                                >
                                    {loading ? (
                                        <i className="fa fa-spinner fa-spin mr-2"></i>
                                    ) : (
                                        <i className="fa fa-plus mr-2"></i>
                                    )}
                                    Create Permission
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {testResult && (
                    <div className="mt-4">
                        <h6>Test Results:</h6>
                        <div className={`alert ${testResult.hasPermission ? 'alert-success' : 'alert-danger'}`}>
                            <div className="row">
                                <div className="col-md-6">
                                    <strong>Permission:</strong> {testResult.permission}<br />
                                    <strong>Has Permission:</strong> {testResult.hasPermission ? 'Yes' : 'No'}<br />
                                    <strong>Tested at:</strong> {testResult.timestamp}
                                </div>
                                <div className="col-md-6">
                                    {testResult.error && (
                                        <>
                                            <strong>Error:</strong> {testResult.error}<br />
                                        </>
                                    )}
                                    {testResult.created && (
                                        <>
                                            <strong>Status:</strong> Permission Created<br />
                                        </>
                                    )}
                                    {testResult.details && (
                                        <>
                                            <strong>Details:</strong><br />
                                            <small>
                                                {JSON.stringify(testResult.details, null, 2)}
                                            </small>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-4">
                    <h6>Example Permission Codenames:</h6>
                    <div className="row">
                        <div className="col-md-6">
                            <ul className="list-unstyled">
                                <li><code>inventory_management</code></li>
                                <li><code>customer_support</code></li>
                                <li><code>financial_reports</code></li>
                                <li><code>product_editing</code></li>
                            </ul>
                        </div>
                        <div className="col-md-6">
                            <ul className="list-unstyled">
                                <li><code>order_processing</code></li>
                                <li><code>user_management</code></li>
                                <li><code>analytics_access</code></li>
                                <li><code>custom_feature</code></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DynamicPermissionTest;
