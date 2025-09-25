import React from 'react';
import styles from './styles.module.css';
import chatApi from './api/chatApi';
import websocketService from './api/websocketService';

const ChatPanel = ({open, onClose}) => {
    const [messages, setMessages] = React.useState([]);
    const [text, setText] = React.useState('');
    const [conversationId, setConversationId] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [seenIds, setSeenIds] = React.useState(new Set());
    // No connection status needed without WebSocket
    const listRef = React.useRef(null);

    // Initialize conversation when panel opens
    React.useEffect(() => {
        if(open && !conversationId) {
            initializeConversation();
        }
    }, [open]);

    // Connect to WebSocket when conversation is ready and panel is open
    React.useEffect(() => {
        if(conversationId && open) {
            // Notify others that panel is opened
            window.dispatchEvent(new CustomEvent('chat_panel_opened'));
            loadMessages();

            // Establish WS connection for this conversation
            websocketService.disconnect();
            websocketService.connect(conversationId);

            // Helper to wait until WS connects (with timeout)
            const waitForConnected = () => new Promise(resolve => {
                if(websocketService.isConnected()) return resolve(true);
                const timeout = setTimeout(() => {
                    websocketService.off('connected', onConnected);
                    resolve(false);
                }, 1000);
                const onConnected = () => {
                    clearTimeout(timeout);
                    websocketService.off('connected', onConnected);
                    resolve(true);
                };
                websocketService.on('connected', onConnected);
            });

            const onWsMessage = (payload) => {
                if(payload?.type === 'chat_message' && payload.message) {
                    setMessages(prev => {
                        // Prevent duplicates by id if server echoes it back
                        const incomingId = String(payload.message.id);
                        const exists = prev.some(m => m.id === incomingId);
                        if(exists) return prev;
                        const appended = [
                            ...prev,
                            {
                                id: incomingId,
                                side: payload.message.is_sender_staff ? 'admin' : 'user',
                                text: payload.message.content,
                                time: new Date(payload.message.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
                            }
                        ];
                        return appended;
                    });
                    // If an admin message arrives while panel is open, immediately mark it as read
                    if(payload.message.is_sender_staff && websocketService.isConnected()) {
                        websocketService.markMessagesRead([payload.message.id]);
                    }
                } else if(payload?.type === 'messages_read' && Array.isArray(payload.message_ids)) {
                    // Mark provided message IDs as seen
                    setSeenIds(prev => {
                        const next = new Set(prev);
                        payload.message_ids.forEach(id => next.add(String(id)));
                        return next;
                    });
                }
            };

            websocketService.on('message', onWsMessage);

            // After initial connect, try to mark any existing admin messages as read
            (async () => {
                const connected = await waitForConnected();
                const adminMsgIds = messages.filter(m => m.side === 'admin').map(m => Number(m.id)).filter(Number.isFinite);
                if(adminMsgIds.length) {
                    if(connected) {
                        websocketService.markMessagesRead(adminMsgIds);
                        // Notify others (floating button) to clear badge immediately
                        window.dispatchEvent(new CustomEvent('chat_unread_cleared'));
                    } else {
                        // Fallback to REST mark all as read in this conversation
                        await chatApi.markMessagesAsRead(conversationId);
                        window.dispatchEvent(new CustomEvent('chat_unread_cleared'));
                    }
                }
            })();

            return () => {
                // Before disconnecting, try to push a final WS mark_read for any admin messages
                try {
                    const adminMsgIds = messages.filter(m => m.side === 'admin').map(m => Number(m.id)).filter(Number.isFinite);
                    if(adminMsgIds.length && websocketService.isConnected()) {
                        websocketService.markMessagesRead(adminMsgIds);
                    }
                } catch(e) {
                    // ignore
                }
                // Small delay to let messages_read propagate to background WS listeners
                setTimeout(() => {
                    websocketService.off('message', onWsMessage);
                    websocketService.disconnect();
                }, 150);
                // Notify others that panel is closed
                window.dispatchEvent(new CustomEvent('chat_panel_closed'));
            };
        }
    }, [conversationId, open]);

    // After messages load (and when open), mark any admin messages as read to clear user's new count and notify admin
    React.useEffect(() => {
        if(!open || !conversationId) return;
        // collect admin message ids
        const adminMsgIds = messages.filter(m => m.side === 'admin').map(m => Number(m.id)).filter(Number.isFinite);
        if(adminMsgIds.length && websocketService.isConnected()) {
            websocketService.markMessagesRead(adminMsgIds);
        }
    }, [open, conversationId, messages]);

    // When panel is closed, ensure backend unread is cleared (final safety) so floating badge doesn't resurface old counts
    React.useEffect(() => {
        if(open === false && conversationId) {
            (async () => {
                try {
                    await chatApi.markMessagesAsRead(conversationId);
                } catch(e) {
                    console.warn('markMessagesAsRead on close failed:', e);
                } finally {
                    window.dispatchEvent(new CustomEvent('chat_unread_cleared'));
                }
            })();
        }
    }, [open, conversationId]);

    const initializeConversation = async () => {
        try {
            setIsLoading(true);

            // First, try to get existing conversations
            console.log('Fetching existing conversations...');
            const conversations = await chatApi.getConversations();
            console.log('Existing conversations:', conversations);

            if(conversations.length > 0) {
                // Use the most recent conversation
                const latestConversation = conversations[0];
                setConversationId(latestConversation.id);
                console.log('Using existing conversation:', latestConversation.id);
                // Proactively clear unread by marking admin messages as read on open
                try {
                    await chatApi.markMessagesAsRead(latestConversation.id);
                } catch (e) {
                    console.warn('markMessagesAsRead fallback failed (will retry via WS if connected):', e);
                }
                // Notify others of conversation id
                window.dispatchEvent(new CustomEvent('chat_conversation_changed', { detail: { id: latestConversation.id } }));
            } else {
                // Only create new conversation if none exists
                console.log('No existing conversations found. Creating new conversation...');
                const conversation = await chatApi.createConversation();
                console.log('Conversation created:', conversation);
                setConversationId(conversation.id);
                window.dispatchEvent(new CustomEvent('chat_conversation_changed', { detail: { id: conversation.id } }));
            }
        } catch(error) {
            console.error('Error initializing conversation:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // No WebSocket connection needed

    const loadMessages = async () => {
        if(!conversationId) return;

        try {
            console.log('Loading messages for conversation:', conversationId);
            const messagesData = await chatApi.getMessages(conversationId);
            console.log('Messages data:', messagesData);
            const formattedMessages = messagesData.map(msg => ({
                id: String(msg.id),
                side: msg.is_sender_staff ? 'admin' : 'user',
                text: msg.content,
                time: new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
            }));
            console.log('Formatted messages:', formattedMessages);
            setMessages(formattedMessages);

            // Initialize Seen state from server flags so "Seen" persists across open/close
            try {
                const initialSeen = new Set();
                for(const m of messagesData) {
                    const isUserMsg = !m.is_sender_staff;
                    const readFlag = (
                        m.is_read_by_recipient === true ||
                        m.is_read === true ||
                        m.read_by_staff === true ||
                        m.read === true
                    );
                    if(isUserMsg && readFlag) {
                        initialSeen.add(String(m.id));
                    }
                }
                if(initialSeen.size) {
                    setSeenIds(initialSeen);
                } else {
                    setSeenIds(new Set());
                }
            } catch(e) {
                console.warn('Failed to derive initial seen state from server data', e);
                setSeenIds(new Set());
            }

            // Immediately mark any admin messages as read to clear unread badge on open
            try {
                const adminIds = messagesData.filter(m => m.is_sender_staff).map(m => m.id);
                if(adminIds.length) {
                    if(websocketService.isConnected()) {
                        websocketService.markMessagesRead(adminIds);
                        window.dispatchEvent(new CustomEvent('chat_unread_cleared'));
                    } else {
                        await chatApi.markMessagesAsRead(conversationId);
                        window.dispatchEvent(new CustomEvent('chat_unread_cleared'));
                    }
                }
            } catch(e) {
                console.warn('mark-as-read after load failed, will retry later:', e);
            }
        } catch(error) {
            console.error('Error loading messages:', error);
        }
    };

    React.useEffect(() => {
        if(open && listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [open, messages.length]);

    const send = async () => {
        const t = text.trim();
        if(!t || !conversationId) return;

        try {
            console.log('Sending message:', t, 'to conversation:', conversationId);

            // Prefer WS send; backend persists and broadcasts
            if(!websocketService.isConnected()) {
                websocketService.connect(conversationId);
            }
            websocketService.sendMessage(conversationId, t);
            setText('');
        } catch(error) {
            console.error('Error sending message:', error);
        }
    };

    // Determine the last user message that has been seen
    const lastSeenUserId = React.useMemo(() => {
        for(let i = messages.length - 1; i >= 0; i--) {
            const m = messages[i];
            if(m.side === 'user' && seenIds.has(m.id)) {
                return m.id;
            }
        }
        return null;
    }, [messages, seenIds]);

    // Determine the latest (last) user message id
    const lastUserMsgId = React.useMemo(() => {
        for(let i = messages.length - 1; i >= 0; i--) {
            if(messages[i].side === 'user') return messages[i].id;
        }
        return null;
    }, [messages]);

    if(!open) return null;

    return (
        <div className={`card shadow rounded ${styles.panel}`} role="dialog" aria-modal="true" aria-label="Support chat">
            <div className="card-header d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center">
                    <span className="fw-semibold">Support</span>
                </div>
                <div className="btn-group">
                    <button type="button" className="btn btn-sm btn-light" onClick={onClose}><i className="fa fa-minus" /></button>
                    <button type="button" className="btn btn-sm btn-light" onClick={onClose}><i className="fa fa-times" /></button>
                </div>
            </div>
            <div className="card-body p-0 d-flex flex-column">
                {isLoading ? (
                    <div className="d-flex justify-content-center align-items-center py-4">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <span className="ms-2">Connecting to support...</span>
                    </div>
                ) : (
                    <>
                        <div ref={listRef} className={`px-3 py-3 d-flex flex-column ${styles.messagesArea}`} style={{gap: '20px'}}>
                            {messages.length === 0 ? (
                                <div className="text-center text-muted py-3">
                                    <i className="fa fa-comments fa-2x mb-2"></i>
                                    <div>Start a conversation with our support team</div>
                                </div>
                            ) : (
                                messages.map(m => (
                                    <div key={m.id} className={`d-flex ${m.side === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                                        <div className={`rounded-3 px-3 py-2 ${styles.bubble} ${m.side === 'user' ? styles.userBubble : styles.adminBubble}`}>
                                            <div>{m.text}</div>
                                            {m.time && (
                                                <div className={`small mt-1 ${m.side === 'user' ? 'text-light' : 'text-muted'}`}>{m.time}</div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                            {/* Outside chat bubbles: show Seen under the latest user message if it has been read */}
                            {lastUserMsgId && lastSeenUserId === lastUserMsgId && (
                                <div className="d-flex justify-content-end mt-1">
                                    <div className="small text-muted">Seen</div>
                                </div>
                            )}
                        </div>
                        <div className="border-top p-2">
                            <div className="input-group">
                                <textarea
                                    className="form-control"
                                    rows={1}
                                    placeholder="Type your message..."
                                    value={text}
                                    onChange={e => setText(e.target.value)}
                                    onKeyPress={e => {
                                        if(e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            send();
                                        }
                                    }}
                                    disabled={!conversationId}
                                />
                                <button
                                    className="btn btn-primary"
                                    type="button"
                                    onClick={send}
                                    disabled={!text.trim() || !conversationId}
                                >
                                    <i className="fa fa-paper-plane" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ChatPanel;
