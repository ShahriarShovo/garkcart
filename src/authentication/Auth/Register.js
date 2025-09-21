import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import Toast from '../../components/Toast';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirm_password: '',
        full_name: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    const {register} = useAuth();
    const navigate = useNavigate();

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

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Validate password when password field changes
        if(name === 'password') {
            validatePassword(value);
        }
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

        // Check password validation
        const validation = validatePassword(formData.password);
        const isPasswordValid = Object.values(validation).every(Boolean);

        if(!isPasswordValid) {
            showToast('Password does not meet requirements. Please check the password criteria below.', 'error');
            return;
        }

        if(formData.password !== formData.confirm_password) {
            showToast('Passwords do not match', 'error');
            return;
        }

        const userData = {
            email: formData.email,
            password: formData.password,
            confirm_password: formData.confirm_password,
            full_name: formData.full_name
        };

        const result = await register(userData);
        if(result.success) {
            showToast('Registration successful! Please check your email for verification.', 'success');
            setTimeout(() => {
                navigate('/email-verification');
            }, 2000); // Navigate to email verification after 2 seconds
        } else {
            showToast(result.message || 'Registration failed. Please try again.', 'error');
        }
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
            <section className="section-content padding-y">
                <div className="card mx-auto" style={{maxWidth: '520px', marginTop: '40px'}}>
                    <article className="card-body">
                        <header className="mb-4">
                            <h4 className="card-title">Sign up</h4>
                        </header>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Enter your full name"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Enter your email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <small className="form-text text-muted">
                                    We'll never share your email with anyone else.
                                </small>
                            </div>
                            <div className="form-row">
                                <div className="form-group col-md-6">
                                    <label>Create password</label>
                                    <div className="input-group">
                                        <input
                                            className="form-control"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            placeholder="Enter password"
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
                                <div className="form-group col-md-6">
                                    <label>Confirm password</label>
                                    <div className="input-group">
                                        <input
                                            className="form-control"
                                            type={showConfirmPassword ? "text" : "password"}
                                            name="confirm_password"
                                            placeholder="Confirm password"
                                            value={formData.confirm_password}
                                            onChange={handleChange}
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
                            </div>

                            {/* Password Requirements */}
                            {formData.password && (
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
                                <button type="submit" className="btn btn-primary btn-block">
                                    Register
                                </button>
                            </div>
                        </form>
                    </article>
                </div>
                <p className="text-center mt-4">
                    Have an account? <Link to="/signin">Log In</Link>
                </p>
            </section>
        </>
    );
};

export default Register;
