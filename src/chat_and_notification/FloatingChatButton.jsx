import React from 'react';
import styles from './styles.module.css';
import chatApi from './api/chatApi';

const FloatingChatButton = ({onOpen, unreadCount = 0}) => {
    const [actualUnreadCount, setActualUnreadCount] = React.useState(unreadCount);

    const wsRef = React.useRef(null);
    const convIdRef = React.useRef(null);
    const isPanelOpenRef = React.useRef(false);
    const lastClearedAtRef = React.useRef(0);
    const wsConnectedRef = React.useRef(false);

    const openBackgroundWS = (conversationId) => {
        try {
            // Close any previous
            if(wsRef.current) {
                try {wsRef.current.close(1000, 'Cleanup');} catch(_) {}
            }
            const token = localStorage.getItem('token');
            const url = `ws://127.0.0.1:8000/ws/chat/${conversationId}/?token=${token}`;
            const ws = new WebSocket(url);
            wsRef.current = ws;

            ws.onopen = () => {
                wsConnectedRef.current = true;
            };
            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if(data?.type === 'chat_message' && data.message?.is_sender_staff) {
                        // Only count as unread if panel is currently closed
                        if(!isPanelOpenRef.current) {
                            setActualUnreadCount(prev => (prev || 0) + 1);
                        }
                    } else if(data?.type === 'messages_read') {
                        // Reads happened (either side) -> clear badge
                        setActualUnreadCount(0);
                    }
                } catch(e) {
                    // ignore parse errors
                }
            };
            ws.onclose = () => {
                wsConnectedRef.current = false;
                // rely on polling as fallback
            };
            ws.onerror = () => {
                // ignore
            };
        } catch(e) {
            // ignore ws errors
        }
    };

    React.useEffect(() => {
        // Set initial grace period to prevent stale data on first load
        lastClearedAtRef.current = Date.now();

        // Fetch unread count when component mounts
        fetchUnreadCount();

        // Also fetch after short delays to catch any messages that arrived while user was logged out
        setTimeout(fetchUnreadCount, 1000);  // First check after 1 second
        setTimeout(fetchUnreadCount, 3000); // Second check after 3 seconds
        setTimeout(fetchUnreadCount, 5000); // Third check after 5 seconds

        // Set up interval to check for new messages
        const interval = setInterval(fetchUnreadCount, 3000); // Check every 3 seconds for very fast updates

        // Listen for global events from ChatPanel
        const onCleared = () => {
            setActualUnreadCount(0);
            // Re-fetch from server to ensure backend state agrees
            lastClearedAtRef.current = Date.now();
            setTimeout(fetchUnreadCount, 500);
        };
        const onOpened = () => {
            isPanelOpenRef.current = true;
            // When panel opens, we expect reads to be sent; proactively clear badge
            setActualUnreadCount(0);
            lastClearedAtRef.current = Date.now();
        };
        const onClosed = () => {
            isPanelOpenRef.current = false;
            // After closing, re-fetch to avoid stale badge from races
            lastClearedAtRef.current = Date.now();
            setTimeout(fetchUnreadCount, 1000);
        };
        window.addEventListener('chat_unread_cleared', onCleared);
        window.addEventListener('chat_panel_opened', onOpened);
        window.addEventListener('chat_panel_closed', onClosed);
        const onConvChanged = (e) => {
            const id = e?.detail?.id;
            if(id && id !== convIdRef.current) {
                convIdRef.current = id;
                openBackgroundWS(id);
            }
        };
        window.addEventListener('chat_conversation_changed', onConvChanged);

        // Load latest conversation and open background WS for real-time badge
        (async () => {
            try {
                const conversations = await chatApi.getConversations();
                if(conversations && conversations.length) {
                    const id = conversations[0].id;
                    convIdRef.current = id;
                    openBackgroundWS(id);
                }
            } catch(e) {
                // ignore
            }
        })();

        return () => {
            clearInterval(interval);
            window.removeEventListener('chat_unread_cleared', onCleared);
            window.removeEventListener('chat_panel_opened', onOpened);
            window.removeEventListener('chat_panel_closed', onClosed);
            window.removeEventListener('chat_conversation_changed', onConvChanged);
            if(wsRef.current) {
                try {wsRef.current.close(1000, 'Unmount');} catch(_) {}
            }
        };
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await chatApi.getUnreadCount();

            // Suppress stale server values immediately after we cleared reads
            const now = Date.now();
            if(now - lastClearedAtRef.current < 5000) {
                // Within grace period, trust local cleared state
                setActualUnreadCount(0);
                return;
            }

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
            onClick={() => {
                // Clear local unread badge immediately upon opening
                setActualUnreadCount(0);
                onOpen && onOpen();
            }}
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
