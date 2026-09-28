const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');

// GET /api/transactions - Fetch transaction history, most recent first
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('transactions').get();
    const transactions = [];
    snapshot.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Sort transactions by date descending (most recent first)
    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transaction history', message: error.message });
  }
});

// POST /api/transactions - Record stock IN or OUT transaction & update item quantity
router.post('/', async (req, res) => {
  try {
    const { itemId, type, quantity, reason } = req.body;

    if (!itemId || !type || quantity === undefined || !reason) {
      return res.status(400).json({ error: 'Missing required fields: itemId, type (IN/OUT), quantity, reason' });
    }

    const txType = String(type).toUpperCase();
    if (txType !== 'IN' && txType !== 'OUT') {
      return res.status(400).json({ error: 'Transaction type must be "IN" or "OUT"' });
    }

    const qtyNumber = Number(quantity);
    if (isNaN(qtyNumber) || qtyNumber <= 0) {
      return res.status(400).json({ error: 'Quantity must be a positive number' });
    }

    // Fetch the target item
    const itemRef = db.collection('items').doc(itemId);
    const itemDoc = await itemRef.get();

    if (!itemDoc.exists) {
      return res.status(404).json({ error: `Item with ID ${itemId} not found` });
    }

    const itemData = itemDoc.data();
    let updatedQuantity = itemData.quantity;

    if (txType === 'IN') {
      updatedQuantity += qtyNumber;
    } else if (txType === 'OUT') {
      if (itemData.quantity < qtyNumber) {
        return res.status(400).json({
          error: `Insufficient stock for item "${itemData.name}". Available: ${itemData.quantity}, Requested: ${qtyNumber}`
        });
      }
      updatedQuantity -= qtyNumber;
    }

    // Update item quantity in items collection
    const nowIso = new Date().toISOString();
    await itemRef.update({
      quantity: updatedQuantity,
      lastUpdated: nowIso
    });

    // Save transaction log
    const transactionLog = {
      itemId,
      itemName: itemData.name,
      type: txType,
      quantity: qtyNumber,
      reason: String(reason).trim(),
      date: nowIso
    };

    const txRef = await db.collection('transactions').add(transactionLog);

    res.status(201).json({
      id: txRef.id,
      ...transactionLog,
      updatedItemQuantity: updatedQuantity
    });
  } catch (error) {
    console.error('Error recording transaction:', error);
    res.status(500).json({ error: 'Failed to record transaction', message: error.message });
  }
});

module.exports = router;
