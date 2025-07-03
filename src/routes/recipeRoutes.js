// Serves all the recipe endpoints
const express = require('express');
const router = express.Router();
const recipeController = require('../controller/recipeController');

// Create a new recipe
router.post('/recipes', recipeController.createRecipe);

// Get all user recipes
router.get('/recipe', recipeController.getUserRecipes);
router.get('/recipes', recipeController.getUserRecipes);

// Update a recipe
router.put('/recipes/:id', recipeController.updateRecipe);

// Delete a recipe
router.delete('/recipes/:id', recipeController.deleteRecipe);

// Search recipes
router.get('/recipes/search', recipeController.searchRecipes);

module.exports = router;