import React from 'react';

const HeroSection = ({ featuredRecipe }) => {
  const renderStars = (rating = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={`hero-star ${i <= rating ? '' : 'empty'}`}>
          ★
        </span>
      );
    }
    return stars;
  };

  // Default recipe if none provided
  const defaultRecipe = {
    title: "Welcome to My Cookbook",
    description: "Start your culinary journey by adding your first recipe. Create, organize, and share your favorite dishes with rich text editing and beautiful photos.",
    media: { mainImage: null },
    rating: { average: 0, count: 0 },
    cookingInfo: { totalTime: 0 },
    servings: 1
  };

  const recipe = featuredRecipe || defaultRecipe;
  const rating = recipe.rating?.average || 0;
  const reviewCount = recipe.rating?.count || 0;
  const totalTime = recipe.cookingInfo?.totalTime || 0;

  return (
    <div className="hero-section">
      <div className="hero-content">
        <div className="hero-text">
          <h2 className="hero-title">
            {featuredRecipe ? 'Recipe of the Day' : 'My Cookbook'}
          </h2>
          <h3 className="hero-recipe-title">{recipe.title}</h3>
          <p className="hero-description">
            {recipe.description || "No description available"}
          </p>
          
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stars">
                {renderStars(rating)}
              </div>
              <span className="hero-reviews">
                {reviewCount > 0 ? `${reviewCount} reviews` : 'No reviews yet'}
              </span>
            </div>
            
            <div className="hero-stat">
              <span className="hero-time">
                ⏱️ {totalTime > 0 ? `${totalTime} minutes` : 'Quick & Easy'}
              </span>
            </div>
            
            <div className="hero-stat">
              <span className="hero-servings">
                👥 {recipe.servings} serving{recipe.servings !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
          
          {featuredRecipe && (
            <button className="hero-button">
              View Recipe
            </button>
          )}
        </div>
        
        <div className="hero-image">
          {recipe.media?.mainImage ? (
            <img src={recipe.media.mainImage} alt={recipe.title} />
          ) : (
            <div className="hero-placeholder">
              <span className="hero-icon">🍽️</span>
              <p>Add your first recipe to see it featured here!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;