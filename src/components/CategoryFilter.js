import React, {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import API_CONFIG from '../config/apiConfig';

const CategoryFilter = ({onCategoryChange, onSubcategoryChange}) => {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState({});
    const [hoveredCategory, setHoveredCategory] = useState(null);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [categoriesExpanded, setCategoriesExpanded] = useState(true);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [modalHoveredCategory, setModalHoveredCategory] = useState(null);

    // Fetch categories from API
    const fetchCategories = async () => {
        setCategoriesLoading(true);
        try {
            const response = await fetch(API_CONFIG.getFullUrl('PRODUCTS', 'CATEGORIES'));
            if(response.ok) {
                const data = await response.json();
                setCategories(data.results || data || []);
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
            const response = await fetch(`${API_CONFIG.BASE_URL}/api/products/category/${categorySlug}/subcategories/`);
            if(response.ok) {
                const data = await response.json();
                setSubcategories(prev => ({
                    ...prev,
                    [categorySlug]: data.subcategories || []
                }));
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

    // Handle modal category hover
    const handleModalCategoryHover = (category) => {
        setModalHoveredCategory(category);
        if(category.slug && !subcategories[category.slug]) {
            fetchSubcategories(category.slug);
        }
    };

    // Handle modal category mouse leave
    const handleModalCategoryLeave = () => {
        setModalHoveredCategory(null);
    };

    // Fetch categories when component mounts
    useEffect(() => {
        fetchCategories();
    }, []);

    return (
        <>
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
                                            <button
                                                type="button"
                                                className="btn btn-link p-0"
                                                onClick={() => setShowCategoryModal(true)}
                                                style={{color: '#007bff', textDecoration: 'none'}}
                                            >
                                                <strong>More...</strong>
                                            </button>
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </article>

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1" role="dialog" aria-labelledby="categoryModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="categoryModalLabel">All Categories</h5>
                                <button type="button" className="close" onClick={() => setShowCategoryModal(false)} aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    {categories.map(category => (
                                        <div key={category.id} className="col-md-4 mb-3">
                                            <div
                                                className="card h-100 position-relative"
                                                style={{cursor: 'pointer', border: '1px solid #e0e0e0', borderRadius: '8px'}}
                                                onMouseEnter={() => handleModalCategoryHover(category)}
                                                onMouseLeave={() => handleModalCategoryLeave()}
                                            >
                                                <div className="card-body">
                                                    <h6 className="card-title text-center mb-3" style={{color: '#333', fontWeight: 'bold'}}>
                                                        <Link to={`/category-products?category=${category.slug}`} onClick={() => setShowCategoryModal(false)}>
                                                            {category.name}
                                                        </Link>
                                                    </h6>

                                                    {/* Subcategories in modal */}
                                                    {modalHoveredCategory && modalHoveredCategory.id === category.id &&
                                                        subcategories[category.slug] &&
                                                        subcategories[category.slug].length > 0 && (
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: '100%',
                                                                left: '50%',
                                                                transform: 'translateX(-50%)',
                                                                background: 'white',
                                                                border: 'none',
                                                                borderRadius: '12px',
                                                                boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)',
                                                                zIndex: 1000,
                                                                padding: '15px',
                                                                marginTop: '8px',
                                                                minWidth: '200px',
                                                                backdropFilter: 'blur(10px)',
                                                                border: '1px solid rgba(255,255,255,0.2)',
                                                                animation: 'fadeIn 0.2s ease-in-out'
                                                            }}>
                                                                <div style={{
                                                                    textAlign: 'center',
                                                                    fontWeight: '600',
                                                                    fontSize: '13px',
                                                                    color: '#333',
                                                                    marginBottom: '12px',
                                                                    textTransform: 'uppercase',
                                                                    letterSpacing: '0.5px',
                                                                    borderBottom: '1px solid #f0f0f0',
                                                                    paddingBottom: '8px'
                                                                }}>
                                                                    {category.name}
                                                                </div>
                                                                <div style={{maxHeight: '200px', overflowY: 'auto'}}>
                                                                    {subcategories[category.slug].map((subcategory, index) => (
                                                                        <div key={subcategory.id} style={{marginBottom: '4px'}}>
                                                                            <Link
                                                                                to={`/category-products?category=${category.slug}&subcategory=${subcategory.slug}`}
                                                                                onClick={() => setShowCategoryModal(false)}
                                                                                style={{
                                                                                    display: 'block',
                                                                                    padding: '10px 12px',
                                                                                    color: '#555',
                                                                                    textDecoration: 'none',
                                                                                    borderRadius: '8px',
                                                                                    fontSize: '13px',
                                                                                    transition: 'all 0.3s ease',
                                                                                    border: '1px solid transparent',
                                                                                    position: 'relative',
                                                                                    fontWeight: '500'
                                                                                }}
                                                                                onMouseEnter={(e) => {
                                                                                    e.target.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                                                                                    e.target.style.color = 'white';
                                                                                    e.target.style.border = '1px solid rgba(102, 126, 234, 0.3)';
                                                                                    e.target.style.transform = 'translateX(4px)';
                                                                                    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
                                                                                }}
                                                                                onMouseLeave={(e) => {
                                                                                    e.target.style.background = 'transparent';
                                                                                    e.target.style.color = '#555';
                                                                                    e.target.style.border = '1px solid transparent';
                                                                                    e.target.style.transform = 'translateX(0)';
                                                                                    e.target.style.boxShadow = 'none';
                                                                                }}
                                                                            >
                                                                                <div style={{
                                                                                    display: 'flex',
                                                                                    alignItems: 'center',
                                                                                    justifyContent: 'space-between'
                                                                                }}>
                                                                                    <span>{subcategory.name}</span>
                                                                                    <i className="fa fa-arrow-right" style={{
                                                                                        fontSize: '10px',
                                                                                        opacity: '0.7',
                                                                                        transition: 'all 0.2s ease'
                                                                                    }}></i>
                                                                                </div>
                                                                            </Link>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div style={{
                                                                    marginTop: '8px',
                                                                    paddingTop: '8px',
                                                                    borderTop: '1px solid #f0f0f0'
                                                                }}>
                                                                    <Link
                                                                        to={`/category-products?category=${category.slug}`}
                                                                        onClick={() => setShowCategoryModal(false)}
                                                                        style={{
                                                                            display: 'block',
                                                                            padding: '8px 12px',
                                                                            color: '#007bff',
                                                                            textDecoration: 'none',
                                                                            borderRadius: '6px',
                                                                            fontSize: '12px',
                                                                            fontWeight: '600',
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
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CategoryFilter;
