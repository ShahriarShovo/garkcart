import React, {useState} from 'react';

const PriceRangeFilter = ({onPriceFilter, initialMin = 0, initialMax = 2000}) => {
    const [priceRange, setPriceRange] = useState({
        // Keep select values as strings to match <option value="..."> strings
        min: String(initialMin),
        max: String(initialMax),
        customMin: '',
        customMax: ''
    });
    const [priceExpanded, setPriceExpanded] = useState(true);

    // Apply price filter
    const applyPriceFilter = () => {
        let minPrice = null;
        let maxPrice = null;

        // When either Min or Max is custom, prioritize custom input values
        if(priceRange.min === 'custom' || priceRange.max === 'custom') {
            // Use custom values if available, otherwise use dropdown values
            if(priceRange.customMin !== '') {
                const v = parseInt(priceRange.customMin, 10);
                if(!Number.isNaN(v)) minPrice = v;
            } else if(priceRange.min !== 'custom') {
                const v = parseInt(priceRange.min, 10);
                if(!Number.isNaN(v)) minPrice = v;
            }

            if(priceRange.customMax !== '') {
                const v = parseInt(priceRange.customMax, 10);
                if(!Number.isNaN(v)) maxPrice = v;
            } else if(priceRange.max !== 'custom') {
                const v = parseInt(priceRange.max, 10);
                if(!Number.isNaN(v)) maxPrice = v;
            }
        } else {
            // Both are dropdown values
            const minV = parseInt(priceRange.min, 10);
            const maxV = parseInt(priceRange.max, 10);
            if(!Number.isNaN(minV)) minPrice = minV;
            if(!Number.isNaN(maxV)) maxPrice = maxV;
        }

        if(onPriceFilter) {
            onPriceFilter(minPrice, maxPrice);
        }
    };

    return (
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
                                    onChange={(e) => setPriceRange(prev => ({...prev, min: e.target.value}))}
                                >
                                    <option value="0">৳0</option>
                                    <option value="50">৳50</option>
                                    <option value="100">৳100</option>
                                    <option value="150">৳150</option>
                                    <option value="200">৳200</option>
                                    <option value="500">৳500</option>
                                    <option value="1000">৳1000</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                            <div className="form-group text-right col-md-6">
                                <label>Max</label>
                                <select
                                    className="mr-2 form-control"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange(prev => ({...prev, max: e.target.value}))}
                                >
                                    <option value="50">৳50</option>
                                    <option value="100">৳100</option>
                                    <option value="150">৳150</option>
                                    <option value="200">৳200</option>
                                    <option value="500">৳500</option>
                                    <option value="1000">৳1000</option>
                                    <option value="2000">৳2000+</option>
                                    <option value="custom">Custom</option>
                                </select>
                            </div>
                        </div>

                        {/* Custom Input Fields - Show when either Min or Max is Custom */}
                        {(priceRange.min === 'custom' || priceRange.max === 'custom') && (
                            <div className="form-row mt-3">
                                <div className="form-group col-md-6">
                                    <label>Min Price</label>
                                    <input
                                        type="text"
                                        className="mr-2 form-control"
                                        placeholder="৳0"
                                        value={priceRange.customMin !== '' ? `৳${priceRange.customMin}` : ''}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^\d]/g, '');
                                            setPriceRange(prev => ({...prev, customMin: value}));
                                        }}
                                        onFocus={(e) => {
                                            if(e.target.value === '') {
                                                e.target.value = '৳';
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if(e.target.value === '৳' || e.target.value === '') {
                                                e.target.value = '';
                                                setPriceRange(prev => ({...prev, customMin: ''}));
                                            }
                                        }}
                                    />
                                </div>
                                <div className="form-group text-right col-md-6">
                                    <label>Max Price</label>
                                    <input
                                        type="text"
                                        className="mr-2 form-control"
                                        placeholder="৳2000"
                                        value={priceRange.customMax !== '' ? `৳${priceRange.customMax}` : ''}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^\d]/g, '');
                                            setPriceRange(prev => ({...prev, customMax: value}));
                                        }}
                                        onFocus={(e) => {
                                            if(e.target.value === '') {
                                                e.target.value = '৳';
                                            }
                                        }}
                                        onBlur={(e) => {
                                            if(e.target.value === '৳' || e.target.value === '') {
                                                e.target.value = '';
                                                setPriceRange(prev => ({...prev, customMax: ''}));
                                            }
                                        }}
                                    />
                                </div>
                                <div className="col-12 mt-2">
                                    <small className="text-muted">
                                        💡 <strong>Tip:</strong> আপনি Min Custom select করলে দুটো input field এই value দিতে পারেন।
                                        Min field এ 0 এবং Max field এ 15 দিলে 0-15 range এ product দেখাবে।
                                    </small>
                                </div>
                            </div>
                        )}
                        <button className="btn btn-block btn-primary" onClick={applyPriceFilter}>
                            Apply
                        </button>
                    </div>
                </div>
            )}
        </article>
    );
};

export default PriceRangeFilter;
