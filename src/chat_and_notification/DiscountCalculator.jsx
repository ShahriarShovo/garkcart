import React, {useState, useEffect} from 'react';
import discountApi from './api/discountApi';

const DiscountCalculator = ({cartItems, onDiscountCalculated, userId = null}) => {
    const [discounts, setDiscounts] = useState([]);
    const [appliedDiscount, setAppliedDiscount] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if(cartItems && cartItems.length > 0) {
            calculateDiscounts();
        }
    }, [cartItems, userId]);

    const calculateDiscounts = async () => {
        try {
            setLoading(true);
            setError(null);

            // Prepare cart items for API
            const cartData = cartItems.map(item => ({
                product_id: item.product_id || item.id,
                quantity: item.quantity,
                price: item.unit_price || item.price,
                total: item.total_price || (item.unit_price * item.quantity)
            }));

            const result = await discountApi.calculateDiscount(cartData, userId);

            if(result.applicable_discounts && result.applicable_discounts.length > 0) {
                setDiscounts(result.applicable_discounts);

                // Auto-apply the best discount
                if(result.best_discount) {
                    setAppliedDiscount(result.best_discount);
                    onDiscountCalculated(result.best_discount);
                }
            } else {
                setDiscounts([]);
                setAppliedDiscount(null);
                onDiscountCalculated(null);
            }
        } catch(error) {
            console.error('DiscountCalculator: Error calculating discounts:', error);
            setError('Failed to calculate discounts');
            setDiscounts([]);
            setAppliedDiscount(null);
            onDiscountCalculated(null);
        } finally {
            setLoading(false);
        }
    };

    const applyDiscount = async (discount) => {
        try {
            setLoading(true);

            const cartData = cartItems.map(item => ({
                product_id: item.product_id || item.id,
                quantity: item.quantity,
                price: item.unit_price || item.price,
                total: item.total_price || (item.unit_price * item.quantity)
            }));

            const result = await discountApi.applyDiscount(discount.discount.id, cartData, userId);

            if(result.success) {
                setAppliedDiscount(discount);
                onDiscountCalculated(discount);
                console.log('DiscountCalculator: Discount applied successfully:', result);
            } else {
                setError(result.error || 'Failed to apply discount');
            }
        } catch(error) {
            console.error('DiscountCalculator: Error applying discount:', error);
            setError('Failed to apply discount');
        } finally {
            setLoading(false);
        }
    };

    const removeDiscount = () => {
        setAppliedDiscount(null);
        onDiscountCalculated(null);
    };

    if(loading && discounts.length === 0) {
        return (
            <div className="text-center py-2">
                <small className="text-muted">
                    <i className="fa fa-spinner fa-spin mr-1"></i>
                    Checking for discounts...
                </small>
            </div>
        );
    }

    if(error) {
        return (
            <div className="alert alert-warning py-2">
                <small>{error}</small>
            </div>
        );
    }

    if(discounts.length === 0) {
        return null;
    }

    return (
        <div className="discount-section">
            {appliedDiscount ? (
                <div className="applied-discount">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <small className="text-success font-weight-bold">
                                <i className="fa fa-check-circle mr-1"></i>
                                {appliedDiscount.discount.name}
                            </small>
                            <br />
                            <small className="text-muted">
                                {appliedDiscount.discount.percentage}% off - Save ${appliedDiscount.discount_amount.toFixed(2)}
                            </small>
                        </div>
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={removeDiscount}
                            title="Remove discount"
                        >
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                </div>
            ) : (
                <div className="available-discounts">
                    <small className="text-muted mb-2 d-block">
                        <i className="fa fa-tag mr-1"></i>
                        Available discounts:
                    </small>
                    {discounts.map((discount, index) => (
                        <div key={index} className="discount-option mb-2">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <small className="font-weight-bold text-primary">
                                        {discount.discount.name}
                                    </small>
                                    <br />
                                    <small className="text-muted">
                                        {discount.discount.percentage}% off - Save ${discount.discount_amount.toFixed(2)}
                                    </small>
                                    {discount.discount.minimum_amount > 0 && (
                                        <>
                                            <br />
                                            <small className="text-warning">
                                                Min. ${discount.discount.minimum_amount} required
                                            </small>
                                        </>
                                    )}
                                </div>
                                <button
                                    className="btn btn-sm btn-success"
                                    onClick={() => applyDiscount(discount)}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <i className="fa fa-spinner fa-spin"></i>
                                    ) : (
                                        'Apply'
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DiscountCalculator;