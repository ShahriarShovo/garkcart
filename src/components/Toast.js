import React, {useState, useEffect} from 'react';

const Toast = ({show, message, type = 'success', onClose, duration = 3000}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if(show) {
            setIsVisible(true);
            const timer = setTimeout(() => {
                handleClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 300); // Wait for animation to complete
    };

    const getToastClass = () => {
        const baseClass = "toast-notification";
        const typeClass = type === 'success' ? 'toast-success' : 'toast-error';
        const visibilityClass = isVisible ? 'toast-show' : 'toast-hide';
        return `${baseClass} ${typeClass} ${visibilityClass}`;
    };

    const getIcon = () => {
        if(type === 'success') {
            return <i className="fa fa-check-circle"></i>;
        } else {
            return <i className="fa fa-exclamation-circle"></i>;
        }
    };

    if(!show && !isVisible) return null;

    return (
        <div className={getToastClass()}>
            <div className="toast-content">
                <div className="toast-icon">
                    {getIcon()}
                </div>
                <div className="toast-message">
                    <strong>{type === 'success' ? 'Success!' : 'Error!'}</strong>
                    <p>{message}</p>
                </div>
                <button className="toast-close" onClick={handleClose}>
                    <i className="fa fa-times"></i>
                </button>
            </div>
            <div className="toast-progress">
                <div className="toast-progress-bar"></div>
            </div>
        </div>
    );
};

export default Toast;
