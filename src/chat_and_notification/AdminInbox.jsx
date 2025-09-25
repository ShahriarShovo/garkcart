import React, {useState, useEffect} from 'react';
import chatApi from './api/chatApi';
import websocketService from './api/websocketService';

const AdminInbox = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        try {
            setIsLoading(true);
            const data = await chatApi.getInbox();
            setConversations(data);
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

            // Connect to WebSocket for real-time updates
            connectToConversation(conversation.id);
        } catch(error) {
            console.error('Error loading messages:', error);
        }
    };

    const connectToConversation = (conversationId) => {
        websocketService.on('connected', () => {
            setIsConnected(true);
        });

        websocketService.on('disconnected', () => {
            setIsConnected(false);
        });

        websocketService.on('message', (data) => {
            if(data.type === 'chat_message') {
                const newMessage = {
                    id: data.message.id,
                    content: data.message.content,
                    sender: data.message.sender,
                    sender_name: data.message.sender_name,
                    is_sender_staff: data.message.is_sender_staff,
                    created_at: data.message.created_at
                };
                setMessages(prev => [...prev, newMessage]);
            }
        });

        websocketService.connect(conversationId);
    };

    const sendMessage = async () => {
        if(!newMessage.trim() || !selectedConversation) return;

        try {
            await chatApi.sendMessage(selectedConversation.id, newMessage.trim());
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

    const filteredConversations = conversations.filter(conv =>
        conv.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conv.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="row" style={{height: 'calc(80vh - 120px)'}}>
            {/* Left Panel - Conversations List */}
            <div className="col-md-4 border-end d-flex flex-column">

                <div className="flex-grow-1" style={{overflowY: 'auto', padding: '12px'}}>
                    {isLoading ? (
                        <div className="text-center py-4">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-2 text-muted">Loading conversations...</p>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="text-center py-4 text-muted">
                            <i className="fa fa-comments fa-3x mb-3"></i>
                            <h6>No conversations found</h6>
                            <p className="small">Customer messages will appear here</p>
                        </div>
                    ) : (
                        <div className="conversation-list">
                            {conversations.map(conv => (
                                <div
                                    key={conv.id}
                                    className={`conversation-item ${selectedConversation?.id === conv.id ? 'active' : ''}`}
                                    onClick={() => selectConversation(conv)}
                                    style={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #e9ecef',
                                        borderRadius: '4px',
                                        marginBottom: '4px',
                                        padding: '12px 16px',
                                        cursor: 'pointer',
                                        transition: 'all 0.15s ease',
                                        boxShadow: 'none',
                                        borderLeft: selectedConversation?.id === conv.id ? '3px solid #007bff' : '3px solid transparent'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.target.style.backgroundColor = '#f8f9fa';
                                        e.target.style.borderColor = '#dee2e6';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.target.style.backgroundColor = '#ffffff';
                                        e.target.style.borderColor = '#e9ecef';
                                    }}
                                >
                                    <div className="d-flex align-items-start">
                                        <div className="avatar rounded-circle text-white d-flex align-items-center justify-content-center mr-3"
                                            style={{
                                                width: '40px',
                                                height: '40px',
                                                flexShrink: 0,
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                backgroundColor: '#6c757d'
                                            }}>
                                            {conv.customer_name ? conv.customer_name.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between align-items-start mb-1">
                                                <strong className="text-truncate" style={{maxWidth: '150px', fontSize: '14px', color: '#212529', fontWeight: '500'}}>
                                                    {conv.customer_name || conv.customer_email || 'Unknown Customer'}
                                                </strong>
                                                <div className="d-flex align-items-center">
                                                    <small className="text-muted mr-2" style={{fontSize: '11px', color: '#6c757d'}}>
                                                        {conv.last_message_at ?
                                                            new Date(conv.last_message_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}) :
                                                            'Now'
                                                        }
                                                    </small>
                                                    {conv.unread_count > 0 && (
                                                        <span className="badge badge-danger badge-pill" style={{fontSize: '9px', minWidth: '16px', height: '16px', padding: '2px 6px'}}>
                                                            {conv.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-muted small" style={{fontSize: '11px', lineHeight: '1.4', color: '#6c757d'}}>
                                                {(() => {
                                                    const message = conv.last_message_preview?.content || 'No messages yet';
                                                    if(message === 'No messages yet') return message;

                                                    const words = message.split(' ');
                                                    if(words.length <= 7) {
                                                        return message;
                                                    } else {
                                                        return words.slice(0, 7).join(' ') + '...';
                                                    }
                                                })()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Panel - Chat Messages */}
            <div className="col-md-8 d-flex flex-column">
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="card-header d-flex align-items-center justify-content-between bg-light">
                            <div className="d-flex align-items-center">
                                <div className="avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mr-3"
                                    style={{width: '40px', height: '40px', flexShrink: 0, fontSize: '16px', fontWeight: 'bold'}}>
                                    {selectedConversation.customer_name ? selectedConversation.customer_name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div>
                                    <div className="fw-semibold">{selectedConversation.customer_name || selectedConversation.customer_email || 'Unknown Customer'}</div>
                                    <div className="small text-muted">
                                        <i className={`fa fa-circle ${isConnected ? 'text-success' : 'text-secondary'} mr-1`}></i>
                                        {isConnected ? 'Online' : 'Offline'} ·
                                        <span className={`badge badge-sm ml-1 ${selectedConversation.status === 'open' ? 'badge-success' :
                                            selectedConversation.status === 'closed' ? 'badge-secondary' : 'badge-warning'
                                            }`}>
                                            {selectedConversation.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="d-flex align-items-center">
                                <button className="btn btn-sm btn-outline-secondary mr-2" title="Assign conversation">
                                    <i className="fa fa-user-plus"></i> Assign
                                </button>
                                <button className="btn btn-sm btn-outline-secondary" title="Archive conversation">
                                    <i className="fa fa-archive"></i>
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-grow-1 p-3" style={{overflowY: 'auto', backgroundColor: '#f8f9fa'}}>
                            {messages.length === 0 ? (
                                <div className="text-center text-muted py-5">
                                    <i className="fa fa-comments fa-3x mb-3"></i>
                                    <h6>No messages yet</h6>
                                    <p>Start the conversation by sending a message</p>
                                </div>
                            ) : (
                                <div className="messages-container">
                                    {/* Today separator */}
                                    <div className="text-center text-muted mb-3">
                                        <small>Today</small>
                                    </div>

                                    {messages.map(msg => (
                                        <div key={msg.id} className={`d-flex mb-3 ${msg.is_sender_staff ? 'justify-content-end' : 'justify-content-start'}`}>
                                            <div className={`message-bubble ${msg.is_sender_staff ? 'admin-message' : 'customer-message'}`}
                                                style={{
                                                    maxWidth: '70%',
                                                    backgroundColor: msg.is_sender_staff ? '#007bff' : '#ffffff',
                                                    color: msg.is_sender_staff ? 'white' : 'black',
                                                    padding: '10px 15px',
                                                    borderRadius: '18px',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                                    border: msg.is_sender_staff ? 'none' : '1px solid #e9ecef'
                                                }}>
                                                <div className="message-content">{msg.content}</div>
                                                <div className={`small mt-1 ${msg.is_sender_staff ? 'text-light' : 'text-muted'}`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="border-top p-3 bg-white">
                            <div className="input-group">
                                <textarea
                                    className="form-control"
                                    rows={2}
                                    placeholder="Type a reply..."
                                    value={newMessage}
                                    onChange={e => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    style={{resize: 'none', borderRadius: '20px'}}
                                />
                                <div className="input-group-append">
                                    <button
                                        className="btn btn-primary rounded-circle"
                                        type="button"
                                        onClick={sendMessage}
                                        disabled={!newMessage.trim()}
                                        style={{width: '40px', height: '40px', marginLeft: '10px'}}
                                        title="Send message"
                                    >
                                        <i className="fa fa-paper-plane"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="d-flex align-items-center justify-content-center h-100 bg-light">
                        <div className="text-center text-muted">
                            <i className="fa fa-comments fa-4x mb-4"></i>
                            <h5>Select a conversation</h5>
                            <p>Choose a conversation from the left panel to start chatting</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminInbox;