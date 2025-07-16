const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const app = express();

// Configurar CORS para permitir solicitudes desde el frontend
app.use(cors({ origin: 'http://localhost:8080' }));
app.use(express.json());

// Configuración de la conexión a la base de datos usando variables de entorno
const db = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'agrouser',
  password: process.env.DB_PASSWORD || 'agropass',
  database: process.env.DB_NAME || 'agroquimicos_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await db.query('SELECT * FROM usuarios WHERE username = ?', [username]);
    if (users.length === 0) {
      return res.json({ success: false });
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    res.json({ success: isMatch });
  } catch (error) {
    console.error('Error in /api/login:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get lotes endpoint
app.get('/api/lotes', async (req, res) => {
  try {
    const [lotes] = await db.query('SELECT * FROM lotes');
    res.json(lotes);
  } catch (error) {
    console.error('Error in /api/lotes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get agroquímicos endpoint
app.get('/api/agroquimicos', async (req, res) => {
  try {
    const [agroquimicos] = await db.query('SELECT * FROM agroquimicos');
    res.json(agroquimicos);
  } catch (error) {
    console.error('Error in /api/agroquimicos:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Post lotes endpoint
app.post('/api/lotes', async (req, res) => {
  const { loteId, fecha, comentario, hectareas, agroquimicos } = req.body;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const [result] = await connection.query(
      'INSERT INTO registros_lotes (lote_id, fecha, comentario, hectareas) VALUES (?, ?, ?, ?)',
      [loteId, fecha, comentario, hectareas]
    );
    
    const registroId = result.insertId;
    
    for (const ag of agroquimicos) {
      const [agroquimico] = await connection.query(
        'SELECT id, cantidad FROM agroquimicos WHERE nombre = ?',
        [ag.nombre]
      );
      if (agroquimico[0]) {
        const nuevaCantidad = agroquimico[0].cantidad - (ag.cantidad * hectareas);
        if (nuevaCantidad < 0) {
          throw new Error(`Cantidad insuficiente para ${ag.nombre}`);
        }
        await connection.query(
          'UPDATE agroquimicos SET cantidad = ? WHERE id = ?',
          [nuevaCantidad, agroquimico[0].id]
        );
        await connection.query(
          'INSERT INTO registros_agroquimicos (registro_id, agroquimico_id, cantidad, unidad) VALUES (?, ?, ?, ?)',
          [registroId, agroquimico[0].id, ag.cantidad * hectareas, ag.unidad]
        );
      } else {
        throw new Error(`Agroquímico ${ag.nombre} no encontrado`);
      }
    }
    
    await connection.commit();
    res.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error('Error in /api/lotes:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  } finally {
    connection.release();
  }
});

// Post agroquímicos endpoint
app.post('/api/agroquimicos', async (req, res) => {
  const { nombre, cantidad, unidad } = req.body;
  try {
    await db.query(
      'INSERT INTO agroquimicos (nombre, cantidad, unidad) VALUES (?, ?, ?)',
      [nombre, cantidad, unidad]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Error in /api/agroquimicos:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update agroquímicos endpoint
app.put('/api/agroquimicos/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, cantidad, unidad } = req.body;
  try {
    const [result] = await db.query(
      'UPDATE agroquimicos SET nombre = ?, cantidad = ?, unidad = ? WHERE id = ?',
      [nombre, cantidad, unidad, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agroquímico no encontrado' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error in /api/agroquimicos/:id:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete agroquímicos endpoint
app.delete('/api/agroquimicos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM agroquimicos WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Agroquímico no encontrado' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error in /api/agroquimicos/:id:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Informes endpoint
app.get('/api/informes', async (req, res) => {
  const { loteId, startDate, endDate } = req.query;
  try {
    let query = `
      SELECT l.nombre, r.fecha, r.comentario, r.hectareas,
             ra.cantidad, ra.unidad, a.nombre as agroquimico_nombre
      FROM lotes l
      JOIN registros_lotes r ON l.id = r.lote_id
      JOIN registros_agroquimicos ra ON r.id = ra.registro_id
      JOIN agroquimicos a ON ra.agroquimico_id = a.id
    `;
    const params = [];
    
    if (loteId) {
      query += ' WHERE l.id = ?';
      params.push(loteId);
    }
    
    if (startDate && endDate) {
      query += loteId ? ' AND' : ' WHERE';
      query += ' r.fecha BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    
    const [rows] = await db.query(query, params);
    
    const informes = {};
    rows.forEach(row => {
      if (!informes[row.nombre]) {
        informes[row.nombre] = { nombre: row.nombre, registros: [] };
      }
      let registro = informes[row.nombre].registros.find(r => r.fecha === row.fecha);
      if (!registro) {
        registro = {
          fecha: row.fecha,
          comentario: row.comentario,
          hectareas: row.hectareas,
          agroquimicos: []
        };
        informes[row.nombre].registros.push(registro);
      }
      registro.agroquimicos.push({
        nombre: row.agroquimico_nombre,
        cantidad: row.cantidad,
        unidad: row.unidad
      });
    });
    
    res.json(Object.values(informes));
  } catch (error) {
    console.error('Error in /api/informes:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));