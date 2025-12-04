class SocketHandler {
    constructor(io, chatbotService) {
        this.io = io;
        this.chatbotService = chatbotService;
        this.connectedUsers = new Map(); // Track connected users
        this.activeConversations = new Set(); // Track active conversations
    }
    
    initialize() {
        this.io.on('connection', (socket) => {
            console.log(`🔗 New client connected: ${socket.id}`);
            
            // Store connection info
            this.connectedUsers.set(socket.id, {
                sessionId: null,
                connectedAt: new Date(),
                lastActivity: new Date()
            });
            
            this.setupSocketEvents(socket);
        });
        
        // Cleanup inactive connections periodically
        setInterval(() => {
            this.cleanupInactiveConnections();
        }, 300000); // Every 5 minutes
    }
    
    setupSocketEvents(socket) {
        // Handle user messages
        socket.on('user_message', async (data) => {
            try {
                const { message, sessionId, timestamp } = data;
                
                if (!message || !sessionId) {
                    socket.emit('error', { message: 'Invalid message format' });
                    return;
                }
                
                // Update connection info
                const userInfo = this.connectedUsers.get(socket.id);
                if (userInfo) {
                    userInfo.sessionId = sessionId;
                    userInfo.lastActivity = new Date();
                }
                
                // Add to active conversations
                this.activeConversations.add(sessionId);
                
                console.log(`📨 Message from ${sessionId}: ${message.substring(0, 50)}...`);
                
                // Show typing indicator
                socket.emit('typing_start');
                
                // Process message with chatbot service
                const response = await this.chatbotService.processMessage(sessionId, message);
                
                // Simulate slight delay for more natural conversation
                await this.delay(1000 + Math.random() * 1500);
                
                // Stop typing indicator
                socket.emit('typing_stop');
                
                // Send response
                socket.emit('bot_message', {
                    message: response.message,
                    intent: response.intent,
                    quickActions: response.quickActions || [],
                    timestamp: new Date().toISOString(),
                    sessionId: sessionId
                });
                
                // Log the interaction
                this.logInteraction(sessionId, message, response);
                
            } catch (error) {
                console.error('Error handling user message:', error);
                
                socket.emit('typing_stop');
                socket.emit('bot_message', {
                    message: "I'm sorry, I encountered an error. Please try again.",
                    intent: 'error',
                    quickActions: [
                        { label: '🔄 Try Again', value: 'Please try again' },
                        { label: '📞 Contact Support', value: 'I need human support' }
                    ],
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        // Handle typing indicators from users
        socket.on('user_typing_start', (data) => {
            const { sessionId } = data;
            socket.broadcast.emit('user_typing_start', { sessionId });
        });
        
        socket.on('user_typing_stop', (data) => {
            const { sessionId } = data;
            socket.broadcast.emit('user_typing_stop', { sessionId });
        });
        
        // Handle session management
        socket.on('join_session', (data) => {
            const { sessionId } = data;
            socket.join(sessionId);
            
            const userInfo = this.connectedUsers.get(socket.id);
            if (userInfo) {
                userInfo.sessionId = sessionId;
            }
            
            console.log(`👤 Client ${socket.id} joined session: ${sessionId}`);
        });
        
        socket.on('leave_session', (data) => {
            const { sessionId } = data;
            socket.leave(sessionId);
            
            console.log(`👤 Client ${socket.id} left session: ${sessionId}`);
        });
        
        // Handle conversation history requests
        socket.on('get_conversation_history', (data) => {
            const { sessionId } = data;
            const history = this.chatbotService.getConversationHistory(sessionId);
            
            socket.emit('conversation_history', {
                sessionId: sessionId,
                history: history,
                timestamp: new Date().toISOString()
            });
        });
        
        // Handle conversation context requests
        socket.on('get_conversation_context', (data) => {
            const { sessionId } = data;
            const context = this.chatbotService.getConversationContext(sessionId);
            
            socket.emit('conversation_context', {
                sessionId: sessionId,
                context: context,
                timestamp: new Date().toISOString()
            });
        });
        
        // Handle conversation clearing
        socket.on('clear_conversation', (data) => {
            const { sessionId } = data;
            this.chatbotService.clearConversation(sessionId);
            
            socket.emit('conversation_cleared', {
                sessionId: sessionId,
                timestamp: new Date().toISOString()
            });
            
            console.log(`🧹 Conversation cleared for session: ${sessionId}`);
        });
        
        // Handle feedback
        socket.on('feedback', (data) => {
            const { sessionId, messageId, rating, comment } = data;
            
            this.logFeedback(sessionId, messageId, rating, comment);
            
            socket.emit('feedback_received', {
                sessionId: sessionId,
                messageId: messageId,
                timestamp: new Date().toISOString()
            });
            
            console.log(`📝 Feedback received for session ${sessionId}: ${rating}/5`);
        });
        
        // Handle handoff to human agent (placeholder)
        socket.on('request_human_agent', (data) => {
            const { sessionId, reason } = data;
            
            // In a real implementation, this would integrate with your support ticket system
            socket.emit('human_agent_requested', {
                sessionId: sessionId,
                message: "I've notified our support team. A human agent will be with you shortly. Please stay connected.",
                estimatedWaitTime: "2-5 minutes",
                timestamp: new Date().toISOString()
            });
            
            console.log(`👨‍💼 Human agent requested for session ${sessionId}: ${reason}`);
        });
        
        // Handle disconnection
        socket.on('disconnect', (reason) => {
            const userInfo = this.connectedUsers.get(socket.id);
            const sessionId = userInfo?.sessionId;
            
            console.log(`❌ Client disconnected: ${socket.id} (Session: ${sessionId}) - Reason: ${reason}`);
            
            // Remove from active conversations if applicable
            if (sessionId) {
                this.activeConversations.delete(sessionId);
            }
            
            // Remove from connected users
            this.connectedUsers.delete(socket.id);
        });
        
        // Handle connection errors
        socket.on('error', (error) => {
            console.error(`Socket error for client ${socket.id}:`, error);
        });
        
        // Send welcome message
        setTimeout(() => {
            socket.emit('bot_message', {
                message: "👋 Welcome to VitaStore! I'm here to help you find the perfect vitamins for your health goals. How can I assist you today?",
                intent: 'welcome',
                quickActions: [
                    { label: '🔍 Get Recommendations', value: 'I need vitamin recommendations' },
                    { label: '📚 Learn About Vitamins', value: 'Tell me about vitamins' },
                    { label: '📦 Track My Order', value: 'I want to track my order' }
                ],
                timestamp: new Date().toISOString()
            });
        }, 1000);
    }
    
    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    logInteraction(sessionId, userMessage, botResponse) {
        // In a real implementation, this would save to a database
        const logEntry = {
            sessionId: sessionId,
            userMessage: userMessage,
            botResponse: botResponse.message,
            intent: botResponse.intent,
            timestamp: new Date().toISOString()
        };
        
        console.log('📊 Interaction logged:', logEntry);
    }
    
    logFeedback(sessionId, messageId, rating, comment) {
        // In a real implementation, this would save to a database
        const feedbackEntry = {
            sessionId: sessionId,
            messageId: messageId,
            rating: rating,
            comment: comment,
            timestamp: new Date().toISOString()
        };
        
        console.log('📝 Feedback logged:', feedbackEntry);
    }
    
    cleanupInactiveConnections() {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
        
        this.connectedUsers.forEach((userInfo, socketId) => {
            if (userInfo.lastActivity < fiveMinutesAgo) {
                console.log(`🧹 Cleaning up inactive connection: ${socketId}`);
                this.connectedUsers.delete(socketId);
                
                if (userInfo.sessionId) {
                    this.activeConversations.delete(userInfo.sessionId);
                }
            }
        });
    }
    
    // Admin methods for monitoring
    getActiveStats() {
        return {
            connectedUsers: this.connectedUsers.size,
            activeConversations: this.activeConversations.size,
            timestamp: new Date().toISOString()
        };
    }
    
    getConnectedUsers() {
        return Array.from(this.connectedUsers.entries()).map(([socketId, userInfo]) => ({
            socketId,
            ...userInfo
        }));
    }
    
    broadcastMessage(message, sessionId = null) {
        if (sessionId) {
            this.io.to(sessionId).emit('broadcast_message', {
                message: message,
                timestamp: new Date().toISOString()
            });
        } else {
            this.io.emit('broadcast_message', {
                message: message,
                timestamp: new Date().toISOString()
            });
        }
    }
}

module.exports = SocketHandler;