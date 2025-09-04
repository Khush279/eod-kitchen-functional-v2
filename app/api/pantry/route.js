import { NextResponse } from 'next/server';

// This is a simple API for pantry management
// In production, you'd connect to a real database

export async function GET(request) {
  try {
    // Since we're using localStorage on the frontend,
    // this endpoint could be used for syncing with a backend database
    return NextResponse.json({
      message: 'Pantry API ready',
      endpoints: {
        GET: 'Get pantry items',
        POST: 'Add pantry item',
        PUT: 'Update pantry item',
        DELETE: 'Delete pantry item'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Here you would typically save to a database
    // For now, we'll just validate the data structure

    const { name, quantity, category, expiryDate, notes } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Item name is required' },
        { status: 400 }
      );
    }

    const newItem = {
      id: Date.now().toString(),
      name,
      quantity: quantity || '',
      category: category || 'other',
      expiryDate: expiryDate || null,
      notes: notes || '',
      addedDate: new Date().toISOString(),
      source: 'api'
    };

    return NextResponse.json({
      item: newItem,
      message: 'Item added successfully'
    });

  } catch (error) {
    console.error('Pantry POST API Error:', error);
    return NextResponse.json(
      { error: 'Failed to add item' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Here you would update the item in the database
    const updatedItem = {
      id,
      ...updates,
      updatedDate: new Date().toISOString()
    };

    return NextResponse.json({
      item: updatedItem,
      message: 'Item updated successfully'
    });

  } catch (error) {
    console.error('Pantry PUT API Error:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Here you would delete the item from the database

    return NextResponse.json({
      message: 'Item deleted successfully'
    });

  } catch (error) {
    console.error('Pantry DELETE API Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
