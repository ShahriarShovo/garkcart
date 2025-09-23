import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import Toast from '../../components/Toast';

const SignIn = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [toast, setToast] = useState({
        show: false,
        message: '',
        type: 'success'
    });
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

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

        const userData = {
            email: formData.email,
            password: formData.password
        };

        const result = await login(userData);
        if(result.success) {
            // Determine admin based on flags
            const isAdmin = !!(result.user?.is_superuser || result.user?.is_staff || result.user?.is_admin || result.user?.user_type === 'admin');
            const successMessage = isAdmin
                ? 'Admin login successful! Welcome to admin panel!'
                : 'Login successful! Welcome back!';

            showToast(successMessage, 'success');
            setTimeout(() => {
                // Navigate based on role
                if(isAdmin) {
                    navigate('/admin/dashboard');
                } else {
                    navigate('/');
                }
            }, 1500);
        } else {
            showToast(result.message || 'Login failed. Please check your credentials.', 'error');
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
                        <h4 className="card-title mb-4">Sign in</h4>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Email Address"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <div className="input-group">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
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
                                <Link to="#" className="float-right">Forgot password?</Link>
                            </div>
                            <div className="form-group">
                                <button type="submit" className="btn btn-primary btn-block">
                                    Login
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <p className="text-center mt-4">
                    Don't have account? <Link to="/register">Sign up</Link>
                </p>
            </section>
        </>
    );
};

export default SignIn;
