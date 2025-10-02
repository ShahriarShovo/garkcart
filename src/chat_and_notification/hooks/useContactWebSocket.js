/**
 * Contact Messages WebSocket React Hook
 * Provides real-time Contact Messages updates
 */

import { useState, useEffect, useCallback } from 'react';
import contactWebSocketService from '../api/contactWebsocketService';

const useContactWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [contactCount, setContactCount] = useState({
        unread: 0,
        total: 0
    });
    const [recentContact, setRecentContact] = useState(null);
    const [error, setError] = useState(null);

    /**
     * Handle WebSocket connection
     */
    const handleConnected = useCallback(() => {
        console.log('🔍 DEBUG: Contact WebSocket hook - connected');
        setIsConnected(true);
        setError(null);
        console.log('Contact WebSocket connected');
    }, []);

    /**
     * Handle WebSocket disconnection
     */
    const handleDisconnected = useCallback(() => {
        setIsConnected(false);
        console.log('Contact WebSocket disconnected');
    }, []);

    /**
     * Handle WebSocket errors
     */
    const handleError = useCallback((error) => {
        setError(error);
        console.error('Contact WebSocket error:', error);
    }, []);

    /**
     * Handle new contact message
     */
    const handleNewContact = useCallback((data) => {
        console.log('New contact message received:', data.contact);
        setRecentContact(data.contact);
        
        // Update contact count
        setContactCount(prev => ({
            unread: prev.unread + 1,
            total: prev.total + 1
        }));

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('contact_updated', {
            detail: { type: 'new_contact', contact: data.contact }
        }));
    }, []);

    /**
     * Handle contact message update
     */
    const handleContactUpdated = useCallback((data) => {
        console.log('Contact message updated:', data.contact);
        setRecentContact(data.contact);

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('contact_updated', {
            detail: { type: 'contact_updated', contact: data.contact }
        }));
    }, []);

    /**
     * Handle contact message deletion
     */
    const handleContactDeleted = useCallback((data) => {
        console.log('Contact message deleted:', data.contact_id);
        
        // Update contact count
        setContactCount(prev => ({
            unread: Math.max(0, prev.unread - 1),
            total: Math.max(0, prev.total - 1)
        }));

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('contact_updated', {
            detail: { type: 'contact_deleted', contact_id: data.contact_id }
        }));
    }, []);

    /**
     * Handle contact count update
     */
    const handleContactCountUpdated = useCallback((data) => {
        console.log('Contact count updated:', data);
        setContactCount({
            unread: data.unread_count,
            total: data.total_count
        });

        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('contact_count_updated', {
            detail: { 
                unread_count: data.unread_count,
                total_count: data.total_count
            }
        }));
    }, []);

    /**
     * Handle contact count response
     */
    const handleContactCount = useCallback((data) => {
        console.log('🔍 DEBUG: Contact count received:', data);
        console.log('🔍 DEBUG: Setting contactCount state to:', { unread: data.unread_count, total: data.total_count });
        
        setContactCount({
            unread: data.unread_count,
            total: data.total_count
        });
        
        console.log('🔍 DEBUG: contactCount state set, dispatching events...');
        
        // Dispatch custom event for AdminDashboard
        window.dispatchEvent(new CustomEvent('contact_count_updated', {
            detail: { 
                unread_count: data.unread_count,
                total_count: data.total_count
            }
        }));
        
        console.log('🔍 DEBUG: Contact count event dispatched to AdminDashboard');
        console.log('🔍 DEBUG: contactCount state updated to:', { unread: data.unread_count, total: data.total_count });
        
        // Force re-render by dispatching a custom event
        window.dispatchEvent(new CustomEvent('contact_count_force_update', {
            detail: { 
                unread_count: data.unread_count,
                total_count: data.total_count
            }
        }));
        
        // Direct state update for AdminDashboard
        window.dispatchEvent(new CustomEvent('contact_count_direct_update', {
            detail: { 
                unread_count: data.unread_count,
                total_count: data.total_count
            }
        }));
        
        console.log('🔍 DEBUG: All events dispatched for contact count update');
        
        // Force React re-render by dispatching a custom event
        window.dispatchEvent(new CustomEvent('contact_count_react_update', {
            detail: { 
                unread_count: data.unread_count,
                total_count: data.total_count
            }
        }));
    }, []);

    /**
     * Handle contact statistics
     */
    const handleContactStats = useCallback((data) => {
        console.log('Contact stats received:', data.stats);
        setContactCount({
            unread: data.stats.unread_count,
            total: data.stats.total_count
        });
    }, []);

    /**
     * Connect to WebSocket
     */
    const connect = useCallback(() => {
        console.log('🔍 DEBUG: Contact WebSocket hook - connect() called, isConnected:', isConnected);
        if (!isConnected) {
            console.log('🔍 DEBUG: Contact WebSocket hook - calling contactWebSocketService.connect()');
            contactWebSocketService.connect();
        } else {
            console.log('🔍 DEBUG: Contact WebSocket hook - already connected');
        }
    }, [isConnected]);

    /**
     * Disconnect from WebSocket
     */
    const disconnect = useCallback(() => {
        contactWebSocketService.disconnect();
    }, []);

    /**
     * Request contact count
     */
    const requestContactCount = useCallback(() => {
        if (isConnected) {
            contactWebSocketService.requestContactCount();
        }
    }, [isConnected]);

    /**
     * Request contact statistics
     */
    const requestContactStats = useCallback(() => {
        if (isConnected) {
            contactWebSocketService.requestContactStats();
        }
    }, [isConnected]);

    /**
     * Setup WebSocket event listeners
     */
    useEffect(() => {
        // Add event listeners
        contactWebSocketService.on('connected', handleConnected);
        contactWebSocketService.on('disconnected', handleDisconnected);
        contactWebSocketService.on('error', handleError);
        contactWebSocketService.on('new_contact', handleNewContact);
        contactWebSocketService.on('contact_updated', handleContactUpdated);
        contactWebSocketService.on('contact_deleted', handleContactDeleted);
        contactWebSocketService.on('contact_count_updated', handleContactCountUpdated);
        contactWebSocketService.on('contact_count', handleContactCount);
        contactWebSocketService.on('contact_stats', handleContactStats);

        // Cleanup function
        return () => {
            contactWebSocketService.off('connected', handleConnected);
            contactWebSocketService.off('disconnected', handleDisconnected);
            contactWebSocketService.off('error', handleError);
            contactWebSocketService.off('new_contact', handleNewContact);
            contactWebSocketService.off('contact_updated', handleContactUpdated);
            contactWebSocketService.off('contact_deleted', handleContactDeleted);
            contactWebSocketService.off('contact_count_updated', handleContactCountUpdated);
            contactWebSocketService.off('contact_count', handleContactCount);
            contactWebSocketService.off('contact_stats', handleContactStats);
        };
    }, [
        handleConnected,
        handleDisconnected,
        handleError,
        handleNewContact,
        handleContactUpdated,
        handleContactDeleted,
        handleContactCountUpdated,
        handleContactCount,
        handleContactStats
    ]);

    return {
        isConnected,
        contactCount,
        recentContact,
        error,
        connect,
        disconnect,
        requestContactCount,
        requestContactStats
    };
};

export default useContactWebSocket;
