import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { ingredients, preferences = {} } = await request.json();

    if (!ingredients || ingredients.length === 0) {
      return NextResponse.json(
        { error: 'No ingredients provided' },
        { status: 400 }
      );
    }

    const { dietaryRestrictions = '', cuisine = '', servings = 4 } = preferences;

    const prompt = `Create a delicious recipe using these ingredients: ${ingredients.join(', ')}

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

Only return the JSON object, no other text.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to generate recipe with Gemini AI');
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let recipe;
    try {
      // Try to parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recipe = JSON.parse(jsonMatch[0]);
      } else {
        recipe = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      // Return a fallback recipe
      recipe = {
        title: `Recipe with ${ingredients.join(', ')}`,
        description: "A delicious recipe created from your ingredients.",
        prepTime: "15 minutes",
        cookTime: "30 minutes",
        servings: servings,
        ingredients: ingredients.map(ingredient => ({
          item: ingredient,
          amount: "1 cup",
          optional: false
        })),
        instructions: [
          "Prepare all ingredients.",
          "Cook according to your preference.",
          "Season to taste and serve."
        ],
        nutrition: {
          calories: "300",
          protein: "15g",
          carbs: "30g",
          fat: "10g"
        },
        tips: ["Taste and adjust seasonings as needed."]
      };
    }

    return NextResponse.json({
      recipe,
      message: 'Recipe generated successfully'
    });

  } catch (error) {
    console.error('Recipe Generation API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate recipe' },
      { status: 500 }
    );
  }
}
