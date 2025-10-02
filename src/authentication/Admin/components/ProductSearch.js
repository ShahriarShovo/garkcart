/**
 * ProductSearch Component
 * Advanced search input with suggestions and debouncing
 */

import React, { useState, useEffect, useCallback } from 'react';
import API_CONFIG from '../../../config/apiConfig';

const ProductSearch = ({ onSearch, onClear, placeholder = "Search products..." }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);

    // Debounced search function
    const debouncedSearch = useCallback(
        (() => {
            let timeoutId;
            return (term) => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    if (term.trim()) {
                        fetchSuggestions(term);
                    } else {
                        setSuggestions([]);
                    }
                }, 300);
            };
        })(),
        []
    );

    // Fetch search suggestions
    const fetchSuggestions = async (term) => {
        if (!term || term.length < 2) return;
        
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${API_CONFIG.BASE_URL}/api/products/search/suggestions/?q=${encodeURIComponent(term)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                setSuggestions(data.suggestions || []);
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle search input change
    const handleInputChange = (e) => {
        const value = e.target.value || '';
        setSearchTerm(value);
        debouncedSearch(value);
        setShowSuggestions(value && typeof value === 'string' && value.length > 0);
    };

    // Handle search submission
    const handleSearch = (term = searchTerm) => {
        if (term && term.trim()) {
            // Add to search history
            const newHistory = [term, ...searchHistory.filter(h => h !== term)].slice(0, 5);
            setSearchHistory(newHistory);
            localStorage.setItem('productSearchHistory', JSON.stringify(newHistory));
            
            onSearch(term.trim());
            setShowSuggestions(false);
        }
    };

    // Handle suggestion click
    const handleSuggestionClick = (suggestion) => {
        const searchText = suggestion?.text || suggestion?.title || '';
        setSearchTerm(searchText);
        handleSearch(searchText);
    };

    // Handle clear search
    const handleClear = () => {
        setSearchTerm('');
        setSuggestions([]);
        setShowSuggestions(false);
        onClear();
    };

    // Handle key press
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    // Load search history on mount
    useEffect(() => {
        const savedHistory = localStorage.getItem('productSearchHistory');
        if (savedHistory) {
            try {
                setSearchHistory(JSON.parse(savedHistory));
            } catch (error) {
                console.error('Error loading search history:', error);
            }
        }
    }, []);

    return (
        <div className="position-relative">
            <div className="input-group">
                <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    onFocus={() => setShowSuggestions(searchTerm && typeof searchTerm === 'string' && searchTerm.length > 0)}
                    style={{ width: '250px' }}
                />
                <div className="input-group-append">
                    {isLoading ? (
                        <span className="input-group-text">
                            <i className="fa fa-spinner fa-spin"></i>
                        </span>
                    ) : (
                        <span className="input-group-text">
                            <i className="fa fa-search"></i>
                        </span>
                    )}
                    {searchTerm && (
                        <button
                            className="btn btn-outline-secondary btn-sm"
                            type="button"
                            onClick={handleClear}
                        >
                            <i className="fa fa-times"></i>
                        </button>
                    )}
                </div>
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && (suggestions.length > 0 || searchHistory.length > 0) && (
                <div className="dropdown-menu show position-absolute w-100" style={{ top: '100%', zIndex: 1000 }}>
                    {/* Recent Searches */}
                    {searchHistory.length > 0 && searchTerm === '' && (
                        <>
                            <div className="dropdown-header">
                                <small className="text-muted">Recent Searches</small>
                            </div>
                            {searchHistory.slice(0, 3).map((term, index) => (
                                <button
                                    key={index}
                                    className="dropdown-item"
                                    onClick={() => handleSuggestionClick({ text: term })}
                                >
                                    <i className="fa fa-history mr-2 text-muted"></i>
                                    {term}
                                </button>
                            ))}
                        </>
                    )}

                    {/* Search Suggestions */}
                    {suggestions.length > 0 && (
                        <>
                            {searchHistory.length > 0 && <div className="dropdown-divider"></div>}
                            <div className="dropdown-header">
                                <small className="text-muted">Suggestions</small>
                            </div>
                            {suggestions.slice(0, 5).map((suggestion, index) => {
                                // Handle both string and object suggestions
                                const isString = typeof suggestion === 'string';
                                const suggestionText = isString ? suggestion : (suggestion?.text || suggestion?.title || suggestion);
                                const suggestionType = isString ? 'product' : (suggestion?.type || 'product');
                                
                                return (
                                    <button
                                        key={index}
                                        className="dropdown-item"
                                        onClick={() => handleSuggestionClick(isString ? { text: suggestion } : suggestion)}
                                    >
                                        <i className={`fa fa-${suggestionType === 'product' ? 'box' : 
                                            suggestionType === 'category' ? 'folder' : 'tag'} mr-2 text-muted`}></i>
                                        {suggestionText}
                                        <small className="text-muted ml-2">({suggestionType})</small>
                                    </button>
                                );
                            })}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductSearch;
