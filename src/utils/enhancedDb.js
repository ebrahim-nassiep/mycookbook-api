// Enhanced database client with support for advanced recipe collection features

const { MongoClient, ObjectId } = require('mongodb');

const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = process.env.DB_PORT || '27017';
const url = `mongodb://${DB_HOST}:${DB_PORT}`;

let envConfig = null;
try {
    const env = process.env.NODE_ENV || 'dev';
    envConfig = require(`./config.${env}.js`);
} catch (error) {
    console.log("No config file for the specified environment.")
}

// Enhanced collections for advanced features
const collections = {
    users: 'users',
    recipes: 'recipes',
    categories: 'categories',
    tags: 'tags',
    mealPlans: 'mealPlans',
    groceryLists: 'groceryLists',
    pantry: 'pantry',
    cookingSessions: 'cookingSessions',
    nutritionData: 'nutritionData'
};

class EnhancedDBClient {
    constructor() {
        this.db = null;
        this.client = null;
    }

    async connect() {
        try {
            this.client = await MongoClient.connect(url);
            this.db = this.client.db(envConfig.DB_NAME);
            
            // Create indexes for better performance
            await this.createIndexes();
            
            console.log('Enhanced database connection successful.');
        } catch (error) {
            this.db = false;
            console.log(`Error connecting to Enhanced DB Client: ${error.message}`);
        }
    }

    async createIndexes() {
        try {
            // Recipe indexes
            await this.db.collection(collections.recipes).createIndex({ title: 'text', description: 'text' });
            await this.db.collection(collections.recipes).createIndex({ userId: 1 });
            await this.db.collection(collections.recipes).createIndex({ categories: 1 });
            await this.db.collection(collections.recipes).createIndex({ tags: 1 });
            await this.db.collection(collections.recipes).createIndex({ 'cookingInfo.totalTime': 1 });
            await this.db.collection(collections.recipes).createIndex({ 'rating.average': -1 });
            
            // User indexes
            await this.db.collection(collections.users).createIndex({ email: 1 }, { unique: true });
            await this.db.collection(collections.users).createIndex({ username: 1 }, { unique: true });
            
            // Meal plan indexes
            await this.db.collection(collections.mealPlans).createIndex({ userId: 1 });
            await this.db.collection(collections.mealPlans).createIndex({ 'meals.date': 1 });
            
            // Grocery list indexes
            await this.db.collection(collections.groceryLists).createIndex({ userId: 1 });
            await this.db.collection(collections.groceryLists).createIndex({ status: 1 });
            
            // Nutrition data indexes
            await this.db.collection(collections.nutritionData).createIndex({ ingredient: 1 });
            await this.db.collection(collections.nutritionData).createIndex({ aliases: 1 });
            
            console.log('Database indexes created successfully.');
        } catch (error) {
            console.log(`Error creating indexes: ${error.message}`);
        }
    }

    hasConnection() {
        return Boolean(this.db);
    }

    async closeConnection() {
        if (this.client) {
            await this.client.close();
        }
    }

    // User operations
    async findUser(field, identifier) {
        try {
            const query = {};
            query[field] = identifier;
            const user = await this.db.collection(collections.users).findOne(query);
            return user;
        } catch (error) {
            console.log(`Error while searching for user: ${error}`);
            return null;
        }
    }

    async insertUser(userInfo) {
        try {
            const result = await this.db.collection(collections.users).insertOne(userInfo);
            return result;
        } catch (error) {
            console.log(`Error while inserting new user: ${error}`);
            return null;
        }
    }

    async updateUser(userId, updateData) {
        try {
            const result = await this.db.collection(collections.users).updateOne(
                { _id: new ObjectId(userId) },
                { $set: { ...updateData, updatedAt: new Date() } }
            );
            return result;
        } catch (error) {
            console.log(`Error while updating user: ${error}`);
            return null;
        }
    }

