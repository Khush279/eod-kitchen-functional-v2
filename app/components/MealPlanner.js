import { useState, useEffect } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import Modal from './ui/Modal';
import { storage } from '../../lib/storage';
import { formatDate, mealTypes } from '../../lib/utils';

const MealPlanner = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [planPreferences, setPlanPreferences] = useState({
    days: 7,
    dietaryRestrictions: '',
    mealsPerDay: 3
  });
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMealPlans();
  }, []);

  const loadMealPlans = () => {
    const plans = storage.getMealPlans();
    setMealPlans(plans);
    if (plans.length > 0) {
      setCurrentPlan(plans[0]);
    }
  };

  const generateMealPlan = async () => {
    const pantryItems = storage.getPantryItems();

    if (pantryItems.length === 0) {
      setError('No pantry items found. Add some items to your pantry first.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/meals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pantryItems: pantryItems.map(item => item.name),
          preferences: planPreferences
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate meal plan');
      }

      const data = await response.json();
      const savedPlan = storage.saveMealPlan(data.mealPlan);
      setCurrentPlan(savedPlan);
      loadMealPlans();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteMealPlan = (planId) => {
    if (window.confirm('Are you sure you want to delete this meal plan?')) {
      const updatedPlans = mealPlans.filter(plan => plan.id !== planId);
      localStorage.setItem('meal_plans', JSON.stringify(updatedPlans));
      loadMealPlans();

      if (currentPlan?.id === planId) {
        setCurrentPlan(updatedPlans[0] || null);
      }
    }
  };

  const getMealIcon = (mealType) => {
    const icons = {
      breakfast: '🌅',
      lunch: '☀️',
      dinner: '🌙',
      snack: '🥨'
    };
    return icons[mealType] || '🍽️';
  };

  const getCurrentWeekDays = () => {
    if (!currentPlan?.mealPlan) return [];

    const startIndex = selectedWeek * 7;
    const endIndex = Math.min(startIndex + 7, currentPlan.mealPlan.length);

    return currentPlan.mealPlan.slice(startIndex, endIndex);
  };

  const getWeekOptions = () => {
    if (!currentPlan?.mealPlan) return [];

    const totalDays = currentPlan.mealPlan.length;
    const weekCount = Math.ceil(totalDays / 7);

    return Array.from({ length: weekCount }, (_, i) => ({
      value: i,
      label: `Week ${i + 1} (Days ${i * 7 + 1}-${Math.min((i + 1) * 7, totalDays)})`
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meal Planner</h1>
          <p className="text-gray-600">Plan your meals based on your pantry items</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          Generate New Plan
        </Button>
      </div>

      {/* Meal Plan Selection */}
      {mealPlans.length > 0 && (
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Saved Meal Plans</h2>
              <span className="text-sm text-gray-500">{mealPlans.length} plans</span>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mealPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    currentPlan?.id === plan.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setCurrentPlan(plan)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {plan.mealPlan?.length || 0} Day Plan
                      </div>
                      <div className="text-sm text-gray-500">
                        Created {new Date(plan.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMealPlan(plan.id);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  {plan.shoppingList && (
                    <div className="text-xs text-gray-500">
                      Shopping list: {plan.shoppingList.length} items
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}

      {/* Current Meal Plan */}
      {currentPlan ? (
        <div className="space-y-6">
          {/* Week Navigation */}
          {getWeekOptions().length > 1 && (
            <Card>
              <Card.Content>
                <div className="flex items-center justify-between">
                  <Input.Select
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(parseInt(e.target.value))}
                    className="w-64"
                  >
                    {getWeekOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Input.Select>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedWeek(Math.max(0, selectedWeek - 1))}
                      disabled={selectedWeek === 0}
                    >
                      ← Previous Week
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedWeek(Math.min(getWeekOptions().length - 1, selectedWeek + 1))}
                      disabled={selectedWeek === getWeekOptions().length - 1}
                    >
                      Next Week →
                    </Button>
                  </div>
                </div>
              </Card.Content>
            </Card>
          )}

          {/* Meal Plan Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
            {getCurrentWeekDays().map((day, dayIndex) => (
              <Card key={day.day} className="min-h-96">
                <Card.Header className="pb-3">
                  <div className="text-center">
                    <div className="font-semibold text-gray-900">
                      Day {day.day}
                    </div>
                    {day.date && (
                      <div className="text-sm text-gray-500">
                        {new Date(day.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    )}
                  </div>
                </Card.Header>
                <Card.Content className="space-y-4">
                  {Object.entries(day.meals || {}).map(([mealType, meal]) => (
                    <div key={mealType} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getMealIcon(mealType)}</span>
                        <span className="font-medium text-sm text-gray-900 capitalize">
                          {mealType}
                        </span>
                      </div>

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="font-medium text-sm text-gray-900 mb-1">
                          {meal.name}
                        </div>

                        {meal.prepTime && (
                          <div className="text-xs text-gray-500 mb-2">
                            🕒 {meal.prepTime}
                          </div>
                        )}

                        {meal.ingredients && meal.ingredients.length > 0 && (
                          <div className="text-xs text-gray-600">
                            <div className="font-medium mb-1">Ingredients:</div>
                            <div className="space-y-1">
                              {meal.ingredients.slice(0, 3).map((ingredient, idx) => (
                                <div key={idx} className="flex items-start space-x-1">
                                  <span className="text-gray-400">•</span>
                                  <span>{ingredient}</span>
                                </div>
                              ))}
                              {meal.ingredients.length > 3 && (
                                <div className="text-gray-400 italic">
                                  +{meal.ingredients.length - 3} more...
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </Card.Content>
              </Card>
            ))}
          </div>

          {/* Shopping List */}
          {currentPlan.shoppingList && currentPlan.shoppingList.length > 0 && (
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold">Shopping List</h3>
              </Card.Header>
              <Card.Content>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {currentPlan.shoppingList.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{item.item}</div>
                        <div className="text-sm text-gray-500">
                          {item.quantity} • {item.category}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                    </div>
                  ))}
                </div>
              </Card.Content>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <Card.Content>
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No meal plans yet</h3>
              <p className="text-gray-500 mb-6">
                Generate your first meal plan based on your pantry items
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                Generate Meal Plan
              </Button>
            </div>
          </Card.Content>
        </Card>
      )}

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

      {/* Generate Plan Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} size="md">
        <Modal.Header onClose={() => setIsModalOpen(false)}>
          Generate New Meal Plan
        </Modal.Header>
        <Modal.Content>
          <div className="space-y-4">
            <Input
              label="Number of Days"
              type="number"
              min="1"
              max="30"
              value={planPreferences.days}
              onChange={(e) => setPlanPreferences({...planPreferences, days: parseInt(e.target.value) || 7})}
              helperText="How many days should we plan for?"
            />

            <Input
              label="Meals per Day"
              type="number"
              min="1"
              max="5"
              value={planPreferences.mealsPerDay}
              onChange={(e) => setPlanPreferences({...planPreferences, mealsPerDay: parseInt(e.target.value) || 3})}
              helperText="Number of meals to plan for each day"
            />

            <Input
              label="Dietary Restrictions"
              placeholder="e.g., vegetarian, gluten-free, dairy-free"
              value={planPreferences.dietaryRestrictions}
              onChange={(e) => setPlanPreferences({...planPreferences, dietaryRestrictions: e.target.value})}
              helperText="Optional: Any dietary restrictions to consider"
            />
          </div>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>
          <Button onClick={generateMealPlan} loading={isGenerating}>
            Generate Plan
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MealPlanner;
