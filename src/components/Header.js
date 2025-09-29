import React, {useState, useEffect} from 'react';
import {Link, useNavigate, useLocation} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import {useAuth} from '../context/AuthContext';
import logoApi from '../settings/api/logoApi';
import API_CONFIG from '../config/apiConfig';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [profile, setProfile] = useState(null);
    const [logoUrl, setLogoUrl] = useState('/images/logo.png'); // Default logo
    const {getTotalItems} = useCart();
    const {user, isAuthenticated, logout} = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const isAdminUser = !!(user?.is_superuser || user?.is_staff || user?.is_admin || user?.user_type === 'admin');
    const isAdminView = isAdminUser && location.pathname.startsWith('/admin');

    const handleSearch = (e) => {
        e.preventDefault();
        if(searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };


    // Fetch user profile
    const fetchProfile = async () => {
        if(!isAuthenticated || !user) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(API_CONFIG.getFullUrl('AUTH', 'PROFILE'), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if(response.ok) {
                const data = await response.json();
                setProfile(data);
            } else {
                console.error('Failed to fetch profile');
            }
        } catch(error) {
            console.error('Error fetching profile:', error);
        }
    };

    // Fetch active logo
    const fetchActiveLogo = async () => {
        try {
            const logoData = await logoApi.getActiveLogo();
            if(logoData && logoData.logo_url) {
                // Convert relative URL to full URL if needed
                let finalUrl = logoData.logo_url;
                if(finalUrl.startsWith('/media/')) {
                    finalUrl = `${API_CONFIG.BASE_URL}${finalUrl}`;
                }
                setLogoUrl(finalUrl);
            } else {
            }
        } catch(error) {
            console.error('Header: Error fetching active logo:', error);
            // Keep default logo if API fails
        }
    };

    // Fetch profile when user is authenticated
    useEffect(() => {
        if(isAuthenticated && user) {
            fetchProfile();
        } else {
            setProfile(null);
        }
    }, [isAuthenticated, user]);

    // Fetch active logo on component mount
    useEffect(() => {
        fetchActiveLogo();
    }, []);

    return (
        <header className="section-header">
            <section className="header-main border-bottom">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-2 col-md-3 col-6">
                            <Link to="/" className="brand-wrap">
                                <img
                                    className="logo"
                                    src={logoUrl}
                                    alt="GreatKart"
                                    onLoad={() => {}}
                                    onError={(e) => console.error('Header: Image failed to load:', logoUrl, e)}
                                />
                            </Link>
                        </div>
                        {!isAdminView && (
                            <div className="col-lg col-sm col-md col-6 flex-grow-0">
                                {/* Empty spacer - All Category button removed but space maintained */}
                            </div>
                        )}
                        {!isAdminView && (
                            <div className="col-lg col-md-6 col-sm-12 col">
                                <form onSubmit={handleSearch} className="search">
                                    <div className="input-group w-100">
                                        <input
                                            type="text"
                                            className="form-control"
                                            style={{width: '60%'}}
                                            placeholder="Search"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        <div className="input-group-append">
                                            <button className="btn btn-primary" type="submit">
                                                <i className="fa fa-search"></i>
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}
                        <div className={isAdminView ? "col-12" : "col-lg-3 col-sm-6 col-8 order-2 order-lg-3"}>
                            <div className="d-flex justify-content-end mb-3 mb-lg-0">
                                <div className={isAdminView ? "widget-header text-right" : "widget-header"}>
                                    <small className="title text-muted">
                                        {isAuthenticated ? (
                                            <>
                                                Welcome {profile?.username || user?.username || user?.full_name || 'User'}!
                                                {user?.user_type === 'admin' && (
                                                    <span className="badge badge-warning ml-2">Admin</span>
                                                )}
                                            </>
                                        ) : 'Welcome guest!'}
                                    </small>
                                    <div>
                                        {isAuthenticated ? (
                                            <>
                                                {user?.user_type === 'admin' ? (
                                                    <Link to="/admin/dashboard">Admin Dashboard</Link>
                                                ) : (
                                                    <Link to="/dashboard">Dashboard</Link>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <Link to="/signin">Sign in</Link>
                                                <span className="dark-transp"> | </span>
                                                <Link to="/register">Register</Link>
                                            </>
                                        )}
                                    </div>
                                </div>
                                {!isAdminView && (
                                    <Link to="/cart" className="widget-header pl-3 ml-3">
                                        <div className="icon icon-sm rounded-circle border">
                                            <i className="fa fa-shopping-cart"></i>
                                        </div>
                                        <span className="badge badge-pill badge-danger notify">
                                            {isAuthenticated ? (getTotalItems() || 0) : 0}
                                        </span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </header>
    );
};

export default Header;
