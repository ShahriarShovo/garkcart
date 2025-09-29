import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import API_CONFIG from '../../config/apiConfig';

const EmailVerifiedSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [verificationStatus, setVerificationStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            // Add delay to prevent race condition
            const timeoutId = setTimeout(() => {
                verifyEmailToken(token);
            }, 100);
            
            return () => clearTimeout(timeoutId);
        } else {
            setVerificationStatus('no-token');
            setMessage('No verification token found.');
        }
    }, [searchParams]);

    const verifyEmailToken = async (token) => {
        try {
            console.log('🔍 DEBUG: Verifying email token:', token);
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/accounts/verify-email/${token}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('🔍 DEBUG: Verification response status:', response.status);
            console.log('🔍 DEBUG: Verification response ok:', response.ok);

            if (response.ok) {
                const data = await response.json();
                console.log('🔍 DEBUG: Verification success data:', data);
                
                if (data.already_verified) {
                    setVerificationStatus('success');
                    setMessage('Email is already verified! You can now log in to your account.');
                } else {
                    setVerificationStatus('success');
                    setMessage('Email verified successfully! You can now log in to your account.');
                }
            } else {
                const errorData = await response.json();
                console.log('🔍 DEBUG: Verification error data:', errorData);
                setVerificationStatus('error');
                setMessage(errorData.message || 'Email verification failed.');
            }
        } catch (error) {
            console.error('🔍 DEBUG: Email verification error:', error);
            setVerificationStatus('error');
            setMessage('Email verification failed. Please try again.');
        }
    };

    const handleLogin = () => {
        navigate('/signin');
    };

    return (
        <>
            <section className="section-content padding-y" style={{minHeight: '84vh'}}>
                <div className="card mx-auto" style={{maxWidth: '500px', marginTop: '60px'}}>
                    <div className="card-body text-center">
                        {/* Dynamic Icon */}
                        <div className="mb-4">
                            {verificationStatus === 'verifying' && (
                                <i className="fa fa-spinner fa-spin text-primary" style={{fontSize: '64px'}}></i>
                            )}
                            {verificationStatus === 'success' && (
                                <i className="fa fa-check-circle text-success" style={{fontSize: '64px'}}></i>
                            )}
                            {verificationStatus === 'error' && (
                                <i className="fa fa-times-circle text-danger" style={{fontSize: '64px'}}></i>
                            )}
                            {verificationStatus === 'no-token' && (
                                <i className="fa fa-exclamation-triangle text-warning" style={{fontSize: '64px'}}></i>
                            )}
                        </div>

                        {/* Dynamic Message */}
                        <h3 className={`card-title mb-3 ${
                            verificationStatus === 'success' ? 'text-success' : 
                            verificationStatus === 'error' ? 'text-danger' : 
                            verificationStatus === 'no-token' ? 'text-warning' : 'text-primary'
                        }`}>
                            {verificationStatus === 'verifying' && 'Verifying Email...'}
                            {verificationStatus === 'success' && 'Email Verified Successfully!'}
                            {verificationStatus === 'error' && 'Verification Failed'}
                            {verificationStatus === 'no-token' && 'Invalid Link'}
                        </h3>
                        
                        <p className="text-muted mb-4">
                            {message}
                        </p>

                        {/* Login Button - only show on success */}
                        {verificationStatus === 'success' && (
                            <div className="mb-4">
                                <button
                                    className="btn btn-primary btn-lg"
                                    onClick={handleLogin}
                                >
                                    <i className="fa fa-sign-in mr-2"></i>
                                    Go to Login
                                </button>
                            </div>
                        )}

                        {/* Retry Button - only show on error */}
                        {verificationStatus === 'error' && (
                            <div className="mb-4">
                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => window.location.reload()}
                                >
                                    <i className="fa fa-refresh mr-2"></i>
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Additional Info */}
                        <div className="text-muted">
                            <small>
                                {verificationStatus === 'success' && 'You can now access all features of your account.'}
                                {verificationStatus === 'error' && 'Please check your email for the correct verification link.'}
                                {verificationStatus === 'no-token' && 'Please use the verification link sent to your email.'}
                            </small>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default EmailVerifiedSuccess;
