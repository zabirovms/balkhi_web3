require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// PostgreSQL connection
const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

app.use(cors());
app.use(express.json());

// API endpoints
app.get('/api/books', async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT book_title FROM poems ORDER BY book_title');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/poems', async (req, res) => {
  try {
    const { book } = req.query;
    let query = 'SELECT * FROM poems';
    const params = [];
    
    if (book) {
      query += ' WHERE book_title = $1';
      params.push(book);
    }
    
    query += ' ORDER BY poem_id';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/random-poem', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM poems ORDER BY RANDOM() LIMIT 1'
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const { query, book } = req.query;
    let sql = `
      SELECT * FROM poems 
      WHERE poem_text ILIKE $1
    `;
    const params = [`%${query}%`];
    
    if (book) {
      sql += ' AND book_title = $2';
      params.push(book);
    }
    
    sql += ' ORDER BY book_title, poem_id';
    
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
