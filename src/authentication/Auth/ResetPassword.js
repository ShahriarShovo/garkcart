import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isValidating, setIsValidating] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });

    const token = searchParams.get('token');

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

    const validatePassword = (password) => {
        const validation = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
        setPasswordValidation(validation);
        return validation;
    };

    // Validate token on component mount
    useEffect(() => {
        const validateToken = async () => {
            if (!token) {
                showToast('Invalid reset link. Please request a new one.', 'error');
                setIsValidating(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:8000/api/accounts/reset-password/${token}/`);
                const data = await response.json();

                if (data.success) {
                    setIsValidToken(true);
                    setUserEmail(data.user_email);
                } else {
                    showToast(data.message, 'error');
                    setIsValidToken(false);
                }
            } catch (err) {
                showToast('Error validating reset link. Please try again.', 'error');
                setIsValidToken(false);
            } finally {
                setIsValidating(false);
            }
        };

        validateToken();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirmPassword) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('Password must be at least 6 characters long', 'error');
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch(`http://localhost:8000/api/accounts/reset-password/${token}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    password,
                    confirm_password: confirmPassword
                })
            });

            const data = await response.json();

            if (data.success) {
                showToast(data.message, 'success');
                setTimeout(() => {
                    navigate('/signin');
                }, 2000);
            } else {
                showToast(data.message, 'error');
            }

        } catch (err) {
            showToast('Something went wrong. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (isValidating) {
        return (
            <section className="section-content padding-y" style={{minHeight: '84vh'}}>
                <div className="card mx-auto" style={{maxWidth: '380px', marginTop: '100px'}}>
                    <div className="card-body text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="sr-only">Loading...</span>
                        </div>
                        <p className="mt-3">Validating reset link...</p>
                    </div>
                </div>
            </section>
        );
    }

    if (!isValidToken) {
        return (
            <section className="section-content padding-y" style={{minHeight: '84vh'}}>
                <div className="card mx-auto" style={{maxWidth: '380px', marginTop: '100px'}}>
                    <div className="card-body text-center">
                        <div className="alert alert-danger">
                            <i className="fa fa-exclamation-triangle mr-2"></i>
                            Invalid or expired reset link
                        </div>
                        <p className="text-muted">
                            This reset link is invalid or has expired. Please request a new one.
                        </p>
                        <Link to="/forgot-password" className="btn btn-primary">
                            <i className="fa fa-key mr-2"></i>
                            Request New Reset Link
                        </Link>
                    </div>
                </div>
            </section>
        );
    }

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
                        <h4 className="card-title mb-4">Reset Password</h4>
                        <p className="text-muted mb-4">
                            Enter your new password for <strong>{userEmail}</strong>
                        </p>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>New Password</label>
                                <div className="input-group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Enter new password"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            validatePassword(e.target.value);
                                        }}
                                        disabled={isLoading}
                                        required
                                    />
                                    <div className="input-group-append">
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <div className="input-group">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                    <div className="input-group-append">
                                        <button
                                            className="btn btn-outline-secondary"
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            <i className={`fa ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Password Requirements */}
                            {password && (
                                <div className="form-group">
                                    <small className="text-muted">Password Requirements:</small>
                                    <div className="mt-2">
                                        <div className={`d-flex align-items-center mb-1 ${passwordValidation.length ? 'text-success' : 'text-danger'}`}>
                                            <i className={`fa ${passwordValidation.length ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                                            <small>At least 8 characters</small>
                                        </div>
                                        <div className={`d-flex align-items-center mb-1 ${passwordValidation.uppercase ? 'text-success' : 'text-danger'}`}>
                                            <i className={`fa ${passwordValidation.uppercase ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                                            <small>At least one uppercase letter (A-Z)</small>
                                        </div>
                                        <div className={`d-flex align-items-center mb-1 ${passwordValidation.lowercase ? 'text-success' : 'text-danger'}`}>
                                            <i className={`fa ${passwordValidation.lowercase ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                                            <small>At least one lowercase letter (a-z)</small>
                                        </div>
                                        <div className={`d-flex align-items-center mb-1 ${passwordValidation.number ? 'text-success' : 'text-danger'}`}>
                                            <i className={`fa ${passwordValidation.number ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                                            <small>At least one number (0-9)</small>
                                        </div>
                                        <div className={`d-flex align-items-center mb-1 ${passwordValidation.special ? 'text-success' : 'text-danger'}`}>
                                            <i className={`fa ${passwordValidation.special ? 'fa-check-circle' : 'fa-times-circle'} mr-2`}></i>
                                            <small>At least one special character (!@#$%^&*)</small>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <i className="fa fa-spinner fa-spin mr-2"></i>
                                            Resetting Password...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-key mr-2"></i>
                                            Reset Password
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
                    </div>
                </div>
            </section>
        </>
    );
};

export default ResetPassword;
