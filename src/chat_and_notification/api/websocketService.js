/**
 * WebSocket service for real-time chat communication
 */

class WebSocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.listeners = new Map();
    }

    /**
     * Connect to WebSocket
     */
    connect(conversationId) {
        if(this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.disconnect();
        }

        const token = localStorage.getItem('token');
        const wsUrl = `ws://127.0.0.1:8000/ws/chat/${conversationId}/?token=${token}`;
        try {
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                this.reconnectAttempts = 0;
                this.emit('connected');
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.emit('message', data);
                } catch(error) {
                    console.error('Error parsing WebSocket message:', error);
                }
            };

            this.socket.onclose = (event) => {
                this.emit('disconnected');

                // Attempt to reconnect if not a normal closure
                if(event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnect(conversationId);
                }
            };

            this.socket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.emit('error', error);
            };

        } catch(error) {
            console.error('Error creating WebSocket connection:', error);
            this.emit('error', error);
        }
    }

    /**
     * Reconnect to WebSocket
     */
    reconnect(conversationId) {
        this.reconnectAttempts++;
        setTimeout(() => {
            this.connect(conversationId);
        }, this.reconnectInterval);
    }

    /**
     * Disconnect from WebSocket
     */
    disconnect() {
        if(this.socket) {
            this.socket.close(1000, 'Normal closure');
            this.socket = null;
        }
    }

    /**
     * Send message through WebSocket
     */
    sendMessage(conversationId, content) {
        if(this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'chat_message',
                message: content
            }));
        } else {
            console.error('WebSocket is not connected');
        }
    }

    /**
     * Send typing indicator
     */
    sendTypingStart() {
        if(this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'typing_start'
            }));
        }
    }

    /**
     * Send typing stop indicator
     */
    sendTypingStop() {
        if(this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'typing_stop'
            }));
        }
    }

    /**
     * Mark messages as read
     */
    markMessagesRead(messageIds) {
        if(this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify({
                type: 'mark_read',
                message_ids: messageIds
            }));
        }
    }

    /**
     * Add event listener
     */
    on(event, callback) {
        if(!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if(this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if(index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event to listeners
     */
    emit(event, data) {
        if(this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch(error) {
                    console.error('Error in event listener:', error);
                }
            });
        }
    }

    /**
     * Get connection status
     */
    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }
}

export default new WebSocketService();
