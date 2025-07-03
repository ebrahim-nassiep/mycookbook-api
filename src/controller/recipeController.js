// Provides functionality for all recipe endpoints
const { enhancedDbClient } = require('../utils/enhancedDb');

/**
 * Creates a new recipe
 * @param {Request} req the http request interface
 * @param {Response} res the http response interface
 */
const createRecipe = async (req, res) => {
    try {
        // Get user ID from session
        if (!req.session.authenticated || !req.session.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userId = req.session.user.id;
        const recipeData = {
            ...req.body,
            userId: userId,
            status: 'published',
            isPublic: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await enhancedDbClient.createRecipe(recipeData);
        
        if (!result) {
            return res.status(500).json({ error: 'Failed to create recipe' });
        }

        res.status(201).json({
            message: 'Recipe created successfully',
            recipeId: result.insertedId
        });
    } catch (error) {
        console.error('Error creating recipe:', error);
        res.status(500).json({ error: 'Server error while creating recipe' });
    }
};

/**
 * Gets all recipes for the authenticated user
 * @param {Request} req the http request interface
 * @param {Response} res the http response interface
 */
const getUserRecipes = async (req, res) => {
    try {
        // Get user ID from session
        if (!req.session.authenticated || !req.session.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const userId = req.session.user.id;
        const recipes = await enhancedDbClient.getUserRecipes(userId);
        
        if (recipes === null) {
            return res.status(500).json({ error: 'Failed to fetch recipes' });
        }

        res.status(200).json({
            message: 'Recipes fetched successfully',
            recipes: recipes
        });
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ error: 'Server error while fetching recipes' });
    }
};

/**
 * Updates an existing recipe
 * @param {Request} req the http request interface
 * @param {Response} res the http response interface
 */
const updateRecipe = async (req, res) => {
    try {
        // Get user ID from session
        if (!req.session.authenticated || !req.session.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { id } = req.params;
        const updateData = {
            ...req.body,
            updatedAt: new Date()
        };

        const result = await enhancedDbClient.updateRecipe(id, updateData);
        
        if (!result || result.matchedCount === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        res.status(200).json({
            message: 'Recipe updated successfully'
        });
    } catch (error) {
        console.error('Error updating recipe:', error);
        res.status(500).json({ error: 'Server error while updating recipe' });
    }
};

/**
 * Deletes a recipe
 * @param {Request} req the http request interface
 * @param {Response} res the http response interface
 */
const deleteRecipe = async (req, res) => {
    try {
        // Get user ID from session
        if (!req.session.authenticated || !req.session.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { id } = req.params;
        const result = await enhancedDbClient.deleteRecipe(id);
        
        if (!result || result.deletedCount === 0) {
            return res.status(404).json({ error: 'Recipe not found' });
        }

        res.status(200).json({
            message: 'Recipe deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting recipe:', error);
        res.status(500).json({ error: 'Server error while deleting recipe' });
    }
};

/**
 * Searches recipes
 * @param {Request} req the http request interface
 * @param {Response} res the http response interface
 */
const searchRecipes = async (req, res) => {
    try {
        // Get user ID from session
        if (!req.session.authenticated || !req.session.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const { q: searchTerm } = req.query;
        const userId = req.session.user.id;
        
        if (!searchTerm) {
            return res.status(400).json({ error: 'Search term is required' });
        }

        const filters = { userId };
        const recipes = await enhancedDbClient.searchRecipes(searchTerm, filters);
        
        if (recipes === null) {
            return res.status(500).json({ error: 'Failed to search recipes' });
        }

        res.status(200).json({
            message: 'Search completed successfully',
            recipes: recipes,
            searchTerm: searchTerm
        });
    } catch (error) {
        console.error('Error searching recipes:', error);
        res.status(500).json({ error: 'Server error while searching recipes' });
    }
};

module.exports = {
    createRecipe,
    getUserRecipes,
    updateRecipe,
    deleteRecipe,
    searchRecipes
};