// Simple localStorage-based storage for demo
// In production, you'd use a proper database

export class StorageService {
  constructor() {
    this.isClient = typeof window !== 'undefined';
  }

  // Pantry management
  getPantryItems() {
    if (!this.isClient) return [];
    const items = localStorage.getItem('pantry_items');
    return items ? JSON.parse(items) : [];
  }

  setPantryItems(items) {
    if (!this.isClient) return;
    localStorage.setItem('pantry_items', JSON.stringify(items));
  }

  addPantryItem(item) {
    const items = this.getPantryItems();
    const existingIndex = items.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase());

    if (existingIndex >= 0) {
      items[existingIndex] = { ...items[existingIndex], ...item };
    } else {
      items.push({ ...item, id: Date.now().toString() });
    }

    this.setPantryItems(items);
    return items;
  }

  removePantryItem(itemId) {
    const items = this.getPantryItems();
    const filtered = items.filter(item => item.id !== itemId);
    this.setPantryItems(filtered);
    return filtered;
  }

  updatePantryItem(itemId, updates) {
    const items = this.getPantryItems();
    const index = items.findIndex(item => item.id === itemId);

    if (index >= 0) {
      items[index] = { ...items[index], ...updates };
      this.setPantryItems(items);
    }

    return items;
  }

  // Meal plans
  getMealPlans() {
    if (!this.isClient) return [];
    const plans = localStorage.getItem('meal_plans');
    return plans ? JSON.parse(plans) : [];
  }

  saveMealPlan(mealPlan) {
    if (!this.isClient) return;
    const plans = this.getMealPlans();
    const planWithId = { ...mealPlan, id: Date.now().toString(), createdAt: new Date().toISOString() };
    plans.unshift(planWithId);
    localStorage.setItem('meal_plans', JSON.stringify(plans.slice(0, 10))); // Keep last 10 plans
    return planWithId;
  }

  // Recipes
  getRecipes() {
    if (!this.isClient) return [];
    const recipes = localStorage.getItem('saved_recipes');
    return recipes ? JSON.parse(recipes) : [];
  }

  saveRecipe(recipe) {
    if (!this.isClient) return;
    const recipes = this.getRecipes();
    const recipeWithId = { ...recipe, id: Date.now().toString(), savedAt: new Date().toISOString() };
    recipes.unshift(recipeWithId);
    localStorage.setItem('saved_recipes', JSON.stringify(recipes.slice(0, 50))); // Keep last 50 recipes
    return recipeWithId;
  }

  removeRecipe(recipeId) {
    if (!this.isClient) return;
    const recipes = this.getRecipes();
    const filtered = recipes.filter(recipe => recipe.id !== recipeId);
    localStorage.setItem('saved_recipes', JSON.stringify(filtered));
    return filtered;
  }

  // User preferences
  getPreferences() {
    if (!this.isClient) return {};
    const prefs = localStorage.getItem('user_preferences');
    return prefs ? JSON.parse(prefs) : {
      dietaryRestrictions: '',
      favoriteCuisines: [],
      servingSize: 4,
      mealsPerDay: 3
    };
  }

  setPreferences(preferences) {
    if (!this.isClient) return;
    localStorage.setItem('user_preferences', JSON.stringify(preferences));
  }
}

export const storage = new StorageService();
