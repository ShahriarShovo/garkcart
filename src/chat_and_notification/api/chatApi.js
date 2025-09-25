/**
 * Chat API service for communicating with backend
 */

const API_BASE_URL = 'http://localhost:8000/api/chat';

class ChatApiService {
    constructor() {
        this.baseURL = API_BASE_URL;
    }

    /**
     * Get authorization headers with token
     */
    getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    }

    /**
     * Create a new conversation
     */
    async createConversation() {
        try {
            const response = await fetch(`${this.baseURL}/conversations/`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    status: 'open'
                })
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error creating conversation:', error);
            throw error;
        }
    }

    /**
     * Get user's conversations
     */
    async getConversations() {
        try {
            const response = await fetch(`${this.baseURL}/conversations/`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error fetching conversations:', error);
            throw error;
        }
    }

    /**
     * Get messages for a conversation
     */
    async getMessages(conversationId) {
        try {
            const response = await fetch(`${this.baseURL}/messages/?conversation=${conversationId}`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }

    /**
     * Send a message
     */
    async sendMessage(conversationId, content) {
        try {
            const response = await fetch(`${this.baseURL}/messages/`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    conversation: conversationId,
                    content: content,
                    message_type: 'text'
                })
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error sending message:', error);
            throw error;
        }
    }

    /**
     * Get admin inbox
     */
    async getInbox() {
        try {
            const response = await fetch(`${this.baseURL}/inbox/`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error fetching inbox:', error);
            throw error;
        }
    }

    /**
     * Mark messages as read
     */
    async markMessagesRead(messageIds) {
        try {
            const response = await fetch(`${this.baseURL}/messages/mark-read/`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    message_ids: messageIds
                })
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error marking messages as read:', error);
            throw error;
        }
    }

    /**
     * Mark all messages in a conversation as read
     */
    async markMessagesAsRead(conversationId) {
        try {
            const response = await fetch(`${this.baseURL}/messages/mark_read/`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({
                    conversation_id: conversationId
                })
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error marking conversation messages as read:', error);
            throw error;
        }
    }

    /**
     * Get unread message count
     */
    async getUnreadCount() {
        try {
            const response = await fetch(`${this.baseURL}/messages/unread_count/`, {
                method: 'GET',
                headers: this.getAuthHeaders()
            });

            if(!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch(error) {
            console.error('Error fetching unread count:', error);
            throw error;
        }
    }
}

export default new ChatApiService();
