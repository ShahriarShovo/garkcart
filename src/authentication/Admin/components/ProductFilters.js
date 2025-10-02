/**
 * ProductFilters Component
 * Advanced filtering options for products
 */

import React, { useState, useEffect } from 'react';
import API_CONFIG from '../../../config/apiConfig';

const ProductFilters = ({ onFiltersChange, appliedFilters = {} }) => {
    const [filters, setFilters] = useState({
        category: appliedFilters.category || '',
        status: appliedFilters.status || 'all',
        min_price: appliedFilters.min_price || '',
        max_price: appliedFilters.max_price || '',
        featured: appliedFilters.featured || 'all',
        in_stock: appliedFilters.in_stock || 'all'
    });

    const [filterOptions, setFilterOptions] = useState({
        categories: [],
        statuses: [],
        price_range: { min: 0, max: 0 },
        featured: [],
        stock: []
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Fetch filter options from backend
    const fetchFilterOptions = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/products/search/filter-options/`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setFilterOptions(data);
            }
        } catch (error) {
            console.error('Error fetching filter options:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Load filter options on mount
    useEffect(() => {
        fetchFilterOptions();
    }, []);

    // Handle filter change
    const handleFilterChange = (filterType, value) => {
        const newFilters = { ...filters, [filterType]: value };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    // Handle clear all filters
    const handleClearFilters = () => {
        const clearedFilters = {
            category: '',
            status: 'all',
            min_price: '',
            max_price: '',
            featured: 'all',
            in_stock: 'all'
        };
        setFilters(clearedFilters);
        onFiltersChange(clearedFilters);
    };

    // Check if any filters are applied
    const hasActiveFilters = Object.values(filters).some(value => 
        value && value !== '' && value !== 'all'
    );

    return (
        <div className="card mb-3">
            <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                    <button
                        className="btn btn-link p-0"
                        onClick={() => setIsExpanded(!isExpanded)}
                        style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                    >
                        <i className={`icon-control fa ${isExpanded ? 'fa-chevron-down' : 'fa-chevron-right'}`}></i>
                        <h6 className="title mb-0">Filters</h6>
                        {hasActiveFilters && (
                            <span className="badge badge-primary ml-2">Active</span>
                        )}
                    </button>
                    {hasActiveFilters && (
                        <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={handleClearFilters}
                        >
                            Clear All
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="card-body">
                    {isLoading ? (
                        <div className="text-center py-3">
                            <i className="fa fa-spinner fa-spin"></i>
                            <small className="ml-2">Loading filters...</small>
                        </div>
                    ) : (
                        <div className="row">
                            {/* Category Filter */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Category</label>
                                <select
                                    className="form-control form-control-sm"
                                    value={filters.category}
                                    onChange={(e) => handleFilterChange('category', e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {filterOptions.categories.map((cat, index) => (
                                        <option key={index} value={cat.value}>
                                            {cat.label} ({cat.count})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Status</label>
                                <select
                                    className="form-control form-control-sm"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    {filterOptions.statuses.map((status, index) => (
                                        <option key={index} value={status.value}>
                                            {status.label} ({status.count})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Range Filter */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Min Price</label>
                                <div className="input-group input-group-sm">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">৳</span>
                                    </div>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="0"
                                        value={filters.min_price}
                                        onChange={(e) => handleFilterChange('min_price', e.target.value)}
                                        min="0"
                                        max={filterOptions.price_range.max}
                                    />
                                </div>
                            </div>

                            <div className="col-md-6 mb-3">
                                <label className="form-label">Max Price</label>
                                <div className="input-group input-group-sm">
                                    <div className="input-group-prepend">
                                        <span className="input-group-text">৳</span>
                                    </div>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder={filterOptions.price_range.max}
                                        value={filters.max_price}
                                        onChange={(e) => handleFilterChange('max_price', e.target.value)}
                                        min="0"
                                        max={filterOptions.price_range.max}
                                    />
                                </div>
                            </div>

                            {/* Featured Filter */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Featured</label>
                                <select
                                    className="form-control form-control-sm"
                                    value={filters.featured}
                                    onChange={(e) => handleFilterChange('featured', e.target.value)}
                                >
                                    <option value="all">All Products</option>
                                    {filterOptions.featured.map((option, index) => (
                                        <option key={index} value={option.value}>
                                            {option.label} ({option.count})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Stock Filter */}
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Stock</label>
                                <select
                                    className="form-control form-control-sm"
                                    value={filters.in_stock}
                                    onChange={(e) => handleFilterChange('in_stock', e.target.value)}
                                >
                                    <option value="all">All Stock</option>
                                    {filterOptions.stock.map((option, index) => (
                                        <option key={index} value={option.value}>
                                            {option.label} ({option.count})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductFilters;
