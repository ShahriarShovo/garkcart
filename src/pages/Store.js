import React, {useState} from 'react';
import {Link} from 'react-router-dom';
import {useCart} from '../context/CartContext';

const Store = () => {
    const [priceRange, setPriceRange] = useState({min: 0, max: 2000});
    const [categoriesExpanded, setCategoriesExpanded] = useState(true);
    const [sizesExpanded, setSizesExpanded] = useState(true);
    const [priceExpanded, setPriceExpanded] = useState(true);
    const {addToCart} = useCart();

    // Function to render star rating
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;

        for(let i = 0; i < fullStars; i++) {
            stars.push(<i key={i} className="fa fa-star text-dark"></i>);
        }

        if(hasHalfStar) {
            stars.push(<i key="half" className="fa fa-star-half-o text-dark"></i>);
        }

        const emptyStars = 5 - Math.ceil(rating);
        for(let i = 0; i < emptyStars; i++) {
            stars.push(<i key={`empty-${i}`} className="fa fa-star-o text-muted"></i>);
        }

        return stars;
    };

    return (
        <div>
            {/* Banner Section from index.html */}
            <section className="section-intro padding-y-sm">
                <div className="container">
                    <div className="intro-banner-wrap">
                        <img src="/images/banners/1.jpg" className="img-fluid rounded" alt="Banner" />
                    </div>
                </div>
            </section>


            {/* Store Content */}
            <section className="section-content padding-y">
                <div className="container">
                    <div className="row">
                        {/* Sidebar Filters */}
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
                                        <div className="filter-content" id="collapse_1">
                                            <div className="card-body">
                                                <ul className="list-menu">
                                                    <li><a href="#">People</a></li>
                                                    <li><a href="#">Watches</a></li>
                                                    <li><a href="#">Cinema</a></li>
                                                    <li><a href="#">Clothes</a></li>
                                                    <li><a href="#">Home items</a></li>
                                                    <li><a href="#">Animals</a></li>
                                                    <li><a href="#">People</a></li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}
                                </article>

                                <article className="filter-group">
                                    <header className="card-header">
                                        <button
                                            className="btn btn-link p-0"
                                            onClick={() => setSizesExpanded(!sizesExpanded)}
                                            style={{border: 'none', background: 'none', width: '100%', textAlign: 'left'}}
                                        >
                                            <i className={`icon-control fa ${sizesExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
                                            <h6 className="title">Sizes</h6>
                                        </button>
                                    </header>
                                    {sizesExpanded && (
                                        <div className="filter-content" id="collapse_4">
                                            <div className="card-body">
                                                <label className="checkbox-btn">
                                                    <input type="checkbox" />
                                                    <span className="btn btn-light">XS</span>
                                                </label>
                                                <label className="checkbox-btn">
                                                    <input type="checkbox" />
                                                    <span className="btn btn-light">SM</span>
                                                </label>
                                                <label className="checkbox-btn">
                                                    <input type="checkbox" />
                                                    <span className="btn btn-light">LG</span>
                                                </label>
                                                <label className="checkbox-btn">
                                                    <input type="checkbox" />
                                                    <span className="btn btn-light">XXL</span>
                                                </label>
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
                                    <span className="mr-md-auto">32 Items found</span>
                                </div>
                            </header>

                            <div className="row">
                                <div className="col-md-4">
                                    <figure className="card card-product-grid">
                                        <div className="img-wrap">
                                            <img src="/images/items/1.jpg" alt="Product" />
                                        </div>
                                        <figcaption className="info-wrap">
                                            <div className="fix-height">
                                                <Link to="/product/1" className="title">Great item name goes here</Link>
                                                <div className="price-wrap mt-2">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <span className="price">$1280</span>
                                                            <del className="price-old">$1980</del>
                                                        </div>
                                                        <div className="rating">
                                                            {renderStars(4.5)}
                                                            <small className="text-muted ml-1">(4.5)</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-block btn-success"
                                                onClick={() => addToCart({
                                                    id: 1,
                                                    name: "Great item name goes here",
                                                    price: 1280,
                                                    image: "/images/items/1.jpg",
                                                    category: "Electronics"
                                                })}
                                            >
                                                Added to cart
                                            </button>
                                        </figcaption>
                                    </figure>
                                </div>

                                <div className="col-md-4">
                                    <figure className="card card-product-grid">
                                        <div className="img-wrap">
                                            <img src="/images/items/2.jpg" alt="Product" />
                                        </div>
                                        <figcaption className="info-wrap">
                                            <div className="fix-height">
                                                <Link to="/product/2" className="title">Product name goes here just for demo item</Link>
                                                <div className="price-wrap mt-2">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <span className="price">$1280</span>
                                                        </div>
                                                        <div className="rating">
                                                            {renderStars(3.5)}
                                                            <small className="text-muted ml-1">(3.5)</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-block btn-primary"
                                                onClick={() => addToCart({
                                                    id: 2,
                                                    name: "Product name goes here just for demo item",
                                                    price: 1280,
                                                    image: "/images/items/2.jpg",
                                                    category: "Electronics"
                                                })}
                                            >
                                                Add to cart
                                            </button>
                                        </figcaption>
                                    </figure>
                                </div>

                                <div className="col-md-4">
                                    <figure className="card card-product-grid">
                                        <div className="img-wrap">
                                            <img src="/images/items/3.jpg" alt="Product" />
                                        </div>
                                        <figcaption className="info-wrap">
                                            <div className="fix-height">
                                                <Link to="/product/3" className="title">Product name goes here just for demo item</Link>
                                                <div className="price-wrap mt-2">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <span className="price">$1280</span>
                                                        </div>
                                                        <div className="rating">
                                                            {renderStars(3.5)}
                                                            <small className="text-muted ml-1">(3.5)</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-block btn-primary"
                                                onClick={() => addToCart({
                                                    id: 2,
                                                    name: "Product name goes here just for demo item",
                                                    price: 1280,
                                                    image: "/images/items/2.jpg",
                                                    category: "Electronics"
                                                })}
                                            >
                                                Add to cart
                                            </button>
                                        </figcaption>
                                    </figure>
                                </div>

                                <div className="col-md-4">
                                    <figure className="card card-product-grid">
                                        <div className="img-wrap">
                                            <img src="/images/items/4.jpg" alt="Product" />
                                        </div>
                                        <figcaption className="info-wrap">
                                            <div className="fix-height">
                                                <Link to="/product/4" className="title">Product name goes here just for demo item</Link>
                                                <div className="price-wrap mt-2">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <span className="price">$1280</span>
                                                        </div>
                                                        <div className="rating">
                                                            {renderStars(3.5)}
                                                            <small className="text-muted ml-1">(3.5)</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-block btn-primary"
                                                onClick={() => addToCart({
                                                    id: 2,
                                                    name: "Product name goes here just for demo item",
                                                    price: 1280,
                                                    image: "/images/items/2.jpg",
                                                    category: "Electronics"
                                                })}
                                            >
                                                Add to cart
                                            </button>
                                        </figcaption>
                                    </figure>
                                </div>

                                <div className="col-md-4">
                                    <figure className="card card-product-grid">
                                        <div className="img-wrap">
                                            <img src="/images/items/5.jpg" alt="Product" />
                                        </div>
                                        <figcaption className="info-wrap">
                                            <div className="fix-height">
                                                <Link to="/product/5" className="title">Product name goes here just for demo item</Link>
                                                <div className="price-wrap mt-2">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <span className="price">$1280</span>
                                                        </div>
                                                        <div className="rating">
                                                            {renderStars(3.5)}
                                                            <small className="text-muted ml-1">(3.5)</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-block btn-primary"
                                                onClick={() => addToCart({
                                                    id: 2,
                                                    name: "Product name goes here just for demo item",
                                                    price: 1280,
                                                    image: "/images/items/2.jpg",
                                                    category: "Electronics"
                                                })}
                                            >
                                                Add to cart
                                            </button>
                                        </figcaption>
                                    </figure>
                                </div>

                                <div className="col-md-4">
                                    <figure className="card card-product-grid">
                                        <div className="img-wrap">
                                            <img src="/images/items/6.jpg" alt="Product" />
                                        </div>
                                        <figcaption className="info-wrap">
                                            <div className="fix-height">
                                                <Link to="/product/6" className="title">Product name goes here just for demo item</Link>
                                                <div className="price-wrap mt-2">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <span className="price">$1280</span>
                                                        </div>
                                                        <div className="rating">
                                                            {renderStars(3.5)}
                                                            <small className="text-muted ml-1">(3.5)</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-block btn-primary"
                                                onClick={() => addToCart({
                                                    id: 2,
                                                    name: "Product name goes here just for demo item",
                                                    price: 1280,
                                                    image: "/images/items/2.jpg",
                                                    category: "Electronics"
                                                })}
                                            >
                                                Add to cart
                                            </button>
                                        </figcaption>
                                    </figure>
                                </div>

                                <div className="col-md-4">
                                    <figure className="card card-product-grid">
                                        <div className="img-wrap">
                                            <img src="/images/items/7.jpg" alt="Product" />
                                        </div>
                                        <figcaption className="info-wrap">
                                            <div className="fix-height">
                                                <Link to="/product/7" className="title">Product name goes here just for demo item</Link>
                                                <div className="price-wrap mt-2">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <span className="price">$1280</span>
                                                        </div>
                                                        <div className="rating">
                                                            {renderStars(3.5)}
                                                            <small className="text-muted ml-1">(3.5)</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-block btn-primary"
                                                onClick={() => addToCart({
                                                    id: 2,
                                                    name: "Product name goes here just for demo item",
                                                    price: 1280,
                                                    image: "/images/items/2.jpg",
                                                    category: "Electronics"
                                                })}
                                            >
                                                Add to cart
                                            </button>
                                        </figcaption>
                                    </figure>
                                </div>

                                <div className="col-md-4">
                                    <figure className="card card-product-grid">
                                        <div className="img-wrap">
                                            <img src="/images/items/1.jpg" alt="Product" />
                                        </div>
                                        <figcaption className="info-wrap">
                                            <div className="fix-height">
                                                <Link to="/product/8" className="title">Product name goes here just for demo item</Link>
                                                <div className="price-wrap mt-2">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <span className="price">$1280</span>
                                                        </div>
                                                        <div className="rating">
                                                            {renderStars(3.5)}
                                                            <small className="text-muted ml-1">(3.5)</small>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                className="btn btn-block btn-primary"
                                                onClick={() => addToCart({
                                                    id: 2,
                                                    name: "Product name goes here just for demo item",
                                                    price: 1280,
                                                    image: "/images/items/2.jpg",
                                                    category: "Electronics"
                                                })}
                                            >
                                                Add to cart
                                            </button>
                                        </figcaption>
                                    </figure>
                                </div>
                            </div>

                            {/* Pagination */}
                            <nav className="mt-4" aria-label="Page navigation sample">
                                <ul className="pagination">
                                    <li className="page-item disabled">
                                        <a className="page-link" href="#">Previous</a>
                                    </li>
                                    <li className="page-item active">
                                        <a className="page-link" href="#">1</a>
                                    </li>
                                    <li className="page-item">
                                        <a className="page-link" href="#">2</a>
                                    </li>
                                    <li className="page-item">
                                        <a className="page-link" href="#">3</a>
                                    </li>
                                    <li className="page-item">
                                        <a className="page-link" href="#">Next</a>
                                    </li>
                                </ul>
                            </nav>
                        </main>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Store;
