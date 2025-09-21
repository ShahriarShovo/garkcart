import React from 'react';
import {Link} from 'react-router-dom';
import {useCart} from '../context/CartContext';

const ProductCard = ({product}) => {
    const {addToCart} = useCart();

    const handleAddToCart = (e) => {
        e.preventDefault();
        addToCart(product);
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
                    <div className="price mt-1">${product.price}</div>
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
