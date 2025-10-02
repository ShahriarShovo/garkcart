/**
 * ProductSorting Component
 * Sorting options for products
 */

import React from 'react';

const ProductSorting = ({ onSortChange, currentSort = { by: 'created_at', order: 'desc' } }) => {
    const sortOptions = [
        { value: 'title', label: 'Product Name', order: 'asc' },
        { value: 'title', label: 'Product Name', order: 'desc' },
        { value: 'price', label: 'Price', order: 'asc' },
        { value: 'price', label: 'Price', order: 'desc' },
        { value: 'created_at', label: 'Date Created', order: 'desc' },
        { value: 'created_at', label: 'Date Created', order: 'asc' },
        { value: 'updated_at', label: 'Last Updated', order: 'desc' },
        { value: 'updated_at', label: 'Last Updated', order: 'asc' },
        { value: 'quantity', label: 'Stock Quantity', order: 'desc' },
        { value: 'quantity', label: 'Stock Quantity', order: 'asc' }
    ];

    const handleSortChange = (e) => {
        const value = e.target.value;
        console.log('🔍 Selected value:', value);
        
        // Split by last underscore to handle fields like 'updated_at'
        const lastUnderscoreIndex = value.lastIndexOf('_');
        const sortBy = value.substring(0, lastUnderscoreIndex);
        const sortOrder = value.substring(lastUnderscoreIndex + 1);
        
        console.log('🔍 Parsed sortBy:', sortBy);
        console.log('🔍 Parsed sortOrder:', sortOrder);
        
        onSortChange({ by: sortBy, order: sortOrder });
    };

    const getCurrentValue = () => {
        console.log('🔍 ProductSorting - getCurrentValue called');
        console.log('🔍 currentSort prop:', currentSort);
        
        if (!currentSort || !currentSort.by || !currentSort.order) {
            console.log('🔍 Using default fallback: created_at_desc');
            return 'created_at_desc'; // Default fallback
        }
        
        const value = `${currentSort.by}_${currentSort.order}`;
        console.log('🔍 Generated value:', value);
        return value;
    };

    return (
        <div className="d-flex align-items-center">
            <label className="form-label mb-0 mr-2">
                <i className="fa fa-sort mr-1"></i>
                Sort by:
            </label>
            <select
                className="form-control form-control-sm"
                style={{ width: '200px' }}
                value={getCurrentValue()}
                onChange={handleSortChange}
            >
                {sortOptions.map((option, index) => {
                    let orderLabel = '';
                    if (option.value === 'title') {
                        orderLabel = option.order === 'asc' ? 'A-Z' : 'Z-A';
                    } else if (option.value === 'price') {
                        orderLabel = option.order === 'asc' ? 'Low to High' : 'High to Low';
                    } else if (option.value === 'created_at') {
                        orderLabel = option.order === 'asc' ? 'Oldest First' : 'Newest First';
                    } else if (option.value === 'updated_at') {
                        orderLabel = option.order === 'asc' ? 'Oldest First' : 'Newest First';
                    } else if (option.value === 'quantity') {
                        orderLabel = option.order === 'asc' ? 'Low to High' : 'High to Low';
                    } else {
                        orderLabel = option.order === 'asc' ? 'A-Z' : 'Z-A';
                    }
                    
                    return (
                        <option key={index} value={`${option.value}_${option.order}`}>
                            {option.label} ({orderLabel})
                        </option>
                    );
                })}
            </select>
        </div>
    );
};

export default ProductSorting;
