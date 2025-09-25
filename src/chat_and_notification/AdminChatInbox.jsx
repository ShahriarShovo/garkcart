import React, {useState, useEffect, useRef} from 'react';
import chatApi from './api/chatApi';
import websocketService from './api/websocketService';
import adminWebsocketService from './api/adminWebsocketService';

const AdminChatInbox = () => {
    // Chat states
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesContainerRef = useRef(null);

    const scrollToBottom = () => {
        const el = messagesContainerRef.current;
        if(el) {
            el.scrollTop = el.scrollHeight;
        }
    };

    useEffect(() => {
        fetchConversations();

        const handleAdminNewMessage = (data) => {
            // data: { type: 'new_message', message: { conversation_id, ... } }
            try {
                if(data?.type === 'new_message' && data.message?.conversation_id) {
                    const convId = data.message.conversation_id;
                    setConversations(prev => prev.map(c => {
                        if(c.id === convId) {
                            // bump unread count for inbox if not currently selected
                            const isSelected = selectedConversation?.id === convId;
                            const unread = isSelected ? 0 : (c.unread_count || 0) + 1;
                            return {
                                ...c,
                                unread_count: unread,
                                last_message_preview: { content: data.message.content },
                                last_message_at: data.message.created_at
                            };
                        }
                        return c;
                    }));
                }
            } catch(e) { console.error('Admin WS handle new_message error', e); }
        };

        const handleAdminConversationUpdated = (data) => {
            try {
                if(data?.type === 'conversation_updated' && data.conversation?.id) {
                    setConversations(prev => prev.map(c => c.id === data.conversation.id ? {
                        ...c,
                        ...data.conversation
                    } : c));
                }
            } catch(e) { console.error('Admin WS handle conversation_updated error', e); }
        };

        // Defer admin WS connection until after conversations load (see below)
        // Listener subscriptions will be attached after connection

        return () => {
            adminWebsocketService.off('new_message', handleAdminNewMessage);
            adminWebsocketService.off('conversation_updated', handleAdminConversationUpdated);
        };
    }, []);

    const fetchConversations = async () => {
        try {
            setIsLoading(true);
            const data = await chatApi.getInbox();
            setConversations(data);
            if(data.length > 0 && !selectedConversation) {
                setSelectedConversation(data[0]);
                const messagesData = await chatApi.getMessages(data[0].id);
                setMessages(messagesData);
            }
            // Now connect admin inbox WS for real-time list updates
            if(!adminWebsocketService.isConnected()) {
                adminWebsocketService.connect();
            }
            // Attach listeners (idempotent)
            const handleAdminNewMessage = (payload) => {
                if(payload?.type === 'new_message' && payload.message?.conversation_id) {
                    const convId = payload.message.conversation_id;
                    setConversations(prev => prev.map(c => {
                        if(c.id === convId) {
                            const isSelected = selectedConversation?.id === convId;
                            const unread = isSelected ? 0 : (c.unread_count || 0) + 1;
                            return {
                                ...c,
                                unread_count: unread,
                                last_message_preview: { content: payload.message.content },
                                last_message_at: payload.message.created_at
                            };
                        }
                        return c;
                    }));
                }
            };
            const handleAdminConversationUpdated = (payload) => {
                if(payload?.type === 'conversation_updated' && payload.conversation?.id) {
                    setConversations(prev => prev.map(c => c.id === payload.conversation.id ? {
                        ...c,
                        ...payload.conversation
                    } : c));
                }
            };
            adminWebsocketService.on('new_message', handleAdminNewMessage);
            adminWebsocketService.on('conversation_updated', handleAdminConversationUpdated);
        } catch(error) {
            console.error('Error fetching conversations:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const selectConversation = async (conversation) => {
        setSelectedConversation(conversation);
        try {
            const messagesData = await chatApi.getMessages(conversation.id);
            setMessages(messagesData);

            // Always mark customer messages as read when conversation is selected
            console.log('Marking messages as read for conversation:', conversation.id);
            // Ensure WS is connecting now so we can wait for 'connected'
            try { websocketService.disconnect(); } catch(_) {}
            websocketService.connect(conversation.id);
            const msgIds = (messagesData || []).filter(m => !m.is_sender_staff).map(m => Number(m.id)).filter(Number.isFinite);
            if(msgIds.length) {
                // Wait briefly for WS to connect; otherwise fallback to REST
                const waitForConnected = () => new Promise(resolve => {
                    if(websocketService.isConnected()) return resolve(true);
                    const timeout = setTimeout(() => {
                        websocketService.off('connected', onConnected);
                        resolve(false);
                    }, 800);
                    const onConnected = () => {
                        clearTimeout(timeout);
                        websocketService.off('connected', onConnected);
                        resolve(true);
                    };
                    websocketService.on('connected', onConnected);
                });

                const connected = await waitForConnected();
                if(connected) {
                    websocketService.markMessagesRead(msgIds);
                } else {
                    await chatApi.markMessagesAsRead(conversation.id);
                }
            }
            // Update conversation list to remove unread count
            setConversations(prev =>
                prev.map(conv =>
                    conv.id === conversation.id
                        ? {...conv, unread_count: 0}
                        : conv
                )
            );
            console.log('Unread count updated to 0 for conversation:', conversation.id);
        } catch(error) {
            console.error('Error loading messages:', error);
        }
    };

    // Scroll to bottom when messages change or when switching conversations
    useEffect(() => {
        scrollToBottom();
    }, [messages.length, selectedConversation?.id]);

    // Maintain conversation WebSocket subscription based on selectedConversation
    useEffect(() => {
        if(!selectedConversation?.id) {
            websocketService.disconnect();
            return;
        }
        // Connect and subscribe
        websocketService.disconnect();
        websocketService.connect(selectedConversation.id);

        const onWsMessage = (payload) => {
            if(payload?.type === 'chat_message' && payload.message) {
                setMessages(prev => {
                    const exists = prev.some(m => m.id === payload.message.id);
                    if(exists) return prev;
                    return [...prev, payload.message];
                });
                // If message is from customer while this conversation is open, instantly mark as read
                if(!payload.message.is_sender_staff) {
                    if(websocketService.isConnected()) {
                        websocketService.markMessagesRead([payload.message.id]);
                    }
                    // Ensure left list unread stays at 0 for selected conversation
                    setConversations(prev => prev.map(c => c.id === selectedConversation.id ? {...c, unread_count: 0} : c));
                }
            }
        };

        websocketService.on('message', onWsMessage);

        return () => {
            websocketService.off('message', onWsMessage);
            websocketService.disconnect();
        };
    }, [selectedConversation?.id]);

    const sendMessage = async () => {
        if(!newMessage.trim() || !selectedConversation) return;
        try {
            // Ensure WS is connected, otherwise wait briefly then send
            if(!websocketService.isConnected()) {
                websocketService.connect(selectedConversation.id);
                // wait for connection or timeout
                await new Promise(resolve => {
                    const timeout = setTimeout(resolve, 800);
                    const onConnected = () => { clearTimeout(timeout); websocketService.off('connected', onConnected); resolve(); };
                    websocketService.on('connected', onConnected);
                });
            }
            if(websocketService.isConnected()) {
                websocketService.sendMessage(selectedConversation.id, newMessage);
            } else {
                // Fallback to REST if WS still not connected
                await chatApi.sendMessage(selectedConversation.id, newMessage);
            }
            setNewMessage('');
        } catch(error) {
            console.error('Error sending message:', error);
        }
    };

    const handleKeyPress = (e) => {
        if(e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <article className="card">
            <header className="card-header">
                <strong className="d-inline-block mr-3">Chat Inbox</strong>
                <div className="float-right">
                    <div className="input-group" style={{maxWidth: '300px'}}>
                        <input
                            className="form-control form-control-sm"
                            placeholder="Search conversations..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <div className="input-group-append">
                            <button className="btn btn-sm btn-outline-secondary" type="button">
                                <i className="fa fa-search"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            <div className="card-body">
                <div className="row">
                    <div className="col-md-4">
                        <div className="list-group" style={{maxHeight: '50vh', overflowY: 'auto'}}>
                            {isLoading ? (
                                <div className="text-center py-4">
                                    <i className="fa fa-spinner fa-spin"></i>
                                    <p className="mt-2 text-muted">Loading conversations...</p>
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="text-center py-4 text-muted">
                                    <i className="fa fa-comments fa-3x mb-3"></i>
                                    <h6>No conversations found</h6>
                                    <p className="small">Customer messages will appear here</p>
                                </div>
                            ) : (
                                conversations
                                    .filter(conv =>
                                        conv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                        conv.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
                                    )
                                    .map(conv => (
                                        <a
                                            key={conv.id}
                                            href="#"
                                            className={`list-group-item list-group-item-action d-flex align-items-start ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                selectConversation(conv);
                                            }}
                                        >
                                            <div className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mr-3" style={{width: '36px', height: '36px', flexShrink: 0}}>
                                                {conv.customer_name ? conv.customer_name.charAt(0).toUpperCase() : 'U'}
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between">
                                                    <strong>{conv.customer_name || conv.customer_email}</strong>
                                                    <small className="text-muted">
                                                        {conv.last_message_at ?
                                                            new Date(conv.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) :
                                                            'Now'
                                                        }
                                                    </small>
                                                </div>
                                                <div className="text-muted small" style={{
                                                    overflow: 'hidden',
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    lineHeight: '1.2',
                                                    maxWidth: '200px'
                                                }}>
                                                    {(() => {
                                                        const content = conv.last_message_preview?.content || 'No messages yet';
                                                        const words = content.split(' ');

                                                        // Check if it's a long word (like hhhhhhhhhhhhhhhhhhhhhh)
                                                        if(words.length === 1 && content.length > 10) {
                                                            return content.substring(0, 4) + '...';
                                                        }

                                                        // For normal text, show 5 words + 1 word on next line + ...
                                                        if(words.length > 6) {
                                                            const firstLine = words.slice(0, 5).join(' ');
                                                            const secondLine = words[5];
                                                            return firstLine + '\n' + secondLine + '...';
                                                        }

                                                        return content;
                                                    })()}
                                                </div>
                                            </div>
                                            {conv.unread_count > 0 && (
                                                <span className="badge bg-danger ml-2">{conv.unread_count}</span>
                                            )}
                                        </a>
                                    ))
                            )}
                        </div>
                    </div>
                    <div className="col-md-8">
                        <div className="card shadow-sm">
                            <div className="card-header d-flex align-items-center justify-content-between">
                                <div className="d-flex align-items-center">
                                    <div className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mr-3" style={{width: '32px', height: '32px', flexShrink: 0}}>
                                        {selectedConversation?.customer_name ? selectedConversation.customer_name.charAt(0).toUpperCase() : 'U'}
                                    </div>
                                    <div>
                                        <div className="fw-semibold">
                                            {selectedConversation?.customer_name || selectedConversation?.customer_email || 'Select a conversation'}
                                        </div>
                                        <div className="small text-muted">
                                            {selectedConversation ? `${selectedConversation.status} · ${selectedConversation.assigned_to ? 'Assigned' : 'Unassigned'}` : ''}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="card-body p-0 d-flex flex-column" style={{height: '50vh'}}>
                                <div ref={messagesContainerRef} className="p-3 bg-light flex-grow-1" style={{overflowY: 'auto'}}>
                                    {!selectedConversation ? (
                                        <div className="text-center text-muted py-5">
                                            <i className="fa fa-comments fa-3x mb-3"></i>
                                            <h6>Select a conversation</h6>
                                            <p>Choose a conversation from the left to start chatting</p>
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center text-muted py-5">
                                            <i className="fa fa-comments fa-3x mb-3"></i>
                                            <h6>No messages yet</h6>
                                            <p>Start the conversation by sending a message</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-center text-muted small mb-2">Today</div>
                                            {messages.map(msg => (
                                                <div key={msg.id} className={`d-flex mb-2 ${msg.is_sender_staff ? 'justify-content-end' : 'justify-content-start'}`}>
                                                    <div className={`${msg.is_sender_staff ? 'bg-primary text-white' : 'bg-white border'} rounded-3 px-3 py-2`} style={{
                                                        maxWidth: '70%',
                                                        wordWrap: 'break-word',
                                                        overflowWrap: 'break-word'
                                                    }}>
                                                        <div style={{
                                                            wordBreak: 'break-word',
                                                            whiteSpace: 'pre-wrap'
                                                        }}>
                                                            {msg.content}
                                                        </div>
                                                        <div className={`small mt-1 ${msg.is_sender_staff ? 'text-light' : 'text-muted'}`}>
                                                            {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                                <div className="border-top p-2">
                                    <div className="input-group">
                                        <textarea
                                            className="form-control"
                                            rows="1"
                                            placeholder="Type a reply..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyPress={handleKeyPress}
                                            disabled={!selectedConversation}
                                        ></textarea>
                                        <button
                                            className="btn btn-primary"
                                            type="button"
                                            onClick={sendMessage}
                                            disabled={!selectedConversation || !newMessage.trim()}
                                        >
                                            <i className="fa fa-paper-plane"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default AdminChatInbox;
