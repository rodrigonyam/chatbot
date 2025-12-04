#!/usr/bin/env node

/**
 * Database Seeding Script
 * Run this to populate your MongoDB database with initial product data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const { Product } = require('./models');

// Connect to MongoDB
async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitamins_chatbot');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

// Product data (same as static fallback data)
const products = [
    // Vitamins
    {
        name: "Vitamin D3 2000 IU",
        category: "vitamins",
        subcategory: "fat-soluble",
        description: "High-potency Vitamin D3 to support bone health, immune function, and overall wellness.",
        benefits: ["Supports bone and teeth health", "Boosts immune system function", "Helps regulate mood and energy levels"],
        ingredients: [
            { name: "Vitamin D3 (Cholecalciferol)", amount: "2000 IU", percentDV: "1000%" }
        ],
        pricing: { 
            basePrice: 24.99, 
            salePrice: 19.99,
            currency: "USD"
        },
        ratings: { average: 4.8, count: 234 },
        tags: ["vitamin-d", "bone-health", "immune-support"],
        inventory: { stock: 150, status: "in-stock" },
        isActive: true,
        certifications: ["Third-party tested", "Non-GMO", "Gluten-free"],
        servingSize: "1 capsule",
        servingsPerContainer: 60
    },
    {
        name: "Vitamin C 1000mg with Rose Hips",
        category: "vitamins",
        subcategory: "water-soluble",
        description: "High-potency vitamin C with natural rose hips for enhanced absorption and antioxidant protection.",
        benefits: ["Powerful antioxidant protection", "Supports immune system", "Promotes collagen synthesis"],
        ingredients: [
            { name: "Vitamin C (Ascorbic Acid)", amount: "1000mg", percentDV: "1111%" },
            { name: "Rose Hips Extract", amount: "50mg", percentDV: "*" }
        ],
        pricing: { 
            basePrice: 19.99, 
            salePrice: 16.99,
            currency: "USD"
        },
        ratings: { average: 4.5, count: 456 },
        tags: ["vitamin-c", "immune-support", "antioxidant"],
        inventory: { stock: 289, status: "in-stock" },
        isActive: true,
        certifications: ["Third-party tested", "Non-GMO"],
        servingSize: "1 tablet",
        servingsPerContainer: 100
    },
    // Add more products here...
    {
        name: "Zinc Picolinate 50mg",
        category: "minerals", 
        subcategory: "essential-minerals",
        description: "High-absorption zinc picolinate to support immune function, wound healing, and protein synthesis.",
        benefits: ["Supports immune system function", "Promotes wound healing", "Essential for protein synthesis"],
        ingredients: [
            { name: "Zinc (as Zinc Picolinate)", amount: "50mg", percentDV: "455%" }
        ],
        pricing: { 
            basePrice: 18.99, 
            salePrice: 15.99,
            currency: "USD"
        },
        ratings: { average: 4.7, count: 389 },
        tags: ["zinc", "immune-support", "healing"],
        inventory: { stock: 245, status: "in-stock" },
        isActive: true,
        certifications: ["Third-party tested", "Chelated form"],
        servingSize: "1 capsule",
        servingsPerContainer: 60
    }
    // Note: Add all 55 products from the static data when ready
];

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        
        // Clear existing products (optional)
        const existingCount = await Product.countDocuments();
        console.log(`📊 Found ${existingCount} existing products`);
        
        if (existingCount > 0) {
            console.log('⚠️  Products already exist. Skipping seeding.');
            console.log('   To reseed, delete products first or modify this script.');
            return;
        }
        
        // Insert products
        console.log(`📦 Inserting ${products.length} products...`);
        const result = await Product.insertMany(products);
        
        console.log(`✅ Successfully seeded ${result.length} products!`);
        console.log('🎉 Database seeding completed!');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    }
}

async function main() {
    await connectDB();
    await seedDatabase();
    
    console.log('🏁 Closing database connection...');
    await mongoose.connection.close();
    console.log('👋 Done!');
}

// Run the seeding
if (require.main === module) {
    main().catch(console.error);
}