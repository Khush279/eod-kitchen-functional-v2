import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

export class GoogleAIService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async analyzeReceipt(ocrText) {
    try {
      const prompt = `
        Analyze this receipt text and extract grocery items with quantities and categories:

        ${ocrText}

        Return a JSON array of items in this format:
        [
          {
            "name": "item name",
            "quantity": "amount with unit",
            "category": "produce/dairy/meat/pantry/frozen/other",
            "price": "price if available"
          }
        ]

        Only return the JSON array, no other text.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch (parseError) {
        // If JSON parsing fails, try to extract JSON from text
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Could not parse receipt data');
      }
    } catch (error) {
      console.error('Error analyzing receipt:', error);
      throw error;
    }
  }

  async generateRecipe(ingredients, preferences = {}) {
    try {
      const { dietaryRestrictions = '', cuisine = '', servings = 4 } = preferences;

      const prompt = `
        Create a delicious recipe using these ingredients: ${ingredients.join(', ')}

        Preferences:
        - Dietary restrictions: ${dietaryRestrictions || 'None'}
        - Cuisine style: ${cuisine || 'Any'}
        - Servings: ${servings}

        Return a JSON object with this structure:
        {
          "title": "Recipe Name",
          "description": "Brief description",
          "prepTime": "15 minutes",
          "cookTime": "30 minutes",
          "servings": ${servings},
          "ingredients": [
            {
              "item": "ingredient name",
              "amount": "quantity with unit",
              "optional": false
            }
          ],
          "instructions": [
            "Step 1 description",
            "Step 2 description"
          ],
          "nutrition": {
            "calories": "per serving",
            "protein": "grams",
            "carbs": "grams",
            "fat": "grams"
          },
          "tips": ["cooking tip 1", "cooking tip 2"]
        }

        Only return the JSON object, no other text.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch (parseError) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Could not parse recipe data');
      }
    } catch (error) {
      console.error('Error generating recipe:', error);
      throw error;
    }
  }

  async generateMealPlan(pantryItems, days = 7, preferences = {}) {
    try {
      const { dietaryRestrictions = '', mealsPerDay = 3 } = preferences;

      const prompt = `
        Create a ${days}-day meal plan using these pantry items: ${pantryItems.join(', ')}

        Preferences:
        - Dietary restrictions: ${dietaryRestrictions || 'None'}
        - Meals per day: ${mealsPerDay}

        Return a JSON object with this structure:
        {
          "mealPlan": [
            {
              "day": 1,
              "date": "2025-01-01",
              "meals": {
                "breakfast": {
                  "name": "Meal name",
                  "ingredients": ["ingredient1", "ingredient2"],
                  "prepTime": "15 minutes"
                },
                "lunch": {
                  "name": "Meal name",
                  "ingredients": ["ingredient1", "ingredient2"],
                  "prepTime": "20 minutes"
                },
                "dinner": {
                  "name": "Meal name",
                  "ingredients": ["ingredient1", "ingredient2"],
                  "prepTime": "30 minutes"
                }
              }
            }
          ],
          "shoppingList": [
            {
              "item": "needed item",
              "quantity": "amount",
              "category": "produce/dairy/etc"
            }
          ]
        }

        Only return the JSON object, no other text.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      try {
        return JSON.parse(text);
      } catch (parseError) {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error('Could not parse meal plan data');
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      throw error;
    }
  }
}

export const googleAI = new GoogleAIService();
