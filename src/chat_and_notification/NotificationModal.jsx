import React, {useState, useEffect} from 'react';
import notificationApi from './api/notificationApi';
import discountApi from './api/discountApi';

const NotificationModal = () => {
    const [notifications, setNotifications] = useState([]);
    const [currentNotificationIndex, setCurrentNotificationIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadActiveNotifications();
    }, []);

    const loadActiveNotifications = async () => {
        try {
            setIsLoading(true);
            console.log('NotificationModal: Loading notifications...');

            // Load regular notifications
            const activeNotifications = await notificationApi.getActiveNotifications();
            console.log('NotificationModal: Regular notifications:', activeNotifications);

            // Load discount notifications
            const discountNotifications = await discountApi.getActiveDiscountsForDisplay();
            console.log('NotificationModal: Discount notifications:', discountNotifications);
            console.log('NotificationModal: Discount notifications length:', discountNotifications.length);

            // Combine both types of notifications
            const allNotifications = [...activeNotifications, ...discountNotifications];
            console.log('NotificationModal: All notifications:', allNotifications);
            console.log('NotificationModal: All notifications length:', allNotifications.length);

            if(allNotifications && allNotifications.length > 0) {
                console.log('NotificationModal: Setting notifications and showing modal');
                setNotifications(allNotifications);
                setCurrentNotificationIndex(0);
                setIsVisible(true);
            } else {
                console.log('NotificationModal: No notifications found');
                setIsVisible(false);
            }
        } catch(error) {
            console.error('NotificationModal: Error loading notifications:', error);
            setIsVisible(false);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = async () => {
        if(notifications.length > 0 && currentNotificationIndex < notifications.length) {
            const currentNotification = notifications[currentNotificationIndex];

            try {
                await notificationApi.markNotificationViewed(currentNotification.id);
            } catch(error) {
                console.error('NotificationModal: Error marking notification as viewed:', error);
            }
        }

        // Move to next notification or close modal
        if(currentNotificationIndex < notifications.length - 1) {
            setCurrentNotificationIndex(currentNotificationIndex + 1);
        } else {
            setIsVisible(false);
            setNotifications([]);
            setCurrentNotificationIndex(0);
        }
    };

    const handleBackdropClick = (e) => {
        if(e.target === e.currentTarget) {
            handleClose();
        }
    };

    if(isLoading) {
        console.log('NotificationModal: Loading...');
        return null;
    }

    console.log('NotificationModal: isVisible:', isVisible, 'notifications.length:', notifications.length);

    if(!isVisible || notifications.length === 0) {
        console.log('NotificationModal: Not showing modal - isVisible:', isVisible, 'notifications.length:', notifications.length);
        return null;
    }

    const currentNotification = notifications[currentNotificationIndex];

    if(!currentNotification) {
        return null;
    }

    return (
        <div
            className="notification-modal-backdrop"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}
            onClick={handleBackdropClick}
        >
            <div
                className="notification-modal"
                style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    padding: '30px',
                    maxWidth: '500px',
                    width: '100%',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                    position: 'relative',
                    animation: 'slideInDown 0.3s ease-out'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: '#666',
                        padding: '5px',
                        borderRadius: '50%',
                        width: '35px',
                        height: '35px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#f0f0f0';
                        e.target.style.color = '#333';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.backgroundColor = 'transparent';
                        e.target.style.color = '#666';
                    }}
                >
                    ×
                </button>

                {/* Notification content */}
                <div style={{paddingRight: '40px'}}>
                    {/* Notification type badge */}
                    {currentNotification.notification_type && (
                        <div style={{marginBottom: '15px'}}>
                            <span
                                style={{
                                    backgroundColor: getNotificationTypeColor(currentNotification.notification_type),
                                    color: 'white',
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {getNotificationTypeLabel(currentNotification.notification_type)}
                            </span>
                        </div>
                    )}

                    {/* Title */}
                    <h3 style={{
                        margin: '0 0 15px 0',
                        color: '#333',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        lineHeight: '1.3'
                    }}>
                        {currentNotification.title}
                    </h3>

                    {/* Message */}
                    <div style={{
                        color: '#666',
                        fontSize: '16px',
                        lineHeight: '1.6',
                        marginBottom: '20px'
                    }}>
                        {currentNotification.message}
                    </div>

                    {/* Action buttons */}
                    <div style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'flex-end',
                        marginTop: '25px'
                    }}>
                        <button
                            onClick={handleClose}
                            style={{
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                padding: '10px 20px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.backgroundColor = '#0056b3';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.backgroundColor = '#007bff';
                            }}
                        >
                            Got it!
                        </button>
                    </div>

                    {/* Progress indicator */}
                    {notifications.length > 1 && (
                        <div style={{
                            marginTop: '20px',
                            textAlign: 'center',
                            fontSize: '12px',
                            color: '#999'
                        }}>
                            {currentNotificationIndex + 1} of {notifications.length}
                        </div>
                    )}
                </div>
            </div>

            {/* CSS Animation */}
            <style jsx>{`
                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

// Helper functions
const getNotificationTypeColor = (type) => {
    const colors = {
        'general': '#6c757d',
        'promotion': '#28a745',
        'announcement': '#17a2b8',
        'maintenance': '#ffc107',
        'custom': '#6f42c1'
    };
    return colors[type] || colors['general'];
};

const getNotificationTypeLabel = (type) => {
    const labels = {
        'general': 'General',
        'promotion': 'Promotion',
        'announcement': 'Announcement',
        'maintenance': 'Maintenance',
        'custom': 'Custom'
    };
    return labels[type] || 'General';
};

export default NotificationModal;
