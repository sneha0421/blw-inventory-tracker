const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET /api/items - Fetch all inventory items
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('items').get();
    const items = [];
    snapshot.forEach(doc => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });
    // Sort items by name by default
    items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch inventory items', message: error.message });
  }
});

// GET /api/items/low-stock - Fetch items where quantity <= minStock
router.get('/low-stock', async (req, res) => {
  try {
    const snapshot = await db.collection('items').get();
    const lowStockItems = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      if (Number(data.quantity) <= Number(data.minStock)) {
        lowStockItems.push({
          id: doc.id,
          ...data
        });
      }
    });
    res.json(lowStockItems);
  } catch (error) {
    console.error('Error fetching low-stock items:', error);
    res.status(500).json({ error: 'Failed to fetch low-stock items', message: error.message });
  }
});

// POST /api/items - Add a new item
router.post('/', async (req, res) => {
  try {
    const { name, category, quantity, minStock, unitPrice } = req.body;

    if (!name || !category || quantity === undefined || minStock === undefined || unitPrice === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name, category, quantity, minStock, unitPrice' });
    }

    const newItem = {
      name: String(name).trim(),
      category: String(category).trim(),
      quantity: Number(quantity),
      minStock: Number(minStock),
      unitPrice: Number(unitPrice),
      lastUpdated: new Date().toISOString()
    };

    const docRef = await db.collection('items').add(newItem);
    res.status(201).json({
      id: docRef.id,
      ...newItem
    });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).json({ error: 'Failed to add item', message: error.message });
  }
});

// PUT /api/items/:id - Update an existing item
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, quantity, minStock, unitPrice } = req.body;

    const itemRef = db.collection('items').doc(id);
    const doc = await itemRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: `Item with ID ${id} not found` });
    }

    const currentData = doc.data();
    const updatedFields = {
      name: name !== undefined ? String(name).trim() : currentData.name,
      category: category !== undefined ? String(category).trim() : currentData.category,
      quantity: quantity !== undefined ? Number(quantity) : currentData.quantity,
      minStock: minStock !== undefined ? Number(minStock) : currentData.minStock,
      unitPrice: unitPrice !== undefined ? Number(unitPrice) : currentData.unitPrice,
      lastUpdated: new Date().toISOString()
    };

    await itemRef.update(updatedFields);

    res.json({
      id,
      ...currentData,
      ...updatedFields
    });
  } catch (error) {
    console.error(`Error updating item ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to update item', message: error.message });
  }
});

// DELETE /api/items/:id - Delete an item
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const itemRef = db.collection('items').doc(id);
    const doc = await itemRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: `Item with ID ${id} not found` });
    }

    await itemRef.delete();
    res.json({ message: 'Item deleted successfully', id });
  } catch (error) {
    console.error(`Error deleting item ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to delete item', message: error.message });
  }
});

module.exports = router;
