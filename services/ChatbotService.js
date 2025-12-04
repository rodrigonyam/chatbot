const OpenAI = require('openai');
const natural = require('natural');
const compromise = require('compromise');

class ChatbotService {
    constructor() {
        // Initialize OpenAI only if API key is available and not a test key
        if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-test-key-for-development') {
            this.openai = new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });
            console.log('OpenAI initialized for chatbot service');
        } else {
            this.openai = null;
            console.log('OpenAI not configured - using fallback responses');
        }
        
        this.conversationHistory = new Map(); // Store conversations by session ID
        this.vitaminKnowledge = this.loadVitaminKnowledge();
        this.intentClassifier = this.setupIntentClassifier();
        this.conversationContext = new Map(); // Track conversation context
    }
    
    setupIntentClassifier() {
        const classifier = new natural.LogisticRegressionClassifier();
        
        // Train with sample data for intent recognition
        const trainingData = [
            // Product recommendations
            { text: 'I need vitamin recommendations', intent: 'product_recommendation' },
            { text: 'What vitamins should I take', intent: 'product_recommendation' },
            { text: 'Help me find supplements', intent: 'product_recommendation' },
            { text: 'I want to buy vitamins', intent: 'product_recommendation' },
            
            // Health questions
            { text: 'What is vitamin D good for', intent: 'health_information' },
            { text: 'Benefits of vitamin C', intent: 'health_information' },
            { text: 'How much vitamin B12 should I take', intent: 'health_information' },
            
            // Order support
            { text: 'Track my order', intent: 'order_tracking' },
            { text: 'Where is my package', intent: 'order_tracking' },
            { text: 'Order status', intent: 'order_tracking' },
            { text: 'Delivery information', intent: 'order_tracking' },
            
            // General support
            { text: 'I need help', intent: 'general_support' },
            { text: 'Customer service', intent: 'general_support' },
            { text: 'Contact support', intent: 'general_support' },
            
            // Product information
            { text: 'Tell me about this product', intent: 'product_info' },
            { text: 'Product details', intent: 'product_info' },
            { text: 'Ingredients list', intent: 'product_info' },
            
            // Pricing and availability
            { text: 'How much does this cost', intent: 'pricing' },
            { text: 'Is this in stock', intent: 'availability' },
            { text: 'Price information', intent: 'pricing' }
        ];
        
        trainingData.forEach(data => {
            classifier.addDocument(data.text.toLowerCase(), data.intent);
        });
        
        classifier.train();
        return classifier;
    }
    
    loadVitaminKnowledge() {
        return {
            vitamins: {
                'vitamin_a': {
                    name: 'Vitamin A',
                    benefits: ['Eye health', 'Immune function', 'Cell growth', 'Skin health'],
                    sources: ['Carrots', 'Sweet potatoes', 'Spinach', 'Liver'],
                    dailyValue: '900 mcg RAE for men, 700 mcg RAE for women',
                    deficiencySymptoms: ['Night blindness', 'Dry eyes', 'Dry skin']
                },
                'vitamin_b12': {
                    name: 'Vitamin B12',
                    benefits: ['Nerve function', 'Red blood cell formation', 'DNA synthesis', 'Energy metabolism'],
                    sources: ['Meat', 'Fish', 'Dairy products', 'Fortified cereals'],
                    dailyValue: '2.4 mcg',
                    deficiencySymptoms: ['Fatigue', 'Weakness', 'Memory problems']
                },
                'vitamin_c': {
                    name: 'Vitamin C',
                    benefits: ['Immune support', 'Collagen synthesis', 'Antioxidant protection', 'Iron absorption'],
                    sources: ['Citrus fruits', 'Berries', 'Bell peppers', 'Broccoli'],
                    dailyValue: '90 mg for men, 75 mg for women',
                    deficiencySymptoms: ['Fatigue', 'Joint pain', 'Easy bruising']
                },
                'vitamin_d': {
                    name: 'Vitamin D',
                    benefits: ['Bone health', 'Immune function', 'Muscle function', 'Calcium absorption'],
                    sources: ['Sunlight exposure', 'Fatty fish', 'Fortified milk', 'Supplements'],
                    dailyValue: '600-800 IU',
                    deficiencySymptoms: ['Bone pain', 'Muscle weakness', 'Fatigue']
                },
                'vitamin_e': {
                    name: 'Vitamin E',
                    benefits: ['Antioxidant protection', 'Immune function', 'Skin health', 'Cell protection'],
                    sources: ['Nuts', 'Seeds', 'Vegetable oils', 'Green leafy vegetables'],
                    dailyValue: '15 mg',
                    deficiencySymptoms: ['Muscle weakness', 'Vision problems']
                }
            },
            minerals: {
                'iron': {
                    name: 'Iron',
                    benefits: ['Oxygen transport', 'Energy production', 'Immune function'],
                    sources: ['Red meat', 'Spinach', 'Lentils', 'Fortified cereals'],
                    dailyValue: '8 mg for men, 18 mg for women',
                    deficiencySymptoms: ['Fatigue', 'Pale skin', 'Shortness of breath']
                },
                'calcium': {
                    name: 'Calcium',
                    benefits: ['Bone health', 'Muscle function', 'Nerve transmission'],
                    sources: ['Dairy products', 'Leafy greens', 'Fortified foods'],
                    dailyValue: '1000-1200 mg',
                    deficiencySymptoms: ['Weak bones', 'Muscle cramps']
                },
                'magnesium': {
                    name: 'Magnesium',
                    benefits: ['Muscle function', 'Heart health', 'Bone health', 'Energy production'],
                    sources: ['Nuts', 'Seeds', 'Whole grains', 'Leafy greens'],
                    dailyValue: '400-420 mg for men, 310-320 mg for women',
                    deficiencySymptoms: ['Muscle cramps', 'Fatigue', 'Irregular heartbeat']
                }
            }
        };
    }
    
    async processMessage(sessionId, message) {
        try {
            // Get or initialize conversation history
            if (!this.conversationHistory.has(sessionId)) {
                this.conversationHistory.set(sessionId, []);
                this.conversationContext.set(sessionId, { intent: null, extractedInfo: {} });
            }
            
            const history = this.conversationHistory.get(sessionId);
            const context = this.conversationContext.get(sessionId);
            
            // Add user message to history
            history.push({ role: 'user', content: message });
            
            // Classify intent
            const intent = this.classifyIntent(message);
            context.intent = intent;
            
            // Extract entities and information
            const entities = this.extractEntities(message);
            Object.assign(context.extractedInfo, entities);
            
            // Generate response based on intent and context
            const response = await this.generateResponse(intent, message, history, context);
            
            // Add bot response to history
            history.push({ role: 'assistant', content: response.message });
            
            // Keep history manageable (last 20 messages)
            if (history.length > 20) {
                history.splice(0, history.length - 20);
            }
            
            return response;
            
        } catch (error) {
            console.error('Error processing message:', error);
            return {
                message: "I'm sorry, I'm having trouble understanding right now. Could you please try again?",
                intent: 'error',
                quickActions: [
                    { label: '🔍 Get Recommendations', value: 'I need vitamin recommendations' },
                    { label: '📞 Contact Support', value: 'I need to speak with a human' }
                ]
            };
        }
    }
    
    classifyIntent(message) {
        const cleanMessage = message.toLowerCase().trim();
        
        // Use trained classifier
        const classification = this.intentClassifier.classify(cleanMessage);
        
        // Add some rule-based fallbacks for better accuracy
        if (cleanMessage.includes('track') || cleanMessage.includes('order') || cleanMessage.includes('delivery')) {
            return 'order_tracking';
        }
        
        if (cleanMessage.includes('recommend') || cleanMessage.includes('suggest') || cleanMessage.includes('what vitamin')) {
            return 'product_recommendation';
        }
        
        if (cleanMessage.includes('price') || cleanMessage.includes('cost') || cleanMessage.includes('how much')) {
            return 'pricing';
        }
        
        return classification;
    }
    
    extractEntities(message) {
        const doc = compromise(message);
        const entities = {};
        
        // Extract vitamin names
        const vitamins = Object.keys(this.vitaminKnowledge.vitamins);
        const minerals = Object.keys(this.vitaminKnowledge.minerals);
        
        vitamins.forEach(vitamin => {
            const vitaminName = this.vitaminKnowledge.vitamins[vitamin].name;
            if (message.toLowerCase().includes(vitaminName.toLowerCase()) || 
                message.toLowerCase().includes(vitamin)) {
                entities.requestedVitamin = vitamin;
            }
        });
        
        minerals.forEach(mineral => {
            const mineralName = this.vitaminKnowledge.minerals[mineral].name;
            if (message.toLowerCase().includes(mineralName.toLowerCase()) || 
                message.toLowerCase().includes(mineral)) {
                entities.requestedMineral = mineral;
            }
        });
        
        // Extract health conditions or goals
        const healthGoals = ['energy', 'immune', 'bone health', 'skin', 'hair', 'weight loss', 'muscle'];
        healthGoals.forEach(goal => {
            if (message.toLowerCase().includes(goal)) {
                entities.healthGoal = goal;
            }
        });
        
        // Extract age and gender if mentioned
        const ageMatch = message.match(/(\d+)\s*(year|age)/i);
        if (ageMatch) {
            entities.age = parseInt(ageMatch[1]);
        }
        
        if (message.toLowerCase().includes('woman') || message.toLowerCase().includes('female')) {
            entities.gender = 'female';
        } else if (message.toLowerCase().includes('man') || message.toLowerCase().includes('male')) {
            entities.gender = 'male';
        }
        
        return entities;
    }
    
    async generateResponse(intent, message, history, context) {
        switch (intent) {
            case 'product_recommendation':
                return this.handleProductRecommendation(message, context);
                
            case 'health_information':
                return this.handleHealthInformation(message, context);
                
            case 'order_tracking':
                return this.handleOrderTracking(message, context);
                
            case 'product_info':
                return this.handleProductInfo(message, context);
                
            case 'pricing':
                return this.handlePricing(message, context);
                
            case 'availability':
                return this.handleAvailability(message, context);
                
            default:
                return await this.handleGeneralConversation(message, history, context);
        }
    }
    
    handleProductRecommendation(message, context) {
        const { extractedInfo } = context;
        let response = "I'd be happy to help you find the right vitamins! ";
        
        const quickActions = [];
        
        if (extractedInfo.healthGoal) {
            const recommendations = this.getRecommendationsForGoal(extractedInfo.healthGoal);
            response += recommendations;
        } else if (extractedInfo.requestedVitamin) {
            const vitaminInfo = this.vitaminKnowledge.vitamins[extractedInfo.requestedVitamin];
            if (vitaminInfo) {
                response += `${vitaminInfo.name} is great for: ${vitaminInfo.benefits.join(', ')}. `;
                response += `The recommended daily value is ${vitaminInfo.dailyValue}.`;
            }
        } else {
            response += "To give you the best recommendations, could you tell me:\n\n";
            response += "• What health goals do you have?\n";
            response += "• Are you looking for general wellness or specific support?\n";
            response += "• Any dietary restrictions I should know about?";
            
            quickActions.push(
                { label: '💪 Energy & Vitality', value: 'I want more energy and vitality' },
                { label: '🛡️ Immune Support', value: 'I want to boost my immune system' },
                { label: '🦴 Bone Health', value: 'I need vitamins for bone health' },
                { label: '❤️ Heart Health', value: 'I want to support my heart health' }
            );
        }
        
        return {
            message: response,
            intent: 'product_recommendation',
            quickActions: quickActions.length > 0 ? quickActions : [
                { label: '🛒 Browse Products', value: 'Show me your vitamin products' },
                { label: '📋 Take Assessment', value: 'I want to take a health assessment' }
            ]
        };
    }
    
    getRecommendationsForGoal(goal) {
        const recommendations = {
            'energy': 'For energy support, I recommend Vitamin B12, Iron, and Magnesium. These help with energy metabolism and reducing fatigue.',
            'immune': 'For immune support, Vitamin C, Vitamin D, and Zinc are excellent choices. They help strengthen your immune system.',
            'bone health': 'For bone health, Calcium, Vitamin D, and Magnesium work together to maintain strong bones.',
            'skin': 'For skin health, Vitamin E, Vitamin C, and Biotin can help maintain healthy, glowing skin.',
            'hair': 'For hair health, Biotin, Iron, and Vitamin D can support strong, healthy hair growth.'
        };
        
        return recommendations[goal] || 'Let me help you find the right vitamins for your specific needs.';
    }
    
    handleHealthInformation(message, context) {
        const { extractedInfo } = context;
        
        if (extractedInfo.requestedVitamin) {
            const vitaminInfo = this.vitaminKnowledge.vitamins[extractedInfo.requestedVitamin];
            if (vitaminInfo) {
                let response = `**${vitaminInfo.name}** is essential for:\n\n`;
                response += `🎯 **Benefits:** ${vitaminInfo.benefits.join(', ')}\n`;
                response += `📊 **Daily Value:** ${vitaminInfo.dailyValue}\n`;
                response += `🥬 **Natural Sources:** ${vitaminInfo.sources.join(', ')}\n\n`;
                response += `⚠️ **Deficiency symptoms may include:** ${vitaminInfo.deficiencySymptoms.join(', ')}`;
                
                return {
                    message: response,
                    intent: 'health_information',
                    quickActions: [
                        { label: '🛒 Shop ' + vitaminInfo.name, value: 'I want to buy ' + vitaminInfo.name },
                        { label: '📋 More Info', value: 'Tell me more about ' + vitaminInfo.name },
                        { label: '🔍 Other Vitamins', value: 'What other vitamins do you recommend?' }
                    ]
                };
            }
        }
        
        if (extractedInfo.requestedMineral) {
            const mineralInfo = this.vitaminKnowledge.minerals[extractedInfo.requestedMineral];
            if (mineralInfo) {
                let response = `**${mineralInfo.name}** is important for:\n\n`;
                response += `🎯 **Benefits:** ${mineralInfo.benefits.join(', ')}\n`;
                response += `📊 **Daily Value:** ${mineralInfo.dailyValue}\n`;
                response += `🥬 **Natural Sources:** ${mineralInfo.sources.join(', ')}\n\n`;
                response += `⚠️ **Deficiency symptoms may include:** ${mineralInfo.deficiencySymptoms.join(', ')}`;
                
                return {
                    message: response,
                    intent: 'health_information',
                    quickActions: [
                        { label: '🛒 Shop ' + mineralInfo.name, value: 'I want to buy ' + mineralInfo.name },
                        { label: '📋 More Info', value: 'Tell me more about ' + mineralInfo.name }
                    ]
                };
            }
        }
        
        return {
            message: "I'd be happy to provide health information! What specific vitamin, mineral, or health topic would you like to learn about?",
            intent: 'health_information',
            quickActions: [
                { label: '💊 Vitamin D', value: 'Tell me about Vitamin D' },
                { label: '🍊 Vitamin C', value: 'Tell me about Vitamin C' },
                { label: '⚡ Vitamin B12', value: 'Tell me about Vitamin B12' },
                { label: '🦴 Calcium', value: 'Tell me about Calcium' }
            ]
        };
    }
    
    handleOrderTracking(message, context) {
        // In a real implementation, this would integrate with your order management system
        return {
            message: "I can help you track your order! To provide accurate tracking information, I'll need your order number or the email address used for the purchase.\n\nYou can also check your order status by:\n• Logging into your account\n• Checking your email for tracking updates\n• Using our order lookup tool",
            intent: 'order_tracking',
            quickActions: [
                { label: '🔍 Order Lookup', value: 'Help me find my order' },
                { label: '📧 Contact Support', value: 'I need help with my order' },
                { label: '📱 Account Login', value: 'Help me log into my account' }
            ]
        };
    }
    
    handleProductInfo(message, context) {
        return {
            message: "I'd be happy to provide detailed product information! Which vitamin or supplement would you like to learn more about?\n\nI can provide details about:\n• Ingredients and dosage\n• Benefits and usage instructions\n• Quality certifications\n• Customer reviews and ratings",
            intent: 'product_info',
            quickActions: [
                { label: '🔍 Browse All Products', value: 'Show me all vitamin products' },
                { label: '⭐ Top Rated', value: 'What are your best-selling vitamins?' },
                { label: '🆕 New Arrivals', value: 'What new products do you have?' }
            ]
        };
    }
    
    handlePricing(message, context) {
        return {
            message: "I can help you with pricing information! Our vitamins are competitively priced with various options:\n\n💰 **Price Ranges:**\n• Single bottles: $15-$50\n• Bundle deals: Save 15-25%\n• Subscription: Additional 10% off\n• Free shipping on orders $35+\n\nWhich specific products would you like pricing for?",
            intent: 'pricing',
            quickActions: [
                { label: '💝 View Bundle Deals', value: 'Show me bundle deals and discounts' },
                { label: '🚚 Shipping Info', value: 'Tell me about shipping costs' },
                { label: '🔄 Subscription', value: 'How does the subscription work?' }
            ]
        };
    }
    
    handleAvailability(message, context) {
        return {
            message: "Most of our vitamins are currently in stock and ready to ship! We update our inventory in real-time.\n\n📦 **Availability:**\n• 95% of products ship within 24 hours\n• Out-of-stock items show estimated restock dates\n• We offer back-in-stock notifications\n\nWhich specific products are you interested in checking?",
            intent: 'availability',
            quickActions: [
                { label: '📋 Check Stock', value: 'Check availability of specific products' },
                { label: '🔔 Notify Me', value: 'Set up stock notifications' },
                { label: '⚡ Quick Ship', value: 'Show me what ships today' }
            ]
        };
    }
    
    async handleGeneralConversation(message, history, context) {
        try {
            // Use OpenAI for more natural conversations
            const systemPrompt = `You are VitaBot, a helpful and knowledgeable AI assistant for a vitamins and supplements store. 
            You should be friendly, informative, and helpful. Always try to guide conversations toward how you can help with vitamin recommendations, health information, or customer support.
            
            Keep responses concise and actionable. Include relevant quick action buttons when appropriate.
            
            Current conversation context: ${JSON.stringify(context.extractedInfo)}`;
            
            const messages = [
                { role: 'system', content: systemPrompt },
                ...history.slice(-10), // Last 10 messages for context
            ];
            
            if (this.openai) {
                const completion = await this.openai.chat.completions.create({
                    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
                    messages: messages,
                    max_tokens: 200,
                    temperature: 0.7
                });
                
                const response = completion.choices[0].message.content.trim();
                
                return {
                    message: response,
                    intent: 'general_conversation',
                    quickActions: [
                        { label: '🔍 Get Recommendations', value: 'I need vitamin recommendations' },
                        { label: '📞 Customer Support', value: 'I need help with my order' },
                        { label: '❓ Ask About Vitamins', value: 'I have a question about vitamins' }
                    ]
                };
            } else {
                // Fallback response when OpenAI is not available
                return {
                    message: "I'm here to help with your vitamin and supplement needs! I can help you find products, answer questions about vitamins, or provide recommendations. What would you like to know?",
                    intent: 'general_conversation',
                    quickActions: [
                        { label: '🔍 Get Recommendations', value: 'I need vitamin recommendations' },
                        { label: '📞 Customer Support', value: 'I need help with my order' },
                        { label: '❓ Ask About Vitamins', value: 'I have a question about vitamins' }
                    ]
                };
            }
            
        } catch (error) {
            console.error('OpenAI API error:', error);
            return {
                message: "I'm here to help with your vitamin needs! How can I assist you today?",
                intent: 'general_conversation',
                quickActions: [
                    { label: '🔍 Get Recommendations', value: 'I need vitamin recommendations' },
                    { label: '📚 Learn About Vitamins', value: 'Tell me about vitamins' },
                    { label: '🛒 Browse Products', value: 'Show me your products' }
                ]
            };
        }
    }
    
    // Utility methods
    clearConversation(sessionId) {
        this.conversationHistory.delete(sessionId);
        this.conversationContext.delete(sessionId);
    }
    
    getConversationHistory(sessionId) {
        return this.conversationHistory.get(sessionId) || [];
    }
    
    getConversationContext(sessionId) {
        return this.conversationContext.get(sessionId) || { intent: null, extractedInfo: {} };
    }
}

module.exports = ChatbotService;