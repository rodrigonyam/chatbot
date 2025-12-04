const express = require('express');
const router = express.Router();
const { Conversation, Product, Customer } = require('../models');
const ChatbotService = require('../services/ChatbotService');

const chatbotService = new ChatbotService();

// POST /api/chat/message - Send a message to the chatbot
router.post('/message', async (req, res) => {
    try {
        const { sessionId, message, userAgent, ipAddress } = req.body;
        
        if (!sessionId || !message) {
            return res.status(400).json({
                error: 'Missing required fields: sessionId and message'
            });
        }
        
        // Process message with chatbot service
        const response = await chatbotService.processMessage(sessionId, message);
        
        // Save conversation to database
        await saveConversationMessage(sessionId, message, response, {
            userAgent,
            ipAddress: ipAddress || req.ip
        });
        
        res.json({
            success: true,
            response: response,
            sessionId: sessionId,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error in chat message endpoint:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Unable to process message at this time'
        });
    }
});

// GET /api/chat/conversation/:sessionId - Get conversation history
router.get('/conversation/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const conversation = await Conversation.findOne({ sessionId });
        
        if (!conversation) {
            return res.status(404).json({
                error: 'Conversation not found'
            });
        }
        
        res.json({
            success: true,
            conversation: conversation,
            messageCount: conversation.messages.length
        });
        
    } catch (error) {
        console.error('Error retrieving conversation:', error);
        res.status(500).json({
            error: 'Unable to retrieve conversation'
        });
    }
});

// POST /api/chat/feedback - Submit feedback for a message
router.post('/feedback', async (req, res) => {
    try {
        const { sessionId, messageId, rating, comment } = req.body;
        
        if (!sessionId || !messageId || !rating) {
            return res.status(400).json({
                error: 'Missing required fields: sessionId, messageId, and rating'
            });
        }
        
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                error: 'Rating must be between 1 and 5'
            });
        }
        
        // Find and update conversation with feedback
        const conversation = await Conversation.findOne({ sessionId });
        
        if (!conversation) {
            return res.status(404).json({
                error: 'Conversation not found'
            });
        }
        
        // Add feedback
        conversation.feedback.push({
            messageId: messageId,
            rating: rating,
            comment: comment || '',
            timestamp: new Date()
        });
        
        await conversation.save();
        
        res.json({
            success: true,
            message: 'Feedback submitted successfully'
        });
        
    } catch (error) {
        console.error('Error submitting feedback:', error);
        res.status(500).json({
            error: 'Unable to submit feedback'
        });
    }
});

// POST /api/chat/clear/:sessionId - Clear conversation history
router.post('/clear/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        // Update conversation status to completed
        await Conversation.updateOne(
            { sessionId },
            { 
                status: 'completed',
                endTime: new Date()
            }
        );
        
        // Clear from chatbot service memory
        chatbotService.clearConversation(sessionId);
        
        res.json({
            success: true,
            message: 'Conversation cleared successfully'
        });
        
    } catch (error) {
        console.error('Error clearing conversation:', error);
        res.status(500).json({
            error: 'Unable to clear conversation'
        });
    }
});

// GET /api/chat/products/search - Search products for recommendations
router.get('/products/search', async (req, res) => {
    try {
        const { query, category, limit = 10 } = req.query;
        
        let searchFilter = { isActive: true };
        
        if (category) {
            searchFilter.category = category;
        }
        
        if (query) {
            searchFilter.$or = [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
                { benefits: { $in: [new RegExp(query, 'i')] } },
                { tags: { $in: [new RegExp(query, 'i')] } }
            ];
        }
        
        const products = await Product.find(searchFilter)
            .select('name category description benefits pricing.basePrice inventory.status ratings')
            .limit(parseInt(limit))
            .sort({ 'ratings.average': -1, name: 1 });
        
        res.json({
            success: true,
            products: products,
            count: products.length
        });
        
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({
            error: 'Unable to search products'
        });
    }
});

