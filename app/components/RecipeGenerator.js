import { useState, useEffect } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import Modal from './ui/Modal';
import { storage } from '../../lib/storage';
import { commonDietaryRestrictions, cuisineTypes, formatTime } from '../../lib/utils';

const RecipeGenerator = () => {
  const [pantryItems, setPantryItems] = useState([]);
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [generatedRecipe, setGeneratedRecipe] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [preferences, setPreferences] = useState({
    dietaryRestrictions: '',
    cuisine: '',
    servings: 4
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadPantryItems();
    loadSavedRecipes();
  }, []);

  const loadPantryItems = () => {
    const items = storage.getPantryItems();
    setPantryItems(items);
  };

  const loadSavedRecipes = () => {
    const recipes = storage.getRecipes();
    setSavedRecipes(recipes);
  };

  const toggleIngredient = (ingredient) => {
    setSelectedIngredients(prev => 
      prev.includes(ingredient)
        ? prev.filter(item => item !== ingredient)
        : [...prev, ingredient]
    );
  };

  const generateRecipe = async () => {
    if (selectedIngredients.length === 0) {
      setError('Please select at least one ingredient');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/generate-recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ingredients: selectedIngredients,
          preferences
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate recipe');
      }

      const data = await response.json();
      setGeneratedRecipe(data.recipe);
      setIsModalOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveRecipe = () => {
    if (generatedRecipe) {
      storage.saveRecipe(generatedRecipe);
      loadSavedRecipes();
      setIsModalOpen(false);
    }
  };

  const deleteRecipe = (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      storage.removeRecipe(recipeId);
      loadSavedRecipes();
    }
  };

  const clearSelection = () => {
    setSelectedIngredients([]);
    setGeneratedRecipe(null);
    setError('');
  };

  return (
    <div className="space-y-6">
      {/* Recipe Preferences */}
      <Card>
        <Card.Header>
          <h2 className="text-lg font-semibold">Recipe Preferences</h2>
        </Card.Header>
        <Card.Content>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input.Select
              label="Dietary Restrictions"
              value={preferences.dietaryRestrictions}
              onChange={(e) => setPreferences({...preferences, dietaryRestrictions: e.target.value})}
            >
              <option value="">None</option>
              {commonDietaryRestrictions.map(restriction => (
                <option key={restriction} value={restriction}>
                  {restriction.charAt(0).toUpperCase() + restriction.slice(1)}
                </option>
              ))}
            </Input.Select>

            <Input.Select
              label="Cuisine Type"
              value={preferences.cuisine}
              onChange={(e) => setPreferences({...preferences, cuisine: e.target.value})}
            >
              <option value="">Any</option>
              {cuisineTypes.map(cuisine => (
                <option key={cuisine} value={cuisine}>
                  {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                </option>
              ))}
            </Input.Select>

            <Input
              label="Servings"
              type="number"
              min="1"
              max="12"
              value={preferences.servings}
              onChange={(e) => setPreferences({...preferences, servings: parseInt(e.target.value) || 4})}
            />
          </div>
        </Card.Content>
      </Card>

      {/* Ingredient Selection */}
      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Select Ingredients</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                {selectedIngredients.length} selected
              </span>
              {selectedIngredients.length > 0 && (
                <Button variant="outline" size="sm" onClick={clearSelection}>
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          {pantryItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No pantry items found. Add some items to your pantry first.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {pantryItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleIngredient(item.name)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedIngredients.includes(item.name)
                      ? 'border-primary-500 bg-primary-50 text-primary-900'
                      : 'border-gray-200 hover:border-gray-300 bg-white text-gray-900'
                  }`}
                >
                  <div className="font-medium text-sm">{item.name}</div>
                  {item.quantity && (
                    <div className="text-xs text-gray-500 mt-1">{item.quantity}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </Card.Content>
        {selectedIngredients.length > 0 && (
          <Card.Footer>
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Selected: {selectedIngredients.join(', ')}
              </div>
              <Button 
                onClick={generateRecipe} 
                loading={isGenerating}
                disabled={selectedIngredients.length === 0}
              >
                Generate Recipe
              </Button>
            </div>
          </Card.Footer>
        )}
      </Card>

      {/* Error Display */}
      {error && (
        <Card>
          <Card.Content>
            <div className="flex items-center space-x-3 text-red-600">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{error}</p>
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Saved Recipes */}
      {savedRecipes.length > 0 && (
        <Card>
          <Card.Header>
            <h2 className="text-lg font-semibold">Saved Recipes</h2>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedRecipes.map((recipe) => (
                <div key={recipe.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900">{recipe.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{recipe.description}</p>
                    </div>
                    <button
                      onClick={() => deleteRecipe(recipe.id)}
                      className="ml-2 p-1 text-gray-400 hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>🕒 {recipe.prepTime}</span>
                    <span>👥 {recipe.servings} servings</span>
                  </div>

                  <div className="text-xs text-gray-400">
                    Saved {new Date(recipe.savedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Recipe Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="lg">
        {generatedRecipe && (
          <>
            <Modal.Header onClose={() => setIsModalOpen(false)}>
              {generatedRecipe.title}
            </Modal.Header>
            <Modal.Content>
              <div className="space-y-6">
                {/* Recipe Info */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-sm text-gray-500">Prep Time</div>
                      <div className="font-medium">{generatedRecipe.prepTime}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Cook Time</div>
                      <div className="font-medium">{generatedRecipe.cookTime}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Servings</div>
                      <div className="font-medium">{generatedRecipe.servings}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {generatedRecipe.description && (
                  <p className="text-gray-600">{generatedRecipe.description}</p>
                )}

                {/* Ingredients */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Ingredients</h3>
                  <ul className="space-y-2">
                    {generatedRecipe.ingredients?.map((ingredient, index) => (
                      <li key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                        <span className="font-medium">{ingredient.amount}</span>
                        <span>{ingredient.item}</span>
                        {ingredient.optional && (
                          <span className="text-sm text-gray-500">(optional)</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Instructions</h3>
                  <ol className="space-y-3">
                    {generatedRecipe.instructions?.map((step, index) => (
                      <li key={index} className="flex space-x-3">
                        <span className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white text-sm font-medium rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Nutrition */}
                {generatedRecipe.nutrition && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Nutrition (per serving)</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="font-medium">{generatedRecipe.nutrition.calories}</div>
                        <div className="text-sm text-gray-500">Calories</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{generatedRecipe.nutrition.protein}</div>
                        <div className="text-sm text-gray-500">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{generatedRecipe.nutrition.carbs}</div>
                        <div className="text-sm text-gray-500">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium">{generatedRecipe.nutrition.fat}</div>
                        <div className="text-sm text-gray-500">Fat</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tips */}
                {generatedRecipe.tips && generatedRecipe.tips.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tips</h3>
                    <ul className="space-y-2">
                      {generatedRecipe.tips.map((tip, index) => (
                        <li key={index} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full flex-shrink-0 mt-2"></div>
                          <span className="text-gray-700">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Modal.Content>
            <Modal.Footer>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
              <Button onClick={saveRecipe}>
                Save Recipe
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default RecipeGenerator;
