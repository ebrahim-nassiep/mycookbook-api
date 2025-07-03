import React, { useState, useEffect } from 'react';
import RichTextEditor from './RichTextEditor';
import ImageUpload from './ImageUpload';
import { recipeAPI } from '../services/api';

const EnhancedRecipeForm = ({ recipe, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    servings: 4,
    
    // Rich content
    content: {
      instructions: [{ 
        step: 1, 
        title: '', 
        description: '', 
        estimatedTime: 0, 
        tips: '',
        imageUrl: '' 
      }],
      notes: '',
      story: ''
    },
    
    // Ingredients
    ingredients: [{ 
      name: '', 
      quantity: '', 
      unit: '', 
      category: '', 
      optional: false, 
      notes: '' 
    }],
    
    // Categories and tags
    categories: [],
    cuisineType: '',
    tags: [],
    
    // Dietary information
    dietaryInfo: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isDairyFree: false,
      isKeto: false,
      isPaleo: false,
      allergens: []
    },
    
    // Cooking information
    cookingInfo: {
      prepTime: 0,
      cookTime: 0,
      totalTime: 0,
      difficulty: 'easy',
      skillLevel: 'beginner',
      techniques: [],
      equipment: []
    },
    
    // Media
    media: {
      mainImage: '',
      images: [],
      videoUrl: ''
    }
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Predefined options
  const categories = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert', 'appetizer', 'side-dish', 'main-course'];
  const cuisineTypes = ['american', 'italian', 'mexican', 'asian', 'indian', 'french', 'mediterranean', 'thai', 'chinese', 'japanese'];
  const difficulties = ['easy', 'medium', 'hard'];
  const skillLevels = ['beginner', 'intermediate', 'advanced'];
  const allergens = ['nuts', 'dairy', 'eggs', 'soy', 'shellfish', 'fish', 'gluten', 'sesame'];
  const units = ['cups', 'tbsp', 'tsp', 'oz', 'lbs', 'grams', 'kg', 'ml', 'liters', 'pieces', 'cloves'];

  useEffect(() => {
    if (recipe) {
      setFormData(prevData => ({
        ...prevData,
        ...recipe,
        content: {
          ...prevData.content,
          ...recipe.content
        },
        cookingInfo: {
          ...prevData.cookingInfo,
          ...recipe.cookingInfo
        },
        dietaryInfo: {
          ...prevData.dietaryInfo,
          ...recipe.dietaryInfo
        },
        media: {
          ...prevData.media,
          ...recipe.media
        }
      }));
    }
  }, [recipe]);

  // Calculate total time when prep or cook time changes
  useEffect(() => {
    const totalTime = formData.cookingInfo.prepTime + formData.cookingInfo.cookTime;
    if (totalTime !== formData.cookingInfo.totalTime) {
      setFormData(prev => ({
        ...prev,
        cookingInfo: {
          ...prev.cookingInfo,
          totalTime
        }
      }));
    }
  }, [formData.cookingInfo.prepTime, formData.cookingInfo.cookTime]);

  const handleInputChange = (path, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleArrayChange = (path, index, field, value) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (const key of keys) {
        current = current[key];
      }
      
      if (current[index]) {
        current[index][field] = value;
      }
      
      return newData;
    });
  };

  const addArrayItem = (path, defaultItem) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (const key of keys) {
        current = current[key];
      }
      
      current.push({ ...defaultItem });
      return newData;
    });
  };

  const removeArrayItem = (path, index) => {
    setFormData(prev => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      
      for (const key of keys) {
        current = current[key];
      }
      
      current.splice(index, 1);
      return newData;
    });
  };

  const handleImageUpload = (images) => {
    if (images && images.length > 0) {
      setFormData(prev => ({
        ...prev,
        media: {
          ...prev.media,
          mainImage: images[0].url,
          images: [...prev.media.images, ...images.map(img => img.url)]
        }
      }));
    }
  };

  const handleStepImageUpload = (stepIndex, images) => {
    if (images && images.length > 0) {
      handleArrayChange('content.instructions', stepIndex, 'imageUrl', images[0].url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Simplify the data structure for backend compatibility
      const simplifiedData = {
        title: formData.title,
        description: formData.description,
        servings: formData.servings,
        categories: formData.categories,
        cuisineType: formData.cuisineType,
        tags: formData.tags,
        ingredients: formData.ingredients,
        instructions: formData.content.instructions.map(inst => inst.description).join('\n\n'),
        cookTime: formData.cookingInfo.cookTime,
        prepTime: formData.cookingInfo.prepTime,
        totalTime: formData.cookingInfo.totalTime,
        difficulty: formData.cookingInfo.difficulty,
        media: formData.media
      };

      if (recipe) {
        await recipeAPI.updateRecipe(recipe._id, simplifiedData);
      } else {
        await recipeAPI.createRecipe(simplifiedData);
      }
      onSave();
    } catch (err) {
      console.error('Recipe save error:', err);
      setError(err.response?.data?.error || err.message || 'Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <div className="form-section">
      <h3>Basic Information</h3>
      
      <div className="form-group">
        <label>Recipe Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          required
          placeholder="Enter recipe title"
        />
      </div>

      <div className="form-group">
        <label>Description</label>
        <RichTextEditor
          value={formData.description}
          onChange={(value) => handleInputChange('description', value)}
          placeholder="Describe your recipe..."
          height="150px"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Servings</label>
          <input
            type="number"
            value={formData.servings}
            onChange={(e) => handleInputChange('servings', parseInt(e.target.value))}
            min="1"
            max="50"
          />
        </div>

        <div className="form-group">
          <label>Cuisine Type</label>
          <select
            value={formData.cuisineType}
            onChange={(e) => handleInputChange('cuisineType', e.target.value)}
          >
            <option value="">Select cuisine</option>
            {cuisineTypes.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Main Recipe Image</label>
        <ImageUpload
          onUpload={handleImageUpload}
          maxFiles={1}
          uploadType="recipe-image"
          existingImages={formData.media.mainImage ? [{ url: formData.media.mainImage }] : []}
        />
      </div>
    </div>
  );

  const renderIngredients = () => (
    <div className="form-section">
      <h3>Ingredients</h3>
      
      {formData.ingredients.map((ingredient, index) => (
        <div key={index} className="ingredient-item">
          <div className="form-row">
            <div className="form-group flex-2">
              <input
                type="text"
                placeholder="Ingredient name"
                value={ingredient.name}
                onChange={(e) => handleArrayChange('ingredients', index, 'name', e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <input
                type="text"
                placeholder="Quantity"
                value={ingredient.quantity}
                onChange={(e) => handleArrayChange('ingredients', index, 'quantity', e.target.value)}
              />
            </div>
            <div className="form-group flex-1">
              <select
                value={ingredient.unit}
                onChange={(e) => handleArrayChange('ingredients', index, 'unit', e.target.value)}
              >
                <option value="">Unit</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={ingredient.optional}
                  onChange={(e) => handleArrayChange('ingredients', index, 'optional', e.target.checked)}
                />
                Optional
              </label>
            </div>
            <button
              type="button"
              onClick={() => removeArrayItem('ingredients', index)}
              className="btn-remove"
            >
              ×
            </button>
          </div>
          <div className="form-group">
            <input
              type="text"
              placeholder="Notes (substitutions, preparation tips)"
              value={ingredient.notes}
              onChange={(e) => handleArrayChange('ingredients', index, 'notes', e.target.value)}
            />
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={() => addArrayItem('ingredients', { 
          name: '', quantity: '', unit: '', category: '', optional: false, notes: '' 
        })}
        className="btn-add"
      >
        + Add Ingredient
      </button>
    </div>
  );

  const renderInstructions = () => (
    <div className="form-section">
      <h3>Instructions</h3>
      
      {formData.content.instructions.map((instruction, index) => (
        <div key={index} className="instruction-item">
          <div className="instruction-header">
            <h4>Step {index + 1}</h4>
            {formData.content.instructions.length > 1 && (
              <button
                type="button"
                onClick={() => removeArrayItem('content.instructions', index)}
                className="btn-remove"
              >
                ×
              </button>
            )}
          </div>
          
          <div className="form-group">
            <label>Step Title (optional)</label>
            <input
              type="text"
              placeholder="e.g., Prepare the vegetables"
              value={instruction.title}
              onChange={(e) => handleArrayChange('content.instructions', index, 'title', e.target.value)}
            />
          </div>
          
          <div className="form-group">
            <label>Instructions *</label>
            <RichTextEditor
              value={instruction.description}
              onChange={(value) => handleArrayChange('content.instructions', index, 'description', value)}
              placeholder="Describe this step in detail..."
              height="120px"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Estimated Time (minutes)</label>
              <input
                type="number"
                value={instruction.estimatedTime}
                onChange={(e) => handleArrayChange('content.instructions', index, 'estimatedTime', parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            <div className="form-group">
              <label>Temperature (optional)</label>
              <input
                type="text"
                placeholder="e.g., 350°F, Medium heat"
                value={instruction.temperature}
                onChange={(e) => handleArrayChange('content.instructions', index, 'temperature', e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Tips & Notes</label>
            <textarea
              placeholder="Any helpful tips for this step..."
              value={instruction.tips}
              onChange={(e) => handleArrayChange('content.instructions', index, 'tips', e.target.value)}
              rows="2"
            />
          </div>
          
          <div className="form-group">
            <label>Step Image</label>
            <ImageUpload
              onUpload={(images) => handleStepImageUpload(index, images)}
              maxFiles={1}
              uploadType="step-image"
              existingImages={instruction.imageUrl ? [{ url: instruction.imageUrl }] : []}
            />
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={() => addArrayItem('content.instructions', { 
          step: formData.content.instructions.length + 1, 
          title: '', 
          description: '', 
          estimatedTime: 0, 
          tips: '',
          imageUrl: '' 
        })}
        className="btn-add"
      >
        + Add Step
      </button>
    </div>
  );

  const renderTabs = () => (
    <div className="form-tabs">
      <button
        type="button"
        className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
        onClick={() => setActiveTab('basic')}
      >
        Basic Info
      </button>
      <button
        type="button"
        className={`tab ${activeTab === 'ingredients' ? 'active' : ''}`}
        onClick={() => setActiveTab('ingredients')}
      >
        Ingredients
      </button>
      <button
        type="button"
        className={`tab ${activeTab === 'instructions' ? 'active' : ''}`}
        onClick={() => setActiveTab('instructions')}
      >
        Instructions
      </button>
    </div>
  );

  return (
    <div className="enhanced-recipe-form">
      <div className="form-header">
        <h2>{recipe ? 'Edit Recipe' : 'Create New Recipe'}</h2>
      </div>

      {renderTabs()}

      <form onSubmit={handleSubmit}>
        <div className="form-content">
          {activeTab === 'basic' && renderBasicInfo()}
          {activeTab === 'ingredients' && renderIngredients()}
          {activeTab === 'instructions' && renderInstructions()}
        </div>

        {error && <div className="error">{error}</div>}

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-save">
            {loading ? 'Saving...' : 'Save Recipe'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EnhancedRecipeForm;