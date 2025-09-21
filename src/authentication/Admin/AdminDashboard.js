import React, {useState} from 'react';
import {useAuth} from '../../context/AuthContext';
import {Link} from 'react-router-dom';

const AdminDashboard = () => {
    const {user, logout} = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard'); // Default active tab

    return (
        <section className="section-conten padding-y bg">
            <div className="container">
                <div className="row">
                    <aside className="col-md-3">
                        {/* ADMIN SIDEBAR */}
                        <ul className="list-group">
                            <a
                                className={`list-group-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('dashboard');
                                }}
                            >
                                Dashboard
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'products' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('products');
                                }}
                            >
                                Manage Products
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'orders' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('orders');
                                }}
                            >
                                Manage Orders
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'users' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('users');
                                }}
                            >
                                Manage Users
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'categories' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('categories');
                                }}
                            >
                                Manage Categories
                            </a>
                            <a
                                className={`list-group-item ${activeTab === 'reports' ? 'active' : ''}`}
                                href="#"
                                onClick={(e) => {
                                    e.preventDefault();
                                    setActiveTab('reports');
                                }}
                            >
                                Reports
                            </a>
                        </ul>
                        <br />
                        <a className="btn btn-light btn-block" href="#" onClick={(e) => {
                            e.preventDefault();
                            logout();
                        }}>
                            <i className="fa fa-power-off"></i>
                            <span className="text">Log out</span>
                        </a>
                        {/* ADMIN SIDEBAR .//END */}
                    </aside>

                    <main className="col-md-9">
                        {activeTab === 'dashboard' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Admin Dashboard</strong>
                                    <span>Welcome, {user?.full_name || user?.email || 'Admin'}</span>
                                </header>
                                <div className="card-body">
                                    <div className="row">
                                        <div className="col-md-3">
                                            <div className="card bg-primary text-white">
                                                <div className="card-body">
                                                    <h5>Total Orders</h5>
                                                    <h2>156</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-success text-white">
                                                <div className="card-body">
                                                    <h5>Total Products</h5>
                                                    <h2>89</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-warning text-white">
                                                <div className="card-body">
                                                    <h5>Total Users</h5>
                                                    <h2>1,234</h2>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="card bg-info text-white">
                                                <div className="card-body">
                                                    <h5>Revenue</h5>
                                                    <h2>$12,456</h2>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        )}

                        {activeTab === 'products' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Manage Products</strong>
                                </header>
                                <div className="card-body">
                                    <div className="table-responsive">
                                        <table className="table table-hover">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th>Price</th>
                                                    <th>Stock</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td>
                                                        <img src="/images/items/1.jpg" className="img-xs border" alt="Product" />
                                                        <span className="ml-2">Camera Canon EOS M50 Kit</span>
                                                    </td>
                                                    <td>$1156.00</td>
                                                    <td>15</td>
                                                    <td>
                                                        <Link to="#" className="btn btn-sm btn-outline-primary">Edit</Link>
                                                        <Link to="#" className="btn btn-sm btn-outline-danger">Delete</Link>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td>
                                                        <img src="/images/items/2.jpg" className="img-xs border" alt="Product" />
                                                        <span className="ml-2">ADATA Premier ONE microSDXC</span>
                                                    </td>
                                                    <td>$149.97</td>
                                                    <td>25</td>
                                                    <td>
                                                        <Link to="#" className="btn btn-sm btn-outline-primary">Edit</Link>
                                                        <Link to="#" className="btn btn-sm btn-outline-danger">Delete</Link>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </article>
                        )}

                        {activeTab === 'orders' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Manage Orders</strong>
                                </header>
                                <div className="card-body">
                                    <p>Order management functionality will be here.</p>
                                </div>
                            </article>
                        )}

                        {activeTab === 'users' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Manage Users</strong>
                                </header>
                                <div className="card-body">
                                    <p>User management functionality will be here.</p>
                                </div>
                            </article>
                        )}

                        {activeTab === 'categories' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Manage Categories</strong>
                                </header>
                                <div className="card-body">
                                    <p>Category management functionality will be here.</p>
                                </div>
                            </article>
                        )}

                        {activeTab === 'reports' && (
                            <article className="card">
                                <header className="card-header">
                                    <strong className="d-inline-block mr-3">Reports</strong>
                                </header>
                                <div className="card-body">
                                    <p>Reports and analytics will be here.</p>
                                </div>
                            </article>
                        )}
                    </main>
                </div>
            </div>
        </section>
    );
};

export default AdminDashboard;
