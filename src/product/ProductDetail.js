import React, {useState, useEffect} from 'react';
import {useParams, Link} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import {useAuth} from '../context/AuthContext';
import Toast from '../components/Toast';

const ProductDetail = () => {
    const {slug} = useParams();
    const {addToCart} = useCart();
    const {user} = useAuth();
    const [selectedColor, setSelectedColor] = useState('Gold');
    const [selectedSize, setSelectedSize] = useState('M');
    const [quantity, setQuantity] = useState(1);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [product, setProduct] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [ratingData, setRatingData] = useState({average_rating: 0, total_reviews: 0});
    const [loading, setLoading] = useState(false);
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        rating: 5,
        title: '',
        comment: ''
    });
    const [toast, setToast] = useState({show: false, message: '', type: 'success'});

    // Fetch product details
    const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:8000/api/products/product-detail/${slug}/`);

            if(response.ok) {
                const data = await response.json();
                setProduct(data.product);
            } else {
                const errorData = await response.json();
                console.error('API Error:', errorData);
                setError('Product not found');
            }
        } catch(error) {
            console.error('Network Error:', error);
            setError('Failed to fetch product');
        } finally {
            setLoading(false);
        }
    };

    // Fetch product reviews
    const fetchReviews = async () => {
        setReviewsLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/products/product-reviews/${slug}/`);

            if(response.ok) {
                const data = await response.json();
                setReviews(data.reviews || []);
                setRatingData({
                    average_rating: data.average_rating || 0,
                    total_reviews: data.total_reviews || 0
                });
            }
        } catch(error) {
            console.error('Failed to fetch reviews:', error);
        } finally {
            setReviewsLoading(false);
        }
    };

    // Submit review
    const submitReview = async (e) => {
        e.preventDefault();
        if(!user) {
            alert('Please login to submit a review');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/products/product-reviews/${slug}/create/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(reviewForm)
            });

            if(response.ok) {
                setReviewForm({rating: 5, title: '', comment: ''});
                setShowReviewForm(false);
                fetchReviews(); // Refresh reviews
                alert('Review submitted successfully!');
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Failed to submit review');
            }
        } catch(error) {
            alert('Network error occurred');
        }
    };

    // Fetch data when component mounts
    useEffect(() => {
        fetchProduct();
        fetchReviews();
    }, [slug]);

    if(loading) {
        return (
            <div className="container text-center py-5">
                <i className="fa fa-spinner fa-spin fa-2x"></i>
                <p>Loading product...</p>
            </div>
        );
    }

    if(error || !product) {
        return (
            <div className="container">
                <div className="text-center">
                    <h2>Product not found</h2>
                    <Link to="/" className="btn btn-primary">Back to Home</Link>
                </div>
            </div>
        );
    }

    const handleAddToCart = async () => {
        // Check stock availability
        const availableStock = selectedVariant ? selectedVariant.quantity : (product?.quantity || 0);
        if(quantity > availableStock) {
            setToast({
                show: true,
                message: `Only ${availableStock} items available in stock`,
                type: 'error'
            });
            return;
        }

        const productToAdd = {
            ...product,
            selectedColor,
            selectedSize,
            quantity,
            selectedVariant,
            // Use variant price if variant is selected, otherwise use product price
            price: selectedVariant ? selectedVariant.price : product.price,
            // Use variant SKU if variant is selected
            sku: selectedVariant ? selectedVariant.sku : product.sku
        };

        const result = await addToCart(productToAdd);

        if(result.success) {
            setToast({
                show: true,
                message: result.message || 'Product added to cart successfully!',
                type: 'success'
            });
        } else {
            setToast({
                show: true,
                message: `Failed to add to cart: ${result.error}`,
                type: 'error'
            });
        }
    };

    // Function to render star rating
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for(let i = 0; i < fullStars; i++) {
            stars.push(<i key={i} className="fa fa-star text-warning"></i>);
        }

        if(hasHalfStar) {
            stars.push(<i key="half" className="fa fa-star-half-o text-warning"></i>);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for(let i = 0; i < emptyStars; i++) {
            stars.push(<i key={`empty-${i}`} className="fa fa-star-o text-muted"></i>);
        }

        return stars;
    };

    const colors = ['Silver', 'Gray', 'Gold', 'Black'];
    const sizes = ['S', 'M', 'L', 'XL'];

    return (
        <>
            <section className="section-content padding-y bg">
                <div className="container">
                    {/* Product Detail Card */}
                    <div className="card">
                        <div className="row no-gutters">
                            <aside className="col-md-6">
                                <article className="gallery-wrap">
                                    {/* Main Image Display */}
                                    <div className="img-big-wrap">
                                        {selectedImage ? (
                                            <img src={selectedImage.image_url} alt={selectedImage.alt_text || product.title} />
                                        ) : product.primary_image ? (
                                            <img src={product.primary_image.image_url} alt={product.title} />
                                        ) : (
                                            <img src="/images/items/1.jpg" alt="Default Product" />
                                        )}
                                    </div>

                                    {/* Image Thumbnails Gallery */}
                                    {product.images && product.images.length > 1 && (
                                        <div className="img-thumbnails-wrap mt-3">
                                            <div className="row">
                                                {product.images.map((image, index) => (
                                                    <div key={image.id} className="col-3 mb-2">
                                                        <div
                                                            className={`img-thumbnail ${selectedImage && selectedImage.id === image.id ? 'active' : (!selectedImage && image.is_primary) ? 'active' : ''}`}
                                                            onClick={() => setSelectedImage(image)}
                                                            style={{cursor: 'pointer'}}
                                                        >
                                                            <img
                                                                src={image.image_url}
                                                                alt={image.alt_text || product.title}
                                                                className="img-fluid"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </article>
                            </aside>
                            <main className="col-md-6 border-left">
                                <article className="content-body">
                                    <h2 className="title">{product.title}</h2>

                                    <div className="mb-3">
                                        <var className="price h4">
                                            ৳{selectedVariant ? selectedVariant.price : product.price}
                                        </var>
                                        {(selectedVariant ? selectedVariant.old_price : product.old_price) && (
                                            <del className="price-old ml-2">
                                                ৳{selectedVariant ? selectedVariant.old_price : product.old_price}
                                            </del>
                                        )}
                                    </div>

                                    <div className="mb-3">
                                        <div className="rating">
                                            {renderStars(ratingData.average_rating || 0)}
                                            <small className="text-muted ml-2">
                                                ({ratingData.average_rating || 0}) ({ratingData.total_reviews || 0} reviews)
                                            </small>
                                        </div>
                                    </div>

                                    <p>{product.description}</p>

                                    <hr />

                                    {/* Product Variants Section */}
                                    {product && product.variants && product.variants.length > 0 && (
                                        <div className="variants-section">
                                            <h6>Available Variants</h6>
                                            <div className="row">
                                                {product.variants.map((variant, index) => (
                                                    <div key={variant.id} className="col-md-6 mb-3">
                                                        <div
                                                            className={`card variant-card ${selectedVariant && selectedVariant.id === variant.id ? 'variant-selected' : ''}`}
                                                            onClick={() => setSelectedVariant(variant)}
                                                            style={{cursor: 'pointer'}}
                                                        >
                                                            <div className="card-body">
                                                                <h6 className="card-title">{variant.title}</h6>
                                                                <p className="card-text">
                                                                    <strong>SKU:</strong> {variant.sku}
                                                                </p>
                                                                <p className="card-text">
                                                                    <strong>Price:</strong> ৳{variant.price}
                                                                    {variant.old_price && (
                                                                        <del className="ml-2 text-muted">৳{variant.old_price}</del>
                                                                    )}
                                                                </p>
                                                                <p className="card-text">
                                                                    <strong>Stock:</strong> {variant.quantity} units
                                                                </p>
                                                                {variant.dynamic_options && variant.dynamic_options.length > 0 && (
                                                                    <div className="variant-options">
                                                                        <strong>Options:</strong>
                                                                        <ul className="list-unstyled mt-1">
                                                                            {variant.dynamic_options.map((option, optIndex) => (
                                                                                <li key={optIndex} className="small">
                                                                                    {option.name}: {option.value}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                {selectedVariant && selectedVariant.id === variant.id && (
                                                                    <div className="variant-selected-indicator">
                                                                        <i className="fa fa-check-circle text-success"></i>
                                                                        <span className="ml-1 small text-success">Selected</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <hr />
                                        </div>
                                    )}

                                    {/* No static color/size selection for products without variants */}
                                    <hr />
                                    <div className="row mb-3">
                                        <div className="col-md-8">
                                            <label>Quantity</label>
                                            <div className="input-group input-spinner">
                                                <div className="input-group-prepend">
                                                    <button
                                                        className="btn btn-light"
                                                        type="button"
                                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                                    >
                                                        <i className="fa fa-minus"></i>
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={quantity}
                                                    onChange={(e) => {
                                                        const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                                                        const availableStock = selectedVariant ? selectedVariant.quantity : (product?.quantity || 0);
                                                        setQuantity(Math.min(newQuantity, availableStock));
                                                    }}
                                                />
                                                <div className="input-group-append">
                                                    <button
                                                        className="btn btn-light"
                                                        type="button"
                                                        onClick={() => {
                                                            const availableStock = selectedVariant ? selectedVariant.quantity : (product?.quantity || 0);
                                                            setQuantity(Math.min(quantity + 1, availableStock));
                                                        }}
                                                    >
                                                        <i className="fa fa-plus"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            {/* Stock information */}
                                            <small className="text-muted">
                                                {selectedVariant ? (
                                                    `${selectedVariant.quantity} items available`
                                                ) : (
                                                    `${product?.quantity || 0} items available`
                                                )}
                                            </small>
                                        </div>
                                        <div className="col-md-4">
                                            {/* Extra space for better layout */}
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-primary"
                                        onClick={handleAddToCart}
                                    >
                                        <span className="text">Add to cart</span>
                                        <i className="fas fa-shopping-cart"></i>
                                    </button>
                                </article>
                            </main>
                        </div>
                    </div>

                    <br />

                    <div className="row">
                        <div className="col-md-9">
                            <header className="section-heading">
                                <h3>Customer Reviews ({ratingData.total_reviews})</h3>
                                {user && (
                                    <button
                                        className="btn btn-primary btn-sm float-right"
                                        onClick={() => setShowReviewForm(!showReviewForm)}
                                    >
                                        {showReviewForm ? 'Cancel' : 'Write Review'}
                                    </button>
                                )}
                            </header>

                            {/* Review Form */}
                            {showReviewForm && user && (
                                <article className="box mb-3">
                                    <h5>Write a Review</h5>
                                    <form onSubmit={submitReview}>
                                        <div className="form-group">
                                            <label>Rating</label>
                                            <div className="rating-input">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <i
                                                        key={star}
                                                        className={`fa fa-star ${star <= reviewForm.rating ? 'text-warning' : 'text-muted'}`}
                                                        style={{cursor: 'pointer', fontSize: '20px'}}
                                                        onClick={() => setReviewForm(prev => ({...prev, rating: star}))}
                                                    ></i>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="form-group">
                                            <label>Title</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                value={reviewForm.title}
                                                onChange={(e) => setReviewForm(prev => ({...prev, title: e.target.value}))}
                                                placeholder="Review title"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Comment</label>
                                            <textarea
                                                className="form-control"
                                                rows="4"
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm(prev => ({...prev, comment: e.target.value}))}
                                                placeholder="Write your review here..."
                                                required
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="btn btn-primary">Submit Review</button>
                                    </form>
                                </article>
                            )}

                            {/* Reviews List */}
                            {reviewsLoading ? (
                                <div className="text-center py-3">
                                    <i className="fa fa-spinner fa-spin"></i>
                                    <p>Loading reviews...</p>
                                </div>
                            ) : reviews.length > 0 ? (
                                reviews.map(review => (
                                    <article key={review.id} className="box mb-3">
                                        <div className="icontext w-100">
                                            <img
                                                src="/images/avatars/avatar1.jpg"
                                                className="img-xs icon rounded-circle"
                                                alt="User"
                                            />
                                            <div className="text">
                                                <span className="date text-muted float-md-right">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                                <h6 className="mb-1">
                                                    {review.user_name}
                                                    {review.is_verified_purchase && (
                                                        <span className="badge badge-success ml-2">Verified Purchase</span>
                                                    )}
                                                </h6>
                                                <div className="rating mb-1">
                                                    {renderStars(review.rating)}
                                                </div>
                                                {review.title && (
                                                    <h6 className="mb-1">{review.title}</h6>
                                                )}
                                            </div>
                                        </div>
                                        <div className="mt-3">
                                            <p>{review.comment}</p>
                                            {review.helpful_count > 0 && (
                                                <small className="text-muted">
                                                    {review.helpful_count} people found this helpful
                                                </small>
                                            )}
                                        </div>
                                    </article>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fa fa-comment-o fa-3x text-muted mb-3"></i>
                                    <h5>No reviews yet</h5>
                                    <p className="text-muted">Be the first to review this product!</p>
                                </div>
                            )}
                        </div>
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

export default ProductDetail;
