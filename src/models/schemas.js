// Enhanced database schemas for advanced recipe collection features

const { ObjectId } = require('mongodb');

// Enhanced User Schema with preferences and goals
const userSchema = {
  _id: ObjectId,
  name: String,
  username: String,
  email: String,
  hashedPwd: String,
  role: String, // 'normal', 'admin'
  
  // User preferences
  preferences: {
    defaultServings: Number,
    dietaryRestrictions: [String], // ['vegetarian', 'gluten-free', 'dairy-free', 'vegan', 'keto', 'paleo']
    allergens: [String], // ['nuts', 'dairy', 'eggs', 'soy', 'shellfish', 'fish']
    preferredCuisines: [String],
    skillLevel: String, // 'beginner', 'intermediate', 'advanced'
    kitchenEquipment: [String], // ['oven', 'stovetop', 'microwave', 'air-fryer', 'slow-cooker']
  },
  
  // Nutritional goals
  nutritionGoals: {
    dailyCalories: Number,
    proteinPercent: Number,
    carbsPercent: Number,
    fatPercent: Number,
    fiberGrams: Number,
    sodiumMg: Number,
  },
  
  // Activity tracking
  favoriteRecipes: [ObjectId], // Recipe IDs
  recentRecipes: [ObjectId], // Recipe IDs
  cookingHistory: [{
    recipeId: ObjectId,
    cookedAt: Date,
    rating: Number,
    notes: String
  }],
  
  createdAt: Date,
  updatedAt: Date
};

// Enhanced Recipe Schema with rich content and metadata
const recipeSchema = {
  _id: ObjectId,
  userId: ObjectId, // Owner of the recipe
  
  // Basic information
  title: String,
  description: String,
  servings: Number,
  
  // Rich content
  content: {
    instructions: [{ // Step-by-step instructions
      step: Number,
      title: String,
      description: String,
      estimatedTime: Number, // minutes
      temperature: String,
      tips: String,
      imageUrl: String
    }],
    notes: String, // Rich text content
    story: String, // Recipe backstory
  },
  
  // Ingredients with detailed information
  ingredients: [{
    name: String,
    quantity: Number,
    unit: String,
    category: String, // 'protein', 'vegetable', 'spice', 'dairy', etc.
    optional: Boolean,
    substitutions: [String],
    cost: Number, // estimated cost
    notes: String
  }],
  
  // Organization and metadata
  categories: [String], // ['main-course', 'side-dish', 'dessert', 'appetizer', 'breakfast']
  cuisineType: String, // 'italian', 'mexican', 'asian', 'american', etc.
  tags: [String], // ['quick', 'healthy', 'comfort-food', 'holiday', 'batch-cooking']
  dietaryInfo: {
    isVegetarian: Boolean,
    isVegan: Boolean,
    isGlutenFree: Boolean,
    isDairyFree: Boolean,
    isKeto: Boolean,
    isPaleo: Boolean,
    allergens: [String]
  },
  
  // Cooking information
  cookingInfo: {
    prepTime: Number, // minutes
    cookTime: Number, // minutes
    totalTime: Number, // minutes
    difficulty: String, // 'easy', 'medium', 'hard'
    skillLevel: String, // 'beginner', 'intermediate', 'advanced'
    techniques: [String], // ['sautéing', 'roasting', 'braising']
    equipment: [String], // ['oven', 'stovetop', 'food-processor']
  },
  
  // Nutritional information
  nutrition: {
    calories: Number,
    protein: Number, // grams
    carbs: Number, // grams
    fat: Number, // grams
    fiber: Number, // grams
    sugar: Number, // grams
    sodium: Number, // mg
    vitamins: [{
      name: String,
      amount: Number,
      unit: String
    }],
    minerals: [{
      name: String,
      amount: Number,
      unit: String
    }]
  },
  
  // Media and presentation
  media: {
    mainImage: String, // URL to main recipe image
    images: [String], // Additional images
    videoUrl: String,
    thumbnailUrl: String
  },
  
  // Social and rating
  rating: {
    average: Number,
    count: Number,
    reviews: [{
      userId: ObjectId,
      rating: Number,
      comment: String,
      createdAt: Date
    }]
  },
  
  // Source and attribution
  source: {
    type: String, // 'original', 'imported', 'adapted'
    url: String, // Original URL if imported
    attribution: String,
    originalAuthor: String
  },
  
  // Status and visibility
  status: String, // 'draft', 'published', 'private'
  isPublic: Boolean,
  shareUrl: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date,
  lastCookedAt: Date
};

