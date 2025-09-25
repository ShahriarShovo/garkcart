import React from 'react';
import styles from './styles.module.css';
import chatApi from './api/chatApi';
import websocketService from './api/websocketService';

const ChatPanel = ({open, onClose}) => {
    const [messages, setMessages] = React.useState([]);
    const [text, setText] = React.useState('');
    const [conversationId, setConversationId] = React.useState(null);
    const [isLoading, setIsLoading] = React.useState(false);
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
            loadMessages();

            // Establish WS connection for this conversation
            websocketService.disconnect();
            websocketService.connect(conversationId);

            const onWsMessage = (payload) => {
                if(payload?.type === 'chat_message' && payload.message) {
                    setMessages(prev => {
                        // Prevent duplicates by id if server echoes it back
                        const exists = prev.some(m => m.id === payload.message.id);
                        if(exists) return prev;
                        const appended = [
                            ...prev,
                            {
                                id: payload.message.id,
                                side: payload.message.is_sender_staff ? 'admin' : 'user',
                                text: payload.message.content,
                                time: new Date(payload.message.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
                            }
                        ];
                        return appended;
                    });
                }
            };

            websocketService.on('message', onWsMessage);

            return () => {
                websocketService.off('message', onWsMessage);
                websocketService.disconnect();
            };
        }
    }, [conversationId, open]);

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
            } else {
                // Only create new conversation if none exists
                console.log('No existing conversations found. Creating new conversation...');
                const conversation = await chatApi.createConversation();
                console.log('Conversation created:', conversation);
                setConversationId(conversation.id);
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
                id: msg.id,
                side: msg.is_sender_staff ? 'admin' : 'user',
                text: msg.content,
                time: new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})
            }));
            console.log('Formatted messages:', formattedMessages);
            setMessages(formattedMessages);
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
