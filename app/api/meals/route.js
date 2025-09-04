import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { pantryItems, preferences = {} } = await request.json();

    if (!pantryItems || pantryItems.length === 0) {
      return NextResponse.json(
        { error: 'No pantry items provided' },
        { status: 400 }
      );
    }

    const { days = 7, dietaryRestrictions = '', mealsPerDay = 3 } = preferences;

    const prompt = `Create a ${days}-day meal plan using these pantry items: ${pantryItems.join(', ')}

Preferences:
- Dietary restrictions: ${dietaryRestrictions || 'None'}
- Meals per day: ${mealsPerDay}

Return a JSON object with this structure:
{
  "mealPlan": [
    {
      "day": 1,
      "date": "2025-01-04",
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
      "category": "produce"
    }
  ]
}

Generate ${days} days of meals. Only return the JSON object, no other text.`;

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
      throw new Error('Failed to generate meal plan with Gemini AI');
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let mealPlan;
    try {
      // Try to parse JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        mealPlan = JSON.parse(jsonMatch[0]);
      } else {
        mealPlan = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      // Return a fallback meal plan
      mealPlan = generateFallbackMealPlan(pantryItems, days, mealsPerDay);
    }

    return NextResponse.json({
      mealPlan,
      message: 'Meal plan generated successfully'
    });

  } catch (error) {
    console.error('Meals API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate meal plan' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    return NextResponse.json({
      message: 'Meals API ready',
      endpoints: {
        POST: 'Generate meal plan',
        GET: 'Get meal plans info'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Fallback function to generate a basic meal plan
function generateFallbackMealPlan(pantryItems, days, mealsPerDay) {
  const mealPlan = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayPlan = {
      day: i + 1,
      date: date.toISOString().split('T')[0],
      meals: {}
    };

    const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'].slice(0, mealsPerDay);

    mealTypes.forEach((mealType, index) => {
      // Rotate through pantry items for variety
      const ingredientIndex = (i + index) % pantryItems.length;
      const mainIngredient = pantryItems[ingredientIndex];

      dayPlan.meals[mealType] = {
        name: `${mainIngredient} ${mealType}`,
        ingredients: [
          mainIngredient,
          pantryItems[(ingredientIndex + 1) % pantryItems.length]
        ].filter(Boolean),
        prepTime: mealType === 'breakfast' ? '10 minutes' : 
                 mealType === 'lunch' ? '15 minutes' : '25 minutes'
      };
    });

    mealPlan.push(dayPlan);
  }

  // Generate a simple shopping list
  const shoppingList = [
    { item: 'Salt', quantity: '1 container', category: 'pantry' },
    { item: 'Pepper', quantity: '1 container', category: 'pantry' },
    { item: 'Oil', quantity: '1 bottle', category: 'pantry' }
  ];

  return {
    mealPlan,
    shoppingList
  };
}