// Category Management Schema
const categorySchema = {
  _id: ObjectId,
  name: String,
  description: String,
  type: String, // 'cuisine', 'meal-type', 'dietary', 'cooking-method'
  color: String, // Hex color for UI
  icon: String, // Icon name or URL
  parentCategory: ObjectId, // For hierarchical categories
  isDefault: Boolean, // System default categories
  createdBy: ObjectId, // User who created custom category
  createdAt: Date
};

// Tag Management Schema
const tagSchema = {
  _id: ObjectId,
  name: String,
  description: String,
  category: String, // 'ingredient', 'technique', 'occasion', 'characteristic'
  usageCount: Number,
  createdBy: ObjectId,
  createdAt: Date
};

// Meal Planning Schema
const mealPlanSchema = {
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  description: String,
  
  // Planning period
  startDate: Date,
  endDate: Date,
  
  // Planned meals
  meals: [{
    date: Date,
    mealType: String, // 'breakfast', 'lunch', 'dinner', 'snack'
    recipeId: ObjectId,
    servings: Number,
    scalingFactor: Number, // For portion adjustment
    notes: String,
    completed: Boolean,
    cookedAt: Date
  }],
  
  // Nutritional tracking
  nutritionSummary: {
    totalCalories: Number,
    avgDailyCalories: Number,
    macroBreakdown: {
      protein: Number,
      carbs: Number,
      fat: Number
    }
  },
  
  // Status
  status: String, // 'planning', 'active', 'completed'
  
  createdAt: Date,
  updatedAt: Date
};

// Grocery List Schema
const groceryListSchema = {
  _id: ObjectId,
  userId: ObjectId,
  name: String,
  
  // Source meal plans
  mealPlanIds: [ObjectId],
  additionalRecipeIds: [ObjectId],
  
  // Grocery items
  items: [{
    ingredient: String,
    quantity: Number,
    unit: String,
    category: String, // 'produce', 'meat', 'dairy', 'pantry', 'frozen'
    aisle: String,
    store: String,
    estimatedCost: Number,
    actualCost: Number,
    notes: String,
    purchased: Boolean,
    purchasedAt: Date,
    
    // Source tracking
    sourceRecipes: [ObjectId],
    consolidatedFrom: [{
      recipeId: ObjectId,
      quantity: Number,
      unit: String
    }]
  }],
  
  // Shopping optimization
  storeLayout: {
    storeName: String,
    aisleOrder: [String],
    customLayout: Boolean
  },
  
  // Budget tracking
  budget: {
    estimated: Number,
    actual: Number,
    currency: String
  },
  
  // Status
  status: String, // 'planning', 'shopping', 'completed'
  completedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
};

// Pantry Management Schema
const pantrySchema = {
  _id: ObjectId,
  userId: ObjectId,
  
  items: [{
    ingredient: String,
    quantity: Number,
    unit: String,
    category: String,
    location: String, // 'pantry', 'fridge', 'freezer'
    expirationDate: Date,
    purchaseDate: Date,
    cost: Number,
    notes: String,
    
    // Inventory tracking
    minimumQuantity: Number,
    restockReminder: Boolean,
    lastUsed: Date
  }],
  
  updatedAt: Date
};

// Cooking Session Schema (for step-by-step cooking mode)
const cookingSessionSchema = {
  _id: ObjectId,
  userId: ObjectId,
  recipeId: ObjectId,
  
  // Session details
  startedAt: Date,
  completedAt: Date,
  servingsMade: Number,
  
  // Progress tracking
  currentStep: Number,
  completedSteps: [Number],
  
  // Timers and notes
  activeTimers: [{
    stepNumber: Number,
    duration: Number,
    startedAt: Date,
    name: String
  }],
  
  sessionNotes: String,
  modifications: [String],
  
  // Results
  finalRating: Number,
  feedback: String,
  
  status: String // 'active', 'paused', 'completed', 'abandoned'
};

// Nutritional Database Schema (for ingredient nutrition lookup)
const nutritionDataSchema = {
  _id: ObjectId,
  ingredient: String,
  aliases: [String],
  
  // Nutritional data per 100g
  nutrition: {
    calories: Number,
    protein: Number,
    carbs: Number,
    fat: Number,
    fiber: Number,
    sugar: Number,
    sodium: Number,
    vitamins: [{
      name: String,
      amount: Number,
      unit: String
    }],
    minerals: [{
      name: String,
      amount: Number,
      unit: String
    }]
  },
  
  // Metadata
  category: String,
  source: String, // 'USDA', 'manual', 'imported'
  verified: Boolean,
  
  updatedAt: Date
};

module.exports = {
  userSchema,
  recipeSchema,
  categorySchema,
  tagSchema,
  mealPlanSchema,
  groceryListSchema,
  pantrySchema,
  cookingSessionSchema,
  nutritionDataSchema
};