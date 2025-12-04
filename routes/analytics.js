const express = require('express');
const router = express.Router();
const { Conversation, Product, Customer, Analytics } = require('../models');

// GET /api/analytics/overview - Get basic analytics overview
router.get('/overview', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // Basic counts
        const totalConversations = await Conversation.countDocuments({
            createdAt: { $gte: startDate }
        });
        
        const activeConversations = await Conversation.countDocuments({
            status: 'active',
            createdAt: { $gte: startDate }
        });
        
        const uniqueUsers = await Conversation.distinct('sessionId', {
            createdAt: { $gte: startDate }
        }).then(sessions => sessions.length);
        
        // Average session metrics
        const sessionMetrics = await Conversation.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: null,
                    avgMessages: { $avg: '$metadata.totalMessages' },
                    totalMessages: { $sum: '$metadata.totalMessages' }
                }
            }
        ]);
        
        res.json({
            success: true,
            overview: {
                totalConversations,
                activeConversations,
                uniqueUsers,
                averageMessagesPerSession: sessionMetrics[0]?.avgMessages || 0,
                totalMessages: sessionMetrics[0]?.totalMessages || 0,
                period: { days, startDate }
            }
        });
        
    } catch (error) {
        console.error('Error getting analytics overview:', error);
        res.status(500).json({ error: 'Unable to retrieve analytics overview' });
    }
});

// GET /api/analytics/intents - Get intent distribution
router.get('/intents', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const intentStats = await Conversation.aggregate([
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
                    'messages.intent': { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: '$messages.intent',
                    count: { $sum: 1 },
                    percentage: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);
        
        // Calculate percentages
        const totalIntents = intentStats.reduce((sum, item) => sum + item.count, 0);
        intentStats.forEach(item => {
            item.percentage = totalIntents > 0 ? ((item.count / totalIntents) * 100).toFixed(1) : 0;
        });
        
        res.json({
            success: true,
            intents: intentStats,
            totalIntents,
            period: { days, startDate }
        });
        
    } catch (error) {
        console.error('Error getting intent analytics:', error);
        res.status(500).json({ error: 'Unable to retrieve intent analytics' });
    }
});

// GET /api/analytics/satisfaction - Get customer satisfaction metrics
router.get('/satisfaction', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const satisfactionStats = await Conversation.aggregate([
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
            },
            {
                $sort: { _id: -1 }
            }
        ]);
        
        // Calculate average rating
        const totalFeedback = satisfactionStats.reduce((sum, item) => sum + item.count, 0);
        const weightedSum = satisfactionStats.reduce((sum, item) => sum + (item._id * item.count), 0);
        const averageRating = totalFeedback > 0 ? (weightedSum / totalFeedback).toFixed(2) : 0;
        
        // Get recent feedback comments
        const recentFeedback = await Conversation.aggregate([
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
                $match: {
                    'feedback.comment': { $exists: true, $ne: '' }
                }
            },
            {
                $project: {
                    sessionId: 1,
                    rating: '$feedback.rating',
                    comment: '$feedback.comment',
                    timestamp: '$feedback.timestamp'
                }
            },
            {
                $sort: { timestamp: -1 }
            },
            {
                $limit: 10
            }
        ]);
        
        res.json({
            success: true,
            satisfaction: {
                averageRating: parseFloat(averageRating),
                totalFeedback,
                ratingDistribution: satisfactionStats,
                recentFeedback
            },
            period: { days, startDate }
        });
        
    } catch (error) {
        console.error('Error getting satisfaction analytics:', error);
        res.status(500).json({ error: 'Unable to retrieve satisfaction analytics' });
    }
});

// GET /api/analytics/popular-products - Get popular product mentions
router.get('/popular-products', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // This is a simplified version - in practice, you'd need more sophisticated text analysis
        const productMentions = await Conversation.aggregate([
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
                    'messages.role': 'user'
                }
            },
            // This would need more sophisticated product name extraction
            // For now, we'll return sample data
        ]);
        
        // Get actual product data for context
        const popularProducts = await Product.find({ isActive: true })
            .sort({ 'ratings.average': -1, 'ratings.count': -1 })
            .limit(10)
            .select('name category ratings');
        
        res.json({
            success: true,
            popularProducts: popularProducts.map((product, index) => ({
                productId: product._id,
                productName: product.name,
                category: product.category,
                mentions: Math.floor(Math.random() * 50) + 10, // Simulated data
                rating: product.ratings.average,
                rank: index + 1
            })),
            period: { days, startDate }
        });
        
    } catch (error) {
        console.error('Error getting popular products:', error);
        res.status(500).json({ error: 'Unable to retrieve popular products' });
    }
});

// GET /api/analytics/daily-trends - Get daily conversation trends
router.get('/daily-trends', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        const dailyTrends = await Conversation.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                        day: { $dayOfMonth: '$createdAt' }
                    },
                    conversations: { $sum: 1 },
                    totalMessages: { $sum: '$metadata.totalMessages' },
                    uniqueUsers: { $addToSet: '$sessionId' }
                }
            },
            {
                $project: {
                    date: {
                        $dateFromParts: {
                            year: '$_id.year',
                            month: '$_id.month',
                            day: '$_id.day'
                        }
                    },
                    conversations: 1,
                    totalMessages: 1,
                    uniqueUsers: { $size: '$uniqueUsers' }
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);
        
        res.json({
            success: true,
            dailyTrends,
            period: { days, startDate }
        });
        
    } catch (error) {
        console.error('Error getting daily trends:', error);
        res.status(500).json({ error: 'Unable to retrieve daily trends' });
    }
});

// GET /api/analytics/conversation-flow - Get conversation flow analysis
router.get('/conversation-flow', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // Analyze conversation patterns
        const conversationFlow = await Conversation.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate },
                    'metadata.totalMessages': { $gte: 2 }
                }
            },
            {
                $project: {
                    sessionId: 1,
                    messageCount: '$metadata.totalMessages',
                    duration: {
                        $subtract: [
                            { $ifNull: ['$metadata.endTime', '$updatedAt'] },
                            '$metadata.startTime'
                        ]
                    },
                    intents: {
                        $map: {
                            input: {
                                $filter: {
                                    input: '$messages',
                                    as: 'message',
                                    cond: {
                                        $and: [
                                            { $eq: ['$$message.role', 'assistant'] },
                                            { $ne: ['$$message.intent', null] }
                                        ]
                                    }
                                }
                            },
                            as: 'msg',
                            in: '$$msg.intent'
                        }
                    }
                }
            },
            {
                $group: {
                    _id: null,
                    avgMessageCount: { $avg: '$messageCount' },
                    avgDuration: { $avg: '$duration' },
                    totalSessions: { $sum: 1 },
                    allIntentSequences: { $push: '$intents' }
                }
            }
        ]);
        
        res.json({
            success: true,
            conversationFlow: conversationFlow[0] || {
                avgMessageCount: 0,
                avgDuration: 0,
                totalSessions: 0,
                allIntentSequences: []
            },
            period: { days, startDate }
        });
        
    } catch (error) {
        console.error('Error getting conversation flow:', error);
        res.status(500).json({ error: 'Unable to retrieve conversation flow' });
    }
});

module.exports = router;