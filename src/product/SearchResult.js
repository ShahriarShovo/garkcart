import React, {useState, useEffect} from 'react';
import {useSearchParams, Link} from 'react-router-dom';
import {products} from '../data/products';

const SearchResult = () => {
    const [searchParams] = useSearchParams();
    const [searchResults, setSearchResults] = useState([]);
    const query = searchParams.get('q') || '';

    useEffect(() => {
        if(query) {
            const results = products.filter(product =>
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase())
            );
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [query]);

    return (
        <section className="section-content padding-y bg">
            <div className="container">
                <div className="row">
                    <div className="col-md-12">
                        <header className="section-heading">
                            <h3>Search Results for "{query}"</h3>
                            <p>{searchResults.length} items found</p>
                        </header>

                        {searchResults.length === 0 ? (
                            <div className="text-center">
                                <h4>No products found</h4>
                                <p>Try searching with different keywords or browse our store.</p>
                                <Link to="/store" className="btn btn-primary">Browse Store</Link>
                            </div>
                        ) : (
                            <div className="row">
                                {searchResults.map(product => (
                                    <div key={product.id} className="col-md-4 mb-4">
                                        <figure className="card card-product-grid">
                                            <div className="img-wrap">
                                                <Link to={`/product/${product.id}`}>
                                                    <img src={product.image} alt={product.name} />
                                                </Link>
                                            </div>
                                            <figcaption className="info-wrap">
                                                <div className="fix-height">
                                                    <Link to={`/product/${product.id}`} className="title">
                                                        {product.name}
                                                    </Link>
                                                    <div className="price-wrap mt-2">
                                                        <span className="price">${product.price}</span>
                                                    </div>
                                                </div>
                                                <Link to={`/product/${product.id}`} className="btn btn-block btn-primary">
                                                    View Details
                                                </Link>
                                            </figcaption>
                                        </figure>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SearchResult;
