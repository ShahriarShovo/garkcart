/**
 * WebSocket service for order management real-time updates
 */

class OrderWebSocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.listeners = new Map();
        this.refreshInProgress = false;
    }

    async connect() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            console.log('Order WS: Already connected, disconnecting first');
            this.disconnect();
        }
        
        // Try to ensure we have a fresh access token before connecting
        let token = localStorage.getItem('token');
        if (!token || token === 'undefined' || token === 'null') {
            console.log('Order WS: No valid token found');
            // nothing to do; attempt connect will fail quickly
        }
        
        const wsUrl = `ws://127.0.0.1:8000/ws/admin/orders/?token=${token}`;
        console.log('Order WS: Attempting to connect to:', wsUrl);
        try {
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                console.log('Order WS: Connection opened successfully');
                this.reconnectAttempts = 0;
                this.emit('connected');
                // Request initial stats when connected
                this.requestOrderStats();
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log('Order WS: Message received:', data);
                    this.emit('message', data);
                    // Also emit by type for convenience
                    if (data?.type) {
                        console.log(`Order WS: Emitting event: ${data.type}`);
                        this.emit(data.type, data);
                    }
                } catch (e) {
                    console.error('Order WS parse error', e);
                }
            };

            this.socket.onclose = async (event) => {
                console.log('Order WS: Connection closed with code:', event.code);
                this.emit('disconnected');
                // 4401/4403 (unauthorized/forbidden) or generic auth failure → try refresh once then reconnect
                if (event && event.code && (event.code === 4401 || event.code === 4403)) {
                    console.log('Order WS: Authentication error, attempting token refresh');
                    const refreshed = await this.tryRefreshToken();
                    if (refreshed) {
                        this.reconnectAttempts = 0;
                        this.reconnect();
                        return;
                    }
                }
                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    console.log('Order WS: Attempting to reconnect...');
                    this.reconnect();
                }
            };

            this.socket.onerror = (err) => {
                console.error('Order WS: Connection error:', err);
                this.emit('error', err);
            };
        } catch (e) {
            console.error('Order WS connect error', e);
            this.emit('error', e);
        }
    }

    reconnect() {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.reconnectInterval);
    }

    async tryRefreshToken() {
        if (this.refreshInProgress) return false;
        this.refreshInProgress = true;
        try {
            const raw = localStorage.getItem('refresh_token');
            if (!raw) return false;
            const resp = await fetch(`${window?.API_BASE_URL || 'http://127.0.0.1:8000'}/api/accounts/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: raw })
            });
            if (!resp.ok) return false;
            const data = await resp.json();
            if (data && data.access) {
                localStorage.setItem('token', data.access);
                return true;
            }
            return false;
        } catch (e) {
            return false;
        } finally {
            this.refreshInProgress = false;
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.close(1000, 'Normal closure');
            this.socket = null;
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const idx = callbacks.indexOf(callback);
            if (idx > -1) callbacks.splice(idx, 1);
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => {
                try { cb(data); } catch (e) { console.error('Order WS listener error', e); }
            });
        }
    }

    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }

    // Order-specific methods
    requestOrderStats() {
        if (this.isConnected()) {
            console.log('Order WS: Requesting order stats');
            this.socket.send(JSON.stringify({ type: 'get_order_stats' }));
        } else {
            console.log('Order WS: Not connected, cannot request order stats');
        }
    }

    requestPendingOrders() {
        if (this.isConnected()) {
            console.log('Order WS: Requesting pending orders');
            this.socket.send(JSON.stringify({ type: 'get_pending_orders' }));
        } else {
            console.log('Order WS: Not connected, cannot request pending orders');
        }
    }

    send(data) {
        if (this.isConnected()) {
            console.log('Order WS: Sending message:', data);
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('Order WS: Not connected, cannot send message.');
        }
    }
}

export default new OrderWebSocketService();
