import React, {useState, useEffect} from 'react';
import {useSearchParams, Link} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import Toast from '../components/Toast';

const CategoryProducts = () => {
    const [searchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [category, setCategory] = useState(null);
    const [subcategory, setSubcategory] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({show: false, message: '', type: 'success'});
    const {addToCart} = useCart();

    const categorySlug = searchParams.get('category');
    const subcategorySlug = searchParams.get('subcategory');

    // Fetch products by category/subcategory
    const fetchCategoryProducts = async () => {
        if(!categorySlug) return;

        setLoading(true);
        setError(null);
        try {
            let url = `http://localhost:8000/api/products/product/category_products/?category=${categorySlug}`;
            if(subcategorySlug) {
                url += `&subcategory=${subcategorySlug}`;
            }

            const response = await fetch(url);

            if(response.ok) {
                const data = await response.json();
                setProducts(data.products || []);
                setCategory(data.category);
                setSubcategory(data.subcategory);
            } else {
                const errorData = await response.json();
                console.error('Failed to fetch category products:', errorData);
                setError(errorData.error || 'Failed to fetch products');
            }
        } catch(error) {
            console.error('Error fetching category products:', error);
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Fetch products when component mounts or params change
    useEffect(() => {
        fetchCategoryProducts();
    }, [categorySlug, subcategorySlug]);

    // Function to render star rating
    const renderStars = (rating, reviewCount = 0) => {
        const numRating = parseFloat(rating) || 0;
        const stars = [];
        const fullStars = Math.floor(numRating);
        const hasHalfStar = numRating % 1 !== 0;

        for(let i = 0; i < fullStars && i < 5; i++) {
            stars.push(<i key={`full-${i}`} className="fa fa-star"></i>);
        }

        if(hasHalfStar && stars.length < 5) {
            stars.push(<i key="half" className="fa fa-star-half-o"></i>);
        }

        while(stars.length < 5) {
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
                                        <h6 className="title">Categories</h6>
                                    </header>
                                    <div className="filter-content collapse show">
                                        <div className="card-body">
                                            <ul className="list-menu">
                                                <li><Link to="/category-products?category=apple">Apple</Link></li>
                                                <li><Link to="/category-products?category=electronics">Electronics</Link></li>
                                                <li><Link to="/category-products?category=google">Google</Link></li>
                                            </ul>
                                        </div>
                                    </div>
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