    // Recipe operations
    async createRecipe(recipeData) {
        try {
            const recipe = {
                ...recipeData,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await this.db.collection(collections.recipes).insertOne(recipe);
            return result;
        } catch (error) {
            console.log(`Error while creating recipe: ${error}`);
            return null;
        }
    }

    async getUserRecipes(userId, options = {}) {
        try {
            const query = { userId: new ObjectId(userId) };
            
            // Add filters if provided
            if (options.categories?.length) {
                query.categories = { $in: options.categories };
            }
            if (options.tags?.length) {
                query.tags = { $in: options.tags };
            }
            if (options.difficulty) {
                query['cookingInfo.difficulty'] = options.difficulty;
            }
            if (options.maxTime) {
                query['cookingInfo.totalTime'] = { $lte: options.maxTime };
            }
            
            const recipes = await this.db.collection(collections.recipes)
                .find(query)
                .sort({ createdAt: -1 })
                .limit(options.limit || 50)
                .toArray();
            
            return recipes;
        } catch (error) {
            console.log(`Error while fetching user recipes: ${error}`);
            return null;
        }
    }

    async updateRecipe(recipeId, updateData) {
        try {
            const result = await this.db.collection(collections.recipes).updateOne(
                { _id: new ObjectId(recipeId) },
                { $set: { ...updateData, updatedAt: new Date() } }
            );
            return result;
        } catch (error) {
            console.log(`Error while updating recipe: ${error}`);
            return null;
        }
    }

    async deleteRecipe(recipeId) {
        try {
            const result = await this.db.collection(collections.recipes).deleteOne(
                { _id: new ObjectId(recipeId) }
            );
            return result;
        } catch (error) {
            console.log(`Error while deleting recipe: ${error}`);
            return null;
        }
    }

    async searchRecipes(searchTerm, filters = {}) {
        try {
            const query = {
                $text: { $search: searchTerm }
            };
            
            // Apply filters
            if (filters.userId) {
                query.userId = new ObjectId(filters.userId);
            }
            if (filters.categories?.length) {
                query.categories = { $in: filters.categories };
            }
            if (filters.tags?.length) {
                query.tags = { $in: filters.tags };
            }
            if (filters.dietaryRestrictions?.length) {
                filters.dietaryRestrictions.forEach(restriction => {
                    query[`dietaryInfo.${restriction}`] = true;
                });
            }
            
            const recipes = await this.db.collection(collections.recipes)
                .find(query)
                .sort({ score: { $meta: 'textScore' } })
                .limit(filters.limit || 20)
                .toArray();
            
            return recipes;
        } catch (error) {
            console.log(`Error while searching recipes: ${error}`);
            return null;
        }
    }

    // Category operations
    async createCategory(categoryData) {
        try {
            const category = {
                ...categoryData,
                createdAt: new Date()
            };
            const result = await this.db.collection(collections.categories).insertOne(category);
            return result;
        } catch (error) {
            console.log(`Error while creating category: ${error}`);
            return null;
        }
    }

    async getCategories(type = null) {
        try {
            const query = type ? { type } : {};
            const categories = await this.db.collection(collections.categories)
                .find(query)
                .sort({ name: 1 })
                .toArray();
            return categories;
        } catch (error) {
            console.log(`Error while fetching categories: ${error}`);
            return null;
        }
    }

    // Tag operations
    async createTag(tagData) {
        try {
            const tag = {
                ...tagData,
                usageCount: 0,
                createdAt: new Date()
            };
            const result = await this.db.collection(collections.tags).insertOne(tag);
            return result;
        } catch (error) {
            console.log(`Error while creating tag: ${error}`);
            return null;
        }
    }

    async getTags(category = null) {
        try {
            const query = category ? { category } : {};
            const tags = await this.db.collection(collections.tags)
                .find(query)
                .sort({ usageCount: -1 })
                .toArray();
            return tags;
        } catch (error) {
            console.log(`Error while fetching tags: ${error}`);
            return null;
        }
    }

    // Meal plan operations
    async createMealPlan(mealPlanData) {
        try {
            const mealPlan = {
                ...mealPlanData,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await this.db.collection(collections.mealPlans).insertOne(mealPlan);
            return result;
        } catch (error) {
            console.log(`Error while creating meal plan: ${error}`);
            return null;
        }
    }

    async getUserMealPlans(userId) {
        try {
            const mealPlans = await this.db.collection(collections.mealPlans)
                .find({ userId: new ObjectId(userId) })
                .sort({ createdAt: -1 })
                .toArray();
            return mealPlans;
        } catch (error) {
            console.log(`Error while fetching meal plans: ${error}`);
            return null;
        }
    }

    async updateMealPlan(mealPlanId, updateData) {
        try {
            const result = await this.db.collection(collections.mealPlans).updateOne(
                { _id: new ObjectId(mealPlanId) },
                { $set: { ...updateData, updatedAt: new Date() } }
            );
            return result;
        } catch (error) {
            console.log(`Error while updating meal plan: ${error}`);
            return null;
        }
    }

    // Grocery list operations
    async createGroceryList(groceryListData) {
        try {
            const groceryList = {
                ...groceryListData,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            const result = await this.db.collection(collections.groceryLists).insertOne(groceryList);
            return result;
        } catch (error) {
            console.log(`Error while creating grocery list: ${error}`);
            return null;
        }
    }

    async getUserGroceryLists(userId) {
        try {
            const groceryLists = await this.db.collection(collections.groceryLists)
                .find({ userId: new ObjectId(userId) })
                .sort({ createdAt: -1 })
                .toArray();
            return groceryLists;
        } catch (error) {
            console.log(`Error while fetching grocery lists: ${error}`);
            return null;
        }
    }

    // Nutrition data operations
    async getNutritionData(ingredient) {
        try {
            const nutritionData = await this.db.collection(collections.nutritionData)
                .findOne({
                    $or: [
                        { ingredient: new RegExp(ingredient, 'i') },
                        { aliases: new RegExp(ingredient, 'i') }
                    ]
                });
            return nutritionData;
        } catch (error) {
            console.log(`Error while fetching nutrition data: ${error}`);
            return null;
        }
    }

    async addNutritionData(nutritionData) {
        try {
            const data = {
                ...nutritionData,
                updatedAt: new Date()
            };
            const result = await this.db.collection(collections.nutritionData).insertOne(data);
            return result;
        } catch (error) {
            console.log(`Error while adding nutrition data: ${error}`);
            return null;
        }
    }
}

const enhancedDbClient = new EnhancedDBClient();

module.exports = {
    EnhancedDBClient,
    enhancedDbClient,
    collections
};