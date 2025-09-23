import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import Toast from '../components/Toast';

const Home = () => {
    const [priceRange, setPriceRange] = useState({min: 0, max: 2000});
    const [categoriesExpanded, setCategoriesExpanded] = useState(true);
    const [priceExpanded, setPriceExpanded] = useState(true);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState({});
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({show: false, message: '', type: 'success'});
    const {addToCart} = useCart();

    // Fetch products from API
    const fetchProducts = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/api/products/homepage/');

            if(response.ok) {
                const data = await response.json();
                setProducts(data.products || []);
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch products:', errorData);
                setError('Failed to fetch products');
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
            const response = await fetch('http://localhost:8000/api/products/category/');

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
            const response = await fetch(`http://localhost:8000/api/products/category/${categorySlug}/subcategories/`);

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
                {/* Banner Section from index.html */}
                <section className="section-intro padding-y-sm">
                    <div className="container">
                        <div className="intro-banner-wrap">
                            <img src="/images/banners/1.jpg" className="img-fluid rounded" alt="Banner" />
                        </div>
                    </div>
                </section>

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
                                                                    <a href="#" className="text-primary">
                                                                        <strong>More...</strong>
                                                                    </a>
                                                                </li>
                                                            )}
                                                        </ul>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </article>


                                    <article className="filter-group">
                                        <header className="card-header">
                                            <button
                                                className="btn btn-link p-0"
                                                onClick={() => setPriceExpanded(!priceExpanded)}
                                                style={{border: 'none', background: 'none', width: '100%', textAlign: 'left'}}
                                            >
                                                <i className={`icon-control fa ${priceExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
                                                <h6 className="title">Price range</h6>
                                            </button>
                                        </header>
                                        {priceExpanded && (
                                            <div className="filter-content" id="collapse_3">
                                                <div className="card-body">
                                                    <div className="form-row">
                                                        <div className="form-group col-md-6">
                                                            <label>Min</label>
                                                            <select
                                                                className="mr-2 form-control"
                                                                value={priceRange.min}
                                                                onChange={(e) => setPriceRange(prev => ({...prev, min: parseInt(e.target.value)}))}
                                                            >
                                                                <option value="0">$0</option>
                                                                <option value="50">$50</option>
                                                                <option value="100">$100</option>
                                                                <option value="150">$150</option>
                                                                <option value="200">$200</option>
                                                                <option value="500">$500</option>
                                                                <option value="1000">$1000</option>
                                                            </select>
                                                        </div>
                                                        <div className="form-group text-right col-md-6">
                                                            <label>Max</label>
                                                            <select
                                                                className="mr-2 form-control"
                                                                value={priceRange.max}
                                                                onChange={(e) => setPriceRange(prev => ({...prev, max: parseInt(e.target.value)}))}
                                                            >
                                                                <option value="50">$50</option>
                                                                <option value="100">$100</option>
                                                                <option value="150">$150</option>
                                                                <option value="200">$200</option>
                                                                <option value="500">$500</option>
                                                                <option value="1000">$1000</option>
                                                                <option value="2000">$2000+</option>
                                                            </select>
                                                        </div>
                                                    </div>
                                                    <button className="btn btn-block btn-primary">Apply</button>
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                </div>
                            </aside>

                            {/* Products Grid */}
                            <main className="col-md-9">
                                <header className="border-bottom mb-4 pb-3">
                                    <div className="form-inline">
                                        <span className="mr-md-auto">
                                            {loading ? 'Loading...' : `${products.length} Items found`}
                                        </span>
                                        <button
                                            className="btn btn-sm btn-outline-primary"
                                            onClick={fetchProducts}
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
                                                        {product.image_url ? (
                                                            <img
                                                                src={product.image_url}
                                                                alt={product.image_alt || product.title}
                                                                style={{width: '100%', height: '200px', objectFit: 'cover'}}
                                                            />
                                                        ) : (
                                                            <img
                                                                src="/images/items/1.jpg"
                                                                alt="Default Product"
                                                                style={{width: '100%', height: '200px', objectFit: 'cover'}}
                                                            />
                                                        )}
                                                    </div>
                                                    <figcaption className="info-wrap">
                                                        <div className="fix-height">
                                                            <Link to={`/product/${product.slug}`} className="title">
                                                                {product.title}
                                                            </Link>
                                                            {product.slug === 'test-variable-product' && (
                                                                <small className="text-info d-block">(Has Variants)</small>
                                                            )}
                                                            <div className="price-wrap mt-2">
                                                                <div className="d-flex align-items-center justify-content-between">
                                                                    <div>
                                                                        <span className="price">৳{product.price}</span>
                                                                        {product.old_price && (
                                                                            <del className="price-old">৳{product.old_price}</del>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <div className="mt-1">
                                                                    {renderStars(product.average_rating || 0, product.review_count || 0)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button
                                                            className="btn btn-block btn-success"
                                                            onClick={async () => {
                                                                // Determine variant ID - use default variant if product has variants
                                                                let variantId = null;
                                                                if(product.has_variants && product.default_variant_id) {
                                                                    variantId = product.default_variant_id;
                                                                }

                                                                const result = await addToCart({
                                                                    id: product.id,
                                                                    name: product.title,
                                                                    price: product.price,
                                                                    image: product.image_url || "/images/items/1.jpg",
                                                                    category: product.category_name || "General",
                                                                    quantity: 1,
                                                                    selectedVariant: variantId ? {id: variantId} : null
                                                                });

                                                                if(result && result.success) {
                                                                    setToast({
                                                                        show: true,
                                                                        message: result.message || 'Product added to cart successfully!',
                                                                        type: 'success'
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
                                                            Add to cart
                                                        </button>
                                                    </figcaption>
                                                </figure>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Pagination */}
                                <nav className="mt-4" aria-label="Page navigation">
                                    <ul className="pagination">
                                        <li className="page-item disabled">
                                            <span className="page-link">Previous</span>
                                        </li>
                                        <li className="page-item active">
                                            <span className="page-link">1</span>
                                        </li>
                                        <li className="page-item">
                                            <span className="page-link">2</span>
                                        </li>
                                        <li className="page-item">
                                            <span className="page-link">3</span>
                                        </li>
                                        <li className="page-item">
                                            <span className="page-link">Next</span>
                                        </li>
                                    </ul>
                                </nav>
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
        </>
    );
};

export default Home;