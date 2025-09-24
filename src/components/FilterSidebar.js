import React from 'react';
import CategoryFilter from './CategoryFilter';
import PriceRangeFilter from './PriceRangeFilter';

const FilterSidebar = ({onCategoryChange, onSubcategoryChange, onPriceFilter, initialMinPrice = 0, initialMaxPrice = 2000}) => {
    return (
        <aside className="col-md-3">
            <div className="card">
                <CategoryFilter
                    onCategoryChange={onCategoryChange}
                    onSubcategoryChange={onSubcategoryChange}
                />
                <PriceRangeFilter
                    onPriceFilter={onPriceFilter}
                    initialMin={initialMinPrice}
                    initialMax={initialMaxPrice}
                />
            </div>
        </aside>
    );
};

export default FilterSidebar;
