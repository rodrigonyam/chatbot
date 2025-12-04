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
        const { query, category, limit = 50 } = req.query;
        
        // Try database first, fall back to static data if not available
        let products = [];
        
        try {
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
            
            products = await Product.find(searchFilter)
                .select('name category description benefits pricing inventory.status ratings tags subcategory')
                .limit(parseInt(limit))
                .sort({ 'ratings.average': -1, name: 1 });
        } catch (dbError) {
            console.log('Database not available, using static product data');
            // Use static fallback data
            products = getStaticProducts();
            
            // Apply filtering for category
            if (category) {
                products = products.filter(p => p.category === category);
            }
            
            // Apply search query
            if (query) {
                const queryLower = query.toLowerCase();
                products = products.filter(p => 
                    p.name.toLowerCase().includes(queryLower) ||
                    p.description.toLowerCase().includes(queryLower) ||
                    (p.benefits && p.benefits.some(b => b.toLowerCase().includes(queryLower))) ||
                    (p.tags && p.tags.some(t => t.toLowerCase().includes(queryLower)))
                );
            }
            
            // Limit results
            products = products.slice(0, parseInt(limit));
        }
        
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

// Static product data for development/fallback
function getStaticProducts() {
    return [
        // Vitamins
        {
            _id: 'vitamin-d3',
            name: "Vitamin D3 2000 IU",
            category: "vitamins",
            subcategory: "fat-soluble",
            description: "High-potency Vitamin D3 to support bone health, immune function, and overall wellness.",
            benefits: ["Supports bone and teeth health", "Boosts immune system function", "Helps regulate mood and energy levels"],
            pricing: { basePrice: 24.99, salePrice: 19.99 },
            ratings: { average: 4.8, count: 234 },
            tags: ["vitamin-d", "bone-health", "immune-support"],
            inventory: { stock: 150, status: "in-stock" }
        },
        {
            _id: 'vitamin-c',
            name: "Vitamin C 1000mg with Rose Hips",
            category: "vitamins",
            subcategory: "water-soluble",
            description: "High-potency vitamin C with natural rose hips for enhanced absorption and antioxidant protection.",
            benefits: ["Powerful antioxidant protection", "Supports immune system", "Promotes collagen synthesis"],
            pricing: { basePrice: 19.99, salePrice: 16.99 },
            ratings: { average: 4.5, count: 456 },
            tags: ["vitamin-c", "immune-support", "antioxidant"],
            inventory: { stock: 289, status: "in-stock" }
        },
        {
            _id: 'vitamin-a',
            name: "Vitamin A 10000 IU",
            category: "vitamins",
            subcategory: "fat-soluble",
            description: "Essential vitamin A for healthy vision, immune function, and cellular growth.",
            benefits: ["Supports healthy vision", "Promotes immune system function", "Essential for cellular growth"],
            pricing: { basePrice: 16.99 },
            ratings: { average: 4.4, count: 189 },
            tags: ["vitamin-a", "vision-health", "immune-support"],
            inventory: { stock: 198, status: "in-stock" }
        },
        {
            _id: 'b-complex',
            name: "B-Complex Stress Formula",
            category: "vitamins",
            subcategory: "b-vitamins",
            description: "Complete B-vitamin complex to support energy metabolism and nervous system function.",
            benefits: ["Supports energy production", "Promotes nervous system health", "Helps manage stress"],
            pricing: { basePrice: 21.99, salePrice: 18.99 },
            ratings: { average: 4.6, count: 334 },
            tags: ["b-vitamins", "energy", "stress-support"],
            inventory: { stock: 156, status: "in-stock" }
        },
        {
            _id: 'vitamin-e',
            name: "Vitamin E 400 IU Natural",
            category: "vitamins",
            subcategory: "fat-soluble",
            description: "Natural vitamin E with powerful antioxidant properties for cellular protection.",
            benefits: ["Powerful antioxidant protection", "Supports cardiovascular health", "Promotes healthy skin"],
            pricing: { basePrice: 18.99 },
            ratings: { average: 4.3, count: 156 },
            tags: ["vitamin-e", "antioxidant", "heart-health"],
            inventory: { stock: 223, status: "in-stock" }
        },
        // Minerals
        {
            _id: 'zinc-picolinate',
            name: "Zinc Picolinate 50mg",
            category: "minerals",
            subcategory: "essential-minerals",
            description: "High-absorption zinc picolinate to support immune function, wound healing, and protein synthesis.",
            benefits: ["Supports immune system function", "Promotes wound healing", "Essential for protein synthesis"],
            pricing: { basePrice: 18.99, salePrice: 15.99 },
            ratings: { average: 4.7, count: 389 },
            tags: ["zinc", "immune-support", "healing"],
            inventory: { stock: 245, status: "in-stock" }
        },
        {
            _id: 'calcium-magnesium',
            name: "Calcium Magnesium Complex",
            category: "minerals",
            subcategory: "bone-health",
            description: "Balanced calcium and magnesium formula for optimal bone health and muscle function support.",
            benefits: ["Supports strong bones and teeth", "Promotes muscle function", "Supports cardiovascular health"],
            pricing: { basePrice: 22.99 },
            ratings: { average: 4.5, count: 267 },
            tags: ["calcium", "magnesium", "bone-health"],
            inventory: { stock: 178, status: "in-stock" }
        },
        {
            _id: 'iron-chelate',
            name: "Iron Chelate 25mg Gentle",
            category: "minerals",
            subcategory: "essential-minerals",
            description: "Gentle iron chelate formula that's easy on the stomach for optimal iron absorption.",
            benefits: ["Supports healthy red blood cells", "Combats iron deficiency", "Gentle on stomach"],
            pricing: { basePrice: 19.99 },
            ratings: { average: 4.4, count: 278 },
            tags: ["iron", "energy", "gentle-formula"],
            inventory: { stock: 134, status: "in-stock" }
        },
        {
            _id: 'magnesium-glycinate',
            name: "Magnesium Glycinate 400mg",
            category: "minerals",
            subcategory: "relaxation",
            description: "Highly bioavailable magnesium glycinate for muscle relaxation and better sleep quality.",
            benefits: ["Promotes muscle relaxation", "Supports better sleep", "Highly bioavailable"],
            pricing: { basePrice: 24.99 },
            ratings: { average: 4.7, count: 445 },
            tags: ["magnesium", "sleep", "muscle-relaxation"],
            inventory: { stock: 167, status: "in-stock" }
        },
        {
            _id: 'chromium-picolinate',
            name: "Chromium Picolinate 200mcg",
            category: "minerals",
            subcategory: "metabolic-support",
            description: "Chromium picolinate to support healthy glucose metabolism and weight management.",
            benefits: ["Supports glucose metabolism", "May help with weight management", "Supports insulin function"],
            pricing: { basePrice: 14.99 },
            ratings: { average: 4.2, count: 189 },
            tags: ["chromium", "glucose-support", "metabolism"],
            inventory: { stock: 198, status: "in-stock" }
        },
        // Supplements
        {
            _id: 'turmeric-curcumin',
            name: "Turmeric Curcumin with BioPerine",
            category: "supplements",
            subcategory: "herbal",
            description: "Potent turmeric curcumin extract with BioPerine for enhanced absorption and anti-inflammatory support.",
            benefits: ["Powerful anti-inflammatory effects", "Supports joint health", "Antioxidant protection"],
            pricing: { basePrice: 29.99, salePrice: 24.99 },
            ratings: { average: 4.5, count: 389 },
            tags: ["turmeric", "anti-inflammatory", "joint-health"],
            inventory: { stock: 167, status: "in-stock" }
        },
        {
            _id: 'ashwagandha',
            name: "Ashwagandha KSM-66 600mg",
            category: "supplements",
            subcategory: "adaptogenic",
            description: "Premium KSM-66 ashwagandha root extract for stress management and energy enhancement.",
            benefits: ["Reduces stress and cortisol", "Improves energy and vitality", "Supports cognitive function"],
            pricing: { basePrice: 34.99 },
            ratings: { average: 4.6, count: 278 },
            tags: ["ashwagandha", "stress-relief", "adaptogen"],
            inventory: { stock: 134, status: "in-stock" }
        },
        {
            _id: 'omega-3',
            name: "Omega-3 Fish Oil 1200mg",
            category: "supplements",
            subcategory: "essential-fatty-acids",
            description: "High-quality fish oil providing EPA and DHA for heart and brain health support.",
            benefits: ["Supports cardiovascular health", "Promotes brain function", "Anti-inflammatory properties"],
            pricing: { basePrice: 26.99, salePrice: 22.99 },
            ratings: { average: 4.6, count: 567 },
            tags: ["omega-3", "heart-health", "brain-support"],
            inventory: { stock: 234, status: "in-stock" }
        },
        {
            _id: 'coq10',
            name: "CoQ10 100mg Ubiquinol",
            category: "supplements",
            subcategory: "antioxidant",
            description: "Active form ubiquinol CoQ10 for cellular energy production and cardiovascular support.",
            benefits: ["Supports cellular energy", "Promotes heart health", "Powerful antioxidant"],
            pricing: { basePrice: 39.99 },
            ratings: { average: 4.5, count: 234 },
            tags: ["coq10", "energy", "heart-health"],
            inventory: { stock: 89, status: "in-stock" }
        },
        {
            _id: 'green-tea-extract',
            name: "Green Tea Extract EGCG",
            category: "supplements",
            subcategory: "antioxidant",
            description: "Concentrated green tea extract standardized for EGCG content and antioxidant benefits.",
            benefits: ["Rich in antioxidants", "Supports metabolism", "Promotes weight management"],
            pricing: { basePrice: 22.99 },
            ratings: { average: 4.4, count: 298 },
            tags: ["green-tea", "antioxidant", "metabolism"],
            inventory: { stock: 156, status: "in-stock" }
        },
        // Multivitamins
        {
            _id: 'mens-multi',
            name: "Men's Daily Multivitamin Formula",
            category: "multivitamins",
            subcategory: "men",
            description: "Comprehensive daily multivitamin specifically formulated for men's nutritional needs and energy support.",
            benefits: ["Complete daily nutritional support", "Supports energy and vitality", "Promotes heart health"],
            pricing: { basePrice: 32.99, salePrice: 27.99 },
            ratings: { average: 4.5, count: 423 },
            tags: ["multivitamin", "men", "energy"],
            inventory: { stock: 189, status: "in-stock" }
        },
        {
            _id: 'womens-multi',
            name: "Women's Daily Multivitamin Plus",
            category: "multivitamins",
            subcategory: "women",
            description: "Complete multivitamin with iron, folate, and biotin specifically designed for women's health needs.",
            benefits: ["Supports women's nutritional needs", "Contains iron for energy support", "Includes folate for reproductive health"],
            pricing: { basePrice: 34.99 },
            ratings: { average: 4.6, count: 512 },
            tags: ["multivitamin", "women", "iron"],
            inventory: { stock: 198, status: "in-stock" }
        },
        {
            _id: 'seniors-multi',
            name: "Senior's Complete Multivitamin",
            category: "multivitamins",
            subcategory: "seniors",
            description: "Age-specific multivitamin formula designed for adults 50+ with enhanced nutrient absorption.",
            benefits: ["Tailored for 50+ nutrition", "Enhanced absorption formula", "Supports cognitive health"],
            pricing: { basePrice: 36.99 },
            ratings: { average: 4.7, count: 345 },
            tags: ["multivitamin", "seniors", "50-plus"],
            inventory: { stock: 145, status: "in-stock" }
        },
        {
            _id: 'prenatal-multi',
            name: "Prenatal Multivitamin with DHA",
            category: "multivitamins",
            subcategory: "prenatal",
            description: "Complete prenatal multivitamin with folic acid, iron, and DHA for maternal and fetal health.",
            benefits: ["Supports healthy pregnancy", "Contains essential folic acid", "Includes DHA for brain development"],
            pricing: { basePrice: 38.99 },
            ratings: { average: 4.8, count: 456 },
            tags: ["prenatal", "pregnancy", "folic-acid"],
            inventory: { stock: 123, status: "in-stock" }
        },
        {
            _id: 'teen-multi',
            name: "Teen Multivitamin Energy Formula",
            category: "multivitamins",
            subcategory: "teens",
            description: "Specially formulated multivitamin for teenagers with nutrients to support growth and energy.",
            benefits: ["Supports teenage growth", "Boosts energy levels", "Promotes healthy development"],
            pricing: { basePrice: 24.99 },
            ratings: { average: 4.4, count: 234 },
            tags: ["teen", "growth", "energy"],
            inventory: { stock: 178, status: "in-stock" }
        },
        // Probiotics
        {
            _id: 'ultimate-probiotic',
            name: "Ultimate Probiotic 100 Billion CFU",
            category: "probiotics",
            subcategory: "high-potency",
            description: "Ultra-high potency probiotic with 15 strains and 100 billion CFU for comprehensive digestive support.",
            benefits: ["Maximum digestive support", "Supports immune function", "Promotes healthy gut bacteria"],
            pricing: { basePrice: 54.99, salePrice: 47.99 },
            ratings: { average: 4.6, count: 267 },
            tags: ["probiotics", "high-potency", "digestive-health"],
            inventory: { stock: 89, status: "in-stock" }
        },
        {
            _id: 'womens-probiotic',
            name: "Women's Probiotic Balance Formula",
            category: "probiotics",
            subcategory: "women",
            description: "Specialized probiotic formula for women's digestive and vaginal health with targeted strains.",
            benefits: ["Supports vaginal health", "Promotes digestive balance", "Supports urinary tract health"],
            pricing: { basePrice: 39.99 },
            ratings: { average: 4.5, count: 334 },
            tags: ["probiotics", "women", "vaginal-health"],
            inventory: { stock: 156, status: "in-stock" }
        },
        {
            _id: 'daily-probiotic',
            name: "Daily Probiotic 30 Billion CFU",
            category: "probiotics",
            subcategory: "daily-support",
            description: "Gentle daily probiotic formula with 8 beneficial strains for everyday digestive wellness.",
            benefits: ["Daily digestive support", "Gentle formula", "Supports regularity"],
            pricing: { basePrice: 29.99, salePrice: 25.99 },
            ratings: { average: 4.4, count: 445 },
            tags: ["probiotics", "daily", "gentle"],
            inventory: { stock: 234, status: "in-stock" }
        },
        {
            _id: 'kids-probiotic',
            name: "Kids Probiotic Chewables",
            category: "probiotics",
            subcategory: "children",
            description: "Fun chewable probiotic tablets designed specifically for children's developing digestive systems.",
            benefits: ["Supports children's digestion", "Fun chewable format", "Kid-friendly flavors"],
            pricing: { basePrice: 24.99 },
            ratings: { average: 4.7, count: 298 },
            tags: ["probiotics", "kids", "chewable"],
            inventory: { stock: 167, status: "in-stock" }
        },
        {
            _id: 'travel-probiotic',
            name: "Travel Probiotic Packets",
            category: "probiotics",
            subcategory: "travel",
            description: "Convenient single-serving probiotic packets perfect for travel and maintaining gut health on-the-go.",
            benefits: ["Perfect for travel", "Individual packets", "Maintains gut balance"],
            pricing: { basePrice: 32.99 },
            ratings: { average: 4.5, count: 189 },
            tags: ["probiotics", "travel", "convenient"],
            inventory: { stock: 123, status: "in-stock" }
        },
        // Prebiotics
        {
            _id: 'prebiotic-fiber',
            name: "Prebiotic Fiber Complex",
            category: "prebiotics",
            subcategory: "fiber-blend",
            description: "Comprehensive prebiotic fiber blend with inulin, FOS, and resistant starch to nourish beneficial gut bacteria.",
            benefits: ["Feeds beneficial gut bacteria", "Supports digestive health", "Promotes regularity"],
            pricing: { basePrice: 27.99 },
            ratings: { average: 4.4, count: 234 },
            tags: ["prebiotics", "fiber", "gut-health"],
            inventory: { stock: 134, status: "in-stock" }
        },
        {
            _id: 'prebiotic-gummies',
            name: "Prebiotic Gummies Berry Blend",
            category: "prebiotics",
            subcategory: "gummies",
            description: "Delicious berry-flavored prebiotic gummies with natural fruit fibers and plant-based pectin.",
            benefits: ["Delicious way to get prebiotics", "Supports gut health", "Natural fruit flavors"],
            pricing: { basePrice: 26.99 },
            ratings: { average: 4.6, count: 278 },
            tags: ["prebiotics", "gummies", "berry-flavor"],
            inventory: { stock: 167, status: "in-stock" }
        },
        {
            _id: 'inulin-powder',
            name: "Pure Inulin Prebiotic Powder",
            category: "prebiotics",
            subcategory: "powder",
            description: "Pure inulin powder from chicory root - a natural prebiotic fiber to support digestive wellness.",
            benefits: ["Pure prebiotic fiber", "Supports beneficial bacteria", "Easy to mix"],
            pricing: { basePrice: 22.99 },
            ratings: { average: 4.3, count: 156 },
            tags: ["prebiotics", "inulin", "powder"],
            inventory: { stock: 198, status: "in-stock" }
        },
        {
            _id: 'prebiotic-blend',
            name: "Advanced Prebiotic Blend Capsules",
            category: "prebiotics",
            subcategory: "advanced-formula",
            description: "Advanced prebiotic blend featuring multiple fiber sources and botanical extracts for optimal gut support.",
            benefits: ["Multi-source prebiotics", "Supports microbiome diversity", "Advanced formula"],
            pricing: { basePrice: 34.99 },
            ratings: { average: 4.5, count: 189 },
            tags: ["prebiotics", "advanced", "blend"],
            inventory: { stock: 89, status: "in-stock" }
        },
        {
            _id: 'digestive-prebiotic',
            name: "Digestive Prebiotic Support Formula",
            category: "prebiotics",
            subcategory: "digestive-support",
            description: "Targeted prebiotic formula with enzymes and botanicals for comprehensive digestive support.",
            benefits: ["Comprehensive digestive support", "Contains digestive enzymes", "Botanical extracts"],
            pricing: { basePrice: 31.99 },
            ratings: { average: 4.4, count: 223 },
            tags: ["prebiotics", "digestive-support", "enzymes"],
            inventory: { stock: 134, status: "in-stock" }
        },
        // Toddler Gummies
        {
            _id: 'toddler-multi',
            name: "Toddler Multivitamin Gummies",
            category: "multivitamins",
            subcategory: "toddler-gummies",
            description: "Complete multivitamin gummies specially formulated for toddlers ages 2-4 with essential nutrients.",
            benefits: ["Supports healthy growth", "Boosts immune system", "Promotes brain development"],
            pricing: { basePrice: 19.99 },
            ratings: { average: 4.8, count: 456 },
            tags: ["toddler", "gummies", "multivitamin"],
            inventory: { stock: 234, status: "in-stock" }
        },
        {
            _id: 'toddler-vitamin-c',
            name: "Toddler Vitamin C Gummies",
            category: "vitamins",
            subcategory: "toddler-gummies",
            description: "Gentle vitamin C gummies for toddlers to support immune system and overall health.",
            benefits: ["Supports immune system", "Gentle on little stomachs", "Natural orange flavor"],
            pricing: { basePrice: 16.99 },
            ratings: { average: 4.7, count: 298 },
            tags: ["toddler", "gummies", "vitamin-c"],
            inventory: { stock: 189, status: "in-stock" }
        },
        {
            _id: 'toddler-omega',
            name: "Toddler Omega-3 DHA Gummies",
            category: "supplements",
            subcategory: "toddler-gummies",
            description: "Omega-3 DHA gummies specifically designed for toddler brain development and eye health.",
            benefits: ["Supports brain development", "Promotes eye health", "Fish-free algae source"],
            pricing: { basePrice: 23.99 },
            ratings: { average: 4.6, count: 234 },
            tags: ["toddler", "gummies", "omega-3"],
            inventory: { stock: 145, status: "in-stock" }
        },
        {
            _id: 'toddler-probiotic',
            name: "Toddler Probiotic Gummies",
            category: "probiotics",
            subcategory: "toddler-gummies",
            description: "Gentle probiotic gummies for toddlers to support developing digestive and immune systems.",
            benefits: ["Supports digestive health", "Boosts immune function", "Gentle for toddlers"],
            pricing: { basePrice: 21.99 },
            ratings: { average: 4.5, count: 278 },
            tags: ["toddler", "gummies", "probiotics"],
            inventory: { stock: 178, status: "in-stock" }
        },
        {
            _id: 'toddler-calcium',
            name: "Toddler Calcium + D3 Gummies",
            category: "minerals",
            subcategory: "toddler-gummies",
            description: "Calcium and vitamin D3 gummies to support strong bones and teeth development in toddlers.",
            benefits: ["Supports bone development", "Promotes strong teeth", "Vanilla flavor"],
            pricing: { basePrice: 18.99 },
            ratings: { average: 4.4, count: 234 },
            tags: ["toddler", "gummies", "calcium"],
            inventory: { stock: 167, status: "in-stock" }
        }
    ];
}

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