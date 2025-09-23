import React, {useState, useEffect} from 'react';
import {useSearchParams, Link} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import Toast from '../components/Toast';

const CategoryProducts = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [subcategory, setSubcategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({show: false, message: '', type: 'success'});
    const {addToCart} = useCart();

    // Sidebar state (mirrors Home sidebar)
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [categoriesExpanded, setCategoriesExpanded] = useState(true);
    const [priceExpanded, setPriceExpanded] = useState(true);
    const [subcategories, setSubcategories] = useState({}); // { [slug]: [] }
    const [hoveredCategory, setHoveredCategory] = useState(null);

    // Price range from URL or defaults
    const initialMin = parseInt(searchParams.get('min_price') || '0', 10);
    const initialMax = parseInt(searchParams.get('max_price') || '2000', 10);
    const [priceRange, setPriceRange] = useState({min: initialMin, max: initialMax});

    const categorySlug = searchParams.get('category');
    const subcategorySlug = searchParams.get('subcategory');

    // Fetch products by category/subcategory and price filters
    const fetchCategoryProducts = async () => {
        if(!categorySlug) return;

        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            params.set('category', categorySlug);
            if(subcategorySlug) params.set('subcategory', subcategorySlug);
            if(searchParams.get('min_price')) params.set('min_price', searchParams.get('min_price'));
            if(searchParams.get('max_price')) params.set('max_price', searchParams.get('max_price'));

            const url = `http://localhost:8000/api/products/product/category_products/?${params.toString()}`;
            const response = await fetch(url);

            if(response.ok) {
                const data = await response.json();
                setProducts(data.products || []);
                setCategory(data.category);
                setSubcategory(data.subcategory);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch products');
            }
        } catch(error) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Fetch categories for sidebar
    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const response = await fetch('http://localhost:8000/api/products/category/');
            if(response.ok) {
                const data = await response.json();
                setCategories(data.results || data);
            }
        } catch(e) {
            // noop
        } finally {
            setCategoriesLoading(false);
        }
    };

    // Fetch subcategories for a category (once)
    const fetchSubcategories = async (catSlug) => {
        if(subcategories[catSlug]) return;
        try {
            const response = await fetch(`http://localhost:8000/api/products/category/${catSlug}/subcategories/`);
            if(response.ok) {
                const data = await response.json();
                setSubcategories(prev => ({...prev, [catSlug]: data.subcategories || []}));
            }
        } catch(e) {
            // noop
        }
    };

    const handleCategoryHover = (cat) => {
        setHoveredCategory(cat);
        if(cat.slug && !subcategories[cat.slug]) fetchSubcategories(cat.slug);
    };
    const handleCategoryLeave = () => setHoveredCategory(null);

    // Apply price filter (update URL and refetch)
    const applyPriceFilter = () => {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set('min_price', String(priceRange.min));
        newParams.set('max_price', String(priceRange.max));
        setSearchParams(newParams);
        // fetchCategoryProducts will react via useEffect below
    };

    // Effects
    useEffect(() => {
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        fetchCategoryProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [categorySlug, subcategorySlug, searchParams.get('min_price'), searchParams.get('max_price')]);

    // Rating renderer (unchanged)
    const renderStars = (rating, reviewCount = 0) => {
        const numRating = parseFloat(rating) || 0;
        const stars = [];
        const fullStars = Math.floor(numRating);
        const hasHalfStar = numRating % 1 !== 0;
        for(let i = 0; i < fullStars && i < 5; i++) stars.push(<i key={`full-${i}`} className="fa fa-star"></i>);
        if(hasHalfStar && stars.length < 5) stars.push(<i key="half" className="fa fa-star-half-o"></i>);
        while(stars.length < 5) stars.push(<i key={`empty-${stars.length}`} className="far fa-star fa-star-o"></i>);
        return (
            <div className="rating">
                {stars}
                <small className="text-muted ml-1">({numRating.toFixed(1)}) {reviewCount > 0 && `(${reviewCount} review${reviewCount > 1 ? 's' : ''})`}</small>
            </div>
        );
    };

    if(loading) {
        return (
            <div className="container text-center py-5">
                <i className="fa fa-spinner fa-spin fa-2x"></i>
                <p>Loading products...</p>
            </div>
        );
    }

    if(error) {
        return (
            <div className="container">
                <div className="text-center">
                    <h2>Error</h2>
                    <p className="text-danger">{error}</p>
                    <Link to="/" className="btn btn-primary">Back to Home</Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <section className="section-content padding-y">
                <div className="container">
                    <div className="row">
                        {/* Sidebar - Same as Home page */}
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
                                        <div className="filter-content collapse show">
                                            <div className="card-body">
                                                {categoriesLoading ? (
                                                    <div className="text-center py-2">
                                                        <i className="fa fa-spinner fa-spin"></i>
                                                        <small className="ml-2">Loading categories...</small>
                                                    </div>
                                                ) : (
                                                    <ul className="list-menu">
                                                        {categories.slice(0, 10).map((cat) => (
                                                            <li
                                                                key={cat.id}
                                                                className="position-relative"
                                                                onMouseEnter={() => handleCategoryHover(cat)}
                                                                onMouseLeave={handleCategoryLeave}
                                                            >
                                                                <Link to={`/category-products?category=${cat.slug}`}>
                                                                    {cat.name}
                                                                    {cat.subcategories_count > 0 && (
                                                                        <i className="fa fa-chevron-right float-right mt-1"></i>
                                                                    )}
                                                                </Link>
                                                                {/* Subcategories dropdown */}
                                                                {hoveredCategory && hoveredCategory.id === cat.id &&
                                                                    subcategories[cat.slug] && subcategories[cat.slug].length > 0 && (
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
                                                                                    {cat.name}
                                                                                </small>
                                                                            </div>
                                                                            {subcategories[cat.slug].map((subcat) => (
                                                                                <div key={subcat.id} style={{padding: 0, margin: '0 8px', borderRadius: '8px', transition: 'all 0.2s ease'}}>
                                                                                    <Link
                                                                                        to={`/category-products?category=${cat.slug}&subcategory=${subcat.slug}`}
                                                                                        style={{display: 'block', padding: '12px 16px', color: '#333', textDecoration: 'none', borderRadius: '8px', transition: 'all 0.2s ease', position: 'relative'}}
                                                                                        onMouseEnter={(e) => {e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'; e.target.style.color = 'white'; e.target.style.transform = 'translateX(4px)'; e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';}}
                                                                                        onMouseLeave={(e) => {e.target.style.background = 'transparent'; e.target.style.color = '#333'; e.target.style.transform = 'translateX(0)'; e.target.style.boxShadow = 'none';}}
                                                                                    >
                                                                                        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
                                                                                            <span style={{fontWeight: 500, fontSize: '14px'}}>{subcat.name}</span>
                                                                                            <i className="fa fa-arrow-right" style={{fontSize: '12px', opacity: 0.6, transition: 'all 0.2s ease'}}></i>
                                                                                        </div>
                                                                                    </Link>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </article>

                                {/* Price Range Filter */}
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
                                                            onChange={(e) => setPriceRange(prev => ({...prev, min: parseInt(e.target.value, 10)}))}
                                                        >
                                                            <option value="0">৳0</option>
                                                            <option value="50">৳50</option>
                                                            <option value="100">৳100</option>
                                                            <option value="150">৳150</option>
                                                            <option value="200">৳200</option>
                                                            <option value="500">৳500</option>
                                                            <option value="1000">৳1000</option>
                                                        </select>
                                                    </div>
                                                    <div className="form-group text-right col-md-6">
                                                        <label>Max</label>
                                                        <select
                                                            className="mr-2 form-control"
                                                            value={priceRange.max}
                                                            onChange={(e) => setPriceRange(prev => ({...prev, max: parseInt(e.target.value, 10)}))}
                                                        >
                                                            <option value="50">৳50</option>
                                                            <option value="100">৳100</option>
                                                            <option value="150">৳150</option>
                                                            <option value="200">৳200</option>
                                                            <option value="500">৳500</option>
                                                            <option value="1000">৳1000</option>
                                                            <option value="2000">৳2000+</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <button className="btn btn-block btn-primary" onClick={applyPriceFilter}>Apply</button>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            </div>
                        </aside>

                        {/* Main Content - Same layout as Home page */}
                        <main className="col-md-9">
                            {/* Category Header */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <nav aria-label="breadcrumb">
                                        <ol className="breadcrumb">
                                            <li className="breadcrumb-item">
                                                <Link to="/">Home</Link>
                                            </li>
                                            <li className="breadcrumb-item">
                                                <Link to="/store">Store</Link>
                                            </li>
                                            {category && (
                                                <li className="breadcrumb-item active" aria-current="page">
                                                    {category.name}
                                                </li>
                                            )}
                                            {subcategory && (
                                                <li className="breadcrumb-item active" aria-current="page">
                                                    {subcategory.name}
                                                </li>
                                            )}
                                        </ol>
                                    </nav>
                                </div>
                            </div>

                            {/* Category Info */}
                            <div className="row mb-4">
                                <div className="col-12">
                                    <div className="card">
                                        <div className="card-body">
                                            <div className="row align-items-center">
                                                <div className="col-md-8">
                                                    <h1 className="h3 mb-2">
                                                        {subcategory ? subcategory.name : category?.name}
                                                    </h1>
                                                    <p className="text-muted mb-0">
                                                        {subcategory ? subcategory.description : category?.description}
                                                    </p>
                                                    <small className="text-muted">
                                                        {products.length} product{products.length !== 1 ? 's' : ''} found
                                                    </small>
                                                </div>
                                                {category?.image && (
                                                    <div className="col-md-4 text-right">
                                                        <img
                                                            src={category.image}
                                                            alt={category.name}
                                                            className="img-fluid rounded"
                                                            style={{maxHeight: '100px'}}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Products Grid - Same as Home page */}
                            {products.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="fa fa-shopping-bag fa-3x text-muted mb-3"></i>
                                    <h5>No products found</h5>
                                    <p className="text-muted">
                                        No products are available in this {subcategory ? 'subcategory' : 'category'} at the moment.
                                    </p>
                                    <Link to="/store" className="btn btn-primary">Browse All Products</Link>
                                </div>
                            ) : (
                                <div className="row">
                                    {products.map((product) => (
                                        <div key={product.id} className="col-md-4 mb-4">
                                            <figure className="card card-product-grid">
                                                <div className="img-wrap">
                                                    {product.primary_image?.image_url ? (
                                                        <img
                                                            src={product.primary_image.image_url}
                                                            alt={product.primary_image.alt_text || product.title}
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
                                                            let variantId = null;
                                                            if(product.has_variants && product.default_variant_id) {
                                                                variantId = product.default_variant_id;
                                                            }

                                                            const result = await addToCart({
                                                                id: product.id,
                                                                name: product.title,
                                                                price: product.price,
                                                                image: product.primary_image?.image_url || "/images/items/1.jpg",
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
                        </main>
                    </div>

                    {/* Pagination */}
                    {products.length > 0 && (
                        <nav className="mt-4" aria-label="Page navigation">
                            <ul className="pagination justify-content-center">
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
                    )}
                </div>
            </section>

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

export default CategoryProducts;
