import React, {useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import {useAuth} from '../context/AuthContext';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const {getTotalItems} = useCart();
    const {user, isAuthenticated, logout} = useAuth();
    const navigate = useNavigate();

    const handleSearch = (e) => {
        e.preventDefault();
        if(searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <header className="section-header">
            <nav className="navbar p-md-0 navbar-expand-sm navbar-light border-bottom">
                <div className="container">
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-toggle="collapse"
                        data-target="#navbarTop4"
                        aria-controls="navbarNav"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarTop4">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item dropdown">
                                <button className="nav-link dropdown-toggle btn btn-link" data-toggle="dropdown">
                                    Language
                                </button>
                                <ul className="dropdown-menu small">
                                    <li><button className="dropdown-item">English</button></li>
                                    <li><button className="dropdown-item">Arabic</button></li>
                                    <li><button className="dropdown-item">Russian</button></li>
                                </ul>
                            </li>
                            <li className="nav-item dropdown">
                                <button className="nav-link dropdown-toggle btn btn-link" data-toggle="dropdown">
                                    USD
                                </button>
                                <ul className="dropdown-menu small">
                                    <li><button className="dropdown-item">EUR</button></li>
                                    <li><button className="dropdown-item">AED</button></li>
                                    <li><button className="dropdown-item">RUBL</button></li>
                                </ul>
                            </li>
                        </ul>
                        <ul className="navbar-nav">
                            <li><button className="nav-link btn btn-link"><i className="fa fa-envelope"></i> Email</button></li>
                            <li><button className="nav-link btn btn-link"><i className="fa fa-phone"></i> Call us</button></li>
                        </ul>
                    </div>
                </div>
            </nav>

            <section className="header-main border-bottom">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-2 col-md-3 col-6">
                            <Link to="/" className="brand-wrap">
                                <img className="logo" src="/images/logo.png" alt="GreatKart" />
                            </Link>
                        </div>
                        <div className="col-lg col-sm col-md col-6 flex-grow-0">
                            <div className="category-wrap dropdown d-inline-block float-right">
                                <button
                                    type="button"
                                    className="btn btn-primary dropdown-toggle"
                                    data-toggle="dropdown"
                                >
                                    <i className="fa fa-bars"></i> All category
                                </button>
                                <div className="dropdown-menu">
                                    <a className="dropdown-item" href="#">Machinery / Mechanical Parts / Tools</a>
                                    <a className="dropdown-item" href="#">Consumer Electronics / Home Appliances</a>
                                    <a className="dropdown-item" href="#">Auto / Transportation</a>
                                    <a className="dropdown-item" href="#">Apparel / Textiles / Timepieces</a>
                                    <a className="dropdown-item" href="#">Home & Garden / Construction / Lights</a>
                                    <a className="dropdown-item" href="#">Beauty & Personal Care / Health</a>
                                </div>
                            </div>
                        </div>
                        <Link to="/store" className="btn btn-outline-primary">Store</Link>
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
                        <div className="col-lg-3 col-sm-6 col-8 order-2 order-lg-3">
                            <div className="d-flex justify-content-end mb-3 mb-lg-0">
                                <div className="widget-header">
                                    <small className="title text-muted">
                                        {isAuthenticated ? (
                                            <>
                                                Welcome {user?.full_name || user?.email || 'User'}!
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
                                                    <>
                                                        <Link to="/admin/dashboard">Admin Dashboard</Link>
                                                        <span className="dark-transp"> | </span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Link to="/dashboard">Dashboard</Link>
                                                        <span className="dark-transp"> | </span>
                                                    </>
                                                )}
                                                <button
                                                    onClick={handleLogout}
                                                    className="btn btn-link p-0"
                                                    style={{textDecoration: 'none', color: 'inherit'}}
                                                >
                                                    Logout
                                                </button>
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
                                <Link to="/cart" className="widget-header pl-3 ml-3">
                                    <div className="icon icon-sm rounded-circle border">
                                        <i className="fa fa-shopping-cart"></i>
                                    </div>
                                    <span className="badge badge-pill badge-danger notify">
                                        {getTotalItems() || 0}
                                    </span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </header>
    );
};

export default Header;
