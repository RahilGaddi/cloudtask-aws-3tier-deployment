import express from 'express';
import { query } from '../config/db.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const [categories] = await query('SELECT * FROM categories ORDER BY name ASC');
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const { name, color } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const [result] = await query(
      'INSERT INTO categories (name, color) VALUES (?, ?)',
      [name, color || '#8b5cf6']
    );

    const [newCat] = await query('SELECT * FROM categories WHERE id = ?', [result.insertId]);

    res.status(201).json({ success: true, data: newCat[0] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
