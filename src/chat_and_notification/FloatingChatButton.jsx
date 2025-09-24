import React from 'react';
import styles from './styles.module.css';

const FloatingChatButton = ({onOpen, unreadCount = 0}) => {
    return (
        <button
            type="button"
            className={`btn btn-primary rounded-circle shadow ${styles.fab}`}
            aria-label="Open support chat"
            onClick={onOpen}
        >
            <i className="fa fa-comments" />
            {unreadCount > 0 && (
                <span className={`position-absolute translate-middle badge rounded-pill bg-danger ${styles.badgeNew}`}>
                    {unreadCount}
                </span>
            )}
        </button>
    );
};

export default FloatingChatButton;
