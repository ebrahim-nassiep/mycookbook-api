import React, { useState, useEffect } from 'react';
import { recipeAPI } from '../services/api';

const RecipeForm = ({ recipe, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    ingredients: '',
    instructions: '',
    cookTime: '',
    servings: '',
    url: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (recipe) {
      setFormData({
        title: recipe.title || '',
        description: recipe.description || '',
        ingredients: recipe.ingredients || '',
        instructions: recipe.instructions || '',
        cookTime: recipe.cookTime || '',
        servings: recipe.servings || '',
        url: recipe.url || ''
      });
    }
  }, [recipe]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (recipe) {
        await recipeAPI.updateRecipe(recipe._id, formData);
      } else {
        await recipeAPI.createRecipe(formData);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recipe-form-container">
      <h2>{recipe ? 'Edit Recipe' : 'Add New Recipe'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            name="title"
            placeholder="Recipe Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <textarea
            name="description"
            placeholder="Recipe Description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>
        <div className="form-group">
          <textarea
            name="ingredients"
            placeholder="Ingredients (one per line)"
            value={formData.ingredients}
            onChange={handleChange}
            rows="5"
          />
        </div>
        <div className="form-group">
          <textarea
            name="instructions"
            placeholder="Instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows="5"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              name="cookTime"
              placeholder="Cook Time"
              value={formData.cookTime}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <input
              type="number"
              name="servings"
              placeholder="Servings"
              value={formData.servings}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-group">
          <input
            type="url"
            name="url"
            placeholder="Recipe URL (optional)"
            value={formData.url}
            onChange={handleChange}
          />
        </div>
        {error && <div className="error">{error}</div>}
        <div className="form-actions">
          <button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Recipe'}
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecipeForm;