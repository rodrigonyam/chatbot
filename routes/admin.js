const express = require('express');
const router = express.Router();
const { Conversation, Product, Customer, Analytics, KnowledgeBase } = require('../models');

// Admin authentication middleware (simplified for demo)
const adminAuth = (req, res, next) => {
    const adminKey = req.headers['x-admin-key'];
    if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

// Apply admin authentication to all routes
router.use(adminAuth);

// GET /api/admin/dashboard - Get dashboard overview
router.get('/dashboard', async (req, res) => {
    try {
        const today = new Date();
        const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        
        // Get basic stats
        const totalConversations = await Conversation.countDocuments();
        const activeConversations = await Conversation.countDocuments({ status: 'active' });
        const totalCustomers = await Customer.countDocuments();
        const totalProducts = await Product.countDocuments({ isActive: true });
        
        // Recent conversations
        const recentConversations = await Conversation.find()
            .sort({ updatedAt: -1 })
            .limit(10)
            .select('sessionId status metadata.totalMessages updatedAt');
        
        // Popular intents (last 7 days)
        const intentStats = await Conversation.aggregate([
            {
                $match: {
                    createdAt: { $gte: last7Days }
                }
            },
            {
                $unwind: '$messages'
            },
            {
                $match: {
                    'messages.role': 'assistant',
                    'messages.intent': { $exists: true }
                }
            },
            {
                $group: {
                    _id: '$messages.intent',
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        // Customer satisfaction (last 30 days)
        const satisfactionStats = await Conversation.aggregate([
            {
                $match: {
                    createdAt: { $gte: last30Days },
                    feedback: { $exists: true, $ne: [] }
                }
            },
            {
                $unwind: '$feedback'
            },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$feedback.rating' },
                    totalFeedback: { $sum: 1 }
                }
            }
        ]);
        
        res.json({
            success: true,
            dashboard: {
                overview: {
                    totalConversations,
                    activeConversations,
                    totalCustomers,
                    totalProducts
                },
                recentConversations,
                intentStats,
                satisfaction: satisfactionStats[0] || { averageRating: 0, totalFeedback: 0 }
            }
        });
        
    } catch (error) {
        console.error('Error getting dashboard data:', error);
        res.status(500).json({ error: 'Unable to load dashboard' });
    }
});

// GET /api/admin/conversations - Get all conversations with pagination
router.get('/conversations', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const status = req.query.status;
        const search = req.query.search;
        
        let filter = {};
        if (status) {
            filter.status = status;
        }
        if (search) {
            filter.sessionId = { $regex: search, $options: 'i' };
        }
        
        const conversations = await Conversation.find(filter)
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('sessionId status metadata createdAt updatedAt');
        
        const total = await Conversation.countDocuments(filter);
        
        res.json({
            success: true,
            conversations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({ error: 'Unable to retrieve conversations' });
    }
});

// GET /api/admin/conversations/:sessionId - Get detailed conversation
router.get('/conversations/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const conversation = await Conversation.findOne({ sessionId });
        
        if (!conversation) {
            return res.status(404).json({ error: 'Conversation not found' });
        }
        
        res.json({
            success: true,
            conversation
        });
        
    } catch (error) {
        console.error('Error getting conversation details:', error);
        res.status(500).json({ error: 'Unable to retrieve conversation details' });
    }
});

// POST /api/admin/products - Create new product
router.post('/products', async (req, res) => {
    try {
        const productData = req.body;
        
        const product = new Product(productData);
        await product.save();
        
        res.status(201).json({
            success: true,
            product
        });
        
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ error: 'Unable to create product' });
    }
});

// GET /api/admin/products - Get all products with pagination
router.get('/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const category = req.query.category;
        const status = req.query.status;
        const search = req.query.search;
        
        let filter = {};
        if (category) {
            filter.category = category;
        }
        if (status) {
            filter['inventory.status'] = status;
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        const products = await Product.find(filter)
            .sort({ name: 1 })
            .skip((page - 1) * limit)
            .limit(limit);
        
        const total = await Product.countDocuments(filter);
        
        res.json({
            success: true,
            products,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Error getting products:', error);
        res.status(500).json({ error: 'Unable to retrieve products' });
    }
});

// PUT /api/admin/products/:id - Update product
router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const product = await Product.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({
            success: true,
            product
        });
        
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ error: 'Unable to update product' });
    }
});

// DELETE /api/admin/products/:id - Delete product
router.delete('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const product = await Product.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        );
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        res.json({
            success: true,
            message: 'Product deactivated successfully'
        });
        
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Unable to delete product' });
    }
});

