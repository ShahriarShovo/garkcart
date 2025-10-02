/**
 * Contact Messages Real-time WebSocket Service
 * Handles WebSocket connections for Contact Messages real-time updates
 */

import API_CONFIG from '../../config/apiConfig';

class ContactWebSocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.listeners = new Map();
        this.isConnecting = false;
    }

    /**
     * Connect to Contact WebSocket
     */
    async connect() {
        console.log('🔍 DEBUG: Contact WebSocket connect() called');
        
        if (this.isConnecting) {
            console.log('🔍 DEBUG: Contact WebSocket already connecting, skipping');
            return;
        }

        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log('🔍 DEBUG: Contact WebSocket already open, disconnecting first');
            this.disconnect();
        }

        this.isConnecting = true;
        
        // Try to ensure we have a fresh access token before connecting
        let token = localStorage.getItem('token');
        console.log('🔍 DEBUG: Token for Contact WebSocket:', token ? 'Present' : 'Missing');
        
        if (!token || token === 'undefined' || token === 'null') {
            console.warn('🔍 DEBUG: No valid token found for Contact WebSocket connection');
            this.isConnecting = false;
            return;
        }
        
        const wsUrl = API_CONFIG.getWebSocketUrl(API_CONFIG.ENDPOINTS.WEBSOCKET.ADMIN_CONTACTS, token);
        console.log('🔍 DEBUG: Contact WebSocket URL:', wsUrl);
        
        try {
            console.log('🔍 DEBUG: Creating Contact WebSocket connection...');
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('🔍 DEBUG: Contact WebSocket connection opened');
                this.reconnectAttempts = 0;
                this.isConnecting = false;
                this.emit('connected');
                console.log('Contact WebSocket connected');
                
                // Request initial contact count after connection
                setTimeout(() => {
                    console.log('🔍 DEBUG: Requesting initial contact count from WebSocket');
                    this.requestContactCount();
                }, 100);
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('🔍 DEBUG: Contact WebSocket message received:', data);
                    this.emit('message', data);
                    // Also emit by type for convenience
                    if (data?.type) {
                        console.log('🔍 DEBUG: Contact WebSocket emitting event:', data.type, data);
                        this.emit(data.type, data);
                    }
                } catch (e) {
                    console.error('Contact WS parse error', e);
                }
            };

            this.socket.onclose = (event) => {
                console.log('🔍 DEBUG: Contact WebSocket connection closed, code:', event.code);
                this.isConnecting = false;
                this.emit('disconnected');
                console.log('Contact WebSocket disconnected');

                // Attempt to reconnect if not a normal closure
                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    console.log('🔍 DEBUG: Attempting to reconnect Contact WebSocket');
                    this.reconnect();
                }
            };

            this.socket.onerror = (error) => {
                console.log('🔍 DEBUG: Contact WebSocket error occurred:', error);
                this.isConnecting = false;
                console.error('Contact WebSocket error:', error);
                this.emit('error', error);
            };

        } catch (error) {
            this.isConnecting = false;
            console.error('Error creating Contact WebSocket connection:', error);
            this.emit('error', error);
        }
    }

    /**
     * Reconnect to Contact WebSocket
     */
    reconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('Max reconnection attempts reached for Contact WebSocket');
            return;
        }

        this.reconnectAttempts++;
        console.log(`Attempting to reconnect Contact WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            this.connect();
        }, this.reconnectInterval);
    }

    /**
     * Disconnect from Contact WebSocket
     */
    disconnect() {
        if (this.socket) {
            this.socket.close(1000, 'Normal closure');
            this.socket = null;
        }
        this.reconnectAttempts = 0;
        this.isConnecting = false;
    }

    /**
     * Check if WebSocket is connected
     */
    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    /**
     * Send message through WebSocket
     */
    send(data) {
        if (this.isConnected()) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('Contact WebSocket not connected, cannot send message');
        }
    }

    /**
     * Request contact count
     */
    requestContactCount() {
        this.send({ type: 'get_contact_count' });
    }

    /**
     * Request contact statistics
     */
    requestContactStats() {
        this.send({ type: 'get_contact_stats' });
    }

    /**
     * Add event listener
     */
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Remove event listener
     */
    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit event to listeners
     */
    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Error in Contact WebSocket event listener for ${event}:`, error);
                }
            });
        }
    }

    /**
     * Remove all listeners
     */
    removeAllListeners() {
        this.listeners.clear();
    }
}

// Create singleton instance
const contactWebSocketService = new ContactWebSocketService();

export default contactWebSocketService;
