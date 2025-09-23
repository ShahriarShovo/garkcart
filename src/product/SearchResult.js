import React, {useState, useEffect} from 'react';
import {useSearchParams, Link} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import Toast from '../components/Toast';

const SearchResult = () => {
    const [searchParams] = useSearchParams();
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [toast, setToast] = useState({show: false, message: '', type: 'success'});
    const {addToCart} = useCart();

    const query = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Fetch search results from API
    const fetchSearchResults = async () => {
        if(!query.trim()) {
            setSearchResults([]);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                q: query,
                page: page,
                page_size: 12
            });

            const response = await fetch(`http://localhost:8000/api/products/search/products/?${params.toString()}`);

            if(response.ok) {
                const data = await response.json();
                setSearchResults(data.results || []);
                setTotalCount(data.count || 0);
                setTotalPages(data.total_pages || 1);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to fetch search results');
            }
        } catch(err) {
            setError('Network error occurred while searching');
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSearchResults();
    }, [query, page]);

    // Star rating renderer
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
                <p>Searching products...</p>
            </div>
        );
    }

    if(error) {
        return (
            <div className="container text-center py-5">
                <div className="alert alert-danger">
                    <i className="fa fa-exclamation-triangle mr-2"></i>
                    {error}
                </div>
                <Link to="/" className="btn btn-primary">Back to Home</Link>
            </div>
        );
    }

    return (
        <>
            <section className="section-content padding-y">
                <div className="container">
                    <div className="row">
                        {/* Empty sidebar to match Home page layout */}
                        <aside className="col-md-3"></aside>

                        {/* Main Content - Same layout as Home page */}
                        <main className="col-md-9">
                            <header className="border-bottom mb-4 pb-3">
                                <div className="form-inline">
                                    <span className="mr-md-auto">
                                        {totalCount} items found for "{query}"
                                    </span>
                                </div>
                            </header>
                            {searchResults.length === 0 ? (
                                <div className="text-center py-5">
                                    <i className="fa fa-search fa-3x text-muted mb-3"></i>
                                    <h4>No products found</h4>
                                    <p className="text-muted">Try searching with different keywords or browse our store.</p>
                                    <Link to="/store" className="btn btn-primary">Browse Store</Link>
                                </div>
                            ) : (
                                <div className="row">
                                    {searchResults.map(product => (
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
                                                            // Determine variant ID - use default variant if product has variants
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

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <nav className="mt-4" aria-label="Page navigation">
                                    <ul className="pagination justify-content-center">
                                        {page > 1 && (
                                            <li className="page-item">
                                                <Link
                                                    className="page-link"
                                                    to={`/search?q=${encodeURIComponent(query)}&page=${page - 1}`}
                                                >
                                                    Previous
                                                </Link>
                                            </li>
                                        )}

                                        {Array.from({length: Math.min(5, totalPages)}, (_, i) => {
                                            const pageNum = Math.max(1, Math.min(totalPages, page - 2 + i));
                                            return (
                                                <li key={pageNum} className={`page-item ${pageNum === page ? 'active' : ''}`}>
                                                    <Link
                                                        className="page-link"
                                                        to={`/search?q=${encodeURIComponent(query)}&page=${pageNum}`}
                                                    >
                                                        {pageNum}
                                                    </Link>
                                                </li>
                                            );
                                        })}

                                        {page < totalPages && (
                                            <li className="page-item">
                                                <Link
                                                    className="page-link"
                                                    to={`/search?q=${encodeURIComponent(query)}&page=${page + 1}`}
                                                >
                                                    Next
                                                </Link>
                                            </li>
                                        )}
                                    </ul>
                                </nav>
                            )}
                        </main>
                    </div>
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

export default SearchResult;
