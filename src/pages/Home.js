import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import Toast from '../components/Toast';
import PriceRangeFilter from '../components/PriceRangeFilter';
import BannerSlider from '../components/BannerSlider';
import API_CONFIG from '../config/apiConfig';

const Home = () => {
    const [categoriesExpanded, setCategoriesExpanded] = useState(true);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState({});
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({show: false, message: '', type: 'success'});

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [pageSize] = useState(12);
    const [isPaginationPage, setIsPaginationPage] = useState(false);

    // Category modal state
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [modalHoveredCategory, setModalHoveredCategory] = useState(null);

    const {addToCart} = useCart();

    // Fetch products from API with pagination and price filter
    const fetchProducts = async (page = 1, minPrice = null, maxPrice = null) => {
        console.trace();
        
        setLoading(true);
        setError(null);
        try {
            let url = `${API_CONFIG.getFullUrl('PRODUCTS', 'PAGINATION')}?page=${page}&page_size=${pageSize}`;

            // If price filter is applied, use price filter API
            if(minPrice !== null || maxPrice !== null) {
                url = `${API_CONFIG.BASE_URL}/api/products/price-filter/products/?page=${page}&page_size=${pageSize}`;
                if(minPrice !== null) url += `&min_price=${minPrice}`;
                if(maxPrice !== null) url += `&max_price=${maxPrice}`;
            }
            const response = await fetch(url);
            if(response.ok) {
                const data = await response.json();
                setProducts(data.results || []);
                setCurrentPage(data.current_page || 1);
                setTotalPages(data.total_pages || 1);
                setTotalCount(data.count || 0);
                setIsPaginationPage(page > 1);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch products');
            }
        } catch(error) {
            console.error('Error fetching products:', error);
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories from API
    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const response = await fetch(API_CONFIG.getFullUrl('PRODUCTS', 'CATEGORIES'));

            if(response.ok) {
                const data = await response.json();
                setCategories(data.results || data);
            } else {
                console.error('Failed to fetch categories');
            }
        } catch(error) {
            console.error('Error fetching categories:', error);
        } finally {
            setCategoriesLoading(false);
        }
    };

    // Fetch subcategories for a specific category
    const fetchSubcategories = async (categorySlug) => {
        if(subcategories[categorySlug]) {
            return; // Already fetched
        }

        try {
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/products/category/${categorySlug}/subcategories/`);

            if(response.ok) {
                const data = await response.json();
                setSubcategories(prev => ({
                    ...prev,
                    [categorySlug]: data.subcategories || []
                }));
            } else {
                console.error('Failed to fetch subcategories for:', categorySlug);
            }
        } catch(error) {
            console.error('Error fetching subcategories:', error);
        }
    };

    // Handle category hover
    const handleCategoryHover = (category) => {
        setHoveredCategory(category);
        if(category.slug && !subcategories[category.slug]) {
            fetchSubcategories(category.slug);
        }
    };

    // Handle category mouse leave
    const handleCategoryLeave = () => {
        setHoveredCategory(null);
    };

    // Pagination functions
    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchProducts(page);
    };

    const handleNextPage = () => {
        if(currentPage < totalPages) {
            handlePageChange(currentPage + 1);
        }
    };

    const handlePrevPage = () => {
        if(currentPage > 1) {
            handlePageChange(currentPage - 1);
        }
    };

    // Generate page numbers for pagination
    const generatePageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 7; // Increased from 5 to 7

        if(totalPages <= maxVisiblePages) {
            for(let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            let startPage = Math.max(1, currentPage - 3);
            let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

            // Adjust start page if we're near the end
            if(endPage - startPage < maxVisiblePages - 1) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            for(let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    // Fetch products and categories when component mounts
    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    // Function to render star rating with real data
    const renderStars = (rating, reviewCount = 0) => {
        // Ensure rating is a number
        const numRating = parseFloat(rating) || 0;
        const stars = [];
        const fullStars = Math.floor(numRating);
        const hasHalfStar = numRating % 1 !== 0;

        // Render full stars
        for(let i = 0; i < fullStars && i < 5; i++) {
            stars.push(<i key={`full-${i}`} className="fa fa-star"></i>);
        }

        // Render half star if needed and space remains
        if(hasHalfStar && stars.length < 5) {
            // Use fa-star-half-o (FA4) fallback, FA5 alt will still look fine if aliased
            stars.push(<i key="half" className="fa fa-star-half-o"></i>);
        }

        // Render empty stars to complete 5
        while(stars.length < 5) {
            // Use far fa-star for empty (FA5), and keep fa-star-o for compatibility
            stars.push(<i key={`empty-${stars.length}`} className="far fa-star fa-star-o"></i>);
        }

        return (
            <div className="rating">
                {stars}
                <small className="text-muted ml-1">
                    ({numRating.toFixed(1)}) {reviewCount > 0 && `(${reviewCount} review${reviewCount > 1 ? 's' : ''})`}
                </small>
            </div>
        );
    };

    return (
        <>
            <div>
                {/* Dynamic Banner Slider - Only show on first page */}
                {!isPaginationPage && (
                    <BannerSlider />
                )}

                <section className="section-content padding-y">
                    <div className="container">
                        <div className="row">
                            <aside className="col-md-3">
                                <div className="card">
                                    <article className="filter-group">
                                        <header className="card-header">
                                            <button
                                                className="btn btn-link p-0"
                                                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                                                style={{border: 'none', background: 'none', width: '100%', textAlign: 'left'}}
                                            >
                                                <i className={`icon-control fa ${categoriesExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
                                                <h6 className="title">Categories</h6>
                                            </button>
                                        </header>
                                        {categoriesExpanded && (
                                            <div className="filter-content collapse show" id="collapse_1">
                                                <div className="card-body">
                                                    {categoriesLoading ? (
                                                        <div className="text-center py-2">
                                                            <i className="fa fa-spinner fa-spin"></i>
                                                            <small className="ml-2">Loading categories...</small>
                                                        </div>
                                                    ) : (
                                                        <ul className="list-menu">
                                                            {categories.slice(0, 10).map((category) => (
                                                                <li
                                                                    key={category.id}
                                                                    className="position-relative"
                                                                    onMouseEnter={() => handleCategoryHover(category)}
                                                                    onMouseLeave={handleCategoryLeave}
                                                                >
                                                                    <Link to={`/category-products?category=${category.slug}`}>
                                                                        {category.name}
                                                                        {category.subcategories_count > 0 && (
                                                                            <i className="fa fa-chevron-right float-right mt-1"></i>
                                                                        )}
                                                                    </Link>

                                                                    {/* Subcategories Dropdown */}
                                                                    {hoveredCategory && hoveredCategory.id === category.id &&
                                                                        subcategories[category.slug] &&
                                                                        subcategories[category.slug].length > 0 && (
                                                                            <div
                                                                                className="subcategory-dropdown"
                                                                                style={{
                                                                                    position: 'absolute',
                                                                                    left: '100%',
                                                                                    top: '-8px',
                                                                                    background: 'white',
                                                                                    border: 'none',
                                                                                    borderRadius: '12px',
                                                                                    boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
                                                                                    zIndex: 1000,
                                                                                    minWidth: '240px',
                                                                                    padding: '12px 0',
                                                                                    backdropFilter: 'blur(10px)',
                                                                                    border: '1px solid rgba(255,255,255,0.2)'
                                                                                }}
                                                                            >
                                                                                <div style={{
                                                                                    padding: '8px 16px 12px 16px',
                                                                                    borderBottom: '1px solid #f0f0f0',
                                                                                    marginBottom: '8px',
                                                                                    textAlign: 'center'
                                                                                }}>
                                                                                    <small style={{
                                                                                        color: '#666',
                                                                                        fontWeight: '600',
                                                                                        textTransform: 'uppercase',
                                                                                        letterSpacing: '0.5px',
                                                                                        fontSize: '11px'
                                                                                    }}>
                                                                                        {category.name}
                                                                                    </small>
                                                                                </div>
                                                                                {subcategories[category.slug].map((subcat, index) => (
                                                                                    <div
                                                                                        key={subcat.id}
                                                                                        style={{
                                                                                            padding: '0',
                                                                                            margin: '0 8px',
                                                                                            borderRadius: '8px',
                                                                                            transition: 'all 0.2s ease'
                                                                                        }}
                                                                                    >
                                                                                        <Link
                                                                                            to={`/category-products?category=${category.slug}&subcategory=${subcat.slug}`}
                                                                                            style={{
                                                                                                display: 'block',
                                                                                                padding: '12px 16px',
                                                                                                color: '#333',
                                                                                                textDecoration: 'none',
                                                                                                borderRadius: '8px',
                                                                                                transition: 'all 0.2s ease',
                                                                                                position: 'relative'
                                                                                            }}
                                                                                            onMouseEnter={(e) => {
                                                                                                e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                                                                                e.target.style.color = 'white';
                                                                                                e.target.style.transform = 'translateX(4px)';
                                                                                                e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                                                                                            }}
                                                                                            onMouseLeave={(e) => {
                                                                                                e.target.style.background = 'transparent';
                                                                                                e.target.style.color = '#333';
                                                                                                e.target.style.transform = 'translateX(0)';
                                                                                                e.target.style.boxShadow = 'none';
                                                                                            }}
                                                                                        >
                                                                                            <div style={{
                                                                                                display: 'flex',
                                                                                                alignItems: 'center',
                                                                                                justifyContent: 'space-between'
                                                                                            }}>
                                                                                                <span style={{
                                                                                                    fontWeight: '500',
                                                                                                    fontSize: '14px'
                                                                                                }}>
                                                                                                    {subcat.name}
                                                                                                </span>
                                                                                                <i className="fa fa-arrow-right" style={{
                                                                                                    fontSize: '12px',
                                                                                                    opacity: '0.6',
                                                                                                    transition: 'all 0.2s ease'
                                                                                                }}></i>
                                                                                            </div>
                                                                                        </Link>
                                                                                    </div>
                                                                                ))}
                                                                                <div style={{
                                                                                    padding: '8px 16px 0 16px',
                                                                                    marginTop: '8px',
                                                                                    borderTop: '1px solid #f0f0f0'
                                                                                }}>
                                                                                    <Link
                                                                                        to={`/category-products?category=${category.slug}`}
                                                                                        style={{
                                                                                            display: 'block',
                                                                                            padding: '8px 12px',
                                                                                            color: '#007bff',
                                                                                            textDecoration: 'none',
                                                                                            borderRadius: '6px',
                                                                                            fontSize: '13px',
                                                                                            fontWeight: '500',
                                                                                            textAlign: 'center',
                                                                                            background: 'rgba(0, 123, 255, 0.1)',
                                                                                            transition: 'all 0.2s ease'
                                                                                        }}
                                                                                        onMouseEnter={(e) => {
                                                                                            e.target.style.background = 'rgba(0, 123, 255, 0.2)';
                                                                                            e.target.style.transform = 'scale(1.02)';
                                                                                        }}
                                                                                        onMouseLeave={(e) => {
                                                                                            e.target.style.background = 'rgba(0, 123, 255, 0.1)';
                                                                                            e.target.style.transform = 'scale(1)';
                                                                                        }}
                                                                                    >
                                                                                        View All {category.name} Products
                                                                                    </Link>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                </li>
                                                            ))}
                                                            {categories.length > 10 && (
                                                                <li>
                                                                    <button
                                                                        type="button"
                                                                        className="btn btn-link p-0"
                                                                        onClick={() => setShowCategoryModal(true)}
                                                                        style={{color: '#007bff', textDecoration: 'none'}}
                                                                    >
                                                                        <strong>More...</strong>
                                                                    </button>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </article>

                                    <PriceRangeFilter
                                        onPriceFilter={(minPrice, maxPrice) => {
                                            setCurrentPage(1);
                                            fetchProducts(1, minPrice, maxPrice);
                                        }}
                                        initialMin={0}
                                        initialMax={2000}
                                    />
                                </div>
                            </aside>

                            {/* Products Grid */}
                            <main className="col-md-9">
                                <header className="border-bottom mb-4 pb-3">
                                    <div className="form-inline">
                                        <span className="mr-md-auto">
                                            {loading ? 'Loading...' : ''}
                                        </span>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={() => {
                                                fetchProducts(currentPage);
                                            }}
                                            disabled={loading}
                                        >
                                            {loading ? 'Refreshing...' : 'Refresh'}
                                        </button>
                                    </div>
                                </header>

                                {loading && (
                                    <div className="text-center py-4">
                                        <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                                        <p className="mt-2">Loading products...</p>
                                    </div>
                                )}

                                {error && (
                                    <div className="alert alert-danger">
                                        <i className="fa fa-exclamation-triangle mr-2"></i>
                                        {error}
                                    </div>
                                )}

                                {!loading && !error && products.length === 0 && (
                                    <div className="text-center py-4">
                                        <i className="fa fa-shopping-bag fa-3x text-muted mb-3"></i>
                                        <h5>No products found</h5>
                                        <p className="text-muted">No products are available at the moment.</p>
                                    </div>
                                )}

                                {!loading && !error && products.length > 0 && (
                                    <div className="row">
                                        {products.map((product) => (
                                            <div key={product.id} className="col-md-4 mb-4">
                                                <figure className="card card-product-grid">
                                                    <div className="img-wrap">
                                                        <Link to={`/product-detail/${product.slug}`}>
                                                            {(product.image_url || product.primary_image?.image_url) ? (
                                                                <img
                                                                    src={product.image_url || product.primary_image?.image_url}
                                                                    alt={product.image_alt || product.primary_image?.alt_text || product.title}
                                                                    style={{width: '100%', height: '200px', objectFit: 'cover'}}
                                                                />
                                                            ) : (
                                                                <img
                                                                    src="/images/items/1.jpg"
                                                                    alt={product.title}
                                                                    style={{width: '100%', height: '200px', objectFit: 'cover'}}
                                                                />
                                                            )}
                                                        </Link>
                                                    </div>
                                                    <figcaption className="info-wrap">
                                                        <div className="fix-height">
                                                            <Link to={`/product-detail/${product.slug}`} className="title">
                                                                {product.title}
                                                            </Link>
                                                            {product.slug === 'test-variable-product' && (
                                                                <small className="text-info d-block">(Has Variants)</small>
                                                            )}
                                                            <div className="price-wrap mt-2">
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    <div>
                                                                        <span className="price">৳{product.display_price || product.price}</span>
                                                                        {(product.display_old_price || product.old_price) && (
                                                                            <del className="price-old">৳{product.display_old_price || product.old_price}</del>
                                                                        )}
                                                                        {/* Show out of stock for variable products */}
                                                                        {product.product_type === 'variable' && !product.default_variant_in_stock && (
                                                                            <div className="text-danger mt-1">
                                                                                <small>Out of Stock</small>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-1">
                                                                    {renderStars(product.average_rating || 0, product.review_count || 0)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="btn btn-block btn-primary"
                                                            onClick={async (e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                
                                                                // Prevent multiple clicks
                                                                if (loading) return;
                                                                
                                                                // Determine variant ID - use default variant if product has variants
                                                                let variantId = null;
                                                                let selectedVariant = null;
                                                                
                                                                // For variable products, try to get default variant or first variant
                                                                if(product.product_type === 'variable') {
                                                                    if(product.default_variant) {
                                                                        selectedVariant = product.default_variant;
                                                                        variantId = product.default_variant.id;
                                                                    } else if(product.variants && product.variants.length > 0) {
                                                                        selectedVariant = product.variants[0];
                                                                        variantId = product.variants[0].id;
                                                                    } else {
                                                                    }
                                                                } else {
                                                                }

                                                                const productToAdd = {
                                                                    id: product.id,
                                                                    name: product.title,
                                                                    price: selectedVariant ? selectedVariant.price : (product.display_price || product.price),
                                                                    image: product.image_url || product.primary_image?.image_url || "/images/items/1.jpg",
                                                                    category: product.category_name || "General",
                                                                    quantity: 1,
                                                                    selectedVariant: selectedVariant
                                                                };
                                                                const result = await addToCart(productToAdd);
                                                                if(result && result.success) {
                                                                    setToast({
                                                                        show: true,
                                                                        message: result.message || 'Product added to cart successfully!',
                                                                        type: 'success'
                                                                    });
                                                                } else if(result && result.requiresAuth) {
                                                                    setToast({
                                                                        show: true,
                                                                        message: result.message || 'Please login or sign up to add items to cart',
                                                                        type: 'warning'
                                                                    });
                                                                } else {
                                                                    setToast({
                                                                        show: true,
                                                                        message: `Failed to add to cart: ${result?.error || 'Unknown error'}`,
                                                                        type: 'error'
                                                                    });
                                                                }
                                                            }}
                                                        >
                                                            <i className="fa fa-shopping-cart mr-1"></i>
                                                            Add to cart
                                                        </button>
                                                    </figcaption>
                                                </figure>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <nav className="mt-4" aria-label="Page navigation">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <div className="text-muted">
                                                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} products
                                            </div>
                                        </div>
                                        <ul className="pagination justify-content-center">
                                            {/* Previous Button */}
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={handlePrevPage}
                                                    disabled={currentPage === 1}
                                                >
                                                    <i className="fa fa-chevron-left"></i> Previous
                                                </button>
                                            </li>

                                            {/* Page Numbers */}
                                            {generatePageNumbers().map((pageNum) => (
                                                <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                                                    <button
                                                        className="page-link"
                                                        onClick={() => handlePageChange(pageNum)}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                </li>
                                            ))}

                                            {/* Next Button */}
                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <button
                                                    className="page-link"
                                                    onClick={handleNextPage}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Next <i className="fa fa-chevron-right"></i>
                                                </button>
                                            </li>
                                        </ul>

                                        {/* Page Jump */}
                                        <div className="text-center mt-3">
                                            <div className="btn-group" role="group">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => handlePageChange(1)}
                                                    disabled={currentPage === 1}
                                                >
                                                    First
                                                </button>
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() => handlePageChange(totalPages)}
                                                    disabled={currentPage === totalPages}
                                                >
                                                    Last
                                                </button>
                                            </div>
                                        </div>
                                    </nav>
                                )}
                            </main>
                        </div>
                    </div>
                </section>
            </div>

            {/* Toast Notification */}
            {toast.show && (
                <Toast
                    show={toast.show}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({show: false, message: '', type: 'success'})}
                />
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1" role="dialog" aria-labelledby="categoryModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="categoryModalLabel">All Categories</h5>
                                <button type="button" className="close" onClick={() => setShowCategoryModal(false)} aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    {categories.map(category => (
                                        <div key={category.id} className="col-md-4 mb-3">
                                            <div
                                                className="card h-100 position-relative"
                                                style={{cursor: 'pointer', border: '1px solid #e0e0e0', borderRadius: '8px'}}
                                                onMouseEnter={() => {
                                                    setModalHoveredCategory(category);
                                                    if(!subcategories[category.slug]) {
                                                        fetchSubcategories(category.slug);
                                                    }
                                                }}
                                                onMouseLeave={() => setModalHoveredCategory(null)}
                                            >
                                                <div className="card-body">
                                                    <h6 className="card-title text-center mb-3" style={{color: '#333', fontWeight: 'bold'}}>
                                                        <Link to={`/category-products?category=${category.slug}`} onClick={() => setShowCategoryModal(false)}>
                                                            {category.name}
                                                        </Link>
                                                    </h6>

                                                    {/* Subcategories in modal */}
                                                    {modalHoveredCategory && modalHoveredCategory.id === category.id &&
                                                        subcategories[category.slug] &&
                                                        subcategories[category.slug].length > 0 && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '100%',
                                                                left: '50%',
                                                                transform: 'translateX(-50%)',
                                                                background: 'white',
                                                                border: 'none',
                                                                borderRadius: '12px',
                                                                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
                                                                zIndex: 1000,
                                                                padding: '15px',
                                                                marginTop: '8px',
                                                                minWidth: '200px',
                                                                backdropFilter: 'blur(10px)',
                                                                border: '1px solid rgba(255,255,255,0.2)',
                                                                animation: 'fadeIn 0.2s ease-in-out'
                                                            }}>
                                                                <div style={{
                                                                    textAlign: 'center',
                                                                    fontWeight: '600',
                                                                    fontSize: '13px',
                                                                    color: '#333',
                                                                    marginBottom: '12px',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px',
                                                                    borderBottom: '1px solid #f0f0f0',
                                                                    paddingBottom: '8px'
                                                                }}>
                                                                    {category.name}
                                                                </div>
                                                                <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                                                                    {subcategories[category.slug].map((subcategory, index) => (
                                                                        <div key={subcategory.id} style={{marginBottom: '4px'}}>
                                                                            <Link
                                                                                to={`/category-products?category=${category.slug}&subcategory=${subcategory.slug}`}
                                                                                onClick={() => setShowCategoryModal(false)}
                                                                                style={{
                                                                                    display: 'block',
                                                                                    padding: '10px 12px',
                                                                                    color: '#555',
                                                                                    textDecoration: 'none',
                                                                                    borderRadius: '8px',
                                                                                    fontSize: '13px',
                                                                                    transition: 'all 0.3s ease',
                                                                                    border: '1px solid transparent',
                                                                                    position: 'relative',
                                                                                    fontWeight: '500'
                                                                                }}
                                                                                onMouseEnter={(e) => {
                                                                                    e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                                                                    e.target.style.color = 'white';
                                                                                    e.target.style.border = '1px solid rgba(102, 126, 234, 0.3)';
                                                                                    e.target.style.transform = 'translateX(4px)';
                                                                                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                                                                                }}
                                                                                onMouseLeave={(e) => {
                                                                                    e.target.style.background = 'transparent';
                                                                                    e.target.style.color = '#555';
                                                                                    e.target.style.border = '1px solid transparent';
                                                                                    e.target.style.transform = 'translateX(0)';
                                                                                    e.target.style.boxShadow = 'none';
                                                                                }}
                                                                            >
                                                                                <div style={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'space-between'
                                                                                }}>
                                                                                    <span>{subcategory.name}</span>
                                                                                    <i className="fa fa-arrow-right" style={{
                                                                                        fontSize: '10px',
                                                                                        opacity: '0.7',
                                                                                        transition: 'all 0.2s ease'
                                                                                    }}></i>
                                                                                </div>
                                                                            </Link>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div style={{
                                                                    marginTop: '8px',
                                                                    paddingTop: '8px',
                                                                    borderTop: '1px solid #f0f0f0'
                                                                }}>
                                                                    <Link
                                                                        to={`/category-products?category=${category.slug}`}
                                                                        onClick={() => setShowCategoryModal(false)}
                                                                        style={{
                                                                            display: 'block',
                                                                            padding: '8px 12px',
                                                                            color: '#007bff',
                                                                            textDecoration: 'none',
                                                                            borderRadius: '6px',
                                                                            fontSize: '12px',
                                                                            fontWeight: '600',
                                                                            textAlign: 'center',
                                                                            background: 'rgba(0, 123, 255, 0.1)',
                                                                            transition: 'all 0.2s ease'
                                                                        }}
                                                                        onMouseEnter={(e) => {
                                                                            e.target.style.background = 'rgba(0, 123, 255, 0.2)';
                                                                            e.target.style.transform = 'scale(1.02)';
                                                                        }}
                                                                        onMouseLeave={(e) => {
                                                                            e.target.style.background = 'rgba(0, 123, 255, 0.1)';
                                                                            e.target.style.transform = 'scale(1)';
                                                                        }}
                                                                    >
                                                                        View All {category.name} Products
                                                                    </Link>
                                                                </div>
                                                            </div>
                                                        )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Home;