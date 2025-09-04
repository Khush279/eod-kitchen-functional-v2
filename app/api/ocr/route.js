import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Extract base64 data from data URL
    const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');

    // Call Google Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Data,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!visionResponse.ok) {
      throw new Error('Failed to process image with Google Vision API');
    }

    const visionData = await visionResponse.json();

    if (!visionData.responses || !visionData.responses[0]) {
      throw new Error('No response from Vision API');
    }

    const detectedText = visionData.responses[0].fullTextAnnotation?.text || '';

    if (!detectedText) {
      return NextResponse.json({
        text: '',
        items: [],
        message: 'No text detected in the image'
      });
    }

    // Use Gemini AI to analyze the receipt text
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Analyze this receipt text and extract grocery items with quantities and categories:

${detectedText}

Return a JSON array of items in this format:
[
  {
    "name": "item name",
    "quantity": "amount with unit",
    "category": "produce/dairy/meat/pantry/frozen/other",
    "price": "price if available"
  }
]

Only return the JSON array, no other text.`
                }
              ]
            }
          ]
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error('Failed to analyze receipt with Gemini AI');
    }

    const geminiData = await geminiResponse.json();
    const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let items = [];
    try {
      // Try to parse JSON from response
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        items = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: try to parse the entire response
        items = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      // Return basic items extracted from text patterns
      items = extractBasicItems(detectedText);
    }

    return NextResponse.json({
      text: detectedText,
      items: items,
      message: `Extracted ${items.length} items from receipt`
    });

  } catch (error) {
    console.error('OCR API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process receipt' },
      { status: 500 }
    );
  }
}

// Fallback function to extract basic items
function extractBasicItems(text) {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const items = [];

  // Simple pattern matching for common grocery items
  const itemPatterns = [
    /([A-Za-z\s]+)\s+([0-9]+\.?[0-9]*)/,
    /([A-Za-z\s]+)\s+\$([0-9]+\.?[0-9]*)/
  ];

  lines.forEach(line => {
    itemPatterns.forEach(pattern => {
      const match = line.match(pattern);
      if (match && match[1].length > 2) {
        const name = match[1].trim();
        // Skip common non-food items
        if (!name.match(/^(total|tax|subtotal|cash|card|receipt)$/i)) {
          items.push({
            name: name,
            quantity: "1",
            category: "other",
            price: match[2] ? `$${match[2]}` : undefined
          });
        }
      }
    });
  });

  return items.slice(0, 20); // Limit to 20 items max
}
