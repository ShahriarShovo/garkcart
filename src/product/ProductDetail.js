import React, {useState, useEffect} from 'react';
import {useParams, Link} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import {useAuth} from '../context/AuthContext';
import Toast from '../components/Toast';

const ProductDetail = () => {
    const {slug, id} = useParams();
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
    const [purchaseEligibility, setPurchaseEligibility] = useState({
        has_purchased: false,
        has_reviewed: false,
        can_review: false,
        purchase_info: null,
        review_info: null
    });
    const [toast, setToast] = useState({show: false, message: '', type: 'success'});

    // Fetch product details
    const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        try {
            // Use slug if available, otherwise use id
            const identifier = slug || id;
            const response = await fetch(`http://localhost:8000/api/products/product-detail/${identifier}/`);

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

    // Check purchase eligibility
    const checkPurchaseEligibility = async () => {
        if(!user) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/products/purchase-verification/${slug}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });
            
            if(response.ok) {
                const data = await response.json();
                setPurchaseEligibility({
                    has_purchased: data.has_purchased || false,
                    has_reviewed: data.has_reviewed || false,
                    can_review: data.can_review || false,
                    purchase_info: data.purchase_info,
                    review_info: data.review_info
                });
            }
        } catch(error) {
            console.error('Error checking purchase eligibility:', error);
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
        if(slug || id) {
            fetchProduct();
            fetchReviews();
            checkPurchaseEligibility();
        }
    }, [slug, id]);

    // Check purchase eligibility when user changes
    useEffect(() => {
        if(user && (slug || id)) {
            checkPurchaseEligibility();
        }
    }, [user, slug, id]);

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
        let availableStock;
        if (selectedVariant) {
            availableStock = selectedVariant.quantity;
        } else if (product.product_type === 'variable' && product.default_variant) {
            availableStock = product.default_variant.quantity;
        } else if (product.product_type === 'variable' && product.variants && product.variants.length > 0) {
            availableStock = product.variants[0].quantity;
        } else {
            availableStock = product?.quantity || 0;
        }
        
        if(quantity > availableStock) {
            setToast({
                show: true,
                message: `Only ${availableStock} items available in stock`,
                type: 'error'
            });
            return;
        }

        // For variable products without selected variant, use default variant or first variant
        let finalSelectedVariant = selectedVariant;
        
        if (product.product_type === 'variable' && !selectedVariant) {
            if (product.default_variant) {
                finalSelectedVariant = product.default_variant;
            } else if (product.variants && product.variants.length > 0) {
                finalSelectedVariant = product.variants[0];
            }
        }

        const productToAdd = {
            ...product,
            selectedColor,
            selectedSize,
            quantity,
            selectedVariant: finalSelectedVariant,
            // Use variant price if variant is selected, otherwise use display price for variable products
            price: finalSelectedVariant ? finalSelectedVariant.price : (product.display_price || product.price),
            // Use variant SKU if variant is selected
            sku: finalSelectedVariant ? finalSelectedVariant.sku : product.sku
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
        const numRating = parseFloat(rating) || 0;
        const fullStars = Math.floor(numRating);
        const hasHalfStar = numRating % 1 !== 0;

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
                                            ৳{(() => {
                                                const unitPrice = selectedVariant ? selectedVariant.price : (product.display_price || product.price);
                                                const numUnitPrice = parseFloat(unitPrice) || 0;
                                                const numQuantity = parseInt(quantity) || 1;
                                                const totalPrice = numUnitPrice * numQuantity;
                                                return totalPrice.toFixed(2);
                                            })()}
                                        </var>
                                        {(() => {
                                            const unitOldPrice = selectedVariant ? selectedVariant.old_price : (product.display_old_price || product.old_price);
                                            return unitOldPrice && unitOldPrice > 0;
                                        })() && (
                                            <del className="price-old ml-2">
                                                ৳{(() => {
                                                    const unitOldPrice = selectedVariant ? selectedVariant.old_price : (product.display_old_price || product.old_price);
                                                    const numUnitOldPrice = parseFloat(unitOldPrice) || 0;
                                                    const numQuantity = parseInt(quantity) || 1;
                                                    const totalOldPrice = numUnitOldPrice * numQuantity;
                                                    return totalOldPrice.toFixed(2);
                                                })()}
                                            </del>
                                        )}
                                        {/* Show out of stock message for variable products */}
                                        {product.product_type === 'variable' && !selectedVariant && !product.default_variant_in_stock && (
                                            <div className="text-danger mt-2">
                                                <small>Out of Stock</small>
                                            </div>
                                        )}
                                        
                                        {/* Show unit price when quantity > 1 */}
                                        {quantity > 1 && (
                                            <div className="mt-1">
                                                <small className="text-muted">
                                                    Unit price: ৳{(() => {
                                                        const unitPrice = selectedVariant ? selectedVariant.price : (product.display_price || product.price);
                                                        const numUnitPrice = parseFloat(unitPrice) || 0;
                                                        return numUnitPrice.toFixed(2);
                                                    })()}
                                                </small>
                                            </div>
                                        )}
                                        
                                        {/* Stock Availability Display - Below Price */}
                                        <div className="mt-2">
                                            <small className="text-muted">
                                                {selectedVariant ? (
                                                    `${selectedVariant.quantity} items available`
                                                ) : product.product_type === 'variable' ? (
                                                    // For variable products, show default variant stock
                                                    product.default_variant ? (
                                                        `${product.default_variant.quantity} items available`
                                                    ) : (
                                                        // Fallback to first variant if no default set
                                                        product.variants && product.variants.length > 0 ? (
                                                            `${product.variants[0].quantity} items available`
                                                        ) : (
                                                            "Out of Stock"
                                                        )
                                                    )
                                                ) : (
                                                    // For simple products, show product stock
                                                    `${product?.quantity || 0} items available`
                                                )}
                                            </small>
                                        </div>
                                    </div>


                                    <div className="mb-3">
                                        <div className="rating">
                                            {renderStars(ratingData.average_rating || 0)}
                                            <small className="text-muted ml-2">
                                                ({(parseFloat(ratingData.average_rating) || 0).toFixed(1)}) ({ratingData.total_reviews || 0} reviews)
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
                                                            onClick={() => {
                                                                console.log('Variant selected:', variant);
                                                                console.log('Current quantity before selection:', quantity);
                                                                setSelectedVariant(variant);
                                                                // Reset quantity to 1 when variant is selected
                                                                setQuantity(1);
                                                                console.log('Quantity reset to 1');
                                                            }}
                                                            style={{cursor: 'pointer'}}
                                                        >
                                                            <div className="card-body">
                                                                <h6 className="card-title">{variant.title}</h6>
                                                                <p className="card-text">
                                                                    <strong>SKU:</strong> {variant.sku}
                                                                </p>
                                                                <p className="card-text">
                                                                    <strong>Price:</strong> ৳{(parseFloat(variant.price) || 0).toFixed(2)}
                                                                    {variant.old_price && (
                                                                        <del className="ml-2 text-muted">৳{(parseFloat(variant.old_price) || 0).toFixed(2)}</del>
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
                                                        onClick={() => {
                                                            console.log('Quantity decrease clicked. Current quantity:', quantity);
                                                            const newQuantity = Math.max(1, quantity - 1);
                                                            console.log('New quantity:', newQuantity);
                                                            setQuantity(newQuantity);
                                                        }}
                                                    >
                                                        <i className="fa fa-minus"></i>
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    value={quantity}
                                                    onChange={(e) => {
                                                        console.log('Quantity input changed. Value:', e.target.value);
                                                        const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                                                        const availableStock = selectedVariant ? selectedVariant.quantity : (
                                                            product.product_type === 'variable' ? (
                                                                product.default_variant ? product.default_variant.quantity : 
                                                                (product.variants && product.variants.length > 0 ? product.variants[0].quantity : 0)
                                                            ) : (product?.quantity || 0)
                                                        );
                                                        console.log('Available stock:', availableStock);
                                                        const finalQuantity = Math.min(newQuantity, availableStock);
                                                        console.log('Final quantity:', finalQuantity);
                                                        setQuantity(finalQuantity);
                                                    }}
                                                />
                                                <div className="input-group-append">
                                                    <button
                                                        className="btn btn-light"
                                                        type="button"
                                                        onClick={() => {
                                                            console.log('Quantity increase clicked. Current quantity:', quantity);
                                                            console.log('Product type:', product.product_type);
                                                            console.log('Selected variant:', selectedVariant);
                                                            console.log('Default variant:', product.default_variant);
                                                            const availableStock = selectedVariant ? selectedVariant.quantity : (
                                                                product.product_type === 'variable' ? (
                                                                    product.default_variant ? product.default_variant.quantity : 
                                                                    (product.variants && product.variants.length > 0 ? product.variants[0].quantity : 0)
                                                                ) : (product?.quantity || 0)
                                                            );
                                                            console.log('Available stock:', availableStock);
                                                            const newQuantity = Math.min(quantity + 1, availableStock);
                                                            console.log('New quantity:', newQuantity);
                                                            setQuantity(newQuantity);
                                                        }}
                                                    >
                                                        <i className="fa fa-plus"></i>
                                                    </button>
                                                </div>
                                            </div>
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
                                    <div className="float-right">
                                        {purchaseEligibility.can_review ? (
                                            <button
                                                className="btn btn-primary btn-sm"
                                                onClick={() => setShowReviewForm(!showReviewForm)}
                                            >
                                                {showReviewForm ? 'Cancel' : 'Write Review'}
                                            </button>
                                        ) : purchaseEligibility.has_reviewed ? (
                                            <span className="btn btn-success btn-sm disabled">
                                                <i className="fa fa-check"></i> Review Submitted
                                            </span>
                                        ) : (
                                            <span className="btn btn-secondary btn-sm disabled">
                                                <i className="fa fa-shopping-cart"></i> Purchase Required
                                            </span>
                                        )}
                                    </div>
                                )}
                            </header>

                            {/* Review Form */}
                            {showReviewForm && user && purchaseEligibility.can_review && (
                                <article className="box mb-3">
                                    <h5>Write a Review</h5>
                                    
                                    {/* Purchase Verification Info */}
                                    {purchaseEligibility.purchase_info && (
                                        <div className="alert alert-info">
                                            <i className="fa fa-check-circle"></i>
                                            <strong> Verified Purchase: </strong>
                                            You purchased this product on {new Date(purchaseEligibility.purchase_info.purchase_date).toLocaleDateString()}
                                            {purchaseEligibility.purchase_info.variant_title && (
                                                <span> - {purchaseEligibility.purchase_info.variant_title}</span>
                                            )}
                                        </div>
                                    )}
                                    
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

                            {/* Purchase Required Message */}
                            {user && !purchaseEligibility.has_purchased && (
                                <div className="alert alert-warning">
                                    <i className="fa fa-shopping-cart"></i>
                                    <strong> Purchase Required: </strong>
                                    You need to purchase this product before you can write a review. 
                                    <a href="#product-details" className="ml-2">
                                        <i className="fa fa-arrow-up"></i> Add to Cart
                                    </a>
                                </div>
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
                                                    {renderStars(review.rating || 0)}
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
