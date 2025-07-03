import React from 'react';

const RecipeCard = ({ recipe, onEdit, onDelete }) => {
  return (
    <div className="recipe-card">
      <h3>{recipe.title}</h3>
      <p className="recipe-description">{recipe.description}</p>
      <div className="recipe-meta">
        <span className="recipe-time">Cook Time: {recipe.cookTime || 'N/A'}</span>
        <span className="recipe-servings">Serves: {recipe.servings || 'N/A'}</span>
      </div>
      <div className="recipe-actions">
        <button onClick={() => onEdit(recipe)} className="btn-edit">
          Edit
        </button>
        <button onClick={() => onDelete(recipe._id)} className="btn-delete">
          Delete
        </button>
      </div>
    </div>
  );
};

export default RecipeCard;