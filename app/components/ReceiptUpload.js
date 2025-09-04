import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Button from './ui/Button';
import Card from './ui/Card';
import { storage } from '../../lib/storage';

const ReceiptUpload = ({ onItemsExtracted }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedItems, setExtractedItems] = useState([]);
  const [error, setError] = useState('');

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setIsProcessing(true);
    setError('');

    try {
      // Convert file to base64
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });

      // Call OCR API
      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: base64 }),
      });

      if (!response.ok) {
        throw new Error('Failed to process receipt');
      }

      const data = await response.json();
      setExtractedItems(data.items);

      if (onItemsExtracted) {
        onItemsExtracted(data.items);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  }, [onItemsExtracted]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const addToPantry = async (item) => {
    try {
      storage.addPantryItem({
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        addedDate: new Date().toISOString(),
        source: 'receipt'
      });

      // Remove from extracted items
      setExtractedItems(prev => prev.filter(i => i !== item));
    } catch (err) {
      setError('Failed to add item to pantry');
    }
  };

  const addAllToPantry = async () => {
    try {
      extractedItems.forEach(item => {
        storage.addPantryItem({
          name: item.name,
          quantity: item.quantity,
          category: item.category,
          addedDate: new Date().toISOString(),
          source: 'receipt'
        });
      });
      setExtractedItems([]);
    } catch (err) {
      setError('Failed to add items to pantry');
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card>
        <Card.Content>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <input {...getInputProps()} />

            {isProcessing ? (
              <div className="space-y-4">
                <div className="w-12 h-12 mx-auto">
                  <svg className="animate-spin w-full h-full text-primary-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p className="text-gray-600">Processing receipt...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-12 h-12 mx-auto text-gray-400">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {isDragActive ? 'Drop receipt here' : 'Upload receipt'}
                  </p>
                  <p className="text-gray-500">
                    Drag and drop a receipt image, or click to select
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Supports: JPG, PNG, GIF, BMP (max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card.Content>
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

      {/* Extracted Items */}
      {extractedItems.length > 0 && (
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Extracted Items</h3>
              <Button onClick={addAllToPantry} size="sm">
                Add All to Pantry
              </Button>
            </div>
          </Card.Header>
          <Card.Content>
            <div className="space-y-3">
              {extractedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>{item.quantity}</span>
                          <span>•</span>
                          <span className="capitalize">{item.category}</span>
                          {item.price && (
                            <>
                              <span>•</span>
                              <span>{item.price}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => addToPantry(item)}
                    size="sm"
                    variant="outline"
                  >
                    Add to Pantry
                  </Button>
                </div>
              ))}
            </div>
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default ReceiptUpload;
