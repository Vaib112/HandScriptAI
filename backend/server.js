require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const axios = require('axios');
const FormData = require('form-data');
const pool = require('./db');
const authRoutes = require('./routes/authRoutes');
const verifyToken = require('./middleware/auth');

const app = express();
const upload = multer(); // stores file in memory

// Middleware
app.use(cors());
app.use(express.json());

// Auth Routes (Login, Register)
app.use('/api/auth', authRoutes);

// Keep the API Key exactly as previously defined or from .env
const API_KEY = process.env.API_KEY || '';

// POST /api/ocr - Protected route. Extracts OCR and saves to user's DB.
app.post('/api/ocr', verifyToken, upload.single('prescription'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const formData = new FormData();
    formData.append('prescription', req.file.buffer, req.file.originalname);

    const response = await axios.post(
      'https://prescriptoai.com/api/v1/prescription/extract',
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          Authorization: `Bearer ${API_KEY}`,
        },
      }
    );

    // The API might return { success: true, data: {...} } or directly {...} 
    const resultObj = response.data.data || response.data;
    
    // Store image preview as base64 string for immediate frontend use
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
console.log({resultObj})
    // Save to user's database footprint
    const [dbResult] = await pool.query(
      'INSERT INTO prescriptions (user_id, file_name, image_preview, result_json) VALUES (?, ?, ?, ?)',
      [req.user.userId, req.file.originalname, base64Image, JSON.stringify(resultObj)]
    );

    const newRecord = {
      id: dbResult.insertId,
      fileName: req.file.originalname,
      image: base64Image,
      result: resultObj,
      createdAt: new Date().toISOString()
    };

    res.json({ success: true, data: newRecord });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error.response?.data?.error || error.response?.data || 'Something went wrong',
    });
  }
});

// GET /api/prescriptions - Fetch history only for the logged-in user
app.get('/api/prescriptions', verifyToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, file_name as fileName, image_preview as image, result_json as result, created_at as createdAt FROM prescriptions WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );

    const formattedRecords = rows.map(row => ({
      ...row,
      result: typeof row.result === 'string' ? JSON.parse(row.result) : row.result
    }));

    res.json({ success: true, data: formattedRecords });
  } catch (error) {
    console.error('[Fetch History Error]', error);
    res.status(500).json({ success: false, error: 'Failed to fetch history' });
  }
});

// DELETE /api/prescriptions/:id
app.delete('/api/prescriptions/:id', verifyToken, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM prescriptions WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, error: 'Prescription not found or not authorized' });
    }

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    console.error('[Delete Error]', error);
    res.status(500).json({ success: false, error: 'Failed to delete record' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});