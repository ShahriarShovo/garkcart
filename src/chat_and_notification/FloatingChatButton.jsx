import React from 'react';
import styles from './styles.module.css';
import chatApi from './api/chatApi';

const FloatingChatButton = ({onOpen, unreadCount = 0}) => {
    const [actualUnreadCount, setActualUnreadCount] = React.useState(unreadCount);

    React.useEffect(() => {
        // Fetch unread count when component mounts
        fetchUnreadCount();

        // Set up interval to check for new messages
        const interval = setInterval(fetchUnreadCount, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await chatApi.getUnreadCount();
            setActualUnreadCount(response.unread_count || 0);
        } catch(error) {
            console.error('Error fetching unread count:', error);
        }
    };

    return (
        <button
            type="button"
            className={`btn btn-primary rounded-circle shadow ${styles.fab}`}
            aria-label="Open support chat"
            onClick={onOpen}
        >
            <i className="fa fa-comments" />
            {actualUnreadCount > 0 && (
                <span className={`position-absolute translate-middle badge rounded-pill bg-danger ${styles.badgeNew}`}>
                    {actualUnreadCount}
                </span>
            )}
        </button>
    );
};

export default FloatingChatButton;