// GET /api/admin/customers - Get all customers with pagination
router.get('/customers', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const search = req.query.search;
        
        let filter = {};
        if (search) {
            filter.$or = [
                { email: { $regex: search, $options: 'i' } },
                { 'profile.firstName': { $regex: search, $options: 'i' } },
                { 'profile.lastName': { $regex: search, $options: 'i' } }
            ];
        }
        
        const customers = await Customer.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('email profile analytics createdAt');
        
        const total = await Customer.countDocuments(filter);
        
        res.json({
            success: true,
            customers,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Error getting customers:', error);
        res.status(500).json({ error: 'Unable to retrieve customers' });
    }
});

// POST /api/admin/knowledge-base - Create knowledge base entry
router.post('/knowledge-base', async (req, res) => {
    try {
        const entryData = req.body;
        
        const entry = new KnowledgeBase(entryData);
        await entry.save();
        
        res.status(201).json({
            success: true,
            entry
        });
        
    } catch (error) {
        console.error('Error creating knowledge base entry:', error);
        res.status(500).json({ error: 'Unable to create knowledge base entry' });
    }
});

// GET /api/admin/knowledge-base - Get all knowledge base entries
router.get('/knowledge-base', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const category = req.query.category;
        const search = req.query.search;
        
        let filter = { isActive: true };
        if (category) {
            filter.category = category;
        }
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } },
                { keywords: { $in: [new RegExp(search, 'i')] } }
            ];
        }
        
        const entries = await KnowledgeBase.find(filter)
            .populate('relatedProducts', 'name category')
            .sort({ updatedAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        
        const total = await KnowledgeBase.countDocuments(filter);
        
        res.json({
            success: true,
            entries,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('Error getting knowledge base:', error);
        res.status(500).json({ error: 'Unable to retrieve knowledge base' });
    }
});

// PUT /api/admin/knowledge-base/:id - Update knowledge base entry
router.put('/knowledge-base/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        
        const entry = await KnowledgeBase.findByIdAndUpdate(
            id,
            { ...updateData, lastVerified: new Date() },
            { new: true, runValidators: true }
        );
        
        if (!entry) {
            return res.status(404).json({ error: 'Knowledge base entry not found' });
        }
        
        res.json({
            success: true,
            entry
        });
        
    } catch (error) {
        console.error('Error updating knowledge base entry:', error);
        res.status(500).json({ error: 'Unable to update knowledge base entry' });
    }
});

// GET /api/admin/analytics/summary - Get analytics summary
router.get('/analytics/summary', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // Daily analytics
        const dailyStats = await Analytics.find({
            date: { $gte: startDate }
        }).sort({ date: 1 });
        
        // Overall metrics
        const totalMetrics = await Conversation.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSessions: { $sum: 1 },
                    totalMessages: { $sum: '$metadata.totalMessages' }
                }
            }
        ]);
        
        // Intent distribution
        const intentDistribution = await Conversation.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $unwind: '$messages'
            },
            {
                $match: {
                    'messages.role': 'assistant',
                    'messages.intent': { $exists: true }
                }
            },
            {
                $group: {
                    _id: '$messages.intent',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Customer satisfaction
        const satisfactionData = await Conversation.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    feedback: { $exists: true, $ne: [] }
                }
            },
            {
                $unwind: '$feedback'
            },
            {
                $group: {
                    _id: '$feedback.rating',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        res.json({
            success: true,
            analytics: {
                dailyStats,
                totalMetrics: totalMetrics[0] || { totalSessions: 0, totalMessages: 0 },
                intentDistribution,
                satisfactionData,
                period: {
                    days,
                    startDate,
                    endDate: new Date()
                }
            }
        });
        
    } catch (error) {
        console.error('Error getting analytics:', error);
        res.status(500).json({ error: 'Unable to retrieve analytics' });
    }
});

// POST /api/admin/system/broadcast - Broadcast message to all connected users
router.post('/system/broadcast', async (req, res) => {
    try {
        const { message, targetSessions } = req.body;
        
        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }
        
        // This would integrate with your SocketHandler
        // For now, we'll just log the broadcast
        console.log('Broadcasting message:', message);
        if (targetSessions) {
            console.log('Target sessions:', targetSessions);
        }
        
        res.json({
            success: true,
            message: 'Broadcast sent successfully'
        });
        
    } catch (error) {
        console.error('Error broadcasting message:', error);
        res.status(500).json({ error: 'Unable to send broadcast' });
    }
});

module.exports = router;