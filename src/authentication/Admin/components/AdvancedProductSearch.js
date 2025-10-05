/**
 * AdvancedProductSearch Component
 * Complete search system with search, filters, and sorting
 */

import React from 'react';
import ProductSearch from './ProductSearch';
import ProductFilters from './ProductFilters';
import ProductSorting from './ProductSorting';
import Pagination from '../../../components/Pagination';
import useProductSearch from '../hooks/useProductSearch';
import API_CONFIG from '../../../config/apiConfig';

const AdvancedProductSearch = ({ onSearchResults, onSearchClear }) => {
    const {
        searchResults,
        isLoading,
        error,
        pagination,
        appliedFilters,
        handleSearch,
        handleFiltersChange,
        handleSortChange,
        handlePageChange,
        clearSearch,
        searchParams
    } = useProductSearch();

    // Pass results to parent component
    React.useEffect(() => {
        if (onSearchResults) {
            onSearchResults({
                results: searchResults,
                isLoading,
                error,
                pagination,
                appliedFilters
            });
        }
    }, [searchResults, isLoading, error, pagination, appliedFilters]);

    // Handle clear search
    const handleClearSearch = () => {
        clearSearch();
        if (onSearchClear) {
            onSearchClear();
        }
    };

    return (
        <div className="mb-4">
            {/* Search Bar */}
            <div className="row mb-3">
                <div className="col-md-6">
                    <ProductSearch
                        onSearch={handleSearch}
                        onClear={handleClearSearch}
                        placeholder="Search products by name, category, or SKU..."
                    />
                </div>
                <div className="col-md-6">
                    {console.log('🔍 AdvancedProductSearch - searchParams:', searchParams)}
                    <ProductSorting
                        onSortChange={handleSortChange}
                        currentSort={{
                            by: searchParams.sort_by,
                            order: searchParams.sort_order
                        }}
                    />
                </div>
            </div>

            {/* Filters */}
            <ProductFilters
                onFiltersChange={handleFiltersChange}
                appliedFilters={appliedFilters}
            />

            {/* Search Status */}
            {appliedFilters && Object.keys(appliedFilters).length > 0 && (
                <div className="alert alert-info">
                    <i className="fa fa-info-circle mr-2"></i>
                    <strong>Active Filters:</strong>
                    {Object.entries(appliedFilters).map(([key, value]) => (
                        <span key={key} className="badge badge-primary ml-2">
                            {key}: {value}
                        </span>
                    ))}
                    <button
                        className="btn btn-sm btn-outline-secondary ml-2"
                        onClick={clearSearch}
                    >
                        Clear All
                    </button>
                </div>
            )}

            {/* Loading State */}
            {isLoading && (
                <div className="text-center py-3">
                    <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                    <p className="mt-2">Searching products...</p>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="alert alert-danger">
                    <i className="fa fa-exclamation-triangle mr-2"></i>
                    {error}
                </div>
            )}

            {/* Search Results */}
            {!isLoading && !error && searchResults.length > 0 && (
                <div className="table-responsive">
                    <table className="table table-hover">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {searchResults.map((product) => (
                                <tr key={product.id}>
                                    <td>
                                        {product.primary_image_url ? (
                                            <img
                                                src={product.primary_image_url.startsWith('http') ? product.primary_image_url : `${API_CONFIG.BASE_URL}${product.primary_image_url}`}
                                                className="img-xs border"
                                                alt={product.title}
                                                style={{width: '50px', height: '50px', objectFit: 'cover'}}
                                            />
                                        ) : (
                                            <div className="img-xs border d-flex align-items-center justify-content-center bg-light" style={{width: '50px', height: '50px'}}>
                                                <i className="fa fa-image text-muted"></i>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <strong>{product.title}</strong>
                                        <br />
                                        <small className="text-muted">/{product.slug}</small>
                                    </td>
                                    <td>{product.category_name}</td>
                                    <td>৳{product.price}</td>
                                    <td>
                                        {product.quantity > 0 ? (
                                            <span className="badge badge-success">{product.quantity} in stock</span>
                                        ) : (
                                            <span className="badge badge-danger">Out of stock</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`badge ${product.status === 'active' ? 'badge-success' : product.status === 'draft' ? 'badge-warning' : 'badge-secondary'}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td>{new Date(product.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {!isLoading && !error && searchResults.length > 0 && pagination.totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                    <Pagination
                        totalItems={pagination.totalCount}
                        currentPage={pagination.currentPage}
                        pageSize={10}
                        onPageChange={handlePageChange}
                    />
                </div>
            )}

            {/* No Results - Only show when no results and no pagination */}
            {!isLoading && !error && searchResults.length === 0 && pagination.totalPages <= 1 && (
                <div className="text-center py-4">
                    <i className="fa fa-search fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">No Products Found</h5>
                    <p className="text-muted">
                        Try adjusting your search terms or filters to find what you're looking for.
                    </p>
                </div>
            )}
        </div>
    );
};

export default AdvancedProductSearch;
