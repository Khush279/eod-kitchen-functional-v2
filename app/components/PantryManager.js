import { useState, useEffect } from 'react';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import Modal from './ui/Modal';
import { storage } from '../../lib/storage';
import { foodCategories, cn } from '../../lib/utils';

const PantryManager = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    category: 'other',
    expiryDate: '',
    notes: ''
  });

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, selectedCategory, searchTerm]);

  const loadItems = () => {
    const pantryItems = storage.getPantryItems();
    setItems(pantryItems);
  };

  const filterItems = () => {
    let filtered = items;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleAddItem = () => {
    if (!newItem.name.trim()) return;

    const itemToAdd = {
      ...newItem,
      addedDate: new Date().toISOString(),
      source: 'manual'
    };

    storage.addPantryItem(itemToAdd);
    loadItems();
    resetForm();
    setIsAddModalOpen(false);
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      quantity: item.quantity || '',
      category: item.category || 'other',
      expiryDate: item.expiryDate || '',
      notes: item.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const handleUpdateItem = () => {
    if (!newItem.name.trim()) return;

    storage.updatePantryItem(editingItem.id, newItem);
    loadItems();
    resetForm();
    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      storage.removePantryItem(itemId);
      loadItems();
    }
  };

  const resetForm = () => {
    setNewItem({
      name: '',
      quantity: '',
      category: 'other',
      expiryDate: '',
      notes: ''
    });
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingItem(null);
    resetForm();
  };

  const getCategoryColor = (category) => {
    const colors = {
      produce: 'bg-green-100 text-green-800',
      dairy: 'bg-blue-100 text-blue-800',
      meat: 'bg-red-100 text-red-800',
      seafood: 'bg-cyan-100 text-cyan-800',
      pantry: 'bg-yellow-100 text-yellow-800',
      frozen: 'bg-purple-100 text-purple-800',
      bakery: 'bg-orange-100 text-orange-800',
      beverages: 'bg-indigo-100 text-indigo-800',
      snacks: 'bg-pink-100 text-pink-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category] || colors.other;
  };

  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  return (
    <div className="space-y-6">
      {/* Header with search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search pantry items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-3">
          <Input.Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-48"
          >
            <option value="all">All Categories</option>
            {foodCategories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </Input.Select>

          <Button onClick={() => setIsAddModalOpen(true)}>
            Add Item
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <Card.Content>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{items.length}</div>
              <div className="text-sm text-gray-500">Total Items</div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {items.filter(item => isExpiringSoon(item.expiryDate)).length}
              </div>
              <div className="text-sm text-gray-500">Expiring Soon</div>
            </div>
          </Card.Content>
        </Card>

        <Card>
          <Card.Content>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {items.filter(item => isExpired(item.expiryDate)).length}
              </div>
              <div className="text-sm text-gray-500">Expired</div>
            </div>
          </Card.Content>
        </Card>
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <Card>
          <Card.Content>
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
              <p className="text-gray-500">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters.'
                  : 'Add your first pantry item to get started.'
                }
              </p>
            </div>
          </Card.Content>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <Card.Content>
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.name}
                      </h3>
                      {item.quantity && (
                        <p className="text-sm text-gray-500">{item.quantity}</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={cn(
                      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                      getCategoryColor(item.category)
                    )}>
                      {item.category}
                    </span>

                    {item.expiryDate && (
                      <span className={cn(
                        'text-xs px-2 py-1 rounded',
                        isExpired(item.expiryDate) 
                          ? 'bg-red-100 text-red-800'
                          : isExpiringSoon(item.expiryDate)
                          ? 'bg-orange-100 text-orange-800'
                          : 'bg-gray-100 text-gray-800'
                      )}>
                        {isExpired(item.expiryDate) 
                          ? 'Expired'
                          : isExpiringSoon(item.expiryDate)
                          ? 'Expires Soon'
                          : new Date(item.expiryDate).toLocaleDateString()
                        }
                      </span>
                    )}
                  </div>

                  {item.notes && (
                    <p className="text-xs text-gray-500 truncate">{item.notes}</p>
                  )}
                </div>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Item Modal */}
      <Modal isOpen={isAddModalOpen} onClose={closeModal} size="md">
        <Modal.Header onClose={closeModal}>
          {editingItem ? 'Edit Item' : 'Add New Item'}
        </Modal.Header>
        <Modal.Content>
          <div className="space-y-4">
            <Input
              label="Item Name"
              placeholder="Enter item name"
              value={newItem.name}
              onChange={(e) => setNewItem({...newItem, name: e.target.value})}
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantity"
                placeholder="e.g., 2 lbs, 1 gallon"
                value={newItem.quantity}
                onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
              />

              <Input.Select
                label="Category"
                value={newItem.category}
                onChange={(e) => setNewItem({...newItem, category: e.target.value})}
              >
                {foodCategories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </Input.Select>
            </div>

            <Input
              label="Expiry Date (Optional)"
              type="date"
              value={newItem.expiryDate}
              onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
            />

            <Input.Textarea
              label="Notes (Optional)"
              placeholder="Any additional notes"
              value={newItem.notes}
              onChange={(e) => setNewItem({...newItem, notes: e.target.value})}
              rows={2}
            />
          </div>
        </Modal.Content>
        <Modal.Footer>
          <Button variant="outline" onClick={closeModal}>
            Cancel
          </Button>
          <Button onClick={editingItem ? handleUpdateItem : handleAddItem}>
            {editingItem ? 'Update Item' : 'Add Item'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PantryManager;
