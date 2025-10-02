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
            this.disconnect();
        }
        
        // Try to ensure we have a fresh access token before connecting
        let token = localStorage.getItem('token');
        if (!token || token === 'undefined' || token === 'null') {
            // nothing to do; attempt connect will fail quickly
        }
        
        const wsUrl = `ws://127.0.0.1:8000/ws/admin/orders/?token=${token}`;
        try {
            this.socket = new WebSocket(wsUrl);

            this.socket.onopen = () => {
                this.reconnectAttempts = 0;
                this.emit('connected');
                // Request initial stats when connected
                this.requestOrderStats();
            };

            this.socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    this.emit('message', data);
                    // Also emit by type for convenience
                    if (data?.type) {
                        this.emit(data.type, data);
                    }
                } catch (e) {
                    console.error('Order WS parse error', e);
                }
            };

            this.socket.onclose = async (event) => {
                this.emit('disconnected');
                // 4401/4403 (unauthorized/forbidden) or generic auth failure → try refresh once then reconnect
                if (event && event.code && (event.code === 4401 || event.code === 4403)) {
                    const refreshed = await this.tryRefreshToken();
                    if (refreshed) {
                        this.reconnectAttempts = 0;
                        this.reconnect();
                        return;
                    }
                }
                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
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
            this.socket.send(JSON.stringify({ type: 'get_order_stats' }));
        } else {
        }
    }

    requestPendingOrders() {
        if (this.isConnected()) {
            this.socket.send(JSON.stringify({ type: 'get_pending_orders' }));
        } else {
        }
    }

    send(data) {
        if (this.isConnected()) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('Order WS: Not connected, cannot send message.');
        }
    }
}

export default new OrderWebSocketService();
