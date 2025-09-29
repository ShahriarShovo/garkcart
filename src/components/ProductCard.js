import React from 'react';
import {Link} from 'react-router-dom';
import {useCart} from '../context/CartContext';

const ProductCard = ({product}) => {
    const {addToCart} = useCart();

    const handleAddToCart = async (e) => {
        e.preventDefault();
        const result = await addToCart(product);
        
        if(result && result.requiresAuth) {
            // Show login message for anonymous users
            alert('Please login or sign up to add items to cart');
        }
    };

    const renderRating = () => {
        const ratingValue = Number(product?.rating) || 0; // default 0 when no rating
        const stars = [];
        for(let i = 1; i <= 5; i++) {
            if(i <= Math.floor(ratingValue)) {
                stars.push(<i key={i} className="fa fa-star"></i>);
            } else {
                stars.push(<i key={i} className="fa fa-star-o"></i>);
            }
        }
        return (
            <div className="rating">
                {stars}
                {product?.review_count !== undefined && (
                    <small>({product.review_count})</small>
                )}
            </div>
        );
    };

    return (
        <div className="col-md-3">
            <div className="card card-product-grid">
                <Link to={`/product/${product.id}`} className="img-wrap">
                    <img src={product.image} alt={product.name} />
                </Link>
                <figcaption className="info-wrap">
                    <Link to={`/product/${product.id}`} className="title">
                        {product.name}
                    </Link>
                    {renderRating()}
                    <div className="price mt-1">৳{product.price}</div>
                    <button
                        className="btn btn-primary btn-sm mt-2"
                        onClick={handleAddToCart}
                    >
                        Add to Cart
                    </button>
                </figcaption>
            </div>
        </div>
    );
};

export default ProductCard;
