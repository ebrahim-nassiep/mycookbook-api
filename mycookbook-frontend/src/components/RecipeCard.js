import React from 'react';
import { getFoodImageForRecipe } from '../utils/foodImages';

const RecipeCard = ({ recipe, onEdit, onDelete }) => {
  // Helper function to render star rating
  const renderStars = (rating = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`star ${i <= rating ? '' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  // Get category color based on type
  const getCategoryColor = (category) => {
    const colors = {
      breakfast: '#ff8c42',
      lunch: '#4dabf7',
      dinner: '#69db7c',
      dessert: '#ff8cc8',
      snack: '#ffd43b'
    };
    return colors[category?.toLowerCase()] || '#ff6b35';
  };

  // Clean HTML from rich text description
  const cleanDescription = (html) => {
    if (!html) return '';
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const mainCategory = recipe.categories?.[0] || 'Recipe';
  const rating = recipe.rating?.average || 0;
  const totalTime = recipe.cookingInfo?.totalTime || recipe.cookTime || 0;
  const servings = recipe.servings || 'N/A';
  const foodImage = getFoodImageForRecipe(recipe);

  return (
    <div className="recipe-card">
      <div className="recipe-card-image">
        <img 
          src={foodImage} 
          alt={recipe.title}
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="recipe-placeholder" style={{ display: 'none' }}>
          <span>🍽️</span>
        </div>
        <div 
          className="recipe-category"
          style={{ backgroundColor: getCategoryColor(mainCategory) }}
        >
          {mainCategory.charAt(0).toUpperCase() + mainCategory.slice(1)}
        </div>
      </div>
      
      <div className="recipe-card-content">
        <h3>{recipe.title}</h3>
        
        <div className="recipe-rating">
          <div className="stars">
            {renderStars(rating)}
          </div>
          <span className="rating-text">
            {rating > 0 ? `${rating.toFixed(1)}` : 'No rating'}
          </span>
        </div>
        
        <p className="recipe-description">
          {cleanDescription(recipe.description) || 'No description available'}
        </p>
        
        <div className="recipe-meta">
          <span>
            ⏱️ {totalTime > 0 ? `${totalTime} min` : 'Quick'}
          </span>
          <span>
            👥 {servings} {typeof servings === 'number' ? 'servings' : ''}
          </span>
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
    </div>
  );
};

export default RecipeCard;