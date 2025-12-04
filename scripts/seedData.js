const mongoose = require('mongoose');
const { Product, KnowledgeBase } = require('../models');
require('dotenv').config();

// Sample product data
const sampleProducts = [
    {
        name: "Vitamin D3 2000 IU",
        category: "vitamins",
        subcategory: "fat-soluble",
        description: "High-potency Vitamin D3 to support bone health, immune function, and overall wellness. Our premium formula ensures maximum absorption.",
        benefits: [
            "Supports bone and teeth health",
            "Boosts immune system function",
            "Helps regulate mood and energy levels",
            "Promotes calcium absorption"
        ],
        ingredients: [
            {
                name: "Vitamin D3 (Cholecalciferol)",
                amount: "2000 IU",
                dailyValue: "1000%"
            }
        ],
        usage: {
            dosage: "1 capsule",
            frequency: "Daily",
            instructions: "Take with food for best absorption"
        },
        pricing: {
            basePrice: 24.99,
            salePrice: 19.99,
            currency: "USD"
        },
        inventory: {
            stock: 150,
            lowStockThreshold: 25,
            status: "in-stock"
        },
        specifications: {
            size: "60 capsules",
            servings: 60,
            weight: "2 oz"
        },
        certifications: ["third-party-tested", "non-gmo", "gluten-free"],
        tags: ["vitamin-d", "bone-health", "immune-support", "mood-support"],
        ratings: {
            average: 4.7,
            count: 312
        }
    },
    {
        name: "Omega-3 Fish Oil 1000mg",
        category: "supplements",
        subcategory: "essential-fatty-acids",
        description: "Premium omega-3 fish oil with EPA and DHA to support heart health, brain function, and reduce inflammation.",
        benefits: [
            "Supports cardiovascular health",
            "Promotes brain and cognitive function",
            "Reduces inflammation",
            "Supports eye health"
        ],
        ingredients: [
            {
                name: "EPA (Eicosapentaenoic Acid)",
                amount: "300mg",
                dailyValue: "*"
            },
            {
                name: "DHA (Docosahexaenoic Acid)",
                amount: "200mg",
                dailyValue: "*"
            }
        ],
        usage: {
            dosage: "2 softgels",
            frequency: "Daily",
            instructions: "Take with meals"
        },
        pricing: {
            basePrice: 32.99,
            currency: "USD"
        },
        inventory: {
            stock: 89,
            lowStockThreshold: 20,
            status: "in-stock"
        },
        specifications: {
            size: "120 softgels",
            servings: 60,
            weight: "4 oz"
        },
        certifications: ["molecularly-distilled", "mercury-tested", "sustainable-sourced"],
        tags: ["omega-3", "heart-health", "brain-health", "anti-inflammatory"],
        ratings: {
            average: 4.5,
            count: 287
        }
    },
    {
        name: "Multivitamin for Women",
        category: "multivitamins",
        description: "Comprehensive daily multivitamin specially formulated for women's nutritional needs with iron, folate, and biotin.",
        benefits: [
            "Fills nutritional gaps in diet",
            "Supports energy and metabolism",
            "Promotes healthy hair, skin, and nails",
            "Contains iron for women's needs"
        ],
        ingredients: [
            { name: "Vitamin A", amount: "2700 IU", dailyValue: "300%" },
            { name: "Vitamin C", amount: "75mg", dailyValue: "100%" },
            { name: "Vitamin D3", amount: "800 IU", dailyValue: "400%" },
            { name: "Vitamin E", amount: "15mg", dailyValue: "100%" },
            { name: "Folate", amount: "400mcg", dailyValue: "100%" },
            { name: "Iron", amount: "18mg", dailyValue: "100%" },
            { name: "Biotin", amount: "30mcg", dailyValue: "100%" }
        ],
        usage: {
            dosage: "2 tablets",
            frequency: "Daily",
            instructions: "Take with breakfast"
        },
        pricing: {
            basePrice: 28.99,
            salePrice: 23.99,
            currency: "USD"
        },
        inventory: {
            stock: 203,
            status: "in-stock"
        },
        specifications: {
            size: "90 tablets",
            servings: 45,
            weight: "3 oz"
        },
        certifications: ["usp-verified", "non-gmo", "gluten-free"],
        tags: ["multivitamin", "women-health", "energy", "hair-skin-nails"],
        ratings: {
            average: 4.4,
            count: 456
        }
    },
    {
        name: "Vitamin B12 Methylcobalamin 1000mcg",
        category: "vitamins",
        subcategory: "b-complex",
        description: "High-absorption methylcobalamin B12 to support energy production, nervous system health, and red blood cell formation.",
        benefits: [
            "Boosts energy and reduces fatigue",
            "Supports nervous system health",
            "Aids in red blood cell formation",
            "Supports cognitive function"
        ],
        ingredients: [
            {
                name: "Vitamin B12 (Methylcobalamin)",
                amount: "1000mcg",
                dailyValue: "41667%"
            }
        ],
        usage: {
            dosage: "1 sublingual tablet",
            frequency: "Daily",
            instructions: "Dissolve under tongue for 30 seconds"
        },
        pricing: {
            basePrice: 19.99,
            currency: "USD"
        },
        inventory: {
            stock: 175,
            status: "in-stock"
        },
        specifications: {
            size: "60 sublingual tablets",
            servings: 60,
            weight: "1.5 oz"
        },
        certifications: ["vegan", "non-gmo", "gluten-free"],
        tags: ["vitamin-b12", "energy", "nervous-system", "vegan-friendly"],
        ratings: {
            average: 4.6,
            count: 198
        }
    },
    {
        name: "Magnesium Glycinate 400mg",
        category: "minerals",
        description: "Highly bioavailable magnesium glycinate for better sleep, muscle relaxation, and stress support.",
        benefits: [
            "Promotes relaxation and better sleep",
            "Supports muscle and nerve function",
            "Helps manage stress and anxiety",
            "Supports bone health"
        ],
        ingredients: [
            {
                name: "Magnesium (as Magnesium Glycinate)",
                amount: "400mg",
                dailyValue: "95%"
            }
        ],
        usage: {
            dosage: "2 capsules",
            frequency: "Daily",
            instructions: "Take 30 minutes before bedtime"
        },
        pricing: {
            basePrice: 26.99,
            currency: "USD"
        },
        inventory: {
            stock: 112,
            status: "in-stock"
        },
        specifications: {
            size: "120 capsules",
            servings: 60,
            weight: "3.5 oz"
        },
        certifications: ["chelated-form", "non-gmo", "third-party-tested"],
        tags: ["magnesium", "sleep-support", "stress-relief", "muscle-health"],
        ratings: {
            average: 4.8,
            count: 234
        }
    },
    // WELLNESS PRODUCTS
    {
        name: "Daily Wellness Multi-Complex",
        category: "multivitamins",
        subcategory: "wellness",
        description: "Comprehensive daily formula with 25 essential vitamins and minerals for optimal wellness and vitality.",
        benefits: [
            "Complete nutritional support",
            "Boosts daily energy levels",
            "Supports immune system",
            "Promotes mental clarity",
            "Antioxidant protection"
        ],
        ingredients: [
            { name: "Vitamin A", amount: "3000 IU", dailyValue: "333%" },
            { name: "Vitamin C", amount: "120mg", dailyValue: "133%" },
            { name: "Vitamin D3", amount: "1000 IU", dailyValue: "250%" },
            { name: "B-Complex Blend", amount: "50mg", dailyValue: "Various" },
            { name: "Zinc", amount: "15mg", dailyValue: "136%" }
        ],
        usage: {
            dosage: "2 capsules",
            frequency: "Daily",
            instructions: "Take with morning meal"
        },
        pricing: {
            basePrice: 34.99,
            salePrice: 27.99,
            currency: "USD"
        },
        inventory: {
            stock: 185,
            status: "in-stock"
        },
        specifications: {
            size: "120 capsules",
            servings: 60,
            weight: "4 oz"
        },
        certifications: ["usp-verified", "non-gmo", "third-party-tested"],
        tags: ["wellness", "multivitamin", "energy", "immune-support", "daily-health"],
        ratings: {
            average: 4.6,
            count: 428
        }
    },
    {
        name: "Stress Relief & Calm Complex",
        category: "supplements",
        subcategory: "wellness",
        description: "Natural blend of ashwagandha, L-theanine, and magnesium to promote relaxation and stress management.",
        benefits: [
            "Reduces stress and anxiety",
            "Promotes calm and relaxation",
            "Supports healthy sleep patterns",
            "Improves mood balance",
            "Enhances mental clarity"
        ],
        ingredients: [
            { name: "Ashwagandha Extract", amount: "600mg", dailyValue: "*" },
            { name: "L-Theanine", amount: "200mg", dailyValue: "*" },
            { name: "Magnesium Glycinate", amount: "200mg", dailyValue: "48%" },
            { name: "GABA", amount: "100mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "2 capsules",
            frequency: "Daily",
            instructions: "Take 30 minutes before bedtime"
        },
        pricing: {
            basePrice: 39.99,
            currency: "USD"
        },
        inventory: {
            stock: 142,
            status: "in-stock"
        },
        specifications: {
            size: "90 capsules",
            servings: 45,
            weight: "3 oz"
        },
        certifications: ["organic", "non-gmo", "vegan"],
        tags: ["stress-relief", "wellness", "sleep-support", "anxiety", "calm"],
        ratings: {
            average: 4.7,
            count: 293
        }
    },
    {
        name: "Immune Boost Daily Defense",
        category: "supplements",
        subcategory: "wellness",
        description: "Powerful immune support formula with vitamin C, zinc, elderberry, and echinacea for year-round protection.",
        benefits: [
            "Strengthens immune system",
            "Fights off seasonal threats",
            "Reduces duration of illness",
            "Antioxidant protection",
            "Supports respiratory health"
        ],
        ingredients: [
            { name: "Vitamin C (Ascorbic Acid)", amount: "1000mg", dailyValue: "1111%" },
            { name: "Zinc Picolinate", amount: "30mg", dailyValue: "273%" },
            { name: "Elderberry Extract", amount: "500mg", dailyValue: "*" },
            { name: "Echinacea Root", amount: "400mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "2 capsules",
            frequency: "Daily",
            instructions: "Take with food, increase to 4 during illness"
        },
        pricing: {
            basePrice: 29.99,
            salePrice: 24.99,
            currency: "USD"
        },
        inventory: {
            stock: 167,
            status: "in-stock"
        },
        specifications: {
            size: "120 capsules",
            servings: 60,
            weight: "3.5 oz"
        },
        certifications: ["non-gmo", "gluten-free", "third-party-tested"],
        tags: ["immune-support", "wellness", "vitamin-c", "elderberry", "seasonal-health"],
        ratings: {
            average: 4.5,
            count: 381
        }
    },
    {
        name: "Joint Health & Mobility Formula",
        category: "supplements",
        subcategory: "wellness",
        description: "Advanced formula with glucosamine, chondroitin, and MSM to support joint health and flexibility.",
        benefits: [
            "Supports joint health and flexibility",
            "Reduces joint discomfort",
            "Promotes cartilage health",
            "Improves mobility and range of motion",
            "Anti-inflammatory support"
        ],
        ingredients: [
            { name: "Glucosamine Sulfate", amount: "1500mg", dailyValue: "*" },
            { name: "Chondroitin Sulfate", amount: "1200mg", dailyValue: "*" },
            { name: "MSM", amount: "1000mg", dailyValue: "*" },
            { name: "Turmeric Extract", amount: "500mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "3 capsules",
            frequency: "Daily",
            instructions: "Take with meals for best absorption"
        },
        pricing: {
            basePrice: 44.99,
            currency: "USD"
        },
        inventory: {
            stock: 98,
            status: "in-stock"
        },
        specifications: {
            size: "180 capsules",
            servings: 60,
            weight: "6 oz"
        },
        certifications: ["shellfish-free", "non-gmo", "third-party-tested"],
        tags: ["joint-health", "wellness", "mobility", "glucosamine", "anti-inflammatory"],
        ratings: {
            average: 4.4,
            count: 267
        }
    },
    {
        name: "Brain Focus & Memory Support",
        category: "supplements",
        subcategory: "wellness",
        description: "Nootropic blend with bacopa monnieri, ginkgo biloba, and phosphatidylserine for cognitive enhancement.",
        benefits: [
            "Enhances memory and focus",
            "Supports cognitive function",
            "Improves mental clarity",
            "Reduces brain fog",
            "Neuroprotective properties"
        ],
        ingredients: [
            { name: "Bacopa Monnieri Extract", amount: "300mg", dailyValue: "*" },
            { name: "Ginkgo Biloba", amount: "240mg", dailyValue: "*" },
            { name: "Phosphatidylserine", amount: "100mg", dailyValue: "*" },
            { name: "Lion's Mane Mushroom", amount: "500mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "2 capsules",
            frequency: "Daily",
            instructions: "Take with breakfast for best results"
        },
        pricing: {
            basePrice: 49.99,
            salePrice: 42.99,
            currency: "USD"
        },
        inventory: {
            stock: 134,
            status: "in-stock"
        },
        specifications: {
            size: "90 capsules",
            servings: 45,
            weight: "3 oz"
        },
        certifications: ["vegan", "non-gmo", "gluten-free"],
        tags: ["brain-health", "wellness", "memory", "focus", "nootropic"],
        ratings: {
            average: 4.3,
            count: 198
        }
    },
    {
        name: "Heart Health CoQ10 Plus",
        category: "supplements",
        subcategory: "wellness",
        description: "Cardiovascular support formula with CoQ10, omega-3, and hawthorn berry for optimal heart health.",
        benefits: [
            "Supports cardiovascular health",
            "Promotes healthy blood pressure",
            "Enhances energy at cellular level",
            "Antioxidant heart protection",
            "Supports healthy cholesterol levels"
        ],
        ingredients: [
            { name: "Coenzyme Q10", amount: "200mg", dailyValue: "*" },
            { name: "Omega-3 (EPA/DHA)", amount: "1000mg", dailyValue: "*" },
            { name: "Hawthorn Berry Extract", amount: "300mg", dailyValue: "*" },
            { name: "L-Carnitine", amount: "500mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "2 softgels",
            frequency: "Daily",
            instructions: "Take with fatty meal for absorption"
        },
        pricing: {
            basePrice: 52.99,
            currency: "USD"
        },
        inventory: {
            stock: 76,
            status: "in-stock"
        },
        specifications: {
            size: "120 softgels",
            servings: 60,
            weight: "4 oz"
        },
        certifications: ["molecularly-distilled", "third-party-tested", "non-gmo"],
        tags: ["heart-health", "wellness", "coq10", "cardiovascular", "energy"],
        ratings: {
            average: 4.6,
            count: 156
        }
    },
    {
        name: "Digestive Health Probiotic Complex",
        category: "probiotics",
        subcategory: "wellness",
        description: "50 billion CFU multi-strain probiotic with digestive enzymes for optimal gut health and digestion.",
        benefits: [
            "Supports digestive health",
            "Promotes healthy gut bacteria",
            "Enhances nutrient absorption",
            "Boosts immune function",
            "Reduces digestive discomfort"
        ],
        ingredients: [
            { name: "Probiotic Blend (10 strains)", amount: "50 Billion CFU", dailyValue: "*" },
            { name: "Digestive Enzyme Blend", amount: "200mg", dailyValue: "*" },
            { name: "Prebiotic Fiber (FOS)", amount: "100mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 capsule",
            frequency: "Daily",
            instructions: "Take on empty stomach or with light meal"
        },
        pricing: {
            basePrice: 39.99,
            salePrice: 34.99,
            currency: "USD"
        },
        inventory: {
            stock: 123,
            status: "in-stock"
        },
        specifications: {
            size: "60 capsules",
            servings: 60,
            weight: "2 oz"
        },
        certifications: ["shelf-stable", "non-gmo", "gluten-free", "dairy-free"],
        tags: ["digestive-health", "wellness", "probiotics", "gut-health", "immune-support"],
        ratings: {
            average: 4.5,
            count: 342
        }
    },
    // DRINK PRODUCTS
    {
        name: "Green Energy Superfood Powder",
        category: "supplements",
        subcategory: "drinks",
        description: "Organic greens powder blend with spirulina, chlorella, and wheatgrass for natural energy and detox support.",
        benefits: [
            "Natural energy boost",
            "Detoxification support",
            "Alkalizing properties",
            "Rich in antioxidants",
            "Supports daily vegetable intake"
        ],
        ingredients: [
            { name: "Organic Spirulina", amount: "1000mg", dailyValue: "*" },
            { name: "Organic Chlorella", amount: "500mg", dailyValue: "*" },
            { name: "Organic Wheatgrass", amount: "1000mg", dailyValue: "*" },
            { name: "Organic Barley Grass", amount: "500mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 scoop (10g)",
            frequency: "Daily",
            instructions: "Mix with 8oz water or juice, best taken morning"
        },
        pricing: {
            basePrice: 44.99,
            salePrice: 39.99,
            currency: "USD"
        },
        inventory: {
            stock: 156,
            status: "in-stock"
        },
        specifications: {
            size: "300g powder",
            servings: 30,
            weight: "10.6 oz"
        },
        certifications: ["organic", "vegan", "non-gmo", "gluten-free"],
        tags: ["green-powder", "drinks", "energy", "detox", "superfood"],
        ratings: {
            average: 4.2,
            count: 289
        }
    },
    {
        name: "Electrolyte Hydration Powder",
        category: "supplements",
        subcategory: "drinks",
        description: "Sugar-free electrolyte powder with essential minerals for optimal hydration and recovery.",
        benefits: [
            "Rapid rehydration",
            "Replaces lost electrolytes",
            "Supports athletic performance",
            "Prevents muscle cramps",
            "Zero sugar formula"
        ],
        ingredients: [
            { name: "Sodium", amount: "380mg", dailyValue: "17%" },
            { name: "Potassium", amount: "200mg", dailyValue: "4%" },
            { name: "Magnesium", amount: "60mg", dailyValue: "14%" },
            { name: "Calcium", amount: "20mg", dailyValue: "2%" }
        ],
        usage: {
            dosage: "1 packet or scoop",
            frequency: "As needed",
            instructions: "Mix with 16-20oz water during or after exercise"
        },
        pricing: {
            basePrice: 24.99,
            currency: "USD"
        },
        inventory: {
            stock: 234,
            status: "in-stock"
        },
        specifications: {
            size: "30 packets or 300g powder",
            servings: 30,
            weight: "10.6 oz"
        },
        certifications: ["keto-friendly", "sugar-free", "non-gmo", "gluten-free"],
        tags: ["electrolytes", "drinks", "hydration", "sports-nutrition", "recovery"],
        ratings: {
            average: 4.4,
            count: 367
        }
    },
    {
        name: "Collagen Beauty Drink Mix",
        category: "supplements",
        subcategory: "drinks",
        description: "Marine collagen peptides with biotin, vitamin C, and hyaluronic acid for radiant skin, hair, and nails.",
        benefits: [
            "Promotes youthful skin appearance",
            "Strengthens hair and nails",
            "Supports joint health",
            "Improves skin elasticity",
            "Hydrates from within"
        ],
        ingredients: [
            { name: "Marine Collagen Peptides", amount: "10g", dailyValue: "*" },
            { name: "Vitamin C", amount: "100mg", dailyValue: "111%" },
            { name: "Biotin", amount: "5000mcg", dailyValue: "1667%" },
            { name: "Hyaluronic Acid", amount: "100mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 scoop (15g)",
            frequency: "Daily",
            instructions: "Mix with 8-12oz cold water, juice, or smoothie"
        },
        pricing: {
            basePrice: 54.99,
            salePrice: 47.99,
            currency: "USD"
        },
        inventory: {
            stock: 98,
            status: "in-stock"
        },
        specifications: {
            size: "450g powder",
            servings: 30,
            weight: "15.9 oz"
        },
        certifications: ["sustainably-sourced", "non-gmo", "gluten-free", "dairy-free"],
        tags: ["collagen", "drinks", "beauty", "skin-health", "anti-aging"],
        ratings: {
            average: 4.6,
            count: 428
        }
    },
    {
        name: "Plant-Based Protein Powder",
        category: "supplements",
        subcategory: "drinks",
        description: "Complete amino acid profile from pea, hemp, and brown rice proteins with digestive enzymes.",
        benefits: [
            "Complete protein source",
            "Supports muscle building",
            "Easy to digest",
            "Supports post-workout recovery",
            "Suitable for all dietary needs"
        ],
        ingredients: [
            { name: "Pea Protein Isolate", amount: "15g", dailyValue: "*" },
            { name: "Brown Rice Protein", amount: "8g", dailyValue: "*" },
            { name: "Hemp Protein", amount: "2g", dailyValue: "*" },
            { name: "Digestive Enzyme Blend", amount: "50mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 scoop (30g)",
            frequency: "1-2 times daily",
            instructions: "Mix with 8-12oz liquid of choice"
        },
        pricing: {
            basePrice: 39.99,
            currency: "USD"
        },
        inventory: {
            stock: 178,
            status: "in-stock"
        },
        specifications: {
            size: "2 lbs (900g)",
            servings: 30,
            weight: "2 lbs"
        },
        certifications: ["vegan", "organic", "non-gmo", "soy-free"],
        tags: ["protein", "drinks", "plant-based", "muscle-building", "vegan"],
        ratings: {
            average: 4.3,
            count: 523
        }
    },
    {
        name: "Pre-Workout Energy Drink Mix",
        category: "supplements",
        subcategory: "drinks",
        description: "Clean energy blend with natural caffeine, B-vitamins, and amino acids for enhanced workout performance.",
        benefits: [
            "Boosts energy and focus",
            "Enhances workout performance",
            "Supports endurance",
            "Improves mental alertness",
            "No crash or jitters"
        ],
        ingredients: [
            { name: "Natural Caffeine (Green Coffee)", amount: "150mg", dailyValue: "*" },
            { name: "L-Citrulline", amount: "6000mg", dailyValue: "*" },
            { name: "Beta-Alanine", amount: "3200mg", dailyValue: "*" },
            { name: "B-Vitamin Complex", amount: "Various", dailyValue: "100%" }
        ],
        usage: {
            dosage: "1 scoop (12g)",
            frequency: "Pre-workout",
            instructions: "Mix with 8oz water 15-30 minutes before exercise"
        },
        pricing: {
            basePrice: 34.99,
            salePrice: 29.99,
            currency: "USD"
        },
        inventory: {
            stock: 145,
            status: "in-stock"
        },
        specifications: {
            size: "360g powder",
            servings: 30,
            weight: "12.7 oz"
        },
        certifications: ["natural-flavors", "non-gmo", "gluten-free", "sugar-free"],
        tags: ["pre-workout", "drinks", "energy", "performance", "fitness"],
        ratings: {
            average: 4.5,
            count: 312
        }
    },
    // WEIGHT LOSS PRODUCTS
    {
        name: "Thermogenic Fat Burner",
        category: "supplements",
        subcategory: "weight-loss",
        description: "Advanced thermogenic formula with green tea extract, L-carnitine, and cayenne pepper to support metabolism.",
        benefits: [
            "Boosts metabolic rate",
            "Supports fat burning",
            "Increases energy levels",
            "Suppresses appetite naturally",
            "Enhances thermogenesis"
        ],
        ingredients: [
            { name: "Green Tea Extract (EGCG)", amount: "400mg", dailyValue: "*" },
            { name: "L-Carnitine", amount: "1000mg", dailyValue: "*" },
            { name: "Cayenne Pepper Extract", amount: "100mg", dailyValue: "*" },
            { name: "Chromium Picolinate", amount: "200mcg", dailyValue: "571%" }
        ],
        usage: {
            dosage: "2 capsules",
            frequency: "Twice daily",
            instructions: "Take 30 minutes before meals with water"
        },
        pricing: {
            basePrice: 49.99,
            salePrice: 42.99,
            currency: "USD"
        },
        inventory: {
            stock: 167,
            status: "in-stock"
        },
        specifications: {
            size: "120 capsules",
            servings: 60,
            weight: "3 oz"
        },
        certifications: ["third-party-tested", "non-gmo", "gluten-free"],
        tags: ["weight-loss", "fat-burner", "metabolism", "thermogenic", "energy"],
        ratings: {
            average: 4.2,
            count: 389
        }
    },
    {
        name: "Appetite Control & Cravings Support",
        category: "supplements",
        subcategory: "weight-loss",
        description: "Natural appetite suppressant with glucomannan, garcinia cambogia, and 5-HTP to reduce cravings.",
        benefits: [
            "Reduces appetite and cravings",
            "Supports portion control",
            "Promotes feeling of fullness",
            "Balances mood and stress eating",
            "Natural hunger management"
        ],
        ingredients: [
            { name: "Glucomannan (Konjac Root)", amount: "1800mg", dailyValue: "*" },
            { name: "Garcinia Cambogia Extract", amount: "1000mg", dailyValue: "*" },
            { name: "5-HTP", amount: "100mg", dailyValue: "*" },
            { name: "White Kidney Bean Extract", amount: "500mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "2 capsules",
            frequency: "30 minutes before meals",
            instructions: "Take with 16oz water for fiber expansion"
        },
        pricing: {
            basePrice: 39.99,
            currency: "USD"
        },
        inventory: {
            stock: 134,
            status: "in-stock"
        },
        specifications: {
            size: "90 capsules",
            servings: 45,
            weight: "3 oz"
        },
        certifications: ["natural", "non-gmo", "vegan", "gluten-free"],
        tags: ["weight-loss", "appetite-control", "cravings", "portion-control", "natural"],
        ratings: {
            average: 4.1,
            count: 276
        }
    },
    {
        name: "Keto BHB Exogenous Ketones",
        category: "supplements",
        subcategory: "weight-loss",
        description: "Beta-hydroxybutyrate ketones to support ketosis, fat burning, and sustained energy on ketogenic diets.",
        benefits: [
            "Supports ketosis state",
            "Accelerates fat burning",
            "Provides clean energy",
            "Reduces keto flu symptoms",
            "Enhances mental clarity"
        ],
        ingredients: [
            { name: "Beta-Hydroxybutyrate (BHB)", amount: "11.7g", dailyValue: "*" },
            { name: "Sodium BHB", amount: "4.2g", dailyValue: "*" },
            { name: "Calcium BHB", amount: "3.8g", dailyValue: "*" },
            { name: "Magnesium BHB", amount: "3.7g", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 scoop (15g)",
            frequency: "1-2 times daily",
            instructions: "Mix with 8-10oz water, best on empty stomach"
        },
        pricing: {
            basePrice: 59.99,
            salePrice: 49.99,
            currency: "USD"
        },
        inventory: {
            stock: 89,
            status: "in-stock"
        },
        specifications: {
            size: "450g powder",
            servings: 30,
            weight: "15.9 oz"
        },
        certifications: ["keto-certified", "sugar-free", "non-gmo", "gluten-free"],
        tags: ["weight-loss", "keto", "ketones", "fat-burning", "energy"],
        ratings: {
            average: 4.4,
            count: 198
        }
    },
    {
        name: "CLA + Green Coffee Bean Extract",
        category: "supplements",
        subcategory: "weight-loss",
        description: "Conjugated linoleic acid with green coffee bean extract to support lean muscle and fat metabolism.",
        benefits: [
            "Supports lean muscle retention",
            "Promotes fat metabolism",
            "Helps reduce belly fat",
            "Boosts metabolic rate",
            "Antioxidant properties"
        ],
        ingredients: [
            { name: "CLA (Conjugated Linoleic Acid)", amount: "1000mg", dailyValue: "*" },
            { name: "Green Coffee Bean Extract", amount: "400mg", dailyValue: "*" },
            { name: "L-Carnitine Tartrate", amount: "500mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "2 softgels",
            frequency: "Twice daily",
            instructions: "Take with meals for best absorption"
        },
        pricing: {
            basePrice: 34.99,
            currency: "USD"
        },
        inventory: {
            stock: 156,
            status: "in-stock"
        },
        specifications: {
            size: "180 softgels",
            servings: 90,
            weight: "4 oz"
        },
        certifications: ["non-gmo", "third-party-tested", "gluten-free"],
        tags: ["weight-loss", "cla", "green-coffee", "lean-muscle", "metabolism"],
        ratings: {
            average: 4.0,
            count: 234
        }
    },
    {
        name: "Detox & Cleanse Support Formula",
        category: "supplements",
        subcategory: "weight-loss",
        description: "Gentle detox blend with milk thistle, dandelion root, and probiotics to support cleansing and weight management.",
        benefits: [
            "Supports natural detoxification",
            "Promotes digestive health",
            "Helps reduce bloating",
            "Supports liver function",
            "Gentle cleansing action"
        ],
        ingredients: [
            { name: "Milk Thistle Extract", amount: "300mg", dailyValue: "*" },
            { name: "Dandelion Root", amount: "250mg", dailyValue: "*" },
            { name: "Probiotics (5 strains)", amount: "2 Billion CFU", dailyValue: "*" },
            { name: "Cascara Sagrada", amount: "100mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "2 capsules",
            frequency: "Daily with dinner",
            instructions: "Use for 10-14 days, then take 1 week break"
        },
        pricing: {
            basePrice: 29.99,
            salePrice: 24.99,
            currency: "USD"
        },
        inventory: {
            stock: 178,
            status: "in-stock"
        },
        specifications: {
            size: "60 capsules",
            servings: 30,
            weight: "2 oz"
        },
        certifications: ["natural", "non-gmo", "vegan", "third-party-tested"],
        tags: ["weight-loss", "detox", "cleanse", "digestive-health", "bloating"],
        ratings: {
            average: 4.3,
            count: 167
        }
    },
    {
        name: "Meal Replacement Protein Shake",
        category: "supplements",
        subcategory: "weight-loss",
        description: "Complete meal replacement with 25g protein, fiber, vitamins, and minerals for healthy weight management.",
        benefits: [
            "Complete nutritional meal",
            "Supports weight management",
            "High protein content",
            "Controls calorie intake",
            "Satisfies hunger for hours"
        ],
        ingredients: [
            { name: "Whey Protein Isolate", amount: "25g", dailyValue: "*" },
            { name: "Fiber Blend", amount: "8g", dailyValue: "29%" },
            { name: "Vitamin & Mineral Blend", amount: "Various", dailyValue: "25%" },
            { name: "MCT Oil Powder", amount: "2g", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 scoop (40g)",
            frequency: "1-2 meals daily",
            instructions: "Blend with 8-12oz liquid and ice"
        },
        pricing: {
            basePrice: 44.99,
            salePrice: 39.99,
            currency: "USD"
        },
        inventory: {
            stock: 123,
            status: "in-stock"
        },
        specifications: {
            size: "2 lbs (900g)",
            servings: 22,
            weight: "2 lbs"
        },
        certifications: ["gluten-free", "non-gmo", "third-party-tested"],
        tags: ["weight-loss", "meal-replacement", "protein", "nutrition", "calorie-control"],
        ratings: {
            average: 4.2,
            count: 445
        }
    },
    // MINERAL PRODUCTS
    {
        name: "Zinc Picolinate 50mg",
        category: "minerals",
        subcategory: "essential-minerals",
        description: "High-absorption zinc picolinate to support immune function, wound healing, and protein synthesis.",
        benefits: [
            "Supports immune system function",
            "Promotes wound healing",
            "Essential for protein synthesis",
            "Supports healthy skin",
            "Enhances sense of taste and smell"
        ],
        ingredients: [
            { name: "Zinc (as Zinc Picolinate)", amount: "50mg", dailyValue: "455%" }
        ],
        usage: {
            dosage: "1 capsule",
            frequency: "Daily",
            instructions: "Take on empty stomach or as directed"
        },
        pricing: {
            basePrice: 18.99,
            salePrice: 15.99,
            currency: "USD"
        },
        inventory: {
            stock: 245,
            status: "in-stock"
        },
        specifications: {
            size: "100 capsules",
            servings: 100,
            weight: "2 oz"
        },
        certifications: ["third-party-tested", "non-gmo", "vegan"],
        tags: ["zinc", "minerals", "immune-support", "healing", "essential"],
        ratings: {
            average: 4.7,
            count: 389
        }
    },
    {
        name: "Calcium Magnesium Complex",
        category: "minerals",
        subcategory: "bone-health",
        description: "Balanced calcium and magnesium formula for optimal bone health and muscle function support.",
        benefits: [
            "Supports strong bones and teeth",
            "Promotes muscle function",
            "Supports cardiovascular health",
            "Helps maintain normal blood pressure",
            "Essential for nerve transmission"
        ],
        ingredients: [
            { name: "Calcium (as Calcium Citrate)", amount: "500mg", dailyValue: "38%" },
            { name: "Magnesium (as Magnesium Oxide)", amount: "250mg", dailyValue: "60%" },
            { name: "Vitamin D3", amount: "400 IU", dailyValue: "100%" }
        ],
        usage: {
            dosage: "2 tablets",
            frequency: "Daily",
            instructions: "Take with meals for best absorption"
        },
        pricing: {
            basePrice: 22.99,
            currency: "USD"
        },
        inventory: {
            stock: 178,
            status: "in-stock"
        },
        specifications: {
            size: "120 tablets",
            servings: 60,
            weight: "4 oz"
        },
        certifications: ["usp-verified", "non-gmo", "gluten-free"],
        tags: ["calcium", "magnesium", "minerals", "bone-health", "muscle-support"],
        ratings: {
            average: 4.5,
            count: 267
        }
    },
    {
        name: "Iron Bisglycinate 28mg",
        category: "minerals",
        subcategory: "essential-minerals",
        description: "Gentle, non-constipating iron bisglycinate for optimal iron absorption and energy support.",
        benefits: [
            "Supports healthy iron levels",
            "Boosts energy and reduces fatigue",
            "Essential for oxygen transport",
            "Supports cognitive function",
            "Gentle on stomach"
        ],
        ingredients: [
            { name: "Iron (as Ferrous Bisglycinate)", amount: "28mg", dailyValue: "156%" },
            { name: "Vitamin C", amount: "60mg", dailyValue: "67%" }
        ],
        usage: {
            dosage: "1 capsule",
            frequency: "Daily",
            instructions: "Take on empty stomach or with vitamin C"
        },
        pricing: {
            basePrice: 24.99,
            salePrice: 19.99,
            currency: "USD"
        },
        inventory: {
            stock: 156,
            status: "in-stock"
        },
        specifications: {
            size: "90 capsules",
            servings: 90,
            weight: "3 oz"
        },
        certifications: ["chelated", "non-gmo", "vegan", "gluten-free"],
        tags: ["iron", "minerals", "energy", "anemia-support", "gentle"],
        ratings: {
            average: 4.6,
            count: 198
        }
    },
    {
        name: "Potassium Citrate 99mg",
        category: "minerals",
        subcategory: "electrolytes",
        description: "Essential electrolyte mineral to support heart health, muscle function, and blood pressure regulation.",
        benefits: [
            "Supports cardiovascular health",
            "Maintains healthy blood pressure",
            "Essential for muscle contractions",
            "Supports nerve function",
            "Helps maintain fluid balance"
        ],
        ingredients: [
            { name: "Potassium (as Potassium Citrate)", amount: "99mg", dailyValue: "2%" }
        ],
        usage: {
            dosage: "1 capsule",
            frequency: "1-3 times daily",
            instructions: "Take with meals and plenty of water"
        },
        pricing: {
            basePrice: 16.99,
            currency: "USD"
        },
        inventory: {
            stock: 234,
            status: "in-stock"
        },
        specifications: {
            size: "120 capsules",
            servings: 120,
            weight: "3 oz"
        },
        certifications: ["usp-grade", "non-gmo", "vegan"],
        tags: ["potassium", "minerals", "heart-health", "electrolytes", "blood-pressure"],
        ratings: {
            average: 4.3,
            count: 156
        }
    },
    {
        name: "Chromium Picolinate 200mcg",
        category: "minerals",
        subcategory: "trace-minerals",
        description: "Trace mineral chromium to support healthy glucose metabolism and weight management.",
        benefits: [
            "Supports glucose metabolism",
            "Helps maintain healthy blood sugar",
            "May reduce sugar cravings",
            "Supports weight management",
            "Essential for macronutrient metabolism"
        ],
        ingredients: [
            { name: "Chromium (as Chromium Picolinate)", amount: "200mcg", dailyValue: "571%" }
        ],
        usage: {
            dosage: "1 capsule",
            frequency: "Daily",
            instructions: "Take with meals"
        },
        pricing: {
            basePrice: 14.99,
            currency: "USD"
        },
        inventory: {
            stock: 189,
            status: "in-stock"
        },
        specifications: {
            size: "100 capsules",
            servings: 100,
            weight: "2 oz"
        },
        certifications: ["third-party-tested", "non-gmo", "gluten-free"],
        tags: ["chromium", "minerals", "blood-sugar", "metabolism", "weight-support"],
        ratings: {
            average: 4.2,
            count: 123
        }
    },
    // VITAMIN PRODUCTS (A, B, C, D, E prioritized)
    {
        name: "Vitamin A 10,000 IU",
        category: "vitamins",
        subcategory: "fat-soluble",
        description: "High-potency vitamin A to support vision health, immune function, and cellular development.",
        benefits: [
            "Supports healthy vision",
            "Promotes immune function",
            "Essential for cell growth",
            "Supports skin health",
            "Important for reproduction"
        ],
        ingredients: [
            { name: "Vitamin A (as Retinyl Palmitate)", amount: "10,000 IU", dailyValue: "1111%" }
        ],
        usage: {
            dosage: "1 softgel",
            frequency: "Daily",
            instructions: "Take with fatty meal for absorption"
        },
        pricing: {
            basePrice: 19.99,
            currency: "USD"
        },
        inventory: {
            stock: 167,
            status: "in-stock"
        },
        specifications: {
            size: "100 softgels",
            servings: 100,
            weight: "3 oz"
        },
        certifications: ["non-gmo", "third-party-tested"],
        tags: ["vitamin-a", "vitamins", "vision", "immune-support", "fat-soluble"],
        ratings: {
            average: 4.4,
            count: 234
        }
    },
    {
        name: "B-Complex Energy Formula",
        category: "vitamins",
        subcategory: "b-complex",
        description: "Complete B-vitamin complex with all 8 essential B vitamins for energy production and nervous system support.",
        benefits: [
            "Boosts natural energy production",
            "Supports nervous system health",
            "Enhances mental clarity",
            "Supports cardiovascular health",
            "Essential for metabolism"
        ],
        ingredients: [
            { name: "Thiamine (B1)", amount: "100mg", dailyValue: "8333%" },
            { name: "Riboflavin (B2)", amount: "100mg", dailyValue: "7692%" },
            { name: "Niacin (B3)", amount: "100mg", dailyValue: "625%" },
            { name: "B6 (Pyridoxine)", amount: "100mg", dailyValue: "5882%" },
            { name: "B12 (Methylcobalamin)", amount: "1000mcg", dailyValue: "41667%" },
            { name: "Biotin", amount: "300mcg", dailyValue: "1000%" },
            { name: "Folate", amount: "400mcg", dailyValue: "100%" },
            { name: "Pantothenic Acid (B5)", amount: "100mg", dailyValue: "2000%" }
        ],
        usage: {
            dosage: "1 capsule",
            frequency: "Daily",
            instructions: "Take with breakfast for energy"
        },
        pricing: {
            basePrice: 26.99,
            salePrice: 22.99,
            currency: "USD"
        },
        inventory: {
            stock: 198,
            status: "in-stock"
        },
        specifications: {
            size: "90 capsules",
            servings: 90,
            weight: "3 oz"
        },
        certifications: ["methylated", "non-gmo", "vegan"],
        tags: ["b-complex", "vitamins", "energy", "nervous-system", "metabolism"],
        ratings: {
            average: 4.6,
            count: 367
        }
    },
    {
        name: "Vitamin C 1000mg with Rose Hips",
        category: "vitamins",
        subcategory: "water-soluble",
        description: "High-potency vitamin C with natural rose hips for enhanced absorption and antioxidant protection.",
        benefits: [
            "Powerful antioxidant protection",
            "Supports immune system",
            "Promotes collagen synthesis",
            "Enhances iron absorption",
            "Supports wound healing"
        ],
        ingredients: [
            { name: "Vitamin C (Ascorbic Acid)", amount: "1000mg", dailyValue: "1111%" },
            { name: "Rose Hips Extract", amount: "25mg", dailyValue: "*" },
            { name: "Bioflavonoids", amount: "25mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 tablet",
            frequency: "Daily",
            instructions: "Take with food to reduce stomach upset"
        },
        pricing: {
            basePrice: 19.99,
            salePrice: 16.99,
            currency: "USD"
        },
        inventory: {
            stock: 289,
            status: "in-stock"
        },
        specifications: {
            size: "120 tablets",
            servings: 120,
            weight: "4 oz"
        },
        certifications: ["non-gmo", "vegan", "gluten-free"],
        tags: ["vitamin-c", "vitamins", "immune-support", "antioxidant", "rose-hips"],
        ratings: {
            average: 4.5,
            count: 456
        }
    },
    {
        name: "Vitamin D3 5000 IU Extra Strength",
        category: "vitamins",
        subcategory: "fat-soluble",
        description: "Extra strength vitamin D3 for superior bone health, immune support, and calcium absorption.",
        benefits: [
            "Superior bone and teeth health",
            "Enhanced immune function",
            "Improves calcium absorption",
            "Supports muscle function",
            "May improve mood"
        ],
        ingredients: [
            { name: "Vitamin D3 (Cholecalciferol)", amount: "5000 IU", dailyValue: "2500%" }
        ],
        usage: {
            dosage: "1 softgel",
            frequency: "Daily",
            instructions: "Take with fatty meal for best absorption"
        },
        pricing: {
            basePrice: 21.99,
            currency: "USD"
        },
        inventory: {
            stock: 234,
            status: "in-stock"
        },
        specifications: {
            size: "120 softgels",
            servings: 120,
            weight: "3 oz"
        },
        certifications: ["third-party-tested", "non-gmo"],
        tags: ["vitamin-d3", "vitamins", "bone-health", "immune-support", "high-potency"],
        ratings: {
            average: 4.7,
            count: 512
        }
    },
    {
        name: "Vitamin E 400 IU Mixed Tocopherols",
        category: "vitamins",
        subcategory: "fat-soluble",
        description: "Natural mixed tocopherols vitamin E for comprehensive antioxidant protection and cardiovascular health.",
        benefits: [
            "Powerful antioxidant protection",
            "Supports cardiovascular health",
            "Protects cell membranes",
            "Supports immune function",
            "Promotes healthy skin"
        ],
        ingredients: [
            { name: "Vitamin E (Mixed Tocopherols)", amount: "400 IU", dailyValue: "1333%" },
            { name: "d-alpha Tocopherol", amount: "268mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 softgel",
            frequency: "Daily",
            instructions: "Take with fatty meal"
        },
        pricing: {
            basePrice: 24.99,
            currency: "USD"
        },
        inventory: {
            stock: 145,
            status: "in-stock"
        },
        specifications: {
            size: "100 softgels",
            servings: 100,
            weight: "3 oz"
        },
        certifications: ["natural", "non-gmo", "soy-free"],
        tags: ["vitamin-e", "vitamins", "antioxidant", "heart-health", "natural"],
        ratings: {
            average: 4.4,
            count: 198
        }
    },
    // SUPPLEMENT PRODUCTS
    {
        name: "Turmeric Curcumin with BioPerine",
        category: "supplements",
        subcategory: "herbal",
        description: "Potent turmeric curcumin extract with BioPerine for enhanced absorption and anti-inflammatory support.",
        benefits: [
            "Powerful anti-inflammatory effects",
            "Supports joint health",
            "Antioxidant protection",
            "May support heart health",
            "Enhanced absorption formula"
        ],
        ingredients: [
            { name: "Turmeric Root Extract (95% Curcuminoids)", amount: "500mg", dailyValue: "*" },
            { name: "BioPerine Black Pepper Extract", amount: "5mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "2 capsules",
            frequency: "Daily",
            instructions: "Take with meals for best absorption"
        },
        pricing: {
            basePrice: 29.99,
            salePrice: 24.99,
            currency: "USD"
        },
        inventory: {
            stock: 167,
            status: "in-stock"
        },
        specifications: {
            size: "120 capsules",
            servings: 60,
            weight: "3 oz"
        },
        certifications: ["standardized", "non-gmo", "vegan"],
        tags: ["turmeric", "supplements", "anti-inflammatory", "joint-health", "curcumin"],
        ratings: {
            average: 4.5,
            count: 389
        }
    },
    {
        name: "Ashwagandha KSM-66 600mg",
        category: "supplements",
        subcategory: "adaptogenic",
        description: "Premium KSM-66 ashwagandha root extract for stress management and energy enhancement.",
        benefits: [
            "Reduces stress and cortisol",
            "Improves energy and vitality",
            "Supports cognitive function",
            "Enhances physical performance",
            "Promotes restful sleep"
        ],
        ingredients: [
            { name: "KSM-66 Ashwagandha Root Extract", amount: "600mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 capsule",
            frequency: "Daily",
            instructions: "Take with food, preferably in evening"
        },
        pricing: {
            basePrice: 34.99,
            currency: "USD"
        },
        inventory: {
            stock: 134,
            status: "in-stock"
        },
        specifications: {
            size: "60 capsules",
            servings: 60,
            weight: "2 oz"
        },
        certifications: ["ksm-66", "organic", "third-party-tested"],
        tags: ["ashwagandha", "supplements", "stress-relief", "adaptogen", "energy"],
        ratings: {
            average: 4.6,
            count: 278
        }
    },
    {
        name: "Rhodiola Rosea 500mg",
        category: "supplements",
        subcategory: "adaptogenic",
        description: "Standardized rhodiola rosea extract to support mental performance and stress resilience.",
        benefits: [
            "Enhances mental performance",
            "Supports stress resilience",
            "Boosts energy and endurance",
            "Improves mood balance",
            "Supports cognitive function"
        ],
        ingredients: [
            { name: "Rhodiola Rosea Root Extract (3% Rosavins)", amount: "500mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 capsule",
            frequency: "Daily",
            instructions: "Take on empty stomach in morning"
        },
        pricing: {
            basePrice: 27.99,
            currency: "USD"
        },
        inventory: {
            stock: 98,
            status: "in-stock"
        },
        specifications: {
            size: "90 capsules",
            servings: 90,
            weight: "3 oz"
        },
        certifications: ["standardized", "non-gmo", "vegan"],
        tags: ["rhodiola", "supplements", "mental-performance", "adaptogen", "energy"],
        ratings: {
            average: 4.3,
            count: 167
        }
    },
    {
        name: "Milk Thistle Silymarin 420mg",
        category: "supplements",
        subcategory: "liver-support",
        description: "Standardized milk thistle extract with 80% silymarin for comprehensive liver health support.",
        benefits: [
            "Supports liver health and function",
            "Powerful antioxidant protection",
            "Supports cellular regeneration",
            "May help detoxification",
            "Supports overall wellness"
        ],
        ingredients: [
            { name: "Milk Thistle Seed Extract (80% Silymarin)", amount: "420mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 capsule",
            frequency: "1-2 times daily",
            instructions: "Take with meals"
        },
        pricing: {
            basePrice: 22.99,
            currency: "USD"
        },
        inventory: {
            stock: 178,
            status: "in-stock"
        },
        specifications: {
            size: "120 capsules",
            servings: 120,
            weight: "3 oz"
        },
        certifications: ["standardized", "non-gmo", "third-party-tested"],
        tags: ["milk-thistle", "supplements", "liver-support", "detox", "antioxidant"],
        ratings: {
            average: 4.4,
            count: 245
        }
    },
    {
        name: "Green Tea Extract EGCG 400mg",
        category: "supplements",
        subcategory: "antioxidant",
        description: "Concentrated green tea extract with 50% EGCG for powerful antioxidant and metabolic support.",
        benefits: [
            "Powerful antioxidant protection",
            "Supports healthy metabolism",
            "May support weight management",
            "Supports cardiovascular health",
            "Provides gentle energy"
        ],
        ingredients: [
            { name: "Green Tea Leaf Extract (50% EGCG)", amount: "400mg", dailyValue: "*" },
            { name: "Natural Caffeine", amount: "50mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 capsule",
            frequency: "1-2 times daily",
            instructions: "Take between meals with water"
        },
        pricing: {
            basePrice: 19.99,
            salePrice: 17.99,
            currency: "USD"
        },
        inventory: {
            stock: 212,
            status: "in-stock"
        },
        specifications: {
            size: "120 capsules",
            servings: 120,
            weight: "3 oz"
        },
        certifications: ["standardized", "non-gmo", "decaffeinated-option"],
        tags: ["green-tea", "supplements", "antioxidant", "metabolism", "egcg"],
        ratings: {
            average: 4.2,
            count: 334
        }
    },
    // MULTIVITAMIN PRODUCTS
    {
        name: "Men's Daily Multivitamin Formula",
        category: "multivitamins",
        subcategory: "men",
        description: "Comprehensive daily multivitamin specifically formulated for men's nutritional needs and energy support.",
        benefits: [
            "Complete daily nutritional support",
            "Supports energy and vitality",
            "Promotes heart health",
            "Supports prostate health",
            "Enhances immune function"
        ],
        ingredients: [
            { name: "Vitamin A", amount: "5000 IU", dailyValue: "556%" },
            { name: "Vitamin C", amount: "200mg", dailyValue: "222%" },
            { name: "Vitamin D3", amount: "2000 IU", dailyValue: "500%" },
            { name: "B-Complex Blend", amount: "Various", dailyValue: "100-1000%" },
            { name: "Lycopene", amount: "300mcg", dailyValue: "*" },
            { name: "Saw Palmetto", amount: "25mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "2 tablets",
            frequency: "Daily",
            instructions: "Take with breakfast"
        },
        pricing: {
            basePrice: 32.99,
            salePrice: 27.99,
            currency: "USD"
        },
        inventory: {
            stock: 189,
            status: "in-stock"
        },
        specifications: {
            size: "120 tablets",
            servings: 60,
            weight: "4 oz"
        },
        certifications: ["third-party-tested", "non-gmo"],
        tags: ["multivitamin", "men", "daily-support", "energy", "prostate-health"],
        ratings: {
            average: 4.5,
            count: 423
        }
    },
    {
        name: "Women's Daily Multivitamin Plus",
        category: "multivitamins",
        subcategory: "women",
        description: "Complete multivitamin with iron, folate, and biotin specifically designed for women's health needs.",
        benefits: [
            "Supports women's nutritional needs",
            "Contains iron for energy support",
            "Includes folate for reproductive health",
            "Supports healthy skin and hair",
            "Enhances immune function"
        ],
        ingredients: [
            { name: "Vitamin A", amount: "4000 IU", dailyValue: "444%" },
            { name: "Vitamin C", amount: "250mg", dailyValue: "278%" },
            { name: "Vitamin D3", amount: "2000 IU", dailyValue: "500%" },
            { name: "Iron (Bisglycinate)", amount: "18mg", dailyValue: "100%" },
            { name: "Folate", amount: "800mcg", dailyValue: "200%" },
            { name: "Biotin", amount: "5000mcg", dailyValue: "1667%" }
        ],
        usage: {
            dosage: "2 tablets",
            frequency: "Daily",
            instructions: "Take with breakfast"
        },
        pricing: {
            basePrice: 34.99,
            currency: "USD"
        },
        inventory: {
            stock: 198,
            status: "in-stock"
        },
        specifications: {
            size: "120 tablets",
            servings: 60,
            weight: "4 oz"
        },
        certifications: ["gentle-iron", "non-gmo", "third-party-tested"],
        tags: ["multivitamin", "women", "iron", "folate", "reproductive-health"],
        ratings: {
            average: 4.6,
            count: 512
        }
    },
    {
        name: "Senior 50+ Complete Multivitamin",
        category: "multivitamins",
        subcategory: "senior",
        description: "Age-specific multivitamin with enhanced nutrients for adults 50+ to support healthy aging.",
        benefits: [
            "Supports healthy aging",
            "Enhanced B12 for energy",
            "Supports bone and joint health",
            "Promotes heart health",
            "Supports cognitive function"
        ],
        ingredients: [
            { name: "Vitamin B12 (Methylcobalamin)", amount: "2500mcg", dailyValue: "104167%" },
            { name: "Vitamin D3", amount: "2000 IU", dailyValue: "500%" },
            { name: "Calcium", amount: "500mg", dailyValue: "38%" },
            { name: "Magnesium", amount: "250mg", dailyValue: "60%" },
            { name: "CoQ10", amount: "30mg", dailyValue: "*" },
            { name: "Lutein", amount: "2mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "2 tablets",
            frequency: "Daily",
            instructions: "Take with morning meal"
        },
        pricing: {
            basePrice: 39.99,
            salePrice: 34.99,
            currency: "USD"
        },
        inventory: {
            stock: 145,
            status: "in-stock"
        },
        specifications: {
            size: "120 tablets",
            servings: 60,
            weight: "4 oz"
        },
        certifications: ["senior-formulated", "non-gmo", "easy-swallow"],
        tags: ["multivitamin", "senior", "50+", "aging-support", "bone-health"],
        ratings: {
            average: 4.4,
            count: 298
        }
    },
    {
        name: "Teen Daily Multivitamin",
        category: "multivitamins",
        subcategory: "teen",
        description: "Age-appropriate multivitamin for teenagers with nutrients to support growth and development.",
        benefits: [
            "Supports healthy growth",
            "Enhances energy and focus",
            "Supports immune function",
            "Promotes healthy skin",
            "Supports academic performance"
        ],
        ingredients: [
            { name: "Vitamin A", amount: "3000 IU", dailyValue: "333%" },
            { name: "Vitamin C", amount: "150mg", dailyValue: "167%" },
            { name: "Vitamin D3", amount: "1000 IU", dailyValue: "250%" },
            { name: "B-Complex", amount: "Various", dailyValue: "100%" },
            { name: "Iron", amount: "8mg", dailyValue: "44%" },
            { name: "Zinc", amount: "8mg", dailyValue: "73%" }
        ],
        usage: {
            dosage: "2 tablets",
            frequency: "Daily",
            instructions: "Take with breakfast or lunch"
        },
        pricing: {
            basePrice: 24.99,
            currency: "USD"
        },
        inventory: {
            stock: 167,
            status: "in-stock"
        },
        specifications: {
            size: "120 tablets",
            servings: 60,
            weight: "3 oz"
        },
        certifications: ["teen-formulated", "non-gmo", "natural-colors"],
        tags: ["multivitamin", "teen", "growth", "development", "school-support"],
        ratings: {
            average: 4.3,
            count: 189
        }
    },
    {
        name: "Prenatal Complete with DHA",
        category: "multivitamins",
        subcategory: "prenatal",
        description: "Complete prenatal vitamin with DHA omega-3 to support healthy pregnancy and fetal development.",
        benefits: [
            "Supports healthy pregnancy",
            "Essential for fetal development",
            "Contains DHA for brain development",
            "Gentle on stomach",
            "Supports maternal health"
        ],
        ingredients: [
            { name: "Folate (Methylfolate)", amount: "800mcg", dailyValue: "200%" },
            { name: "Iron (Bisglycinate)", amount: "27mg", dailyValue: "150%" },
            { name: "DHA Omega-3", amount: "200mg", dailyValue: "*" },
            { name: "Vitamin D3", amount: "2000 IU", dailyValue: "500%" },
            { name: "Calcium", amount: "250mg", dailyValue: "19%" },
            { name: "Choline", amount: "55mg", dailyValue: "10%" }
        ],
        usage: {
            dosage: "2 capsules",
            frequency: "Daily",
            instructions: "Take with food, preferably breakfast"
        },
        pricing: {
            basePrice: 44.99,
            currency: "USD"
        },
        inventory: {
            stock: 123,
            status: "in-stock"
        },
        specifications: {
            size: "120 capsules",
            servings: 60,
            weight: "4 oz"
        },
        certifications: ["methylated", "gentle-iron", "third-party-tested"],
        tags: ["multivitamin", "prenatal", "pregnancy", "dha", "folate"],
        ratings: {
            average: 4.7,
            count: 378
        }
    },
    // PROBIOTIC PRODUCTS
    {
        name: "Ultimate Probiotic 100 Billion CFU",
        category: "probiotics",
        subcategory: "high-potency",
        description: "Ultra-high potency probiotic with 15 strains and 100 billion CFU for comprehensive digestive support.",
        benefits: [
            "Maximum digestive support",
            "Supports immune function",
            "Promotes healthy gut bacteria",
            "Enhances nutrient absorption",
            "Supports overall wellness"
        ],
        ingredients: [
            { name: "Probiotic Blend (15 strains)", amount: "100 Billion CFU", dailyValue: "*" },
            { name: "Lactobacillus acidophilus", amount: "25 Billion CFU", dailyValue: "*" },
            { name: "Bifidobacterium lactis", amount: "20 Billion CFU", dailyValue: "*" },
            { name: "Prebiotic FOS", amount: "200mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 capsule",
            frequency: "Daily",
            instructions: "Take on empty stomach or as directed"
        },
        pricing: {
            basePrice: 54.99,
            salePrice: 47.99,
            currency: "USD"
        },
        inventory: {
            stock: 89,
            status: "in-stock"
        },
        specifications: {
            size: "60 capsules",
            servings: 60,
            weight: "2 oz"
        },
        certifications: ["shelf-stable", "acid-resistant", "non-gmo"],
        tags: ["probiotics", "high-potency", "digestive-health", "immune-support", "15-strains"],
        ratings: {
            average: 4.6,
            count: 267
        }
    },
    {
        name: "Women's Probiotic Balance Formula",
        category: "probiotics",
        subcategory: "women",
        description: "Specialized probiotic formula for women's digestive and vaginal health with targeted strains.",
        benefits: [
            "Supports vaginal health",
            "Promotes digestive balance",
            "Supports urinary tract health",
            "Enhances immune function",
            "Specifically formulated for women"
        ],
        ingredients: [
            { name: "Lactobacillus rhamnosus", amount: "10 Billion CFU", dailyValue: "*" },
            { name: "Lactobacillus reuteri", amount: "8 Billion CFU", dailyValue: "*" },
            { name: "Lactobacillus crispatus", amount: "7 Billion CFU", dailyValue: "*" },
            { name: "Cranberry Extract", amount: "100mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 capsule",
            frequency: "Daily",
            instructions: "Take with or without food"
        },
        pricing: {
            basePrice: 39.99,
            currency: "USD"
        },
        inventory: {
            stock: 156,
            status: "in-stock"
        },
        specifications: {
            size: "60 capsules",
            servings: 60,
            weight: "2 oz"
        },
        certifications: ["women-specific", "shelf-stable", "third-party-tested"],
        tags: ["probiotics", "women", "vaginal-health", "urinary-tract", "balance"],
        ratings: {
            average: 4.5,
            count: 334
        }
    },
    {
        name: "Daily Probiotic 30 Billion CFU",
        category: "probiotics",
        subcategory: "daily-support",
        description: "Balanced daily probiotic with 10 beneficial strains for everyday digestive and immune support.",
        benefits: [
            "Daily digestive support",
            "Supports immune function",
            "Promotes gut health balance",
            "Easy daily maintenance",
            "Gentle and effective"
        ],
        ingredients: [
            { name: "Probiotic Blend (10 strains)", amount: "30 Billion CFU", dailyValue: "*" },
            { name: "Lactobacillus plantarum", amount: "8 Billion CFU", dailyValue: "*" },
            { name: "Bifidobacterium longum", amount: "6 Billion CFU", dailyValue: "*" },
            { name: "Prebiotic Inulin", amount: "100mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 capsule",
            frequency: "Daily",
            instructions: "Take with breakfast"
        },
        pricing: {
            basePrice: 29.99,
            salePrice: 24.99,
            currency: "USD"
        },
        inventory: {
            stock: 234,
            status: "in-stock"
        },
        specifications: {
            size: "60 capsules",
            servings: 60,
            weight: "2 oz"
        },
        certifications: ["daily-formula", "shelf-stable", "non-gmo"],
        tags: ["probiotics", "daily-support", "digestive-health", "maintenance", "gentle"],
        ratings: {
            average: 4.4,
            count: 445
        }
    },
    {
        name: "Kids Probiotic Chewable Berry",
        category: "probiotics",
        subcategory: "children",
        description: "Kid-friendly chewable probiotic with natural berry flavor and strains specifically for children's health.",
        benefits: [
            "Supports children's digestive health",
            "Boosts immune system",
            "Delicious natural berry flavor",
            "Promotes healthy gut bacteria",
            "Easy chewable format"
        ],
        ingredients: [
            { name: "Kid-Safe Probiotic Blend (5 strains)", amount: "5 Billion CFU", dailyValue: "*" },
            { name: "Lactobacillus casei", amount: "2 Billion CFU", dailyValue: "*" },
            { name: "Bifidobacterium infantis", amount: "1.5 Billion CFU", dailyValue: "*" },
            { name: "Natural Berry Flavor", amount: "Various", dailyValue: "*" }
        ],
        usage: {
            dosage: "1-2 chewables",
            frequency: "Daily",
            instructions: "Chew thoroughly, ages 2+ with supervision"
        },
        pricing: {
            basePrice: 24.99,
            currency: "USD"
        },
        inventory: {
            stock: 178,
            status: "in-stock"
        },
        specifications: {
            size: "60 chewables",
            servings: 30-60,
            weight: "3 oz"
        },
        certifications: ["kid-safe", "natural-flavors", "sugar-free"],
        tags: ["probiotics", "kids", "chewable", "berry-flavor", "immune-support"],
        ratings: {
            average: 4.7,
            count: 298
        }
    },
    {
        name: "Travel Probiotic Immune Support",
        category: "probiotics",
        subcategory: "travel",
        description: "Portable probiotic specifically formulated for travel with immune and digestive support strains.",
        benefits: [
            "Supports digestive health while traveling",
            "Boosts immune function",
            "Helps with dietary changes",
            "Convenient travel-size",
            "No refrigeration required"
        ],
        ingredients: [
            { name: "Travel-Specific Blend (8 strains)", amount: "20 Billion CFU", dailyValue: "*" },
            { name: "Lactobacillus helveticus", amount: "5 Billion CFU", dailyValue: "*" },
            { name: "Saccharomyces boulardii", amount: "3 Billion CFU", dailyValue: "*" },
            { name: "Zinc", amount: "5mg", dailyValue: "45%" }
        ],
        usage: {
            dosage: "1 capsule",
            frequency: "Daily while traveling",
            instructions: "Start 3 days before travel"
        },
        pricing: {
            basePrice: 19.99,
            currency: "USD"
        },
        inventory: {
            stock: 145,
            status: "in-stock"
        },
        specifications: {
            size: "30 capsules",
            servings: 30,
            weight: "1 oz"
        },
        certifications: ["travel-formulated", "shelf-stable", "portable"],
        tags: ["probiotics", "travel", "immune-support", "portable", "digestive-health"],
        ratings: {
            average: 4.3,
            count: 156
        }
    },
    // PREBIOTIC PRODUCTS
    {
        name: "Prebiotic Fiber Complex",
        category: "prebiotics",
        subcategory: "fiber-blend",
        description: "Comprehensive prebiotic fiber blend with inulin, FOS, and resistant starch to nourish beneficial gut bacteria.",
        benefits: [
            "Feeds beneficial gut bacteria",
            "Supports digestive health",
            "Promotes regularity",
            "Enhances probiotic effectiveness",
            "Supports overall gut microbiome"
        ],
        ingredients: [
            { name: "Inulin (Chicory Root)", amount: "3g", dailyValue: "*" },
            { name: "Fructooligosaccharides (FOS)", amount: "2g", dailyValue: "*" },
            { name: "Resistant Potato Starch", amount: "1g", dailyValue: "*" },
            { name: "Acacia Fiber", amount: "1g", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 scoop (7g)",
            frequency: "Daily",
            instructions: "Mix with water or add to smoothies"
        },
        pricing: {
            basePrice: 27.99,
            currency: "USD"
        },
        inventory: {
            stock: 134,
            status: "in-stock"
        },
        specifications: {
            size: "210g powder",
            servings: 30,
            weight: "7.4 oz"
        },
        certifications: ["organic", "non-gmo", "vegan"],
        tags: ["prebiotics", "fiber", "gut-health", "digestive-support", "microbiome"],
        ratings: {
            average: 4.4,
            count: 234
        }
    },
    {
        name: "Inulin Pure Prebiotic Powder",
        category: "prebiotics",
        subcategory: "pure-inulin",
        description: "Pure inulin prebiotic powder from Jerusalem artichoke to support healthy gut bacteria growth.",
        benefits: [
            "Pure prebiotic fiber source",
            "Supports beneficial bacteria",
            "Promotes digestive health",
            "Helps maintain regularity",
            "Tasteless and versatile"
        ],
        ingredients: [
            { name: "Inulin (Jerusalem Artichoke)", amount: "5g", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 teaspoon (5g)",
            frequency: "Daily",
            instructions: "Mix into any beverage or food"
        },
        pricing: {
            basePrice: 19.99,
            currency: "USD"
        },
        inventory: {
            stock: 189,
            status: "in-stock"
        },
        specifications: {
            size: "300g powder",
            servings: 60,
            weight: "10.6 oz"
        },
        certifications: ["pure", "organic", "non-gmo"],
        tags: ["prebiotics", "inulin", "pure", "tasteless", "gut-bacteria"],
        ratings: {
            average: 4.2,
            count: 167
        }
    },
    {
        name: "Green Banana Resistant Starch",
        category: "prebiotics",
        subcategory: "resistant-starch",
        description: "Natural resistant starch from green bananas to support gut health and healthy metabolism.",
        benefits: [
            "Natural prebiotic fiber",
            "Supports gut bacteria diversity",
            "May support healthy blood sugar",
            "Promotes satiety",
            "Supports digestive health"
        ],
        ingredients: [
            { name: "Green Banana Resistant Starch", amount: "15g", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 tablespoon (15g)",
            frequency: "Daily",
            instructions: "Add to smoothies or mix with cold liquids"
        },
        pricing: {
            basePrice: 24.99,
            salePrice: 21.99,
            currency: "USD"
        },
        inventory: {
            stock: 98,
            status: "in-stock"
        },
        specifications: {
            size: "450g powder",
            servings: 30,
            weight: "15.9 oz"
        },
        certifications: ["natural", "organic", "raw"],
        tags: ["prebiotics", "resistant-starch", "banana", "natural", "blood-sugar"],
        ratings: {
            average: 4.3,
            count: 145
        }
    },
    {
        name: "Acacia Fiber Prebiotic",
        category: "prebiotics",
        subcategory: "soluble-fiber",
        description: "Gentle acacia fiber prebiotic that's well-tolerated and supports digestive comfort.",
        benefits: [
            "Gentle on sensitive stomachs",
            "Supports beneficial bacteria",
            "Promotes digestive comfort",
            "Well-tolerated fiber source",
            "Dissolves completely clear"
        ],
        ingredients: [
            { name: "Acacia Senegal Fiber", amount: "6g", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 scoop (6g)",
            frequency: "1-2 times daily",
            instructions: "Stir into any beverage until dissolved"
        },
        pricing: {
            basePrice: 22.99,
            currency: "USD"
        },
        inventory: {
            stock: 156,
            status: "in-stock"
        },
        specifications: {
            size: "240g powder",
            servings: 40,
            weight: "8.5 oz"
        },
        certifications: ["gentle", "organic", "sustainably-sourced"],
        tags: ["prebiotics", "acacia-fiber", "gentle", "soluble-fiber", "sensitive-stomach"],
        ratings: {
            average: 4.5,
            count: 189
        }
    },
    {
        name: "Prebiotic Gummies Berry Blend",
        category: "prebiotics",
        subcategory: "gummies",
        description: "Delicious berry-flavored prebiotic gummies with natural fruit fibers and plant-based pectin.",
        benefits: [
            "Delicious way to get prebiotics",
            "Supports gut health",
            "Natural fruit flavors",
            "Easy and convenient",
            "Kids and adults love them"
        ],
        ingredients: [
            { name: "Prebiotic Fiber Blend", amount: "3g", dailyValue: "*" },
            { name: "Natural Berry Flavors", amount: "Various", dailyValue: "*" },
            { name: "Pectin (Plant-based)", amount: "500mg", dailyValue: "*" }
        ],
        usage: {
            dosage: "2 gummies",
            frequency: "Daily",
            instructions: "Chew thoroughly, can be taken anytime"
        },
        pricing: {
            basePrice: 26.99,
            currency: "USD"
        },
        inventory: {
            stock: 167,
            status: "in-stock"
        },
        specifications: {
            size: "60 gummies",
            servings: 30,
            weight: "4 oz"
        },
        certifications: ["natural-flavors", "vegan", "gluten-free"],
        tags: ["prebiotics", "gummies", "berry-flavor", "convenient", "family-friendly"],
        ratings: {
            average: 4.6,
            count: 278
        }
    },
    // TODDLER GUMMIES PRODUCTS
    {
        name: "Toddler Multivitamin Gummies",
        category: "multivitamins",
        subcategory: "toddler-gummies",
        description: "Complete multivitamin gummies specially formulated for toddlers ages 2-4 with essential nutrients.",
        benefits: [
            "Supports healthy growth",
            "Boosts immune system",
            "Promotes brain development",
            "Delicious natural fruit flavors",
            "Easy chewable format"
        ],
        ingredients: [
            { name: "Vitamin A", amount: "1500 IU", dailyValue: "150%" },
            { name: "Vitamin C", amount: "40mg", dailyValue: "267%" },
            { name: "Vitamin D3", amount: "600 IU", dailyValue: "150%" },
            { name: "B Vitamins", amount: "Various", dailyValue: "50-100%" },
            { name: "Zinc", amount: "2.5mg", dailyValue: "83%" }
        ],
        usage: {
            dosage: "1-2 gummies",
            frequency: "Daily",
            instructions: "Ages 2-4, supervise chewing"
        },
        pricing: {
            basePrice: 19.99,
            currency: "USD"
        },
        inventory: {
            stock: 234,
            status: "in-stock"
        },
        specifications: {
            size: "60 gummies",
            servings: 30-60,
            weight: "4 oz"
        },
        certifications: ["toddler-safe", "natural-flavors", "no-artificial-colors"],
        tags: ["toddler", "gummies", "multivitamin", "growth", "immune-support"],
        ratings: {
            average: 4.8,
            count: 456
        }
    },
    {
        name: "Toddler Vitamin C Gummies",
        category: "vitamins",
        subcategory: "toddler-gummies",
        description: "Gentle vitamin C gummies for toddlers to support immune system and overall health.",
        benefits: [
            "Supports immune system",
            "Gentle on little stomachs",
            "Natural orange flavor",
            "Promotes healthy development",
            "Easy to chew and swallow"
        ],
        ingredients: [
            { name: "Vitamin C (Sodium Ascorbate)", amount: "125mg", dailyValue: "833%" },
            { name: "Natural Orange Flavor", amount: "Various", dailyValue: "*" },
            { name: "Natural Colors", amount: "Various", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 gummy",
            frequency: "Daily",
            instructions: "Ages 2+, chew thoroughly"
        },
        pricing: {
            basePrice: 16.99,
            currency: "USD"
        },
        inventory: {
            stock: 189,
            status: "in-stock"
        },
        specifications: {
            size: "60 gummies",
            servings: 60,
            weight: "3 oz"
        },
        certifications: ["gentle-formula", "natural-flavors", "toddler-approved"],
        tags: ["toddler", "gummies", "vitamin-c", "immune-support", "orange-flavor"],
        ratings: {
            average: 4.7,
            count: 298
        }
    },
    {
        name: "Toddler DHA Omega-3 Gummies",
        category: "supplements",
        subcategory: "toddler-gummies",
        description: "Essential DHA omega-3 gummies for toddler brain development and cognitive support.",
        benefits: [
            "Supports brain development",
            "Promotes eye health",
            "Essential for cognitive function",
            "Natural strawberry flavor",
            "Mercury-free and pure"
        ],
        ingredients: [
            { name: "DHA (from Algae)", amount: "50mg", dailyValue: "*" },
            { name: "EPA", amount: "10mg", dailyValue: "*" },
            { name: "Natural Strawberry Flavor", amount: "Various", dailyValue: "*" }
        ],
        usage: {
            dosage: "2 gummies",
            frequency: "Daily",
            instructions: "Ages 2+, take with food"
        },
        pricing: {
            basePrice: 24.99,
            salePrice: 21.99,
            currency: "USD"
        },
        inventory: {
            stock: 145,
            status: "in-stock"
        },
        specifications: {
            size: "60 gummies",
            servings: 30,
            weight: "4 oz"
        },
        certifications: ["algae-based", "mercury-free", "vegetarian"],
        tags: ["toddler", "gummies", "dha", "brain-development", "omega-3"],
        ratings: {
            average: 4.6,
            count: 234
        }
    },
    {
        name: "Toddler Probiotic Gummies",
        category: "probiotics",
        subcategory: "toddler-gummies",
        description: "Kid-friendly probiotic gummies with beneficial bacteria strains for digestive and immune health.",
        benefits: [
            "Supports digestive health",
            "Boosts immune system",
            "Promotes healthy gut bacteria",
            "Natural grape flavor",
            "Helps with occasional tummy troubles"
        ],
        ingredients: [
            { name: "Probiotic Blend (3 strains)", amount: "1 Billion CFU", dailyValue: "*" },
            { name: "Lactobacillus casei", amount: "500 Million CFU", dailyValue: "*" },
            { name: "Natural Grape Flavor", amount: "Various", dailyValue: "*" }
        ],
        usage: {
            dosage: "1 gummy",
            frequency: "Daily",
            instructions: "Ages 2+, can be taken anytime"
        },
        pricing: {
            basePrice: 22.99,
            currency: "USD"
        },
        inventory: {
            stock: 167,
            status: "in-stock"
        },
        specifications: {
            size: "60 gummies",
            servings: 60,
            weight: "3 oz"
        },
        certifications: ["shelf-stable", "kid-safe", "natural-flavors"],
        tags: ["toddler", "gummies", "probiotics", "digestive-health", "grape-flavor"],
        ratings: {
            average: 4.5,
            count: 189
        }
    },
    {
        name: "Toddler Calcium + D3 Gummies",
        category: "minerals",
        subcategory: "toddler-gummies",
        description: "Essential calcium and vitamin D3 gummies for growing toddlers' bone and teeth development.",
        benefits: [
            "Supports strong bones and teeth",
            "Essential for growth",
            "Promotes calcium absorption",
            "Natural vanilla flavor",
            "Easy for toddlers to chew"
        ],
        ingredients: [
            { name: "Calcium (as Calcium Citrate)", amount: "100mg", dailyValue: "25%" },
            { name: "Vitamin D3", amount: "400 IU", dailyValue: "100%" },
            { name: "Natural Vanilla Flavor", amount: "Various", dailyValue: "*" }
        ],
        usage: {
            dosage: "2 gummies",
            frequency: "Daily",
            instructions: "Ages 2+, chew thoroughly"
        },
        pricing: {
            basePrice: 18.99,
            currency: "USD"
        },
        inventory: {
            stock: 198,
            status: "in-stock"
        },
        specifications: {
            size: "60 gummies",
            servings: 30,
            weight: "4 oz"
        },
        certifications: ["gentle-calcium", "natural-flavors", "growth-support"],
        tags: ["toddler", "gummies", "calcium", "vitamin-d3", "bone-health"],
        ratings: {
            average: 4.4,
            count: 167
        }
    }
];

// Sample knowledge base entries
const sampleKnowledge = [
    {
        category: "vitamin",
        title: "Vitamin D: The Sunshine Vitamin",
        content: `Vitamin D is a fat-soluble vitamin that plays a crucial role in maintaining healthy bones and supporting immune function. Unlike other vitamins, your body can produce vitamin D when your skin is exposed to sunlight.

**Key Benefits:**
- Helps the body absorb calcium for strong bones and teeth
- Supports immune system function
- May help regulate mood and ward off depression
- Supports muscle function

**Deficiency Signs:**
- Bone pain and muscle weakness
- Increased susceptibility to infections
- Fatigue and tiredness
- Depression or mood changes

**Best Sources:**
- Sunlight exposure (10-30 minutes several times per week)
- Fatty fish (salmon, mackerel, sardines)
- Fortified foods (milk, cereals)
- Supplements (especially in winter or limited sun exposure)

**Recommended Daily Intake:**
- Adults: 600-800 IU (15-20 mcg)
- Older adults (70+): 800 IU (20 mcg)`,
        keywords: ["vitamin-d", "sunshine", "bones", "immune", "calcium", "deficiency"],
        source: "National Institutes of Health",
        lastVerified: new Date(),
        metadata: {
            author: "Nutrition Team",
            accuracy: 95
        }
    },
    {
        category: "mineral",
        title: "Magnesium: The Relaxation Mineral",
        content: `Magnesium is an essential mineral involved in over 300 enzyme reactions in the human body. It's crucial for energy production, protein synthesis, and maintaining normal heart rhythm.

**Key Benefits:**
- Supports muscle and nerve function
- Helps maintain steady heart rhythm
- Supports immune system health
- Keeps bones strong
- Helps regulate blood sugar levels
- Promotes better sleep quality

**Deficiency Symptoms:**
- Muscle cramps or spasms
- Fatigue and weakness
- Irregular heartbeat
- Anxiety and restlessness
- Difficulty sleeping

**Best Food Sources:**
- Dark leafy greens (spinach, Swiss chard)
- Nuts and seeds (almonds, pumpkin seeds)
- Whole grains
- Legumes (black beans, chickpeas)
- Dark chocolate

**Supplementation:**
Magnesium glycinate is highly bioavailable and less likely to cause digestive upset compared to other forms like magnesium oxide.`,
        keywords: ["magnesium", "muscle", "sleep", "heart", "energy", "cramps"],
        source: "Harvard Health Publishing",
        lastVerified: new Date()
    },
    {
        category: "supplement",
        title: "Omega-3 Fatty Acids: Essential for Heart and Brain Health",
        content: `Omega-3 fatty acids are essential fats that your body cannot produce on its own. The three main types are EPA, DHA, and ALA, with EPA and DHA being the most beneficial for health.

**Types of Omega-3s:**
- EPA (Eicosapentaenoic Acid): Anti-inflammatory effects
- DHA (Docosahexaenoic Acid): Brain and eye health
- ALA (Alpha-Linolenic Acid): Plant-based omega-3

**Health Benefits:**
- Reduces inflammation throughout the body
- Supports heart health and may lower triglycerides
- Essential for brain development and function
- May help reduce symptoms of depression
- Supports eye health and may prevent age-related vision loss

**Best Sources:**
- Fatty fish (salmon, mackerel, sardines, anchovies)
- Walnuts and flaxseeds (ALA)
- Chia seeds
- High-quality fish oil supplements

**Dosage Recommendations:**
For general health: 250-500mg EPA+DHA daily
For heart health: 1000mg EPA+DHA daily
Always choose molecular distilled, third-party tested supplements.`,
        keywords: ["omega-3", "fish-oil", "epa", "dha", "heart", "brain", "inflammation"],
        source: "American Heart Association"
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vitamins_chatbot');
        console.log('Connected to MongoDB');

        // Clear existing data
        await Product.deleteMany({});
        await KnowledgeBase.deleteMany({});
        console.log('Cleared existing data');

        // Insert sample products
        const products = await Product.insertMany(sampleProducts);
        console.log(`Inserted ${products.length} products`);

        // Insert sample knowledge base entries
        const knowledge = await KnowledgeBase.insertMany(sampleKnowledge);
        console.log(`Inserted ${knowledge.length} knowledge base entries`);

        // Link knowledge entries to related products
        for (let i = 0; i < knowledge.length && i < products.length; i++) {
            const entry = knowledge[i];
            const relatedProducts = products.filter(product => 
                entry.keywords.some(keyword => 
                    product.tags.includes(keyword) || 
                    product.name.toLowerCase().includes(keyword)
                )
            );
            
            if (relatedProducts.length > 0) {
                entry.relatedProducts = relatedProducts.slice(0, 3).map(p => p._id);
                await entry.save();
            }
        }

        console.log('✅ Database seeded successfully!');
        
    } catch (error) {
        console.error('❌ Error seeding database:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed');
    }
}

// Run the seeding function if this file is executed directly
if (require.main === module) {
    seedDatabase();
}

module.exports = { seedDatabase };