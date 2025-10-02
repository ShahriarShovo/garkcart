/**
 * useProductSearch Hook
 * Custom hook for managing product search functionality
 */

import { useState, useEffect, useCallback } from 'react';
import API_CONFIG from '../../../config/apiConfig';

const useProductSearch = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrevious: false
    });

    // Search parameters
    const [searchParams, setSearchParams] = useState({
        search: '',
        category: '',
        status: 'all',
        min_price: '',
        max_price: '',
        featured: 'all',
        in_stock: 'all',
        sort_by: 'created_at',
        sort_order: 'desc',
        page: 1,
        page_size: 10
    });

    // Debounced search function
    const debouncedSearch = useCallback(
        (() => {
            let timeoutId;
            return (params) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    performSearch(params);
                }, 300);
            };
        })(),
        []
    );

    // Perform search API call
    const performSearch = async (params) => {
        setIsLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();
            
            // Add all non-empty parameters
            Object.entries(params).forEach(([key, value]) => {
                if (value && value !== '' && value !== 'all') {
                    queryParams.append(key, value);
                }
            });

            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/products/search/?${queryParams.toString()}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.results || []);
                setPagination({
                    currentPage: data.current_page || 1,
                    totalPages: data.total_pages || 1,
                    totalCount: data.total_count || 0,
                    hasNext: data.has_next || false,
                    hasPrevious: data.has_previous || false
                });
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Search failed');
            }
        } catch (err) {
            setError('Network error occurred');
            console.error('Search error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Update search parameters
    const updateSearchParams = (newParams) => {
        const updatedParams = { ...searchParams, ...newParams };
        setSearchParams(updatedParams);
        debouncedSearch(updatedParams);
    };

    // Handle search term change
    const handleSearch = (searchTerm) => {
        updateSearchParams({ search: searchTerm, page: 1 });
    };

    // Handle filter change
    const handleFiltersChange = (filters) => {
        updateSearchParams({ ...filters, page: 1 });
    };

    // Handle sort change
    const handleSortChange = (sort) => {
        console.log('🔍 useProductSearch - handleSortChange called with:', sort);
        console.log('🔍 Current searchParams before update:', searchParams);
        
        updateSearchParams({ 
            sort_by: sort.by, 
            sort_order: sort.order,
            page: 1 
        });
    };

    // Handle page change
    const handlePageChange = (page) => {
        updateSearchParams({ page });
    };

    // Clear search
    const clearSearch = () => {
        const clearedParams = {
            search: '',
            category: '',
            status: 'all',
            min_price: '',
            max_price: '',
            featured: 'all',
            in_stock: 'all',
            sort_by: 'created_at',
            sort_order: 'desc',
            page: 1,
            page_size: 10
        };
        setSearchParams(clearedParams);
        setSearchResults([]);
        setPagination({
            currentPage: 1,
            totalPages: 1,
            totalCount: 0,
            hasNext: false,
            hasPrevious: false
        });
    };

    // Get applied filters for display
    const getAppliedFilters = () => {
        const applied = {};
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value && value !== '' && value !== 'all' && key !== 'search' && key !== 'sort_by' && key !== 'sort_order' && key !== 'page' && key !== 'page_size') {
                applied[key] = value;
            }
        });
        return applied;
    };

    return {
        // State
        searchResults,
        isLoading,
        error,
        pagination,
        searchParams,
        appliedFilters: getAppliedFilters(),
        
        // Actions
        handleSearch,
        handleFiltersChange,
        handleSortChange,
        handlePageChange,
        clearSearch,
        updateSearchParams,
        performSearch
    };
};

export default useProductSearch;
