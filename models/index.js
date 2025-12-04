const mongoose = require('mongoose');

// Conversation Schema
const conversationSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        index: true
    },
    messages: [{
        role: {
            type: String,
            enum: ['user', 'assistant'],
            required: true
        },
        content: {
            type: String,
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        intent: String,
        entities: Object
    }],
    context: {
        intent: String,
        extractedInfo: Object,
        userProfile: {
            age: Number,
            gender: String,
            healthGoals: [String],
            medicalConditions: [String],
            allergies: [String]
        }
    },
    metadata: {
        userAgent: String,
        ipAddress: String,
        referrer: String,
        startTime: {
            type: Date,
            default: Date.now
        },
        endTime: Date,
        totalMessages: {
            type: Number,
            default: 0
        }
    },
    feedback: [{
        messageId: String,
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        comment: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned', 'escalated'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Product Schema
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        enum: ['vitamins', 'minerals', 'supplements', 'multivitamins', 'probiotics', 'herbs']
    },
    subcategory: String,
    description: {
        type: String,
        required: true
    },
    benefits: [String],
    ingredients: [{
        name: String,
        amount: String,
        dailyValue: String
    }],
    usage: {
        dosage: String,
        frequency: String,
        instructions: String
    },
    pricing: {
        basePrice: {
            type: Number,
            required: true
        },
        salePrice: Number,
        currency: {
            type: String,
            default: 'USD'
        }
    },
    inventory: {
        stock: {
            type: Number,
            default: 0
        },
        lowStockThreshold: {
            type: Number,
            default: 10
        },
        status: {
            type: String,
            enum: ['in-stock', 'low-stock', 'out-of-stock', 'discontinued'],
            default: 'in-stock'
        }
    },
    specifications: {
        size: String,
        servings: Number,
        weight: String,
        dimensions: String
    },
    certifications: [String], // e.g., 'organic', 'non-gmo', 'gluten-free'
    images: [String],
    tags: [String],
    seo: {
        metaTitle: String,
        metaDescription: String,
        keywords: [String]
    },
    ratings: {
        average: {
            type: Number,
            default: 0
        },
        count: {
            type: Number,
            default: 0
        }
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Customer Schema
const customerSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    profile: {
        firstName: String,
        lastName: String,
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer-not-to-say']
        },
        phone: String
    },
    healthProfile: {
        healthGoals: [String],
        medicalConditions: [String],
        allergies: [String],
        medications: [String],
        dietaryRestrictions: [String],
        activityLevel: {
            type: String,
            enum: ['sedentary', 'light', 'moderate', 'active', 'very-active']
        }
    },
    preferences: {
        communicationMethod: {
            type: String,
            enum: ['email', 'sms', 'phone', 'chat'],
            default: 'email'
        },
        newsletter: {
            type: Boolean,
            default: true
        },
        recommendationFrequency: {
            type: String,
            enum: ['weekly', 'monthly', 'quarterly', 'never'],
            default: 'monthly'
        }
    },
    chatSessions: [{
        sessionId: String,
        startTime: Date,
        endTime: Date,
        messageCount: Number,
        satisfaction: Number
    }],
    orders: [{
        orderId: String,
        orderDate: Date,
        totalAmount: Number,
        status: String
    }],
    analytics: {
        totalChatSessions: {
            type: Number,
            default: 0
        },
        averageSessionDuration: Number,
        totalOrders: {
            type: Number,
            default: 0
        },
        totalSpent: {
            type: Number,
            default: 0
        },
        lastActivity: Date
    }
}, {
    timestamps: true
});

// Analytics Schema
const analyticsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        index: true
    },
    metrics: {
        totalSessions: {
            type: Number,
            default: 0
        },
        totalMessages: {
            type: Number,
            default: 0
        },
        uniqueUsers: {
            type: Number,
            default: 0
        },
        averageSessionDuration: Number,
        averageMessagesPerSession: Number,
        conversionRate: Number,
        customerSatisfaction: Number
    },
    intents: {
        product_recommendation: {
            type: Number,
            default: 0
        },
        health_information: {
            type: Number,
            default: 0
        },
        order_tracking: {
            type: Number,
            default: 0
        },
        product_info: {
            type: Number,
            default: 0
        },
        pricing: {
            type: Number,
            default: 0
        },
        availability: {
            type: Number,
            default: 0
        },
        general_support: {
            type: Number,
            default: 0
        }
    },
    topProducts: [{
        productId: String,
        productName: String,
        mentions: Number,
        conversions: Number
    }],
    feedback: {
        totalResponses: {
            type: Number,
            default: 0
        },
        averageRating: Number,
        ratings: {
            five: { type: Number, default: 0 },
            four: { type: Number, default: 0 },
            three: { type: Number, default: 0 },
            two: { type: Number, default: 0 },
            one: { type: Number, default: 0 }
        }
    }
}, {
    timestamps: true
});

// Knowledge Base Schema
const knowledgeBaseSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['vitamin', 'mineral', 'supplement', 'condition', 'general']
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    keywords: [String],
    relatedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    source: String,
    lastVerified: Date,
    isActive: {
        type: Boolean,
        default: true
    },
    metadata: {
        author: String,
        reviewedBy: String,
        accuracy: Number,
        citations: [String]
    }
}, {
    timestamps: true
});

// Create indexes for better performance
conversationSchema.index({ sessionId: 1, 'messages.timestamp': -1 });
productSchema.index({ category: 1, name: 1 });
productSchema.index({ 'inventory.status': 1 });
customerSchema.index({ email: 1 });
analyticsSchema.index({ date: -1 });
knowledgeBaseSchema.index({ category: 1, keywords: 1 });

// Create models
const Conversation = mongoose.model('Conversation', conversationSchema);
const Product = mongoose.model('Product', productSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Analytics = mongoose.model('Analytics', analyticsSchema);
const KnowledgeBase = mongoose.model('KnowledgeBase', knowledgeBaseSchema);

module.exports = {
    Conversation,
    Product,
    Customer,
    Analytics,
    KnowledgeBase
};