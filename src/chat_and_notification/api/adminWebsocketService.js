/**
 * WebSocket service for admin inbox (global) real-time updates
 */

class AdminWebSocketService {
    constructor() {
        this.socket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectInterval = 3000;
        this.listeners = new Map();
    }

    connect() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.disconnect();
        }

        const token = localStorage.getItem('token');
        const wsUrl = `ws://127.0.0.1:8000/ws/admin/inbox/?token=${token}`;
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
                    // Also emit by type for convenience
                    if (data?.type) {
                        this.emit(data.type, data);
                    }
                } catch (e) {
                    console.error('Admin WS parse error', e);
                }
            };

            this.socket.onclose = (event) => {
                this.emit('disconnected');
                if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnect();
                }
            };

            this.socket.onerror = (err) => {
                this.emit('error', err);
            };
        } catch (e) {
            console.error('Admin WS connect error', e);
            this.emit('error', e);
        }
    }

    reconnect() {
        this.reconnectAttempts++;
        setTimeout(() => this.connect(), this.reconnectInterval);
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
                try { cb(data); } catch (e) { console.error('Admin WS listener error', e); }
            });
        }
    }

    isConnected() {
        return this.socket && this.socket.readyState === WebSocket.OPEN;
    }
}

export default new AdminWebSocketService();
