import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Toast from '../../components/Toast';

const ForgotPassword = () => {
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const showToast = (message, type = 'success') => {
        setToast({
            show: true,
            message,
            type
        });
    };

    const hideToast = () => {
        setToast({
            show: false,
            message: '',
            type: 'success'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email) {
            showToast('Please enter your email address', 'error');
            return;
        }
        
        if (!/\S+@\S+\.\S+/.test(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }
        
        try {
            setIsLoading(true);
            
            const response = await fetch('http://localhost:8000/api/accounts/forgot-password/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showToast(data.message, 'success');
                setEmail('');
            } else {
                showToast(data.message, 'error');
            }
            
        } catch (err) {
            showToast('Something went wrong. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Toast
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
                duration={3000}
            />
            <section className="section-content padding-y" style={{minHeight: '84vh'}}>
                <div className="card mx-auto" style={{maxWidth: '380px', marginTop: '100px'}}>
                    <div className="card-body">
                        <h4 className="card-title mb-4">Forgot Password?</h4>
                        <p className="text-muted mb-4">
                            Don't worry! Enter your email address and we'll send you instructions to reset your password.
                        </p>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <i className="fa fa-spinner fa-spin mr-2"></i>
                                            Sending Instructions...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-paper-plane mr-2"></i>
                                            Send Reset Instructions
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                        <div className="text-center mt-3">
                            <p className="text-muted">
                                Remember your password?{' '}
                                <Link to="/signin" className="text-primary">
                                    <i className="fa fa-arrow-left mr-1"></i>
                                    Back to Login
                                </Link>
                            </p>
                        </div>
                        <div className="text-center mt-3">
                            <small className="text-muted">
                                <i className="fa fa-info-circle mr-1"></i>
                                If you don't receive an email within a few minutes, check your spam folder.
                            </small>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ForgotPassword;
