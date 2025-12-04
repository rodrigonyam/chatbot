// Chatbot JavaScript Module
class VitaChatbot {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.isTyping = false;
        this.messageHistory = [];
        this.sessionId = this.generateSessionId();
        
        // DOM elements
        this.chatToggle = document.getElementById('chat-toggle');
        this.chatWindow = document.getElementById('chat-window');
        this.chatMessages = document.getElementById('chat-messages');
        this.messageInput = document.getElementById('message-input');
        this.sendButton = document.getElementById('send-button');
        this.typingIndicator = document.getElementById('typing-indicator');
        this.notificationBadge = document.getElementById('notification-badge');
        
        this.initialize();
    }
    
    initialize() {
        this.setupEventListeners();
        this.connectSocket();
        this.loadChatHistory();
        
        // Show welcome message after a delay
        setTimeout(() => {
            this.showNotification();
        }, 3000);
    }
    
    generateSessionId() {
        return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
    }
    
    setupEventListeners() {
        // Chat toggle
        this.chatToggle.addEventListener('click', () => this.toggleChat());
        
        // Message input
        this.messageInput.addEventListener('input', (e) => this.handleInputChange(e));
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Send button
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Close chat when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.chatWindow.contains(e.target) && !this.chatToggle.contains(e.target)) {
                if (this.chatWindow.classList.contains('open')) {
                    this.closeChat();
                }
            }
        });
        
        // Prevent chat window from closing when clicking inside
        this.chatWindow.addEventListener('click', (e) => e.stopPropagation());
    }
    
    connectSocket() {
        try {
            this.socket = io({
                transports: ['websocket', 'polling']
            });
            
            this.socket.on('connect', () => {
                console.log('🔗 Connected to chatbot server');
                this.isConnected = true;
                this.updateConnectionStatus(true);
            });
            
            this.socket.on('disconnect', () => {
                console.log('❌ Disconnected from chatbot server');
                this.isConnected = false;
                this.updateConnectionStatus(false);
            });
            
            this.socket.on('bot_message', (data) => {
                this.handleBotMessage(data);
            });
            
            this.socket.on('typing_start', () => {
                this.showTypingIndicator();
            });
            
            this.socket.on('typing_stop', () => {
                this.hideTypingIndicator();
            });
            
            this.socket.on('error', (error) => {
                console.error('Socket error:', error);
                this.showToast('Connection error. Please try again.', 'error');
            });
            
        } catch (error) {
            console.error('Failed to connect to server:', error);
            this.showToast('Unable to connect to chat service.', 'error');
        }
    }
    
    updateConnectionStatus(connected) {
        const statusDot = document.querySelector('.status-dot');
        const statusText = document.querySelector('.status');
        
        if (connected) {
            statusDot.classList.add('online');
            statusText.innerHTML = '<span class="status-dot online"></span>Online';
        } else {
            statusDot.classList.remove('online');
            statusText.innerHTML = '<span class="status-dot"></span>Connecting...';
        }
    }
    
    toggleChat() {
        if (this.chatWindow.classList.contains('open')) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }
    
    openChat() {
        this.chatWindow.classList.add('open');
        this.chatToggle.style.display = 'none';
        this.hideNotification();
        this.messageInput.focus();
        
        // Scroll to bottom
        this.scrollToBottom();
    }
    
    closeChat() {
        this.chatWindow.classList.remove('open');
        this.chatToggle.style.display = 'flex';
    }
    
    minimizeChat() {
        this.closeChat();
    }
    
    handleInputChange(e) {
        const message = e.target.value.trim();
        const charCount = e.target.value.length;
        
        // Update character count
        document.querySelector('.char-count').textContent = `${charCount}/500`;
        
        // Enable/disable send button
        this.sendButton.disabled = !message || charCount > 500;
        
        // Auto-resize textarea (if needed)
        e.target.style.height = 'auto';
        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    }
    
    sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || !this.isConnected) return;
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Clear input
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';
        this.sendButton.disabled = true;
        document.querySelector('.char-count').textContent = '0/500';
        
        // Send to server
        this.socket.emit('user_message', {
            message: message,
            sessionId: this.sessionId,
            timestamp: new Date().toISOString()
        });
        
        // Show typing indicator
        this.showTypingIndicator();
    }
    
    sendQuickMessage(message) {
        if (!this.isConnected) {
            this.showToast('Please wait while we connect to the chat service.', 'warning');
            return;
        }
        
        this.messageInput.value = message;
        this.sendMessage();
    }
    
    addMessage(content, sender, options = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'message-avatar';
        avatarDiv.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        const textDiv = document.createElement('div');
        textDiv.className = 'message-text';
        
        // Process message content (handle HTML, links, etc.)
        textDiv.innerHTML = this.processMessageContent(content);
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'message-time';
        timeDiv.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        contentDiv.appendChild(textDiv);
        contentDiv.appendChild(timeDiv);
        
        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);
        
        // Add quick actions for bot messages
        if (sender === 'bot' && options.quickActions) {
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'quick-actions';
            
            options.quickActions.forEach(action => {
                const button = document.createElement('button');
                button.className = 'quick-action';
                button.textContent = action.label;
                button.onclick = () => this.sendQuickMessage(action.value);
                actionsDiv.appendChild(button);
            });
            
            contentDiv.appendChild(actionsDiv);
        }
        
        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Store in history
        this.messageHistory.push({
            content,
            sender,
            timestamp: new Date().toISOString(),
            options
        });
        
        // Save to localStorage
        this.saveChatHistory();
    }
    
    handleBotMessage(data) {
        this.hideTypingIndicator();
        
        const { message, quickActions, suggestions } = data;
        
        this.addMessage(message, 'bot', { 
            quickActions: quickActions || suggestions 
        });
    }
    
    processMessageContent(content) {
        // Convert URLs to links
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        content = content.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
        
        // Convert newlines to <br>
        content = content.replace(/\n/g, '<br>');
        
        // Process markdown-style formatting
        content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        content = content.replace(/\*(.*?)\*/g, '<em>$1</em>');
        content = content.replace(/`(.*?)`/g, '<code>$1</code>');
        
        return content;
    }
    
    showTypingIndicator() {
        this.isTyping = true;
        this.typingIndicator.classList.add('show');
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        this.isTyping = false;
        this.typingIndicator.classList.remove('show');
    }
    
    showNotification() {
        this.notificationBadge.classList.add('show');
        
        // Also show a toast notification
        setTimeout(() => {
            this.showToast('👋 Hi! I\'m here to help you find the perfect vitamins!', 'info');
        }, 500);
    }
    
    hideNotification() {
        this.notificationBadge.classList.remove('show');
    }
    
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }
    
    showToast(message, type = 'info') {
        const toast = document.getElementById('notification-toast');
        const icon = toast.querySelector('.toast-icon');
        const text = toast.querySelector('.toast-message');
        
        // Set content
        text.textContent = message;
        
        // Set icon based on type
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        icon.className = `toast-icon ${icons[type] || icons.info}`;
        
        // Set type class
        toast.className = `notification-toast ${type}`;
        toast.style.display = 'flex';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            toast.style.display = 'none';
        }, 5000);
    }
    
    saveChatHistory() {
        try {
            localStorage.setItem(`vitachat_history_${this.sessionId}`, JSON.stringify(this.messageHistory));
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }
    
    loadChatHistory() {
        try {
            const saved = localStorage.getItem(`vitachat_history_${this.sessionId}`);
            if (saved) {
                this.messageHistory = JSON.parse(saved);
                
                // Restore messages (limit to last 50 for performance)
                const recentMessages = this.messageHistory.slice(-50);
                recentMessages.forEach(msg => {
                    if (msg.sender !== 'bot' || !msg.content.includes('👋 Hi!')) { // Skip welcome messages
                        this.addMessage(msg.content, msg.sender, msg.options);
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load chat history:', error);
        }
    }
    
    clearHistory() {
        this.messageHistory = [];
        this.chatMessages.innerHTML = `
            <div class="message bot-message welcome-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <div class="message-text">
                        👋 Hi! I'm VitaBot, your personal vitamin assistant. How can I help you today?
                    </div>
                    <div class="quick-actions">
                        <button class="quick-action" onclick="vitaBot.sendQuickMessage('I need vitamin recommendations')">
                            🔍 Get Recommendations
                        </button>
                        <button class="quick-action" onclick="vitaBot.sendQuickMessage('Track my order')">
                            📦 Track Order
                        </button>
                        <button class="quick-action" onclick="vitaBot.sendQuickMessage('I have a question about vitamins')">
                            ❓ Ask Question
                        </button>
                    </div>
                </div>
            </div>
        `;
        this.saveChatHistory();
    }
    
    // API methods for external use
    isOnline() {
        return this.isConnected;
    }
    
    getSessionId() {
        return this.sessionId;
    }
    
    getMessageHistory() {
        return [...this.messageHistory];
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.vitaBot = new VitaChatbot();
});

// Global functions for inline event handlers
function toggleChat() {
    if (window.vitaBot) {
        window.vitaBot.toggleChat();
    }
}

function openChat() {
    if (window.vitaBot) {
        window.vitaBot.openChat();
    }
}

function closeChat() {
    if (window.vitaBot) {
        window.vitaBot.closeChat();
    }
}

function minimizeChat() {
    if (window.vitaBot) {
        window.vitaBot.minimizeChat();
    }
}

function sendMessage() {
    if (window.vitaBot) {
        window.vitaBot.sendMessage();
    }
}

function sendQuickMessage(message) {
    if (window.vitaBot) {
        window.vitaBot.sendQuickMessage(message);
    }
}

// Utility functions for the main website
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VitaChatbot;
}