// GET /api/chat/products/recommendations - Get personalized recommendations
router.get('/products/recommendations', async (req, res) => {
    try {
        const { sessionId, healthGoals, age, gender } = req.query;
        
        // Get conversation context for personalized recommendations
        let context = {};
        if (sessionId) {
            context = chatbotService.getConversationContext(sessionId);
        }
        
        // Build recommendation filter based on health goals and context
        let recommendationFilter = { isActive: true, 'inventory.status': 'in-stock' };
        
        // Add health goal based filtering
        const healthGoalMappings = {
            'energy': ['vitamin-b12', 'iron', 'magnesium', 'b-complex'],
            'immune': ['vitamin-c', 'vitamin-d', 'zinc', 'elderberry'],
            'bone-health': ['calcium', 'vitamin-d', 'magnesium', 'vitamin-k'],
            'heart-health': ['omega-3', 'coq10', 'magnesium', 'vitamin-e'],
            'skin-health': ['vitamin-e', 'vitamin-c', 'biotin', 'collagen']
        };
        
        if (healthGoals) {
            const goalTags = healthGoalMappings[healthGoals] || [];
            if (goalTags.length > 0) {
                recommendationFilter.tags = { $in: goalTags };
            }
        }
        
        const recommendations = await Product.find(recommendationFilter)
            .select('name category description benefits pricing.basePrice ratings images')
            .limit(6)
            .sort({ 'ratings.average': -1 });
        
        res.json({
            success: true,
            recommendations: recommendations,
            criteria: {
                healthGoals: healthGoals,
                age: age,
                gender: gender,
                sessionContext: context.extractedInfo
            }
        });
        
    } catch (error) {
        console.error('Error getting recommendations:', error);
        res.status(500).json({
            error: 'Unable to get recommendations'
        });
    }
});

// POST /api/chat/customer/profile - Update customer profile
router.post('/customer/profile', async (req, res) => {
    try {
        const { sessionId, email, profile, healthProfile } = req.body;
        
        if (!sessionId && !email) {
            return res.status(400).json({
                error: 'Either sessionId or email is required'
            });
        }
        
        let customer;
        
        if (email) {
            // Find or create customer by email
            customer = await Customer.findOne({ email });
            if (!customer) {
                customer = new Customer({ email });
            }
        }
        
        if (profile) {
            customer.profile = { ...customer.profile, ...profile };
        }
        
        if (healthProfile) {
            customer.healthProfile = { ...customer.healthProfile, ...healthProfile };
        }
        
        // Link session to customer
        if (sessionId) {
            const existingSession = customer.chatSessions.find(s => s.sessionId === sessionId);
            if (!existingSession) {
                customer.chatSessions.push({
                    sessionId: sessionId,
                    startTime: new Date(),
                    messageCount: 0
                });
            }
        }
        
        customer.analytics.lastActivity = new Date();
        
        await customer.save();
        
        res.json({
            success: true,
            customer: {
                id: customer._id,
                email: customer.email,
                profile: customer.profile,
                healthProfile: customer.healthProfile
            }
        });
        
    } catch (error) {
        console.error('Error updating customer profile:', error);
        res.status(500).json({
            error: 'Unable to update customer profile'
        });
    }
});

// Helper function to save conversation messages
async function saveConversationMessage(sessionId, userMessage, botResponse, metadata = {}) {
    try {
        let conversation = await Conversation.findOne({ sessionId });
        
        if (!conversation) {
            conversation = new Conversation({
                sessionId: sessionId,
                messages: [],
                context: {
                    intent: null,
                    extractedInfo: {},
                    userProfile: {}
                },
                metadata: {
                    userAgent: metadata.userAgent,
                    ipAddress: metadata.ipAddress,
                    startTime: new Date(),
                    totalMessages: 0
                },
                status: 'active'
            });
        }
        
        // Add user message
        conversation.messages.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        });
        
        // Add bot response
        conversation.messages.push({
            role: 'assistant',
            content: botResponse.message,
            timestamp: new Date(),
            intent: botResponse.intent,
            entities: botResponse.entities || {}
        });
        
        // Update metadata
        conversation.metadata.totalMessages = conversation.messages.length;
        conversation.metadata.lastActivity = new Date();
        
        // Update context if available
        const currentContext = chatbotService.getConversationContext(sessionId);
        if (currentContext) {
            conversation.context = currentContext;
        }
        
        await conversation.save();
        
    } catch (error) {
        console.error('Error saving conversation:', error);
    }
}

module.exports = router;