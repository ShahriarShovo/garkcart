import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import {CartProvider} from './context/CartContext';
import {AuthProvider} from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Store from './pages/Store';
import ProductDetail from './product/ProductDetail';
import Cart from './product/Cart';
import CategoryProducts from './product/CategoryProducts';
import SignIn from './authentication/Auth/SignIn';
import Register from './authentication/Auth/Register';
import EmailVerification from './authentication/Auth/EmailVerification';
import SearchResult from './product/SearchResult';
import PlaceOrder from './order/PlaceOrder';
import OrderComplete from './order/OrderComplete';
import Dashboard from './authentication/User/Dashboard';
import AdminDashboard from './authentication/Admin/AdminDashboard';
import {useAuth} from './context/AuthContext';
import {FloatingChatWidget} from './chat_and_notification';

function AppShell() {
    const {isAuthenticated, user} = useAuth();
    return (
        <div className="App" style={{minHeight: '100vh', display: 'flex', flexDirection: 'column'}}>
            <Header />
            <main style={{flex: 1}}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/store" element={<Store />} />
                    <Route path="/product-detail/:slug" element={<ProductDetail />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/category-products" element={<CategoryProducts />} />
                    <Route path="/signin" element={<SignIn />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/email-verification" element={<EmailVerification />} />
                    <Route path="/search" element={<SearchResult />} />
                    <Route path="/place-order" element={<PlaceOrder />} />
                    <Route path="/order-complete" element={<OrderComplete />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                </Routes>
            </main>
            <Footer />
            {isAuthenticated && !user?.is_admin && !user?.is_staff && <FloatingChatWidget />}
        </div>
    );
}

function App() {
    return (
        <Router future={{v7_startTransition: true, v7_relativeSplatPath: true}}>
            <AuthProvider>
                <CartProvider>
                    <AppShell />
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
