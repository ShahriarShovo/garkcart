import React, {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import Toast from '../../components/Toast';
import API_CONFIG from '../../config/apiConfig';

const EmailVerification = () => {
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });
    const [isResending, setIsResending] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [userEmail, setUserEmail] = useState('');
    const {user} = useAuth();
    const navigate = useNavigate();

    // Get user email from URL parameters first, then localStorage
    React.useEffect(() => {
        // Check URL parameters first (most recent registration)
        const urlParams = new URLSearchParams(window.location.search);
        const emailFromUrl = urlParams.get('email');

        if (emailFromUrl) {
            // Use email from URL (most recent registration)
            setUserEmail(emailFromUrl);

            // Clear old localStorage data to prevent conflicts
            localStorage.removeItem('user');

        } else {
            // Fallback to localStorage if no URL parameter
            const savedUser = localStorage.getItem('user');

            if (savedUser) {
                try {
                    const userData = JSON.parse(savedUser);

                    setUserEmail(userData.email || '');

                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }
        }
    }, []);

    useEffect(() => {
        // Start countdown for resend button
        if(countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

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

    const handleResendEmail = async () => {
        setIsResending(true);
        
        try {
            const emailToSend = userEmail || user?.email;

            // Use the original email as entered by user during registration

            const response = await fetch(API_CONFIG.getFullUrl('AUTH', 'RESEND_VERIFICATION'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: emailToSend
                }),
            });

            if (response.ok) {
                const data = await response.json();
                showToast(data.message || 'Verification email sent successfully!', 'success');
                setCountdown(60); // 60 seconds cooldown
            } else {
                const errorData = await response.json();
                showToast(errorData.message || 'Failed to send verification email. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Resend verification error:', error);
            showToast('Failed to send verification email. Please try again.', 'error');
        } finally {
            setIsResending(false);
        }
    };

    const handleContinue = () => {
        navigate('/');
    };

    return (
        <>
            <Toast 
                show={toast.show}
                message={toast.message}
                type={toast.type}
                onClose={hideToast}
                duration={4000}
            />
            <section className="section-content padding-y" style={{minHeight: '84vh'}}>
                <div className="card mx-auto" style={{maxWidth: '500px', marginTop: '60px'}}>
                    <div className="card-body text-center">
                        {/* Success Icon */}
                        <div className="mb-4">
                            <i className="fa fa-envelope-open text-success email-verification-icon" style={{fontSize: '64px'}}></i>
                        </div>

                        {/* Main Message */}
                        <h3 className="card-title mb-3">Check Your Email</h3>
                        <p className="text-muted mb-4">
                            We've sent a verification link to your email address:
                        </p>
                        
                        {/* User Email */}
                        <div className="alert alert-info mb-4">
                            <i className="fa fa-envelope mr-2"></i>
                            <strong>
                                {userEmail || user?.email || 'your-email@example.com'}
                            </strong>
                            {!userEmail && !user?.email && (
                                <div className="mt-2">
                                    <small className="text-muted">
                                        <i className="fa fa-info-circle mr-1"></i>
                                        Email address not found. Please check your registration.
                                    </small>
                                </div>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className="text-left mb-4">
                            <h6 className="mb-3">Next Steps:</h6>
                            <ol className="text-muted verification-steps">
                                <li className="mb-2">Check your email inbox (and spam folder)</li>
                                <li className="mb-2">Click the verification link in the email</li>
                                <li className="mb-2">Return to this page after verification</li>
                                <li>Your account will be fully activated</li>
                            </ol>
                        </div>

                        {/* Resend Email Button */}
                        <div className="mb-4">
                            <p className="text-muted mb-3">Didn't receive the email?</p>
                            <div className="d-flex justify-content-center">
                                <button
                                    className={`btn resend-button ${countdown > 0 ? 'btn-outline-secondary' : 'btn-outline-primary'}`}
                                    onClick={handleResendEmail}
                                    disabled={isResending || countdown > 0}
                                >
                                    {isResending ? (
                                        <>
                                            <i className="fa fa-spinner fa-spin mr-2"></i>
                                            Sending...
                                        </>
                                    ) : countdown > 0 ? (
                                        <span className="countdown-text">Resend in {countdown}s</span>
                                    ) : (
                                        <>
                                            <i className="fa fa-paper-plane mr-2"></i>
                                            Resend Verification Email
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Continue Button */}
                        <div className="mb-3">
                            <button
                                className="btn btn-primary"
                                onClick={handleContinue}
                            >
                                <i className="fa fa-home mr-2"></i>
                                Continue to Homepage
                            </button>
                        </div>

                        {/* Help Text */}
                        <div className="text-muted">
                            <small>
                                Having trouble? <Link to="/contact">Contact Support</Link>
                            </small>
                        </div>
                    </div>
                </div>

                {/* Additional Info Card */}
                <div className="card mx-auto mt-4" style={{maxWidth: '500px'}}>
                    <div className="card-body">
                        <h6 className="card-title">
                            <i className="fa fa-info-circle text-info mr-2"></i>
                            Why verify your email?
                        </h6>
                        <ul className="text-muted mb-0">
                            <li>Secure your account and prevent unauthorized access</li>
                            <li>Receive important updates about your orders</li>
                            <li>Reset your password if needed</li>
                            <li>Get exclusive offers and promotions</li>
                        </ul>
                    </div>
                </div>
            </section>
        </>
    );
};

export default EmailVerification;
