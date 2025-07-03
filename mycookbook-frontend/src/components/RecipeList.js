import React, { useState, useEffect } from 'react';
import { recipeAPI } from '../services/api';
import RecipeCard from './RecipeCard';
import EnhancedRecipeForm from './EnhancedRecipeForm';

const RecipeList = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await recipeAPI.getAllRecipes();
      setRecipes(response.recipes || []);
    } catch (err) {
      setError('Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecipe = () => {
    setEditingRecipe(null);
    setShowForm(true);
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setShowForm(true);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await recipeAPI.deleteRecipe(recipeId);
        fetchRecipes();
      } catch (err) {
        setError('Failed to delete recipe');
      }
    }
  };

  const handleSaveRecipe = () => {
    setShowForm(false);
    setEditingRecipe(null);
    fetchRecipes();
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingRecipe(null);
  };

  if (loading) return <div className="loading">Loading recipes...</div>;

  return (
    <div className="recipe-list-container">
      <div className="recipe-list-header">
        <h2>My Recipes</h2>
        <button onClick={handleAddRecipe} className="btn-add">
          Add New Recipe
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <EnhancedRecipeForm
          recipe={editingRecipe}
          onSave={handleSaveRecipe}
          onCancel={handleCancelForm}
        />
      )}

      <div className="recipes-grid">
        {recipes.length === 0 ? (
          <div className="empty-state">
            <p>No recipes yet. Add your first recipe!</p>
          </div>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard
              key={recipe._id}
              recipe={recipe}
              onEdit={handleEditRecipe}
              onDelete={handleDeleteRecipe}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RecipeList;